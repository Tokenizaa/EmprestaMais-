import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabaseService } from '../services/supabaseService';
import { LoanRequest, LoanContract, LoanStatus } from '../types';
import { useAuth } from '../App';
import { Check, X, User } from 'lucide-react';

export const GerenciarEmprestimos: React.FC = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<LoanRequest[]>([]);
  const [activeContracts, setActiveContracts] = useState<LoanContract[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = () => {
    if (user) {
      // Get requests for my offers
      supabaseService.db.getLoanRequests(user.id, true).then(setPendingRequests);
      // Get contracts where I am the lender (assuming role check logic in service or simple filter here)
      supabaseService.db.getContracts(user.id, user.role).then(contracts => {
          setActiveContracts(contracts.filter(c => c.lender_id === user.id));
      });
    }
  };

  const handleApprove = async (req: LoanRequest) => {
      if(!user) return;
      if(confirm(`Aprovar empréstimo para ${req.borrower_name}?`)) {
          await supabaseService.db.approveLoanRequest(req.id, user.id);
          loadData();
      }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gerenciar Empréstimos</h1>
        <p className="text-slate-500">Aprovar solicitações e acompanhar recebimentos.</p>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-slate-800">Solicitações Pendentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.length === 0 && <p className="text-slate-500 text-sm">Nenhuma solicitação pendente.</p>}
            {pendingRequests.map(req => (
                <Card key={req.id} className="border-l-4 border-l-yellow-400">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-2">
                                <div className="bg-slate-200 p-2 rounded-full"><User size={16} /></div>
                                <div>
                                    <p className="font-bold text-slate-900">{req.borrower_name}</p>
                                    <p className="text-xs text-slate-500">Score: N/A</p>
                                </div>
                            </div>
                            <span className="font-bold text-indigo-600">R$ {req.amount_requested}</span>
                        </div>
                        <div className="flex space-x-2 mt-4">
                            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleApprove(req)}>
                                <Check size={16} className="mr-2" /> Aprovar
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50">
                                <X size={16} className="mr-2" /> Recusar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-slate-800">Contratos Ativos (A Receber)</h2>
        <div className="space-y-4">
            {activeContracts.length === 0 && <p className="text-slate-500 text-sm">Nenhum contrato ativo.</p>}
            {activeContracts.map(contract => (
                <Card key={contract.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="font-bold">{contract.borrower_name}</p>
                            <p className="text-sm text-slate-500">Restante: R$ {contract.remaining_amount.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                             <p className="font-medium text-green-600">+ R$ {contract.monthly_payment.toFixed(2)}/mês</p>
                             <p className="text-xs text-slate-400">Próx: {new Date(contract.next_payment_date).toLocaleDateString()}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </section>
    </div>
  );
};