
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { supabaseService } from '../services/supabaseService';
import { LoanRequest, LoanStatus } from '../types';
import { useAuth } from '../App';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { getFriendlyErrorMessage } from '../utils/errorHandling';

export const Solicitacoes: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Show requests where I am the borrower
      supabaseService.db.getLoanRequests(user.id, false)
        .then(data => {
            setRequests(data);
            setError(null);
        })
        .catch(err => {
            console.error(err);
            setError(getFriendlyErrorMessage(err));
        });
    }
  }, [user]);

  const getStatusColor = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.APPROVED: return 'text-green-600 bg-green-100';
      case LoanStatus.REJECTED: return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Minhas Solicitações</h1>
        <p className="text-slate-500">Acompanhe o status dos seus pedidos de empréstimo.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-200 text-red-600 rounded-lg">
            {error}
        </div>
      )}

      <div className="space-y-4">
        {requests.length === 0 && !error && (
          <div className="text-center py-10 bg-white border border-slate-200 rounded-lg">
            <Clock className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <p className="text-slate-500">Nenhuma solicitação encontrada.</p>
          </div>
        )}
        {requests.map((req) => (
          <Card key={req.id}>
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Solicitado em {new Date(req.request_date).toLocaleDateString()}</p>
                <h3 className="text-xl font-bold text-slate-900">R$ {req.amount_requested.toLocaleString('pt-BR')}</h3>
                <p className="text-sm font-medium text-slate-600">Para oferta #{req.offer_id.substring(0,6)}</p>
              </div>
              
              <div className={`px-4 py-2 rounded-full font-bold flex items-center ${getStatusColor(req.status)}`}>
                {req.status === LoanStatus.PENDING && <Clock className="w-4 h-4 mr-2" />}
                {req.status === LoanStatus.APPROVED && <CheckCircle className="w-4 h-4 mr-2" />}
                {req.status === LoanStatus.REJECTED && <XCircle className="w-4 h-4 mr-2" />}
                {req.status === LoanStatus.PENDING ? 'Aguardando Aprovação' : 
                 req.status === LoanStatus.APPROVED ? 'Aprovado' : 'Rejeitado'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
