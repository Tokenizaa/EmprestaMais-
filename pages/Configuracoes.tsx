
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Bell, Lock, Globe, Moon, Shield } from 'lucide-react';
import { useAuth } from '../App';

export const Configuracoes: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
      email: true,
      push: true,
      marketing: false
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-slate-400">Gerencie suas preferências e segurança.</p>
      </div>

      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-indigo-400" /> Notificações
              </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                  <div>
                      <p className="font-medium text-white">Alertas por Email</p>
                      <p className="text-sm text-slate-400">Receba atualizações sobre seus empréstimos.</p>
                  </div>
                  <input type="checkbox" checked={notifications.email} onChange={e => setNotifications({...notifications, email: e.target.checked})} className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                  <div>
                      <p className="font-medium text-white">Notificações Push</p>
                      <p className="text-sm text-slate-400">Alertas em tempo real no navegador.</p>
                  </div>
                  <input type="checkbox" checked={notifications.push} onChange={e => setNotifications({...notifications, push: e.target.checked})} className="toggle" />
              </div>
          </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-400" /> Segurança
              </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-800">
                  <div>
                      <p className="font-medium text-white">Senha</p>
                      <p className="text-sm text-slate-400">Última alteração há 3 meses</p>
                  </div>
                  <Button variant="outline" size="sm">Alterar</Button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-800">
                  <div>
                      <p className="font-medium text-white">Autenticação de Dois Fatores (2FA)</p>
                      <p className="text-sm text-slate-400">Adicione uma camada extra de segurança.</p>
                  </div>
                  <Button variant="primary" size="sm">Ativar</Button>
              </div>
          </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-400" /> Preferências
              </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
               <div className="flex items-center justify-between">
                  <div>
                      <p className="font-medium text-white">Idioma</p>
                  </div>
                  <select className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-white">
                      <option>Português (Brasil)</option>
                      <option>English</option>
                  </select>
              </div>
          </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
          <Button variant="primary" onClick={() => alert('Configurações salvas!')}>Salvar Todas as Alterações</Button>
      </div>
    </div>
  );
};
