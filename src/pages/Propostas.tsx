
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoanOffer, UserRole } from '../types';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from '../App';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { getFriendlyErrorMessage } from '../utils/errorHandling';

export const Propostas: React.FC = () => {
  const [offers, setOffers] = useState<LoanOffer[]>([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    supabaseService.db.getOffers().then(setOffers).catch(console.error);
  }, []);

  const handleApply = async (offer: LoanOffer) => {
    if (!user) return;
    // Cannot request own loan
    if (offer.lender_id === user.id) {
        alert('Você não pode solicitar seu próprio empréstimo.');
        return;
    }

    if (confirm(`Deseja solicitar o empréstimo de R$ ${offer.amount.toLocaleString('pt-BR')}?`)) {
      setIsLoading(true);
      try {
        await supabaseService.db.createLoanRequest(offer, user);
        alert('Solicitação enviada com sucesso! Acompanhe em "Solicitações".');
      } catch (e) {
        alert(getFriendlyErrorMessage(e));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Empréstimos Disponíveis</h1>
        <p className="text-slate-400">Encontre a melhor oferta para o seu perfil.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.length === 0 && (
          <div className="col-span-full p-8 text-center bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-slate-400">Nenhuma oferta disponível no momento.</p>
          </div>
        )}
        {offers.map((offer) => (
          <Card key={offer.id} className="hover:border-indigo-500/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {offer.months} meses
                </div>
                <span className="text-slate-500 text-xs">
                  {new Date(offer.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-white">R$ {offer.amount.toLocaleString('pt-BR')}</h3>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{offer.description}</p>
              </div>

              <div className="space-y-3 mb-6 p-3 bg-slate-900/50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Taxa de Juros</span>
                  <span className="font-bold text-emerald-400">{offer.interest_rate}% a.m.</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Emprestador</span>
                  <span className="font-medium text-slate-300">{offer.lender_name}</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => handleApply(offer)}
                disabled={user?.role === UserRole.ADMIN || isLoading}
                variant={user?.role === UserRole.ADMIN ? 'outline' : 'primary'}
              >
                {user?.role === UserRole.ADMIN ? 'Apenas Visualização' : 'Solicitar Agora'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
