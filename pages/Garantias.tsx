
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabaseService } from '../services/supabaseService';
import { Guarantee, GuaranteeType } from '../types';
import { useAuth } from '../App';
import { useUserPoints } from '../hooks/useUserPoints';
import { Car, Home, Shield, Plus, X } from 'lucide-react';

export const Garantias: React.FC = () => {
  const { user } = useAuth();
  const { addPoints } = useUserPoints(); // Hook de pontos
  const [guarantees, setGuarantees] = useState<Guarantee[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newGuarantee, setNewGuarantee] = useState<Partial<Guarantee>>({
    tipo_garantia: GuaranteeType.VEHICLE,
    descricao: '',
    valor_estimado: 0,
    deseja_vender: false
  });

  useEffect(() => {
    if (user) {
      supabaseService.db.getGuarantees(user.id).then(setGuarantees);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      await supabaseService.db.createGuarantee({
        ...newGuarantee as any,
        user_id: user.id
      });
      
      // Adiciona pontos ao usuário por cadastrar garantia
      await addPoints(50, 'Cadastro de Garantia');
      alert('Garantia cadastrada! Você ganhou 50 pontos.');

      setIsAdding(false);
      // Refresh list
      supabaseService.db.getGuarantees(user.id).then(setGuarantees);
    } catch (error) {
      alert('Erro ao criar garantia');
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
          <h1 className="text-2xl font-bold text-slate-900">Minhas Garantias</h1>
          <p className="text-slate-500">Cadastre bens para aumentar seu limite de crédito e reduzir taxas.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? <><X className="mr-2 h-4 w-4" /> Cancelar</> : <><Plus className="mr-2 h-4 w-4" /> Nova Garantia</>}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-indigo-200 shadow-lg">
          <CardHeader>
            <CardTitle>Adicionar Nova Garantia</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Bem</label>
                  <select 
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    value={newGuarantee.tipo_garantia}
                    onChange={(e) => setNewGuarantee({...newGuarantee, tipo_garantia: e.target.value as GuaranteeType})}
                  >
                    <option value={GuaranteeType.VEHICLE}>Veículo</option>
                    <option value={GuaranteeType.PROPERTY}>Imóvel</option>
                    <option value={GuaranteeType.OTHER}>Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Estimado (R$)</label>
                  <input 
                    type="number"
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    value={newGuarantee.valor_estimado}
                    onChange={(e) => setNewGuarantee({...newGuarantee, valor_estimado: Number(e.target.value)})}
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                  <input 
                    type="text"
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    placeholder="Ex: Honda Civic 2020 Preto"
                    value={newGuarantee.descricao}
                    onChange={(e) => setNewGuarantee({...newGuarantee, descricao: e.target.value})}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox"
                    id="vender"
                    checked={newGuarantee.deseja_vender}
                    onChange={(e) => setNewGuarantee({...newGuarantee, deseja_vender: e.target.checked})}
                  />
                  <label htmlFor="vender" className="text-sm text-slate-700">Aceito vender este bem como garantia</label>
                </div>
              </div>
              <Button type="submit">Cadastrar Garantia</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guarantees.length === 0 && !isAdding && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
            <Shield className="mx-auto h-12 w-12 text-slate-300 mb-2" />
            <p className="text-slate-500">Nenhuma garantia cadastrada.</p>
          </div>
        )}
        {guarantees.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-100 rounded-lg">{getIcon(item.tipo_garantia)}</div>
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                  item.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 
                  item.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {item.status === 'VERIFIED' ? 'Verificado' : item.status === 'PENDING' ? 'Em Análise' : 'Rejeitado'}
                </span>
              </div>
              <h3 className="font-bold text-lg text-slate-900">{item.descricao}</h3>
              <p className="text-slate-500 text-sm mb-4">Valor: R$ {item.valor_estimado.toLocaleString('pt-BR')}</p>
              
              {item.deseja_vender && (
                <div className="text-xs bg-indigo-50 text-indigo-700 p-2 rounded mt-2">
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
