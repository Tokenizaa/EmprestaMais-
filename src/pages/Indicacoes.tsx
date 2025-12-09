
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabaseService } from '../services/supabaseService';
import { Indicacao } from '../types';
import { useAuth } from '../App';
import { Users, Copy, Send, Star } from 'lucide-react';
import { getFriendlyErrorMessage } from '../utils/errorHandling';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { indicationSchema, IndicationFormData } from '../utils/schemas';

export const Indicacoes: React.FC = () => {
  const { user } = useAuth();
  const [indications, setIndications] = useState<Indicacao[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const referralLink = `https://emprestamais.app/registro?ref=${user?.id}`;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<IndicationFormData>({
    resolver: zodResolver(indicationSchema),
    defaultValues: {
      nome: '',
      email: ''
    }
  });

  useEffect(() => {
    if (user) {
      supabaseService.db.getIndications(user.id).then(setIndications);
    }
  }, [user]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Link copiado para a área de transferência!');
  };

  const onSubmit = async (data: IndicationFormData) => {
    if (!user) return;
    setIsLoading(true);
    try {
        await supabaseService.db.createIndication(user.id, data);
        alert('Convite enviado com sucesso!');
        reset();
        const updated = await supabaseService.db.getIndications(user.id);
        setIndications(updated);
    } catch(err) {
        alert(getFriendlyErrorMessage(err));
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white shadow-xl">
         <div className="relative z-10 max-w-xl">
            <h1 className="text-3xl font-bold mb-4">Indique e Ganhe</h1>
            <p className="text-indigo-100 text-lg mb-6">Convide amigos para a EmprestaMais. Ganhe <span className="font-bold text-amber-300">100 XP</span> para cada amigo que tiver um empréstimo aprovado.</p>
            
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-grow w-full">
                    <p className="text-xs text-indigo-200 mb-1">Seu Link Exclusivo</p>
                    <code className="block w-full bg-black/20 rounded px-3 py-2 text-sm font-mono truncate">
                        {referralLink}
                    </code>
                </div>
                <Button onClick={handleCopy} className="whitespace-nowrap bg-white text-indigo-600 hover:bg-indigo-50 border-0">
                    <Copy className="mr-2 h-4 w-4" /> Copiar Link
                </Button>
            </div>
         </div>
         
         <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent"></div>
         <Star className="absolute right-8 bottom-[-20px] text-white/20 w-48 h-48 rotate-12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
              <CardHeader>
                  <CardTitle>Enviar Convite por Email</CardTitle>
              </CardHeader>
              <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Nome do Amigo</label>
                          <input 
                            type="text" 
                            {...register('nome')}
                            className={`w-full bg-slate-950 border rounded-lg p-2 text-white focus:ring-2 focus:ring-primary ${errors.nome ? 'border-red-500' : 'border-slate-700'}`}
                          />
                          {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome.message}</p>}
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Email do Amigo</label>
                          <input 
                            type="email" 
                            {...register('email')}
                            className={`w-full bg-slate-950 border rounded-lg p-2 text-white focus:ring-2 focus:ring-primary ${errors.email ? 'border-red-500' : 'border-slate-700'}`}
                          />
                          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                      </div>
                      <Button type="submit" className="w-full" isLoading={isLoading}>
                          <Send className="mr-2 h-4 w-4" /> Enviar Convite
                      </Button>
                  </form>
              </CardContent>
          </Card>

          <Card>
              <CardHeader>
                  <CardTitle>Histórico de Indicações</CardTitle>
              </CardHeader>
              <CardContent>
                  {indications.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                          <Users className="mx-auto h-12 w-12 opacity-50 mb-2" />
                          <p>Você ainda não indicou ninguém.</p>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          {indications.map(ind => (
                              <div key={ind.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-800">
                                  <div className="flex items-center gap-3">
                                      <div className="bg-indigo-500/20 p-2 rounded-full text-indigo-400">
                                          <Users size={16} />
                                      </div>
                                      <div>
                                          <p className="font-bold text-white text-sm">{ind.nome_indicado}</p>
                                          <p className="text-xs text-slate-400">{ind.email_indicado}</p>
                                      </div>
                                  </div>
                                  <div>
                                      {ind.status === 'SENT' && <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">Enviado</span>}
                                      {ind.status === 'REGISTERED' && <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">Cadastrou</span>}
                                      {ind.status === 'CONVERTED' && <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded">Aprovado (+XP)</span>}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </CardContent>
          </Card>
      </div>
    </div>
  );
};
