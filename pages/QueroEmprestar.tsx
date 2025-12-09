import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from '../App';
import { DollarSign, AlertTriangle } from 'lucide-react';

export const QueroEmprestar: React.FC = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState(1000);
  const [rate, setRate] = useState(2.0);
  const [months, setMonths] = useState(12);
  const [desc, setDesc] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!user) return;
    try {
        await supabaseService.db.createOffer({
            lender_id: user.id,
            lender_name: user.nome_completo,
            amount,
            interest_rate: rate,
            months,
            description: desc
        }, user.level);
        alert('Oferta criada com sucesso!');
        setDesc('');
    } catch(e) {
        alert('Erro ao criar oferta.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div>
        <h1 className="text-2xl font-bold text-slate-900">Quero Emprestar (Investir)</h1>
        <p className="text-slate-500">Crie uma oferta de empréstimo e receba juros mensais.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
              <CardHeader>
                  <CardTitle>Criar Oferta</CardTitle>
              </CardHeader>
              <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700">Valor a Emprestar (R$)</label>
                          <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full border p-2 rounded" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Juros Mensal (%)</label>
                            <input type="number" step="0.1" value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Prazo (Meses)</label>
                            <input type="number" value={months} onChange={e => setMonths(Number(e.target.value))} className="w-full border p-2 rounded" />
                        </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700">Descrição/Objetivo</label>
                          <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full border p-2 rounded" rows={3} placeholder="Ex: Empréstimo para pequenos empreendedores." />
                      </div>
                      <Button type="submit" className="w-full">Publicar Oferta</Button>
                  </form>
              </CardContent>
          </Card>

          <div className="space-y-6">
              <Card className="bg-indigo-50 border-indigo-100">
                  <CardContent className="p-6">
                      <h3 className="font-bold text-indigo-900 mb-2 flex items-center"><DollarSign className="w-5 h-5 mr-2"/> Retorno Estimado</h3>
                      <div className="text-3xl font-bold text-indigo-700 mb-1">
                          R$ {((amount * (rate/100) / (1 - Math.pow(1 + (rate/100), -months))) * months).toFixed(2)}
                      </div>
                      <p className="text-sm text-indigo-600">Total a receber ao final do período</p>
                  </CardContent>
              </Card>

              <Card className="bg-amber-50 border-amber-100">
                  <CardContent className="p-6">
                      <h3 className="font-bold text-amber-900 mb-2 flex items-center"><AlertTriangle className="w-5 h-5 mr-2"/> Análise de Risco</h3>
                      <p className="text-sm text-amber-800">
                          Lembre-se: Todo investimento possui riscos. A plataforma verifica os tomadores, mas a inadimplência é possível. Diversifique seus empréstimos.
                      </p>
                  </CardContent>
              </Card>
          </div>
      </div>
    </div>
  );
};