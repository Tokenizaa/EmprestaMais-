// Definições de tipos globais baseadas no mapeamento do banco de dados

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum LoanStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
  ACTIVE = 'ACTIVE'
}

export enum GuaranteeType {
  VEHICLE = 'VEHICLE',
  PROPERTY = 'PROPERTY',
  OTHER = 'OTHER'
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  nome_completo: string;
  cpf_cnpj: string;
  telefone: string;
  data_nascimento?: string;
  tipo_pessoa?: 'PF' | 'PJ';
  razao_social?: string;
  points: number;
  level: number;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Endereco {
  id: string;
  user_id: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface Guarantee {
  id: string;
  user_id: string;
  tipo_garantia: GuaranteeType;
  descricao: string;
  valor_estimado: number;
  deseja_vender: boolean;
  valor_venda?: number;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  fotos?: string[];
  marca?: string;
  modelo?: string;
  ano?: number;
  placa?: string;
  tipo_imovel?: string;
  area_total?: number;
  matricula?: string;
}

// DTOs para criação (Remove dependência de 'any' nos serviços)
export type CreateGuaranteeDTO = Omit<Guarantee, 'id' | 'status' | 'user_id'> & { user_id: string };
export type SaveAddressDTO = Omit<Endereco, 'id' | 'user_id'>;

export interface LoanOffer {
  id: string;
  lender_id: string;
  lender_name: string;
  amount: number;
  interest_rate: number;
  months: number;
  description: string;
  created_at: string;
}

export interface LoanRequest {
  id: string;
  offer_id: string;
  borrower_id: string;
  borrower_name: string;
  status: LoanStatus;
  request_date: string;
  amount_requested: number;
}

export interface LoanContract {
  id: string;
  offer_id: string;
  borrower_id: string;
  lender_id: string;
  borrower_name: string;
  status: LoanStatus;
  total_amount: number;
  monthly_payment: number;
  remaining_amount: number;
  months_total: number;
  months_paid: number;
  created_at: string;
  next_payment_date: string;
}

export interface Parcela {
  id: string;
  contract_id: string;
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  status: 'PENDING' | 'PAID' | 'LATE';
  data_pagamento?: string;
}

export interface Documento {
  id: string;
  user_id: string;
  tipo: string;
  nome_arquivo: string;
  status: 'PENDING' | 'ANALYSIS' | 'APPROVED' | 'REJECTED';
  data_envio: string;
  url?: string;
}

export interface Recompensa {
  id: string;
  titulo: string;
  descricao: string;
  custo_pontos: number;
  categoria: 'DESCONTO' | 'CASHBACK' | 'CONSULTORIA' | 'PREMIUM';
  imagem_url?: string;
}

export interface RecompensaResgatada {
  id: string;
  user_id: string;
  recompensa_id: string;
  data_resgate: string;
  codigo?: string;
}

export interface Indicacao {
  id: string;
  user_id: string;
  nome_indicado: string;
  email_indicado: string;
  status: 'SENT' | 'REGISTERED' | 'CONVERTED';
  data_indicacao: string;
  pontos_ganhos?: number;
}

// ADMIN TYPES
export interface Challenge {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  type: 'DAILY' | 'WEEKLY' | 'SPECIAL';
  active: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  icon: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  target: 'ALL' | 'GROUP' | 'USER';
  created_at: string;
}

export interface Partner {
  id: string;
  name: string;
  type: 'BANK' | 'FINTECH' | 'CONSULTANCY';
  status: 'ACTIVE' | 'INACTIVE';
  contact_email: string;
}

export interface SystemSettings {
  platform_name: string;
  maintenance_mode: boolean;
  min_loan_value: number;
  max_loan_value: number;
  base_interest_rate: number;
}

// UI Types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}