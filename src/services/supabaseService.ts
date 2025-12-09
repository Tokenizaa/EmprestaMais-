
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, UserRole, LoanOffer, LoanContract, LoanStatus, Guarantee, LoanRequest, Documento, Recompensa, Indicacao, RecompensaResgatada, Challenge, Badge, Notification, Partner, SystemSettings, Endereco, CreateGuaranteeDTO, SaveAddressDTO } from '../types';
import { logger } from '../utils/logger';
import { MockBackendStrategy } from './strategies/MockStrategy';
import { SupabaseBackendStrategy } from './strategies/SupabaseStrategy';

// Interface comum que ambas as estratégias devem implementar
export interface IBackendStrategy {
  signIn(email: string): Promise<{ user: UserProfile | null, error: string | null }>;
  updateProfile(id: string, data: Partial<UserProfile>): Promise<UserProfile>;
  
  getAddress(userId: string): Promise<Endereco | null>;
  saveAddress(userId: string, address: SaveAddressDTO): Promise<Endereco>;

  getOffers(): Promise<LoanOffer[]>;
  createOffer(offer: Omit<LoanOffer, 'id' | 'created_at'>, userLevel: number): Promise<LoanOffer>;
  
  getContracts(userId: string, role: UserRole): Promise<LoanContract[]>;
  createContractFromRequest(request: LoanRequest, lenderId: string): Promise<LoanContract>;
  
  getLoanRequests(userId: string, isLender: boolean): Promise<LoanRequest[]>;
  createLoanRequest(offer: LoanOffer, borrower: UserProfile): Promise<LoanRequest>;
  approveLoanRequest(requestId: string, lenderId: string): Promise<void>;
  
  getGuarantees(userId: string): Promise<Guarantee[]>;
  createGuarantee(guarantee: CreateGuaranteeDTO): Promise<Guarantee>;
  
  getDocuments(userId: string): Promise<Documento[]>;
  uploadDocument(userId: string, tipo: string, file: File): Promise<Documento>;
  
  getRewards(): Promise<Recompensa[]>;
  getMyRewards(userId: string): Promise<RecompensaResgatada[]>;
  redeemReward(userId: string, rewardId: string): Promise<RecompensaResgatada>;
  
  getIndications(userId: string): Promise<Indicacao[]>;
  createIndication(userId: string, data: {nome: string, email: string}): Promise<Indicacao>;
  
  getUsers(): Promise<UserProfile[]>;
  getChallenges(): Promise<Challenge[]>;
  getBadges(): Promise<Badge[]>;
  getNotifications(): Promise<Notification[]>;
  getPartners(): Promise<Partner[]>;
  getSystemSettings(): Promise<SystemSettings>;
}

const STORAGE_KEY_CONFIG = 'emprestamais_config';

class SupabaseServiceManager {
  private strategy: IBackendStrategy;
  private isRealBackend: boolean = false;
  private client: SupabaseClient | null = null;

  constructor() {
    // Inicializa com Mock por padrão
    this.strategy = new MockBackendStrategy();
    this.initialize();
  }

  private initialize() {
    const storedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
    let url = (import.meta as any).env.VITE_SUPABASE_URL;
    let key = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

    if (storedConfig) {
      const parsed = JSON.parse(storedConfig);
      if (parsed.url && parsed.key) {
        url = parsed.url;
        key = parsed.key;
      }
    }

    if (url && key && url.startsWith('http')) {
      try {
        this.client = createClient(url, key);
        this.strategy = new SupabaseBackendStrategy(this.client);
        this.isRealBackend = true;
        logger.info("Strategy: Real Supabase Backend initialized.");
      } catch (e) {
        logger.error("Failed to initialize Supabase, falling back to Mock.", e);
        this.strategy = new MockBackendStrategy();
        this.isRealBackend = false;
      }
    } else {
      logger.warn("No Supabase config found. Using Mock Strategy.");
      this.strategy = new MockBackendStrategy();
      this.isRealBackend = false;
    }
  }

  public updateCredentials(url: string, key: string) {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({ url, key }));
    window.location.reload();
  }

  public isConnected() {
    return this.isRealBackend;
  }

  public async logErrorToDB(level: string, message: string, details: any, userId?: string) {
    if (this.isRealBackend && this.client) {
      this.client.from('system_logs').insert({ level, message, details: JSON.stringify(details), user_id: userId }).then(({ error }) => {
          if(error) console.error("Logger fail", error);
      });
    }
  }

  // Facade Methods that delegate to the active strategy
  public auth = {
    signIn: (email: string) => this.strategy.signIn(email),
    updateProfile: (id: string, data: Partial<UserProfile>) => this.strategy.updateProfile(id, data),
    getAddress: (userId: string) => this.strategy.getAddress(userId),
    saveAddress: (userId: string, data: SaveAddressDTO) => this.strategy.saveAddress(userId, data),
  };

  public db = {
    getOffers: () => this.strategy.getOffers(),
    createOffer: (offer: Omit<LoanOffer, 'id' | 'created_at'>, level: number) => this.strategy.createOffer(offer, level),
    getContracts: (userId: string, role: UserRole) => this.strategy.getContracts(userId, role),
    createContractFromRequest: (req: LoanRequest, lenderId: string) => this.strategy.createContractFromRequest(req, lenderId),
    getLoanRequests: (userId: string, isLender: boolean) => this.strategy.getLoanRequests(userId, isLender),
    createLoanRequest: (offer: LoanOffer, borrower: UserProfile) => this.strategy.createLoanRequest(offer, borrower),
    approveLoanRequest: (reqId: string, lenderId: string) => this.strategy.approveLoanRequest(reqId, lenderId),
    getGuarantees: (userId: string) => this.strategy.getGuarantees(userId),
    createGuarantee: (g: CreateGuaranteeDTO) => this.strategy.createGuarantee(g),
    getDocuments: (userId: string) => this.strategy.getDocuments(userId),
    uploadDocument: (userId: string, tipo: string, file: File) => this.strategy.uploadDocument(userId, tipo, file),
    getRewards: () => this.strategy.getRewards(),
    getMyRewards: (userId: string) => this.strategy.getMyRewards(userId),
    redeemReward: (userId: string, rId: string) => this.strategy.redeemReward(userId, rId),
    getIndications: (userId: string) => this.strategy.getIndications(userId),
    createIndication: (userId: string, data: {nome: string, email: string}) => this.strategy.createIndication(userId, data),
  };

  public admin = {
    getUsers: () => this.strategy.getUsers(),
    getChallenges: () => this.strategy.getChallenges(),
    getBadges: () => this.strategy.getBadges(),
    getNotifications: () => this.strategy.getNotifications(),
    getPartners: () => this.strategy.getPartners(),
    getSystemSettings: () => this.strategy.getSystemSettings(),
  };
}

export const supabaseService = new SupabaseServiceManager();
