
/**
 * Calcula o valor da parcela de um empréstimo baseado no Sistema Price (Amortização Constante).
 * Fórmula: PMT = PV * i / (1 - (1 + i)^-n)
 * 
 * @param amount Valor do empréstimo (PV)
 * @param monthlyRatePercent Taxa de juros mensal em porcentagem (ex: 2.5 para 2.5%)
 * @param months Número de meses (n)
 * @returns Valor da parcela mensal
 */
export const calculateInstallment = (amount: number, monthlyRatePercent: number, months: number): number => {
  if (months <= 0 || amount <= 0) return 0;
  
  // Tratamento para taxa zero (apenas divisão simples)
  if (monthlyRatePercent === 0) return amount / months;

  const i = monthlyRatePercent / 100;
  // Evita divisão por zero ou resultados infinitos
  const denominator = 1 - Math.pow(1 + i, -months);
  if (denominator === 0) return amount / months;

  const pmt = (amount * i) / denominator;
  
  return pmt;
};

/**
 * Calcula o montante total a ser pago/recebido ao final do contrato.
 */
export const calculateTotalAmount = (installment: number, months: number): number => {
  return installment * months;
};
