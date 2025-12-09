
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valida as regras de negócio para criação de oferta de empréstimo.
 * Centraliza limites de valores, taxas e restrições de nível do usuário.
 */
export const validateLoanOfferRules = (amount: number, months: number, rate: number, userLevel: number): ValidationResult => {
  // Regra 1: Nível mínimo para investir
  if (userLevel < 2) {
    return { 
      isValid: false, 
      error: "Você precisa ser Nível 2 ou superior para oferecer empréstimos. Complete seu perfil para subir de nível." 
    };
  }

  // Regra 2: Valor Mínimo
  if (amount < 100) {
    return { 
      isValid: false, 
      error: "O valor mínimo para empréstimo é R$ 100,00." 
    };
  }

  // Regra 3: Limite de Valor por Nível
  if (amount > 50000 && userLevel < 5) {
    return { 
      isValid: false, 
      error: `Seu nível atual (${userLevel}) permite ofertas de até R$ 50.000,00. Torne-se um investidor qualificado (Nível 5) para limites maiores.` 
    };
  }

  // Regra 4: Limites de Prazo (Meses)
  if (months < 1 || months > 60) {
    return {
      isValid: false,
      error: "O prazo deve ser entre 1 e 60 meses."
    };
  }

  // Regra 5: Limites de Taxa de Juros (Proteção contra usura ou erro de digitação)
  if (rate <= 0.1 || rate > 20) {
    return {
      isValid: false,
      error: "A taxa de juros deve estar entre 0.1% e 20% ao mês."
    };
  }

  return { isValid: true };
};
