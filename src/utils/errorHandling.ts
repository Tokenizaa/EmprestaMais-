
export class AppError extends Error {
  public type: 'VALIDATION' | 'NETWORK' | 'AUTH' | 'SERVER';
  public originalError?: any;

  constructor(message: string, type: 'VALIDATION' | 'NETWORK' | 'AUTH' | 'SERVER' = 'SERVER', originalError?: any) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.originalError = originalError;
  }
}

/**
 * Tenta executar uma função assíncrona múltiplas vezes em caso de falha.
 * @param fn Função assíncrona a ser executada
 * @param retries Número máximo de tentativas (padrão: 3)
 * @param delay Tempo de espera entre tentativas em ms (padrão: 1000)
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // Não tenta novamente se for erro de validação ou autenticação (erros definitivos)
    if (error instanceof AppError && (error.type === 'VALIDATION' || error.type === 'AUTH')) {
      throw error;
    }

    if (retries <= 0) {
      if (error instanceof AppError) throw error;
      throw new AppError('Ocorreu um erro temporário. Por favor, tente novamente.', 'NETWORK', error);
    }

    console.warn(`Tentativa falhou. Tentando novamente em ${delay}ms... (${retries} restantes)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2); // Backoff exponencial
  }
}

export const getFriendlyErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
};
