
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../App';
import { supabaseService } from '../services/supabaseService';
import { LoanContract, LoanStatus } from '../types';
import { TrendingUp, ShieldCheck, DollarSign, Award, ArrowRight, Zap, AlertCircle } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { getFriendlyErrorMessage } from '../utils/errorHandling';

const { Link } = ReactRouterDOM;

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeContracts, setActiveContracts] = useState<LoanContract[]>([]);
  const [totalDebt, setTotalDebt] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      supabaseService.db.getContracts(user.id, user.role)
        .then(contracts => {
          const active = contracts.filter(c => c.status === LoanStatus.ACTIVE && c.borrower_id === user.id);
          setActiveContracts(active);
          const debt = active.reduce((acc, curr) => acc + curr.remaining_amount, 0);
          setTotalDebt(debt);
          setError(null);
        })
        .catch(err => {
          console.error("Dashboard Error:", err);
          setError(getFriendlyErrorMessage(err));
        });
    }
  }, [user]);

  if (!user) return null;

  // Lógica de Gamificação Visual
  const pointsToNextLevel = 500 - (user.points % 500);
  const progressPercent = ((500 - pointsToNextLevel) / 500) * 100;

  return (
    <div className="space-y-8 animate-fade-in">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Não foi possível carregar alguns dados: {error}</span>
        </div>
      )}

      {/* Welcome & Gamification Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 to-purple-900 border border-white/10 shadow-2xl p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Olá, {user.nome_completo.split(' ')[0]}! 👋
            </h1>
            <p className="text-indigo-200 text-sm md:text-base">
              Você está no <span className="font-bold text-amber-400">Nível {user.level}</span>. Continue evoluindo para reduzir suas taxas.
            </p>
            
            <div className="mt-6 max-w-md">
              <div className="flex justify-between text-xs font-semibold text-indigo-300 mb-2">
                <span>XP Atual: {user.points}</span>
                <span>Próximo Nível: {Math.floor(user.points / 500) + 1} ({pointsToNextLevel} XP restantes)</span>
              </div>
              <div className="h-3 w-full bg-black/30 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
             <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <Award className="w-12 h-12 text-amber-400 drop-shadow-lg" />
             </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="glass">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Empréstimos Ativos</p>
              <h3 className="text-2xl font-bold text-white mt-1">{activeContracts.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <TrendingUp size={24} />
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Saldo Devedor</p>
              <h3 className="text-2xl font-bold text-white mt-1">R$ {totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
              <DollarSign size={24} />
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Limite Pré-Aprovado</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">R$ {(user.level * 2000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions & Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
           <h2 className="text-xl font-bold text-white flex items-center">
             <Zap className="mr-2 text-amber-400" size={20} /> Ações Rápidas
           </h2>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/propostas">
                <div className="group p-6 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 hover:border-indigo-500/60 transition-all cursor-pointer hover:shadow-lg hover:shadow-indigo-500/20">
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-indigo-500 rounded-lg text-white shadow-lg">
                        <DollarSign size={24} />
                      </div>
                      <ArrowRight className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
                   </div>
                   <h3 className="text-lg font-bold text-white">Solicitar Empréstimo</h3>
                   <p className="text-sm text-slate-400 mt-1">Simule e contrate crédito em segundos.</p>
                </div>
              </Link>

              <Link to="/garantias">
                <div className="group p-6 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer hover:shadow-lg hover:shadow-emerald-500/20">
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-emerald-500 rounded-lg text-white shadow-lg">
                        <ShieldCheck size={24} />
                      </div>
                      <ArrowRight className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
                   </div>
                   <h3 className="text-lg font-bold text-white">Cadastrar Garantia</h3>
                   <p className="text-sm text-slate-400 mt-1">Use seus bens para reduzir taxas de juros.</p>
                </div>
              </Link>
           </div>

           <h2 className="text-xl font-bold text-white mt-8 flex items-center">
             <AlertCircle className="mr-2 text-slate-400" size={20} /> Próximos Pagamentos
           </h2>
           
           <Card>
              <CardContent className="p-0">
                 {activeContracts.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                       Você não possui pagamentos pendentes.
                    </div>
                 ) : (
                    <div className="divide-y divide-slate-800">
                       {activeContracts.map(contract => (
                          <div key={contract.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                             <div>
                                <p className="font-bold text-white">Parcela Empréstimo</p>
                                <p className="text-xs text-slate-400">Vence em: {new Date(contract.next_payment_date).toLocaleDateString()}</p>
                             </div>
                             <div className="text-right">
                                <p className="font-bold text-white">R$ {contract.monthly_payment.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                                <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-indigo-300 h-8 px-2">Pagar</Button>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>

        {/* Right Column: Tips/Notifications */}
        <div className="space-y-6">
           <h2 className="text-xl font-bold text-white">Dicas para Você</h2>
           <Card variant="elevated" className="border-l-4 border-l-amber-500">
              <CardContent>
                 <h3 className="font-bold text-amber-500 mb-2">Aumente seu Score</h3>
                 <p className="text-sm text-slate-400 mb-4">
                    Completar seu perfil com dados profissionais pode aumentar seu score em até 200 pontos.
                 </p>
                 <Link to="/perfil">
                   <Button size="sm" variant="outline" className="w-full">Completar Perfil</Button>
                 </Link>
              </CardContent>
           </Card>

           <Card variant="elevated" className="border-l-4 border-l-purple-500">
              <CardContent>
                 <h3 className="font-bold text-purple-400 mb-2">Indique e Ganhe</h3>
                 <p className="text-sm text-slate-400">
                    Ganhe 100 XP para cada amigo que tiver um empréstimo aprovado.
                 </p>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
};
