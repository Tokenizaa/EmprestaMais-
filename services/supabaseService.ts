
import { UserProfile, UserRole, LoanOffer, LoanContract, LoanStatus, Guarantee, LoanRequest, Documento, Recompensa, Indicacao, RecompensaResgatada, Challenge, Badge, Notification, Partner, SystemSettings } from '../types';
import { AppError, withRetry } from '../src/utils/errorHandling';
import { calculateInstallment } from '../utils/financial';

// Simulação de banco de dados em memória/localStorage
const STORAGE_KEY_USERS = 'credifacil_users';
const STORAGE_KEY_OFFERS = 'credifacil_offers';
const STORAGE_KEY_CONTRACTS = 'credifacil_contracts';
const STORAGE_KEY_GUARANTEES = 'credifacil_guarantees';
const STORAGE_KEY_REQUESTS = 'credifacil_requests';
const STORAGE_KEY_DOCUMENTS = 'credifacil_documents';
const STORAGE_KEY_REWARDS_USER = 'credifacil_rewards_user';
const STORAGE_KEY_INDICATIONS = 'credifacil_indications';

// Dados iniciais (Mock)
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

export const supabaseService = {
  auth: {
    signIn: async (email: string): Promise<{ user: UserProfile | null, error: string | null }> => {
      // Usando withRetry para simular robustez em chamadas de rede
      return withRetry(async () => {
        await new Promise(resolve => setTimeout(resolve, 600)); // Simula delay de rede
        
        // Simulação de erro aleatório de rede (5% de chance) para testar o retry
        if (Math.random() < 0.05) {
            throw new Error("Simulated Network Timeout");
        }

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
    },
    
    updateProfile: async (id: string, data: Partial<UserProfile>) => {
      return withRetry(async () => {
         const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
         const index = users.findIndex((u: UserProfile) => u.id === id);
         
         if (index === -1) throw new AppError("Usuário não encontrado", "VALIDATION");

         users[index] = { ...users[index], ...data, updated_at: new Date().toISOString() };
         localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
         return users[index];
      });
    }
  },

  db: {
    // --- OFFERS ---
    getOffers: async (): Promise<LoanOffer[]> => {
      return withRetry(async () => {
        const stored = localStorage.getItem(STORAGE_KEY_OFFERS);
        return stored ? JSON.parse(stored) : MOCK_OFFERS;
      });
    },

    createOffer: async (offer: Omit<LoanOffer, 'id' | 'created_at'>, userLevel: number): Promise<LoanOffer> => {
      return withRetry(async () => {
         if (userLevel < 2) throw new AppError("Você precisa ser Nível 2 ou superior para oferecer empréstimos.", "VALIDATION");
         if (offer.amount < 100) throw new AppError("O valor mínimo para empréstimo é R$ 100,00.", "VALIDATION");
         if (offer.amount > 50000 && userLevel < 5) throw new AppError("Para valores acima de R$ 50.000, é necessário ser Nível 5.", "VALIDATION");

         const offers = await supabaseService.db.getOffers();
         const newOffer: LoanOffer = {
           ...offer,
           id: Math.random().toString(36).substr(2, 9),
           created_at: new Date().toISOString()
         };
         offers.push(newOffer);
         localStorage.setItem(STORAGE_KEY_OFFERS, JSON.stringify(offers));
         return newOffer;
      });
    },

    // --- CONTRACTS ---
    getContracts: async (userId: string, role: UserRole): Promise<LoanContract[]> => {
      return withRetry(async () => {
          const stored = localStorage.getItem(STORAGE_KEY_CONTRACTS);
          const contracts: LoanContract[] = stored ? JSON.parse(stored) : [];
          if (role === UserRole.ADMIN) return contracts;
          return contracts.filter(c => c.borrower_id === userId || c.lender_id === userId);
      });
    },

    createContractFromRequest: async (request: LoanRequest, lenderId: string): Promise<LoanContract> => {
        return withRetry(async () => {
            const offers = await supabaseService.db.getOffers();
            const offer = offers.find(o => o.id === request.offer_id);
            if (!offer) throw new AppError("Oferta original não encontrada.", "VALIDATION");

            const amount = request.amount_requested;
            const months = offer.months;
            const monthlyPayment = calculateInstallment(amount, offer.interest_rate, months);

            const contract: LoanContract = {
                id: Math.random().toString(36).substr(2, 9),
                offer_id: offer.id,
                borrower_id: request.borrower_id,
                lender_id: lenderId,
                borrower_name: request.borrower_name,
                status: LoanStatus.ACTIVE,
                total_amount: monthlyPayment * months,
                monthly_payment: monthlyPayment,
                remaining_amount: monthlyPayment * months,
                months_total: months,
                months_paid: 0,
                created_at: new Date().toISOString(),
                next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            };

            const stored = localStorage.getItem(STORAGE_KEY_CONTRACTS);
            const contracts = stored ? JSON.parse(stored) : [];
            contracts.push(contract);
            localStorage.setItem(STORAGE_KEY_CONTRACTS, JSON.stringify(contracts));
            return contract;
        });
    },

    // --- REQUESTS ---
    getLoanRequests: async (userId: string, isLender: boolean): Promise<LoanRequest[]> => {
        return withRetry(async () => {
            const stored = localStorage.getItem(STORAGE_KEY_REQUESTS);
            const requests: LoanRequest[] = stored ? JSON.parse(stored) : [];
            const offers = await supabaseService.db.getOffers();
            
            if (isLender) {
                const myOfferIds = offers.filter(o => o.lender_id === userId).map(o => o.id);
                return requests.filter(r => myOfferIds.includes(r.offer_id) && r.status === LoanStatus.PENDING);
            } else {
                return requests.filter(r => r.borrower_id === userId);
            }
        });
    },

    createLoanRequest: async (offer: LoanOffer, borrower: UserProfile): Promise<LoanRequest> => {
        return withRetry(async () => {
            if (!borrower.cpf_cnpj) throw new AppError("Complete seu CPF/CNPJ no perfil antes de solicitar.", "VALIDATION");
            
            const stored = localStorage.getItem(STORAGE_KEY_REQUESTS);
            const requests: LoanRequest[] = stored ? JSON.parse(stored) : [];
            const exists = requests.find(r => r.offer_id === offer.id && r.borrower_id === borrower.id && r.status === LoanStatus.PENDING);
            if(exists) throw new AppError("Você já possui uma solicitação pendente para esta oferta.", "VALIDATION");

            const newRequest: LoanRequest = {
                id: Math.random().toString(36).substr(2, 9),
                offer_id: offer.id,
                borrower_id: borrower.id,
                borrower_name: borrower.nome_completo,
                status: LoanStatus.PENDING,
                request_date: new Date().toISOString(),
                amount_requested: offer.amount
            };

            requests.push(newRequest);
            localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
            return newRequest;
        });
    },

    approveLoanRequest: async (requestId: string, lenderId: string) => {
        return withRetry(async () => {
            const stored = localStorage.getItem(STORAGE_KEY_REQUESTS);
            let requests: LoanRequest[] = stored ? JSON.parse(stored) : [];
            const index = requests.findIndex(r => r.id === requestId);
            
            if (index !== -1) {
                requests[index].status = LoanStatus.APPROVED;
                localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
                await supabaseService.db.createContractFromRequest(requests[index], lenderId);
            } else {
                throw new AppError("Solicitação não encontrada", "VALIDATION");
            }
        });
    },

    // --- GUARANTEES ---
    getGuarantees: async (userId: string): Promise<Guarantee[]> => {
        return withRetry(async () => {
            const stored = localStorage.getItem(STORAGE_KEY_GUARANTEES);
            const all: Guarantee[] = stored ? JSON.parse(stored) : [];
            return all.filter(g => g.user_id === userId);
        });
    },

    createGuarantee: async (guarantee: Omit<Guarantee, 'id' | 'status'>): Promise<Guarantee> => {
        return withRetry(async () => {
            if(guarantee.valor_estimado <= 0) throw new AppError("O valor estimado deve ser positivo.", "VALIDATION");

            const stored = localStorage.getItem(STORAGE_KEY_GUARANTEES);
            const all: Guarantee[] = stored ? JSON.parse(stored) : [];
            
            const newGuarantee: Guarantee = {
                ...guarantee,
                id: Math.random().toString(36).substr(2, 9),
                status: 'PENDING'
            };
            
            all.push(newGuarantee);
            localStorage.setItem(STORAGE_KEY_GUARANTEES, JSON.stringify(all));
            return newGuarantee;
        });
    },

    // --- DOCUMENTS ---
    getDocuments: async (userId: string): Promise<Documento[]> => {
        return withRetry(async () => {
            const stored = localStorage.getItem(STORAGE_KEY_DOCUMENTS);
            const all: Documento[] = stored ? JSON.parse(stored) : [];
            return all.filter(d => d.user_id === userId);
        });
    },

    uploadDocument: async (userId: string, tipo: string, file: File): Promise<Documento> => {
        return withRetry(async () => {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simula upload

            const stored = localStorage.getItem(STORAGE_KEY_DOCUMENTS);
            const all: Documento[] = stored ? JSON.parse(stored) : [];
            
            const newDoc: Documento = {
                id: Math.random().toString(36).substr(2, 9),
                user_id: userId,
                tipo,
                nome_arquivo: file.name,
                status: 'PENDING',
                data_envio: new Date().toISOString(),
                url: URL.createObjectURL(file)
            };

            all.push(newDoc);
            localStorage.setItem(STORAGE_KEY_DOCUMENTS, JSON.stringify(all));
            return newDoc;
        });
    },

    // --- REWARDS ---
    getRewards: async (): Promise<Recompensa[]> => {
        return MOCK_REWARDS;
    },

    getMyRewards: async (userId: string): Promise<RecompensaResgatada[]> => {
        return withRetry(async () => {
             const stored = localStorage.getItem(STORAGE_KEY_REWARDS_USER);
             const all: RecompensaResgatada[] = stored ? JSON.parse(stored) : [];
             return all.filter(r => r.user_id === userId);
        });
    },

    redeemReward: async (userId: string, rewardId: string): Promise<RecompensaResgatada> => {
        return withRetry(async () => {
            const reward = MOCK_REWARDS.find(r => r.id === rewardId);
            if(!reward) throw new AppError("Recompensa não encontrada", "VALIDATION");

            const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
            const userIdx = users.findIndex((u: UserProfile) => u.id === userId);
            const user = users[userIdx];

            if(user.points < reward.custo_pontos) {
                throw new AppError("Pontos insuficientes para esta recompensa.", "VALIDATION");
            }

            users[userIdx].points -= reward.custo_pontos;
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

            const stored = localStorage.getItem(STORAGE_KEY_REWARDS_USER);
            const all: RecompensaResgatada[] = stored ? JSON.parse(stored) : [];
            
            const redemption: RecompensaResgatada = {
                id: Math.random().toString(36).substr(2, 9),
                user_id: userId,
                recompensa_id: rewardId,
                data_resgate: new Date().toISOString(),
                codigo: Math.random().toString(36).substr(2, 6).toUpperCase()
            };

            all.push(redemption);
            localStorage.setItem(STORAGE_KEY_REWARDS_USER, JSON.stringify(all));
            
            return redemption;
        });
    },

    // --- INDICATIONS ---
    getIndications: async (userId: string): Promise<Indicacao[]> => {
         const stored = localStorage.getItem(STORAGE_KEY_INDICATIONS);
         const all: Indicacao[] = stored ? JSON.parse(stored) : [];
         return all.filter(i => i.user_id === userId);
    },

    createIndication: async (userId: string, data: {nome: string, email: string}): Promise<Indicacao> => {
        return withRetry(async () => {
             await new Promise(resolve => setTimeout(resolve, 800));

             const stored = localStorage.getItem(STORAGE_KEY_INDICATIONS);
             const all: Indicacao[] = stored ? JSON.parse(stored) : [];

             if(all.find(i => i.email_indicado === data.email)) {
                 throw new AppError("Este email já foi indicado anteriormente.", "VALIDATION");
             }

             const newIndication: Indicacao = {
                 id: Math.random().toString(36).substr(2, 9),
                 user_id: userId,
                 nome_indicado: data.nome,
                 email_indicado: data.email,
                 status: 'SENT',
                 data_indicacao: new Date().toISOString()
             };

             all.push(newIndication);
             localStorage.setItem(STORAGE_KEY_INDICATIONS, JSON.stringify(all));
             return newIndication;
        });
    }
  },

  admin: {
    getUsers: async (): Promise<UserProfile[]> => {
        return withRetry(async () => {
             const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
             return users;
        });
    },
    getChallenges: async (): Promise<Challenge[]> => {
        return [
            { id: '1', title: 'Completar Perfil', description: 'Preencha todos os dados.', xp_reward: 100, type: 'SPECIAL', active: true },
            { id: '2', title: 'Login Diário', description: 'Acesse a plataforma hoje.', xp_reward: 10, type: 'DAILY', active: true }
        ];
    },
    getBadges: async (): Promise<Badge[]> => {
        return [
            { id: '1', name: 'Pioneiro', description: 'Primeiros 100 usuários.', rarity: 'EPIC', icon: 'star' },
            { id: '2', name: 'Bom Pagador', description: 'Pagou 3 faturas em dia.', rarity: 'RARE', icon: 'check' }
        ];
    },
    getNotifications: async (): Promise<Notification[]> => {
        return [];
    },
    getPartners: async (): Promise<Partner[]> => {
        return [
            { id: '1', name: 'Banco Alpha', type: 'BANK', status: 'ACTIVE', contact_email: 'contato@alpha.com' }
        ];
    },
    getSystemSettings: async (): Promise<SystemSettings> => {
        return {
            platform_name: 'CrediFacil',
            maintenance_mode: false,
            min_loan_value: 100,
            max_loan_value: 50000,
            base_interest_rate: 2.0
        };
    }
  }
};
