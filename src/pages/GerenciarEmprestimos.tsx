
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabaseService } from '../services/supabaseService';
import { LoanRequest, LoanContract, LoanStatus } from '../types';
import { useAuth } from '../App';
import { Check, X, User, AlertCircle } from 'lucide-react';
import { getFriendlyErrorMessage } from '../utils/errorHandling';

export const GerenciarEmprestimos: React.FC = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<LoanRequest[]>([]);
  const [activeContracts, setActiveContracts] = useState<LoanContract[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = () => {
    if (user) {
      supabaseService.db.getLoanRequests(user.id, true).then(setPendingRequests).catch(console.error);
      supabaseService.db.getContracts(user.id, user.role).then(contracts => {
          setActiveContracts(contracts.filter(c => c.lender_id === user.id));
      }).catch(console.error);
    }
  };

  const handleApprove = async (req: LoanRequest) => {
      if(!user) return;
      if(confirm(`Aprovar empréstimo para ${req.borrower_name} no valor de R$ ${req.amount_requested}?`)) {
          setLoadingAction(req.id);
          try {
             await supabaseService.db.approveLoanRequest(req.id, user.id);
             alert("Empréstimo aprovado com sucesso! O contrato foi gerado.");
             loadData();
          } catch (e) {
             alert(getFriendlyErrorMessage(e));
          } finally {
             setLoadingAction(null);
          }
      }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Gerenciar Empréstimos</h1>
        <p className="text-slate-400">Aprovar solicitações e acompanhar recebimentos.</p>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-white border-l-4 border-amber-500 pl-3">Solicitações Pendentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.length === 0 && (
                <div className="col-span-full p-6 bg-slate-800/30 rounded-lg text-slate-500 text-center border border-slate-700">
                    Nenhuma solicitação pendente no momento.
                </div>
            )}
            {pendingRequests.map(req => (
                <Card key={req.id} variant="elevated" className="border-l-4 border-l-amber-500">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="bg-slate-700 p-2 rounded-full text-slate-300"><User size={20} /></div>
                                <div>
                                    <p className="font-bold text-white">{req.borrower_name}</p>
                                    <p className="text-xs text-slate-400">Solicitado em: {new Date(req.request_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <span className="font-bold text-amber-400 text-lg">R$ {req.amount_requested.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex space-x-3 mt-4">
                            <Button 
                                size="sm" 
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0" 
                                onClick={() => handleApprove(req)}
                                isLoading={loadingAction === req.id}
                            >
                                <Check size={16} className="mr-2" /> Aprovar
                            </Button>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1 border-red-500/30 text-red-500 hover:bg-red-500/10"
                                disabled={loadingAction === req.id}
                            >
                                <X size={16} className="mr-2" /> Recusar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-white border-l-4 border-emerald-500 pl-3">Contratos Ativos (A Receber)</h2>
        <div className="space-y-4">
            {activeContracts.length === 0 && (
                 <div className="p-6 bg-slate-800/30 rounded-lg text-slate-500 text-center border border-slate-700">
                    Você ainda não possui contratos ativos.
                 </div>
            )}
            {activeContracts.map(contract => (
                <Card key={contract.id} variant="glass">
                    <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-400 border border-emerald-500/20">
                                <Check size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-white text-lg">{contract.borrower_name}</p>
                                <p className="text-sm text-slate-400">Total Restante: <span className="text-white font-mono">R$ {contract.remaining_amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></p>
                            </div>
                        </div>
                        <div className="text-right bg-slate-900/50 p-3 rounded-lg border border-white/5 min-w-[200px]">
                             <p className="font-bold text-emerald-400">+ R$ {contract.monthly_payment.toLocaleString('pt-BR', {minimumFractionDigits: 2})}<span className="text-xs text-slate-500 font-normal">/mês</span></p>
                             <p className="text-xs text-slate-400 mt-1 flex justify-end items-center gap-1">
                                <AlertCircle size={10} /> 
                                Próx: {new Date(contract.next_payment_date).toLocaleDateString()}
                             </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </section>
    </div>
  );
};
