
import { calculateInstallment, calculateTotalAmount } from '../utils/financial';
import { validateLoanOfferRules, ValidationResult } from '../utils/businessRules';

export const useFinancialCalculations = () => {
  /**
   * Calcula o valor da parcela mensal (Tabela Price)
   */
  const calculateMonthlyPayment = (amount: number, rate: number, months: number): number => {
    return calculateInstallment(amount, rate, months);
  };

  /**
   * Calcula o retorno total (bruto)
   */
  const calculateTotalReturn = (installment: number, months: number): number => {
    return calculateTotalAmount(installment, months);
  };

  /**
   * Valida as regras de negócio para criação de oferta de empréstimo.
   * Utiliza a lógica centralizada de businessRules.
   */
  const validateLoanOffer = (amount: number, months: number, rate: number, userLevel: number): ValidationResult => {
    return validateLoanOfferRules(amount, months, rate, userLevel);
  };

  return {
    calculateMonthlyPayment,
    calculateTotalReturn,
    validateLoanOffer
  };
};