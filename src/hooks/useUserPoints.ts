
import { useAuth } from '../App';
import { supabaseService } from '../services/supabaseService';

export const useUserPoints = () => {
  const { user, refreshUser } = useAuth();

  /**
   * Adiciona pontos ao usuário logado e recalcula o nível automaticamente.
   * @param amount Quantidade de pontos a adicionar
   * @param reason Razão da pontuação (para logs futuros ou notificações)
   */
  const addPoints = async (amount: number, reason: string) => {
    if (!user) return;

    try {
      const currentPoints = user.points || 0;
      const newPoints = currentPoints + amount;
      
      // Lógica de Nível: Sobe de nível a cada 500 pontos
      // Nível 1 (0-499), Nível 2 (500-999), etc.
      const newLevel = Math.floor(newPoints / 500) + 1;

      console.log(`[Gamification] Adding ${amount} points for: ${reason}. Total: ${newPoints}. Level: ${newLevel}`);

      await supabaseService.auth.updateProfile(user.id, {
        points: newPoints,
        level: newLevel
      });

      // Atualiza o contexto do usuário para refletir as mudanças na UI imediatamente
      await refreshUser();
    } catch (error) {
      console.error('Erro ao atualizar pontos:', error);
      // Não lançamos erro aqui para não interromper o fluxo principal do usuário
      // (ex: salvar perfil não deve falhar se o sistema de pontos falhar)
    }
  };

  return { addPoints };
};
