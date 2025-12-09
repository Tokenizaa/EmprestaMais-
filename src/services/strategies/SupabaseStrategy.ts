
import { SupabaseClient } from '@supabase/supabase-js';
import { IBackendStrategy } from '../supabaseService';
import { UserProfile, UserRole, LoanOffer, LoanContract, LoanStatus, Guarantee, LoanRequest, Documento, Recompensa, Indicacao, RecompensaResgatada, Challenge, Badge, Notification, Partner, SystemSettings, Endereco, CreateGuaranteeDTO, SaveAddressDTO } from '../../types';
import { AppError, withRetry } from '../../utils/errorHandling';
import { calculateInstallment } from '../../utils/financial';
import { validateLoanOfferRules } from '../../utils/businessRules';
import { logger } from '../../utils/logger';

export class SupabaseBackendStrategy implements IBackendStrategy {
  constructor(private client: SupabaseClient) {}

  // Helper para tratamento de erros do Supabase
  private handleError(error: any): never {
      if (error?.message) logger.error("Supabase Error", error);
      throw new AppError(error?.message || "Erro no banco de dados", "SERVER", error);
  }

  async signIn(email: string): Promise<{ user: UserProfile | null, error: string | null }> {
    return withRetry(async () => {
      const { data, error } = await this.client.from('profiles').select('*').eq('email', email).single();
      if (error) {
          if (error.code === 'PGRST116') return { user: null, error: 'Usuário não encontrado' }; // Not found
          this.handleError(error);
      }
      return { user: data as UserProfile, error: null };
    });
  }

  async updateProfile(id: string, data: Partial<UserProfile>): Promise<UserProfile> {
    return withRetry(async () => {
      const { data: updated, error } = await this.client.from('profiles').update(data).eq('id', id).select().single();
      if (error) this.handleError(error);
      return updated;
    });
  }

  async getAddress(userId: string): Promise<Endereco | null> {
    return withRetry(async () => {
      const { data, error } = await this.client.from('addresses').select('*').eq('user_id', userId).single();
      if (error) {
         if (error.code === 'PGRST116') return null; // No address found
         this.handleError(error);
      }
      return data;
    });
  }

  async saveAddress(userId: string, addressData: SaveAddressDTO): Promise<Endereco> {
    return withRetry(async () => {
      // Upsert logic based on user_id if table has unique constraint or check existence first
      const { data: existing } = await this.client.from('addresses').select('id').eq('user_id', userId).single();
      
      let query;
      if (existing) {
         query = this.client.from('addresses').update(addressData).eq('user_id', userId).select().single();
      } else {
         query = this.client.from('addresses').insert({ user_id: userId, ...addressData }).select().single();
      }

      const { data, error } = await query;
      if (error) this.handleError(error);
      return data;
    });
  }

  async getOffers(): Promise<LoanOffer[]> {
    return withRetry(async () => {
      const { data, error } = await this.client.from('loan_offers').select('*');
      if (error) this.handleError(error);
      return data || [];
    });
  }

  async createOffer(offer: Omit<LoanOffer, 'id' | 'created_at'>, userLevel: number): Promise<LoanOffer> {
    const validation = validateLoanOfferRules(offer.amount, offer.months, offer.interest_rate, userLevel);
    if (!validation.isValid) throw new AppError(validation.error!, "VALIDATION");

    return withRetry(async () => {
        const { data, error } = await this.client.from('loan_offers').insert(offer).select().single();
        if (error) this.handleError(error);
        return data;
    });
  }

  async getContracts(userId: string, role: UserRole): Promise<LoanContract[]> {
    return withRetry(async () => {
        let query = this.client.from('loan_contracts').select('*');
        if (role !== UserRole.ADMIN) {
            query = query.or(`borrower_id.eq.${userId},lender_id.eq.${userId}`);
        }
        const { data, error } = await query;
        if (error) this.handleError(error);
        return data || [];
    });
  }

  async createContractFromRequest(request: LoanRequest, lenderId: string): Promise<LoanContract> {
    return withRetry(async () => {
        // Obter oferta original
        const { data: offer } = await this.client.from('loan_offers').select('*').eq('id', request.offer_id).single();
        if (!offer) throw new AppError("Oferta não encontrada", "VALIDATION");

        const monthlyPayment = calculateInstallment(request.amount_requested, offer.interest_rate, offer.months);
        const totalAmount = monthlyPayment * offer.months;

        const contract = {
            offer_id: offer.id,
            borrower_id: request.borrower_id,
            lender_id: lenderId,
            borrower_name: request.borrower_name,
            status: LoanStatus.ACTIVE,
            total_amount: totalAmount,
            monthly_payment: monthlyPayment,
            remaining_amount: totalAmount,
            months_total: offer.months,
            months_paid: 0,
            next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        const { data, error } = await this.client.from('loan_contracts').insert(contract).select().single();
        if (error) this.handleError(error);
        return data;
    });
  }

  async getLoanRequests(userId: string, isLender: boolean): Promise<LoanRequest[]> {
      return withRetry(async () => {
          if (isLender) {
              const { data: myOffers } = await this.client.from('loan_offers').select('id').eq('lender_id', userId);
              const offerIds = myOffers?.map(o => o.id) || [];
              if (offerIds.length === 0) return [];
              const { data, error } = await this.client.from('loan_requests').select('*').in('offer_id', offerIds).eq('status', 'PENDING');
              if (error) this.handleError(error);
              return data || [];
          } else {
              const { data, error } = await this.client.from('loan_requests').select('*').eq('borrower_id', userId);
              if (error) this.handleError(error);
              return data || [];
          }
      });
  }

  async createLoanRequest(offer: LoanOffer, borrower: UserProfile): Promise<LoanRequest> {
      return withRetry(async () => {
          if (!borrower.cpf_cnpj) throw new AppError("CPF Obrigatório", "VALIDATION");
          // Check exists
          const { data: exists } = await this.client.from('loan_requests').select('id').eq('offer_id', offer.id).eq('borrower_id', borrower.id).eq('status', 'PENDING');
          if (exists && exists.length > 0) throw new AppError("Já existe solicitação pendente", "VALIDATION");

          const { data, error } = await this.client.from('loan_requests').insert({
              offer_id: offer.id,
              borrower_id: borrower.id,
              borrower_name: borrower.nome_completo,
              amount_requested: offer.amount,
              status: 'PENDING'
          }).select().single();
          if (error) this.handleError(error);
          return data;
      });
  }

  async approveLoanRequest(requestId: string, lenderId: string): Promise<void> {
      return withRetry(async () => {
          const { data: req, error } = await this.client.from('loan_requests').update({ status: LoanStatus.APPROVED }).eq('id', requestId).select().single();
          if (error) this.handleError(error);
          await this.createContractFromRequest(req, lenderId);
      });
  }

  async getGuarantees(userId: string): Promise<Guarantee[]> {
      const { data, error } = await this.client.from('guarantees').select('*').eq('user_id', userId);
      if (error) this.handleError(error);
      return data || [];
  }

  async createGuarantee(guarantee: CreateGuaranteeDTO): Promise<Guarantee> {
      const { data, error } = await this.client.from('guarantees').insert({ ...guarantee, status: 'PENDING' }).select().single();
      if (error) this.handleError(error);
      return data;
  }

  async getDocuments(userId: string): Promise<Documento[]> {
      const { data, error } = await this.client.from('documents').select('*').eq('user_id', userId);
      if (error) this.handleError(error);
      return data || [];
  }

  async uploadDocument(userId: string, tipo: string, file: File): Promise<Documento> {
      // Mock de upload real para bucket (simplificado pois exigiria storage)
      const { data, error } = await this.client.from('documents').insert({
          user_id: userId, tipo, nome_arquivo: file.name, status: 'PENDING',
          data_envio: new Date().toISOString(), url: `https://fake-storage/${file.name}`
      }).select().single();
      if (error) this.handleError(error);
      return data;
  }

  async getRewards(): Promise<Recompensa[]> {
      const { data, error } = await this.client.from('rewards').select('*');
      if (error) this.handleError(error);
      return data || [];
  }

  async getMyRewards(userId: string): Promise<RecompensaResgatada[]> {
      const { data, error } = await this.client.from('user_rewards').select('*').eq('user_id', userId);
      if (error) this.handleError(error);
      return data || [];
  }

  async redeemReward(userId: string, rewardId: string): Promise<RecompensaResgatada> {
      // Simplificado sem transação (Supabase Client não suporta transactions diretas facilmente sem RPC)
      // Ideal: Criar RPC 'redeem_reward' no banco
      const { data: user } = await this.client.from('profiles').select('points').eq('id', userId).single();
      const { data: reward } = await this.client.from('rewards').select('*').eq('id', rewardId).single();
      
      if (user.points < reward.custo_pontos) throw new AppError("Pontos insuficientes", "VALIDATION");

      await this.client.from('profiles').update({ points: user.points - reward.custo_pontos }).eq('id', userId);
      const { data, error } = await this.client.from('user_rewards').insert({
          user_id: userId, recompensa_id: rewardId, data_resgate: new Date().toISOString(),
          codigo: Math.random().toString(36).substr(2, 8).toUpperCase()
      }).select().single();
      
      if (error) this.handleError(error);
      return data;
  }

  async getIndications(userId: string): Promise<Indicacao[]> {
      const { data, error } = await this.client.from('indications').select('*').eq('user_id', userId);
      if (error) this.handleError(error);
      return data || [];
  }

  async createIndication(userId: string, data: {nome: string, email: string}): Promise<Indicacao> {
      const { data: exists } = await this.client.from('indications').select('id').eq('email_indicado', data.email);
      if (exists && exists.length > 0) throw new AppError("Já indicado", "VALIDATION");

      const { data: newInd, error } = await this.client.from('indications').insert({
          user_id: userId, nome_indicado: data.nome, email_indicado: data.email, status: 'SENT', data_indicacao: new Date().toISOString()
      }).select().single();
      if (error) this.handleError(error);
      return newInd;
  }

  // --- ADMIN ---
  async getUsers(): Promise<UserProfile[]> {
      const { data, error } = await this.client.from('profiles').select('*');
      if(error) this.handleError(error);
      return data || [];
  }
  async getChallenges(): Promise<Challenge[]> {
      const { data, error } = await this.client.from('challenges').select('*');
      if(error) this.handleError(error);
      return data || [];
  }
  async getBadges(): Promise<Badge[]> {
      const { data, error } = await this.client.from('badges').select('*');
      if(error) this.handleError(error);
      return data || [];
  }
  async getNotifications(): Promise<Notification[]> {
      const { data, error } = await this.client.from('notifications').select('*');
      if(error) this.handleError(error);
      return data || [];
  }
  async getPartners(): Promise<Partner[]> {
      const { data, error } = await this.client.from('partners').select('*');
      if(error) this.handleError(error);
      return data || [];
  }
  async getSystemSettings(): Promise<SystemSettings> {
      const { data, error } = await this.client.from('system_settings').select('*').single();
      if(error && error.code !== 'PGRST116') this.handleError(error);
      return data || { platform_name: 'EmprestaMais', maintenance_mode: false, min_loan_value: 100, max_loan_value: 50000, base_interest_rate: 2.0 };
  }
}
