
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from '../App';
import { DollarSign, AlertTriangle, Lock, Calculator, AlertCircle } from 'lucide-react';
import { getFriendlyErrorMessage } from '../utils/errorHandling';
import { useFinancialCalculations } from '../hooks/useFinancialCalculations';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loanOfferSchema, LoanOfferFormData } from '../utils/schemas';
import { useToast } from '../contexts/ToastContext';

export const QueroEmprestar: React.FC = () => {
  const { user } = useAuth();
  const { calculateMonthlyPayment, calculateTotalReturn, validateLoanOffer } = useFinancialCalculations();
  const [isLoading, setIsLoading] = useState(false);
  const [businessError, setBusinessError] = useState<string | null>(null);
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<LoanOfferFormData>({
    resolver: zodResolver(loanOfferSchema),
    defaultValues: {
      amount: 1000,
      interest_rate: 2.0,
      months: 12,
      description: ''
    }
  });

  // Watch fields for real-time calculation
  const amount = watch('amount');
  const rate = watch('interest_rate');
  const months = watch('months');

  // Real-time calculations
  const installment = calculateMonthlyPayment(amount || 0, rate || 0, months || 0);
  const totalReturn = calculateTotalReturn(installment, months || 0);
  const profit = totalReturn - (amount || 0);

  const onSubmit = async (data: LoanOfferFormData) => {
    if(!user) return;
    setBusinessError(null);
    
    // Business Rule Validation (Extra layer beyond schema)
    const validation = validateLoanOffer(data.amount, data.months, data.interest_rate, user.level);
    if (!validation.isValid) {
      setBusinessError(validation.error || 'Erro de validação desconhecido.');
      addToast({
        type: 'warning',
        title: 'Validação',
        message: validation.error || 'Verifique os dados da oferta.'
      });
      return;
    }

    setIsLoading(true);
    try {
        await supabaseService.db.createOffer({
            lender_id: user.id,
            lender_name: user.nome_completo,
            amount: data.amount,
            interest_rate: data.interest_rate,
            months: data.months,
            description: data.description
        }, user.level);
        
        addToast({
          type: 'success',
          title: 'Oferta Publicada!',
          message: 'Sua oferta de empréstimo já está disponível no mercado.'
        });
        reset();
    } catch(error: any) {
        addToast({
          type: 'error',
          title: 'Erro ao criar oferta',
          message: getFriendlyErrorMessage(error)
        });
    } finally {
        setIsLoading(false);
    }
  };

  // Level Lock UI
  if (user && user.level < 2) {
      return (
          <div className="max-w-4xl mx-auto py-12 text-center animate-fade-in">
              <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 inline-block backdrop-blur-sm">
                  <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-slate-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Recurso Bloqueado</h2>
                  <p className="text-slate-400 mt-2 max-w-md">
                      Para garantir a segurança da plataforma, apenas usuários <strong>Nível 2</strong> ou superior podem atuar como investidores.
                  </p>
                  <div className="mt-6 p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                     <p className="text-sm text-indigo-300">
                        <strong>Como desbloquear?</strong><br/>
                        Complete seu perfil, cadastre garantias ou pague empréstimos em dia para subir de nível.
                     </p>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div>
        <h1 className="text-2xl font-bold text-white">Quero Emprestar (Investir)</h1>
        <p className="text-slate-400">Crie uma oferta de empréstimo e receba juros mensais.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <Card>
              <CardHeader>
                  <CardTitle>Configurar Oferta</CardTitle>
              </CardHeader>
              <CardContent>
                  {businessError && (
                      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start text-red-400 text-sm">
                          <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{businessError}</span>
                      </div>
                  )}
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Valor a Emprestar (R$)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-500">R$</span>
                            <input 
                                type="number" 
                                {...register('amount', { valueAsNumber: true })}
                                className={`w-full bg-slate-950 border rounded-lg p-2 pl-10 text-white focus:ring-2 focus:ring-primary ${errors.amount ? 'border-red-500' : 'border-slate-700'}`}
                            />
                          </div>
                          {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
                          <div className="flex justify-between mt-1">
                             <span className="text-xs text-slate-500">Mínimo: R$ 100,00</span>
                             <span className="text-xs text-slate-500">Máximo: {user && user.level < 5 ? 'R$ 50.000' : 'Ilimitado'}</span>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Juros Mensal (%)</label>
                            <input 
                                type="number" 
                                step="0.1" 
                                {...register('interest_rate', { valueAsNumber: true })}
                                className={`w-full bg-slate-950 border rounded-lg p-2 text-white focus:ring-2 focus:ring-primary ${errors.interest_rate ? 'border-red-500' : 'border-slate-700'}`}
                            />
                            {errors.interest_rate && <p className="text-xs text-red-500 mt-1">{errors.interest_rate.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Prazo (Meses)</label>
                            <input 
                                type="number" 
                                {...register('months', { valueAsNumber: true })}
                                className={`w-full bg-slate-950 border rounded-lg p-2 text-white focus:ring-2 focus:ring-primary ${errors.months ? 'border-red-500' : 'border-slate-700'}`}
                            />
                            {errors.months && <p className="text-xs text-red-500 mt-1">{errors.months.message}</p>}
                        </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Descrição/Objetivo</label>
                          <textarea 
                            {...register('description')}
                            className={`w-full bg-slate-950 border rounded-lg p-2 text-white focus:ring-2 focus:ring-primary ${errors.description ? 'border-red-500' : 'border-slate-700'}`}
                            rows={3} 
                            placeholder="Ex: Empréstimo para pequenos empreendedores da região." 
                          />
                          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                      </div>

                      <Button type="submit" className="w-full shadow-lg shadow-primary/20" isLoading={isLoading}>
                        Publicar Oferta
                      </Button>
                  </form>
              </CardContent>
          </Card>

          {/* Simulator / Preview */}
          <div className="space-y-6">
              <Card variant="elevated" className="border-l-4 border-l-emerald-500 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Calculator size={100} className="text-emerald-500" />
                  </div>
                  <CardContent className="p-6 relative z-10">
                      <h3 className="font-bold text-emerald-400 mb-4 flex items-center">
                          <DollarSign className="w-5 h-5 mr-2"/> Retorno Estimado
                      </h3>
                      
                      <div className="flex flex-col space-y-1 mb-6">
                          <span className="text-sm text-slate-400">Montante Total a Receber</span>
                          <span className="text-3xl font-bold text-white">
                              R$ {totalReturn.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </span>
                      </div>
                      
                      <div className="space-y-3 pt-4 border-t border-white/10">
                         <div className="flex justify-between text-sm">
                             <span className="text-slate-400">Investimento:</span>
                             <span className="font-medium text-white">R$ {(amount || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                         </div>
                         <div className="flex justify-between text-sm">
                             <span className="text-slate-400">Parcela Mensal:</span>
                             <span className="font-medium text-emerald-300">R$ {installment.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                         </div>
                         <div className="flex justify-between text-sm bg-emerald-500/10 p-2 rounded">
                             <span className="text-emerald-200">Lucro Bruto Estimado:</span>
                             <span className="font-bold text-emerald-400">+ R$ {profit.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                         </div>
                      </div>
                  </CardContent>
              </Card>

              <Card className="bg-amber-900/10 border-amber-500/20">
                  <CardContent className="p-6">
                      <h3 className="font-bold text-amber-500 mb-2 flex items-center"><AlertTriangle className="w-5 h-5 mr-2"/> Regras da Plataforma</h3>
                      <ul className="text-sm text-amber-200/80 space-y-2 list-disc pl-4">
                          <li>Usuários Nível 1 não podem criar ofertas.</li>
                          <li>Valores acima de R$ 50.000 exigem Nível 5 (Investidor Qualificado).</li>
                          <li>A plataforma cobra uma taxa de serviço de 1% sobre os pagamentos recebidos.</li>
                      </ul>
                  </CardContent>
              </Card>
          </div>
      </div>
    </div>
  );
};
