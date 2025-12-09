import { z } from 'zod';
import { validateCPF, validateCNPJ, validatePhone, validateCEP } from './validators';
import { GuaranteeType } from '../types';

export const userProfileSchema = z.object({
  nome_completo: z.string().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
  
  cpf_cnpj: z.string().refine((val) => {
    const clean = val.replace(/\D/g, '');
    if (clean.length <= 11) return validateCPF(clean);
    return validateCNPJ(clean);
  }, "CPF ou CNPJ inválido"),
  
  telefone: z.string().refine((val) => validatePhone(val), "Telefone inválido"),
  
  data_nascimento: z.string().refine((val) => {
    if (!val) return false;
    const date = new Date(val);
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return age >= 18;
  }, "Você deve ter pelo menos 18 anos"),

  email: z.string().email("Email inválido").optional(),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;

export const addressSchema = z.object({
  cep: z.string().refine((val) => validateCEP(val), "CEP inválido (8 dígitos)"),
  logradouro: z.string().min(3, "Logradouro obrigatório"),
  numero: z.string().min(1, "Número obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(2, "Bairro obrigatório"),
  cidade: z.string().min(2, "Cidade obrigatória"),
  estado: z.string().length(2, "UF inválida (2 letras)"),
});

export type AddressFormData = z.infer<typeof addressSchema>;

export const loanOfferSchema = z.object({
  amount: z.number().min(100, "Valor mínimo é R$ 100").max(1000000, "Valor excede o limite permitido"),
  interest_rate: z.number().min(0.1, "Taxa mínima é 0.1%").max(20, "Taxa máxima é 20%"),
  months: z.number().int().min(1, "Prazo mínimo é 1 mês").max(60, "Prazo máximo é 60 meses"),
  description: z.string().min(10, "Descrição muito curta (mín. 10 caracteres)").max(500, "Descrição muito longa"),
});

export type LoanOfferFormData = z.infer<typeof loanOfferSchema>;

export const guaranteeSchema = z.object({
  tipo_garantia: z.nativeEnum(GuaranteeType),
  valor_estimado: z.number().min(1, "Valor deve ser maior que zero"),
  descricao: z.string().min(3, "Descrição muito curta"),
  deseja_vender: z.boolean(),
});

export type GuaranteeFormData = z.infer<typeof guaranteeSchema>;

export const indicationSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
});

export type IndicationFormData = z.infer<typeof indicationSchema>;