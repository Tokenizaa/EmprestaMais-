
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabaseService } from '../services/supabaseService';
import { Guarantee, GuaranteeType } from '../types';
import { useAuth } from '../App';
import { useUserPoints } from '../hooks/useUserPoints';
import { Car, Home, Shield, Plus, X } from 'lucide-react';
import { getFriendlyErrorMessage } from '../utils/errorHandling';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { guaranteeSchema, GuaranteeFormData } from '../utils/schemas';
import { useToast } from '../contexts/ToastContext';

export const Garantias: React.FC = () => {
  const { user } = useAuth();
  const { addPoints } = useUserPoints();
  const [guarantees, setGuarantees] = useState<Guarantee[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<GuaranteeFormData>({
    resolver: zodResolver(guaranteeSchema),
    defaultValues: {
      tipo_garantia: GuaranteeType.VEHICLE,
      descricao: '',
      valor_estimado: 0,
      deseja_vender: false
    }
  });

  useEffect(() => {
    if (user) {
      supabaseService.db.getGuarantees(user.id).then(setGuarantees).catch(console.error);
    }
  }, [user]);

  const onSubmit = async (data: GuaranteeFormData) => {
    if (!user) return;
    setLoading(true);
    try {
      await supabaseService.db.createGuarantee({
        ...data,
        user_id: user.id
      });
      
      await addPoints(50, 'Cadastro de Garantia');
      addToast({
        type: 'success',
        title: 'Sucesso',
        message: 'Garantia cadastrada! Você ganhou 50 pontos.'
      });

      setIsAdding(false);
      reset();
      
      const updated = await supabaseService.db.getGuarantees(user.id);
      setGuarantees(updated);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro',
        message: getFriendlyErrorMessage(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: GuaranteeType) => {
    switch (type) {
      case GuaranteeType.VEHICLE: return <Car className="h-6 w-6 text-blue-500" />;
      case GuaranteeType.PROPERTY: return <Home className="h-6 w-6 text-emerald-500" />;
      default: return <Shield className="h-6 w-6 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Minhas Garantias</h1>
          <p className="text-slate-400">Cadastre bens para aumentar seu limite de crédito e reduzir taxas.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? 'outline' : 'primary'}>
          {isAdding ? <><X className="mr-2 h-4 w-4" /> Cancelar</> : <><Plus className="mr-2 h-4 w-4" /> Nova Garantia</>}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-indigo-500/30 shadow-lg bg-slate-800/50">
          <CardHeader>
            <CardTitle>Adicionar Nova Garantia</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Tipo de Bem</label>
                  <select 
                    {...register('tipo_garantia')}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 text-white px-3 py-2"
                  >
                    <option value={GuaranteeType.VEHICLE}>Veículo</option>
                    <option value={GuaranteeType.PROPERTY}>Imóvel</option>
                    <option value={GuaranteeType.OTHER}>Outros</option>
                  </select>
                  {errors.tipo_garantia?.message && <p className="text-xs text-red-500 mt-1">{String(errors.tipo_garantia.message)}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Valor Estimado (R$)</label>
                  <input 
                    type="number"
                    {...register('valor_estimado', { valueAsNumber: true })}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 text-white px-3 py-2"
                    min="0"
                  />
                  {errors.valor_estimado && <p className="text-xs text-red-500 mt-1">{errors.valor_estimado.message}</p>}
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
                  <input 
                    type="text"
                    {...register('descricao')}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 text-white px-3 py-2"
                    placeholder="Ex: Honda Civic 2020 Preto"
                  />
                  {errors.descricao && <p className="text-xs text-red-500 mt-1">{errors.descricao.message}</p>}
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox"
                    id="vender"
                    {...register('deseja_vender')}
                    className="rounded border-slate-700 bg-slate-950 text-primary focus:ring-primary"
                  />
                  <label htmlFor="vender" className="text-sm text-slate-300 cursor-pointer">Aceito vender este bem como garantia</label>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button type="submit" isLoading={loading}>Cadastrar Garantia</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guarantees.length === 0 && !isAdding && (
          <div className="col-span-full text-center py-12 bg-slate-800/30 rounded-lg border border-dashed border-slate-700">
            <Shield className="mx-auto h-12 w-12 text-slate-500 mb-2" />
            <p className="text-slate-400">Nenhuma garantia cadastrada.</p>
          </div>
        )}
        {guarantees.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">{getIcon(item.tipo_garantia)}</div>
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                  item.status === 'VERIFIED' ? 'bg-green-500/10 text-green-400' : 
                  item.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {item.status === 'VERIFIED' ? 'Verificado' : item.status === 'PENDING' ? 'Em Análise' : 'Rejeitado'}
                </span>
              </div>
              <h3 className="font-bold text-lg text-white">{item.descricao}</h3>
              <p className="text-slate-400 text-sm mb-4">Valor: R$ {item.valor_estimado.toLocaleString('pt-BR')}</p>
              
              {item.deseja_vender && (
                <div className="text-xs bg-indigo-500/10 text-indigo-400 p-2 rounded mt-2 border border-indigo-500/20 text-center">
                  Disponível para venda
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
