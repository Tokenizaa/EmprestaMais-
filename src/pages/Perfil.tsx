import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { DadosPessoaisForm } from '../components/forms/DadosPessoaisForm';
import { EnderecoForm } from '../components/forms/EnderecoForm';

export const Perfil: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Meu Perfil</h1>
        <p className="text-slate-500">Gerencie seus dados pessoais e aumente sua credibilidade.</p>
      </div>

      <Card>
        <CardHeader className="border-b border-slate-100">
          <CardTitle>Dados Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <DadosPessoaisForm />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
             <CardTitle>Endereço</CardTitle>
          </CardHeader>
          <CardContent>
            <EnderecoForm />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle>Dados Financeiros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 italic">Formulário financeiro (Implementação futura)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};