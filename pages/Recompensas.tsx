
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabaseService } from '../services/supabaseService';
import { Recompensa, RecompensaResgatada } from '../types';
import { useAuth } from '../App';
import { Gift, Award, ShoppingBag, Zap } from 'lucide-react';

export const Recompensas: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [rewards, setRewards] = useState<Recompensa[]>([]);
  const [myRedemptions, setMyRedemptions] = useState<RecompensaResgatada[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    supabaseService.db.getRewards().then(setRewards);
    if(user) {
        supabaseService.db.getMyRewards(user.id).then(setMyRedemptions);
    }
  }, [user]);

  const handleRedeem = async (reward: Recompensa) => {
    if(!user) return;
    if(user.points < reward.custo_pontos) {
        alert("Você não tem pontos suficientes.");
        return;
    }

    if(confirm(`Deseja resgatar "${reward.titulo}" por ${reward.custo_pontos} pontos?`)) {
        setLoadingId(reward.id);
        try {
            await supabaseService.db.redeemReward(user.id, reward.id);
            alert("Resgate realizado com sucesso! Confira o código na aba 'Meus Resgates'.");
            await refreshUser(); // Atualiza saldo de pontos
            const updated = await supabaseService.db.getMyRewards(user.id);
            setMyRedemptions(updated);
        } catch(e) {
            alert("Erro ao resgatar recompensa.");
        } finally {
            setLoadingId(null);
        }
    }
  };

  const getIcon = (cat: string) => {
      switch(cat) {
          case 'DESCONTO': return <ShoppingBag className="text-pink-400" size={24} />;
          case 'PREMIUM': return <Award className="text-amber-400" size={24} />;
          default: return <Gift className="text-indigo-400" size={24} />;
      }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-white">Recompensas e Benefícios</h1>
           <p className="text-slate-400">Troque seus pontos XP por vantagens exclusivas.</p>
        </div>
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-full text-black font-bold">
                <Zap size={20} className="fill-black" />
            </div>
            <div>
                <p className="text-xs text-amber-200 uppercase font-bold tracking-wider">Seu Saldo</p>
                <p className="text-2xl font-bold text-amber-400">{user?.points || 0} XP</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rewards.map(reward => (
              <Card key={reward.id} className="relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-125 duration-500">
                      {getIcon(reward.categoria)}
                  </div>
                  <CardContent className="p-6 flex flex-col h-full">
                      <div className="bg-slate-800/50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-white/5">
                          {getIcon(reward.categoria)}
                      </div>
                      <h3 className="font-bold text-lg text-white mb-2">{reward.titulo}</h3>
                      <p className="text-sm text-slate-400 mb-6 flex-grow">{reward.descricao}</p>
                      
                      <div className="mt-auto">
                          <div className="flex justify-between items-center mb-3">
                              <span className="text-xs text-slate-500 font-bold uppercase">Custo</span>
                              <span className="font-bold text-indigo-400">{reward.custo_pontos} XP</span>
                          </div>
                          <Button 
                            className={`w-full ${user && user.points < reward.custo_pontos ? 'opacity-50' : ''}`}
                            variant={user && user.points >= reward.custo_pontos ? 'primary' : 'outline'}
                            disabled={user ? user.points < reward.custo_pontos : true}
                            onClick={() => handleRedeem(reward)}
                            isLoading={loadingId === reward.id}
                          >
                             {user && user.points >= reward.custo_pontos ? 'Resgatar Agora' : 'Pontos Insuficientes'}
                          </Button>
                      </div>
                  </CardContent>
              </Card>
          ))}
      </div>

      {myRedemptions.length > 0 && (
          <div className="pt-8 border-t border-slate-800">
              <h2 className="text-xl font-bold text-white mb-6">Meus Resgates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myRedemptions.map(redemption => {
                      const originalReward = rewards.find(r => r.id === redemption.recompensa_id);
                      return (
                          <div key={redemption.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex justify-between items-center">
                              <div>
                                  <p className="font-bold text-white">{originalReward?.titulo || 'Recompensa'}</p>
                                  <p className="text-xs text-slate-500">Resgatado em: {new Date(redemption.data_resgate).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-xs text-slate-400 mb-1">Seu Código:</p>
                                  <code className="bg-slate-950 px-3 py-1 rounded text-emerald-400 font-mono font-bold border border-slate-800">
                                      {redemption.codigo}
                                  </code>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      )}
    </div>
  );
};
