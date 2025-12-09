import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoanOffer, UserRole } from '../types';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from '../App';
import { CheckCircle } from 'lucide-react';

export const Propostas: React.FC = () => {
  const [offers, setOffers] = useState<LoanOffer[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    supabaseService.db.getOffers().then(setOffers);
  }, []);

  const handleApply = async (offer: LoanOffer) => {
    if (!user) return;
    // Cannot request own loan
    if (offer.lender_id === user.id) {
        alert('Você não pode solicitar seu próprio empréstimo.');
        return;
    }

    if (confirm(`Deseja solicitar o empréstimo de R$ ${offer.amount}?`)) {
      try {
        await supabaseService.db.createLoanRequest(offer, user);
        alert('Solicitação enviada com sucesso! Acompanhe em "Solicitações".');
      } catch (e) {
        alert('Erro ao processar solicitação.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Empréstimos Disponíveis</h1>
        <p className="text-slate-500">Encontre a melhor oferta para o seu perfil.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <Card key={offer.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {offer.months} meses
                </div>
                <span className="text-slate-400 text-xs">
                  {new Date(offer.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-slate-900">R$ {offer.amount.toLocaleString('pt-BR')}</h3>
                <p className="text-sm text-slate-500 mt-1">{offer.description}</p>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Taxa de Juros</span>
                  <span className="font-medium text-slate-900">{offer.interest_rate}% a.m.</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Emprestador</span>
                  <span className="font-medium text-slate-900">{offer.lender_name}</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => handleApply(offer)}
                disabled={user?.role === UserRole.ADMIN} // Admins apenas gerenciam
              >
                Solicitar Agora
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};