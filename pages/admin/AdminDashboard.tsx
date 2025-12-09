import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { supabaseService } from '../../services/supabaseService';
import { LoanOffer, UserProfile } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, DollarSign, FileText, AlertTriangle, ArrowUpRight } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [offers, setOffers] = useState<LoanOffer[]>([]);
  const [totalVolume, setTotalVolume] = useState(0);
  
  // Dados Mock para os gráficos (já que não temos histórico real completo no mock service)
  const chartData = [
    { name: 'Jan', volume: 4000, usuarios: 24 },
    { name: 'Fev', volume: 3000, usuarios: 18 },
    { name: 'Mar', volume: 2000, usuarios: 35 },
    { name: 'Abr', volume: 2780, usuarios: 42 },
    { name: 'Mai', volume: 1890, usuarios: 45 },
    { name: 'Jun', volume: 2390, usuarios: 55 },
    { name: 'Jul', volume: 3490, usuarios: 60 },
  ];

  useEffect(() => {
    supabaseService.db.getOffers().then(data => {
      setOffers(data);
      setTotalVolume(data.reduce((acc, curr) => acc + curr.amount, 0));
    });
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
            <p className="text-slate-400">Visão geral da performance da plataforma.</p>
         </div>
         <div className="flex space-x-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center">
               <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span> Sistema Operante
            </span>
         </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="elevated" className="border-l-4 border-l-indigo-500">
           <CardContent className="p-6">
              <div className="flex justify-between items-start">
                 <div>
                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Volume Total</p>
                    <h3 className="text-2xl font-bold text-white mt-1">R$ {totalVolume.toLocaleString()}</h3>
                 </div>
                 <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <DollarSign size={20} />
                 </div>
              </div>
              <div className="mt-4 text-xs text-emerald-400 flex items-center">
                 <ArrowUpRight size={14} className="mr-1" /> +12% vs mês anterior
              </div>
           </CardContent>
        </Card>

        <Card variant="elevated" className="border-l-4 border-l-blue-500">
           <CardContent className="p-6">
              <div className="flex justify-between items-start">
                 <div>
                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Usuários</p>
                    <h3 className="text-2xl font-bold text-white mt-1">1,234</h3>
                 </div>
                 <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <Users size={20} />
                 </div>
              </div>
              <div className="mt-4 text-xs text-emerald-400 flex items-center">
                 <ArrowUpRight size={14} className="mr-1" /> +45 novos esta semana
              </div>
           </CardContent>
        </Card>

        <Card variant="elevated" className="border-l-4 border-l-amber-500">
           <CardContent className="p-6">
              <div className="flex justify-between items-start">
                 <div>
                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Ofertas Ativas</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{offers.length}</h3>
                 </div>
                 <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                    <FileText size={20} />
                 </div>
              </div>
              <div className="mt-4 text-xs text-slate-500">
                 Média de juros: 2.1% a.m.
              </div>
           </CardContent>
        </Card>

        <Card variant="elevated" className="border-l-4 border-l-red-500">
           <CardContent className="p-6">
              <div className="flex justify-between items-start">
                 <div>
                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Risco Médio</p>
                    <h3 className="text-2xl font-bold text-white mt-1">Baixo</h3>
                 </div>
                 <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                    <AlertTriangle size={20} />
                 </div>
              </div>
              <div className="mt-4 text-xs text-red-400 flex items-center">
                 Inadimplência: 1.2% (Estável)
              </div>
           </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card variant="elevated" className="h-[400px]">
            <CardHeader>
               <CardTitle>Volume de Empréstimos (6 Meses)</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                     <XAxis dataKey="name" stroke="#94a3b8" />
                     <YAxis stroke="#94a3b8" />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                     />
                     <Bar dataKey="volume" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </CardContent>
         </Card>

         <Card variant="elevated" className="h-[400px]">
            <CardHeader>
               <CardTitle>Crescimento de Usuários</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                     <XAxis dataKey="name" stroke="#94a3b8" />
                     <YAxis stroke="#94a3b8" />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                     />
                     <Line type="monotone" dataKey="usuarios" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 8}} />
                  </LineChart>
               </ResponsiveContainer>
            </CardContent>
         </Card>
      </div>

      {/* Recent Activity Table */}
      <Card variant="elevated">
         <CardHeader>
            <CardTitle>Atividade Recente do Sistema</CardTitle>
         </CardHeader>
         <CardContent>
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                     <tr>
                        <th className="px-6 py-3 rounded-l-lg">ID</th>
                        <th className="px-6 py-3">Tipo</th>
                        <th className="px-6 py-3">Descrição</th>
                        <th className="px-6 py-3">Valor</th>
                        <th className="px-6 py-3 rounded-r-lg">Data</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                     {offers.slice(0, 5).map(offer => (
                        <tr key={offer.id} className="hover:bg-slate-800/30 transition-colors">
                           <td className="px-6 py-4 font-mono text-slate-500">#{offer.id.substring(0, 6)}</td>
                           <td className="px-6 py-4"><span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-xs font-bold">Oferta</span></td>
                           <td className="px-6 py-4 text-slate-300">{offer.description}</td>
                           <td className="px-6 py-4 text-white font-bold">R$ {offer.amount.toLocaleString()}</td>
                           <td className="px-6 py-4 text-slate-400">{new Date(offer.created_at).toLocaleDateString()}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </CardContent>
      </Card>
    </div>
  );
};
