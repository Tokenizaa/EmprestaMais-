
import { IBackendStrategy } from '../supabaseService';
import { UserProfile, UserRole, LoanOffer, LoanContract, LoanStatus, Guarantee, LoanRequest, Documento, Recompensa, Indicacao, RecompensaResgatada, Challenge, Badge, Notification, Partner, SystemSettings, Endereco, CreateGuaranteeDTO, SaveAddressDTO } from '../../types';
import { AppError, withRetry } from '../../utils/errorHandling';
import { calculateInstallment } from '../../utils/financial';
import { validateLoanOfferRules } from '../../utils/businessRules';

// Keys
const STORAGE_KEY_USERS = 'emprestamais_users';
const STORAGE_KEY_OFFERS = 'emprestamais_offers';
const STORAGE_KEY_CONTRACTS = 'emprestamais_contracts';
const STORAGE_KEY_GUARANTEES = 'emprestamais_guarantees';
const STORAGE_KEY_REQUESTS = 'emprestamais_requests';
const STORAGE_KEY_DOCUMENTS = 'emprestamais_documents';
const STORAGE_KEY_REWARDS_USER = 'emprestamais_rewards_user';
const STORAGE_KEY_INDICATIONS = 'emprestamais_indications';
const STORAGE_KEY_ADDRESSES = 'emprestamais_addresses';

// Mock Data
const MOCK_OFFERS: LoanOffer[] = [
  { id: '1', lender_id: 'admin', lender_name: 'Banco Parceiro A', amount: 5000, interest_rate: 2.5, months: 12, description: 'Empréstimo pessoal rápido', created_at: new Date().toISOString() },
  { id: '2', lender_id: 'user2', lender_name: 'Investidor Anjo', amount: 15000, interest_rate: 1.9, months: 24, description: 'Para pequenos negócios', created_at: new Date().toISOString() },
];

const MOCK_REWARDS: Recompensa[] = [
  { id: '1', titulo: 'Desconto 10% Marketplace', descricao: 'Voucher de desconto em lojas parceiras.', custo_pontos: 200, categoria: 'DESCONTO' },
  { id: '2', titulo: 'Cashback R$ 25', descricao: 'Crédito na fatura do seu próximo empréstimo.', custo_pontos: 500, categoria: 'CASHBACK' },
  { id: '3', titulo: 'Consultoria Financeira', descricao: '1 hora com especialista financeiro.', custo_pontos: 1000, categoria: 'CONSULTORIA' },
  { id: '4', titulo: 'Badge Premium', descricao: 'Destaque seu perfil para investidores.', custo_pontos: 1500, categoria: 'PREMIUM' },
];

export class MockBackendStrategy implements IBackendStrategy {
  
  // --- AUTH ---
  async signIn(email: string): Promise<{ user: UserProfile | null, error: string | null }> {
    return withRetry(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
      const user = users.find((u: UserProfile) => u.email === email);
      
      if (email === 'admin@admin.com') {
        const adminUser: UserProfile = { 
          id: 'admin-123', email, role: UserRole.ADMIN, nome_completo: 'Administrador Sistema', 
          cpf_cnpj: '00000000000', telefone: '000000000', points: 1000, level: 5 
        };
        if(!user) {
            users.push(adminUser);
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
        }
        return { user: adminUser, error: null };
      }

      if (user) return { user, error: null };
      
      const newUser: UserProfile = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        role: UserRole.USER,
        nome_completo: 'Usuário Demo',
        cpf_cnpj: '',
        telefone: '',
        points: 0,
        level: 1,
        created_at: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      return { user: newUser, error: null };
    });
  }

  async updateProfile(id: string, data: Partial<UserProfile>): Promise<UserProfile> {
    return withRetry(async () => {
       const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
       const index = users.findIndex((u: UserProfile) => u.id === id);
       if (index === -1) throw new AppError("Usuário não encontrado", "VALIDATION");

       users[index] = { ...users[index], ...data, updated_at: new Date().toISOString() };
       localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
       return users[index];
    });
  }

  async getAddress(userId: string): Promise<Endereco | null> {
    return withRetry(async () => {
      const addresses = JSON.parse(localStorage.getItem(STORAGE_KEY_ADDRESSES) || '[]');
      const address = addresses.find((a: Endereco) => a.user_id === userId);
      return address || null;
    });
  }

  async saveAddress(userId: string, addressData: SaveAddressDTO): Promise<Endereco> {
    return withRetry(async () => {
      const addresses = JSON.parse(localStorage.getItem(STORAGE_KEY_ADDRESSES) || '[]');
      const index = addresses.findIndex((a: Endereco) => a.user_id === userId);
      
      let savedAddress: Endereco;

      if (index !== -1) {
        // Update existing
        savedAddress = { ...addresses[index], ...addressData };
        addresses[index] = savedAddress;
      } else {
        // Create new
        savedAddress = {
          id: Math.random().toString(36).substr(2, 9),
          user_id: userId,
          ...addressData
        };
        addresses.push(savedAddress);
      }

      localStorage.setItem(STORAGE_KEY_ADDRESSES, JSON.stringify(addresses));
      return savedAddress;
    });
  }

  // --- DB ---
  async getOffers(): Promise<LoanOffer[]> {
    const stored = localStorage.getItem(STORAGE_KEY_OFFERS);
    return stored ? JSON.parse(stored) : MOCK_OFFERS;
  }

  async createOffer(offer: Omit<LoanOffer, 'id' | 'created_at'>, userLevel: number): Promise<LoanOffer> {
    const validation = validateLoanOfferRules(offer.amount, offer.months, offer.interest_rate, userLevel);
    if (!validation.isValid) throw new AppError(validation.error || "Erro de validação", "VALIDATION");

    const offers = await this.getOffers();
    const newOffer: LoanOffer = { ...offer, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
    offers.push(newOffer);
    localStorage.setItem(STORAGE_KEY_OFFERS, JSON.stringify(offers));
    return newOffer;
  }

  async getContracts(userId: string, role: UserRole): Promise<LoanContract[]> {
    const stored = localStorage.getItem(STORAGE_KEY_CONTRACTS);
    const contracts: LoanContract[] = stored ? JSON.parse(stored) : [];
    if (role === UserRole.ADMIN) return contracts;
    return contracts.filter(c => c.borrower_id === userId || c.lender_id === userId);
  }

  async createContractFromRequest(request: LoanRequest, lenderId: string): Promise<LoanContract> {
    const offers = await this.getOffers();
    const offer = offers.find(o => o.id === request.offer_id);
    if (!offer) throw new AppError("Oferta não encontrada", "VALIDATION");

    const monthlyPayment = calculateInstallment(request.amount_requested, offer.interest_rate, offer.months);
    const contract: LoanContract = {
        id: Math.random().toString(36).substr(2, 9),
        offer_id: offer.id,
        borrower_id: request.borrower_id,
        lender_id: lenderId,
        borrower_name: request.borrower_name,
        status: LoanStatus.ACTIVE,
        total_amount: monthlyPayment * offer.months,
        monthly_payment: monthlyPayment,
        remaining_amount: monthlyPayment * offer.months,
        months_total: offer.months,
        months_paid: 0,
        created_at: new Date().toISOString(),
        next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    const contracts = await this.getContracts('all', UserRole.ADMIN);
    contracts.push(contract);
    localStorage.setItem(STORAGE_KEY_CONTRACTS, JSON.stringify(contracts));
    return contract;
  }

  async getLoanRequests(userId: string, isLender: boolean): Promise<LoanRequest[]> {
    const stored = localStorage.getItem(STORAGE_KEY_REQUESTS);
    const requests: LoanRequest[] = stored ? JSON.parse(stored) : [];
    if (isLender) {
        // Simple logic for mock: return all requests for offers created by this user
        const offers = await this.getOffers();
        const myOfferIds = offers.filter(o => o.lender_id === userId).map(o => o.id);
        return requests.filter(r => myOfferIds.includes(r.offer_id) && r.status === LoanStatus.PENDING);
    }
    return requests.filter(r => r.borrower_id === userId);
  }

  async createLoanRequest(offer: LoanOffer, borrower: UserProfile): Promise<LoanRequest> {
    if (!borrower.cpf_cnpj) throw new AppError("CPF/CNPJ obrigatório", "VALIDATION");
    const requests = await this.getLoanRequests(borrower.id, false);
    if (requests.find(r => r.offer_id === offer.id && r.status === LoanStatus.PENDING)) {
        throw new AppError("Solicitação já existente", "VALIDATION");
    }

    const newRequest: LoanRequest = {
        id: Math.random().toString(36).substr(2, 9),
        offer_id: offer.id,
        borrower_id: borrower.id,
        borrower_name: borrower.nome_completo,
        status: LoanStatus.PENDING,
        request_date: new Date().toISOString(),
        amount_requested: offer.amount
    };
    
    // Direct localStorage manipulation to append
    const allRequests = JSON.parse(localStorage.getItem(STORAGE_KEY_REQUESTS) || '[]');
    allRequests.push(newRequest);
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(allRequests));
    return newRequest;
  }

  async approveLoanRequest(requestId: string, lenderId: string): Promise<void> {
      const allRequests = JSON.parse(localStorage.getItem(STORAGE_KEY_REQUESTS) || '[]');
      const index = allRequests.findIndex((r: LoanRequest) => r.id === requestId);
      if (index === -1) throw new AppError("Solicitação não encontrada", "VALIDATION");
      
      allRequests[index].status = LoanStatus.APPROVED;
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(allRequests));
      
      await this.createContractFromRequest(allRequests[index], lenderId);
  }

  async getGuarantees(userId: string): Promise<Guarantee[]> {
    const stored = localStorage.getItem(STORAGE_KEY_GUARANTEES);
    const all: Guarantee[] = stored ? JSON.parse(stored) : [];
    return all.filter(g => g.user_id === userId);
  }

  async createGuarantee(guarantee: CreateGuaranteeDTO): Promise<Guarantee> {
    const stored = localStorage.getItem(STORAGE_KEY_GUARANTEES);
    const all: Guarantee[] = stored ? JSON.parse(stored) : [];
    
    const newG: Guarantee = { 
      ...guarantee, 
      id: Math.random().toString(36).substr(2, 9), 
      status: 'PENDING'
    };
    
    all.push(newG);
    localStorage.setItem(STORAGE_KEY_GUARANTEES, JSON.stringify(all));
    return newG;
  }

  async getDocuments(userId: string): Promise<Documento[]> {
    const stored = localStorage.getItem(STORAGE_KEY_DOCUMENTS);
    const all: Documento[] = stored ? JSON.parse(stored) : [];
    return all.filter(d => d.user_id === userId);
  }

  async uploadDocument(userId: string, tipo: string, file: File): Promise<Documento> {
    await new Promise(r => setTimeout(r, 1000));
    const stored = localStorage.getItem(STORAGE_KEY_DOCUMENTS);
    const all: Documento[] = stored ? JSON.parse(stored) : [];
    const newDoc: Documento = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: userId, tipo, nome_arquivo: file.name, status: 'PENDING',
        data_envio: new Date().toISOString(), url: '#'
    };
    all.push(newDoc);
    localStorage.setItem(STORAGE_KEY_DOCUMENTS, JSON.stringify(all));
    return newDoc;
  }

  async getRewards(): Promise<Recompensa[]> { return MOCK_REWARDS; }
  
  async getMyRewards(userId: string): Promise<RecompensaResgatada[]> {
      const stored = localStorage.getItem(STORAGE_KEY_REWARDS_USER);
      const all: RecompensaResgatada[] = stored ? JSON.parse(stored) : [];
      return all.filter(r => r.user_id === userId);
  }

  async redeemReward(userId: string, rewardId: string): Promise<RecompensaResgatada> {
      const reward = MOCK_REWARDS.find(r => r.id === rewardId);
      if (!reward) throw new AppError("Recompensa não encontrada", "VALIDATION");
      
      // Update User Points
      const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
      const userIdx = users.findIndex((u: UserProfile) => u.id === userId);
      if (users[userIdx].points < reward.custo_pontos) throw new AppError("Pontos insuficientes", "VALIDATION");
      users[userIdx].points -= reward.custo_pontos;
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

      const stored = localStorage.getItem(STORAGE_KEY_REWARDS_USER);
      const all: RecompensaResgatada[] = stored ? JSON.parse(stored) : [];
      const redemption: RecompensaResgatada = {
          id: Math.random().toString(36).substr(2, 9),
          user_id: userId, recompensa_id: rewardId, data_resgate: new Date().toISOString(),
          codigo: Math.random().toString(36).substr(2, 6).toUpperCase()
      };
      all.push(redemption);
      localStorage.setItem(STORAGE_KEY_REWARDS_USER, JSON.stringify(all));
      return redemption;
  }

  async getIndications(userId: string): Promise<Indicacao[]> {
      const stored = localStorage.getItem(STORAGE_KEY_INDICATIONS);
      const all: Indicacao[] = stored ? JSON.parse(stored) : [];
      return all.filter(i => i.user_id === userId);
  }

  async createIndication(userId: string, data: {nome: string, email: string}): Promise<Indicacao> {
      const stored = localStorage.getItem(STORAGE_KEY_INDICATIONS);
      const all: Indicacao[] = stored ? JSON.parse(stored) : [];
      if (all.find(i => i.email_indicado === data.email)) throw new AppError("Email já indicado", "VALIDATION");
      
      const newInd = { id: Math.random().toString(36).substr(2, 9), user_id: userId, nome_indicado: data.nome, email_indicado: data.email, status: 'SENT' as const, data_indicacao: new Date().toISOString() };
      all.push(newInd);
      localStorage.setItem(STORAGE_KEY_INDICATIONS, JSON.stringify(all));
      return newInd;
  }

  // --- ADMIN ---
  async getUsers(): Promise<UserProfile[]> { return JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]'); }
  async getChallenges(): Promise<Challenge[]> { return [{ id: '1', title: 'Completar Perfil', description: 'Preencha todos os dados.', xp_reward: 100, type: 'SPECIAL', active: true }]; }
  async getBadges(): Promise<Badge[]> { return [{ id: '1', name: 'Pioneiro', description: 'Early Adopter', rarity: 'EPIC', icon: 'star' }]; }
  async getNotifications(): Promise<Notification[]> { return []; }
  async getPartners(): Promise<Partner[]> { return []; }
  async getSystemSettings(): Promise<SystemSettings> { return { platform_name: 'EmprestaMais (Mock)', maintenance_mode: false, min_loan_value: 100, max_loan_value: 50000, base_interest_rate: 2.0 }; }
}
