
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { supabaseService } from '../services/supabaseService';
import { UserRole } from '../types';
import { Zap, AlertTriangle } from 'lucide-react';
import { getFriendlyErrorMessage } from '../utils/errorHandling';
import { useToast } from '../contexts/ToastContext';

const { useNavigate } = ReactRouterDOM;

export const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await login(email, password);
      
      const { user, error } = await supabaseService.auth.signIn(email);
      
      if (error) {
          throw new Error(error);
      }

      if (user) {
        addToast({
          type: 'success',
          title: 'Login realizado',
          message: `Bem-vindo de volta, ${user.nome_completo.split(' ')[0]}!`
        });

        if (user.role === UserRole.ADMIN) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      // Use standardized error message extractor
      const msg = getFriendlyErrorMessage(error);
      setErrorMsg(msg);
      
      addToast({
        type: 'error',
        title: 'Falha no login',
        message: msg
      });
      
      // Auto-redirect logic for Admin configuration if connection fails
      if (email.includes('admin') && msg.includes('Supabase não conectado')) {
          const proceed = confirm("O Supabase não está configurado. Deseja ir para as configurações agora?");
          if(proceed) navigate('/admin/configuracoes'); 
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full"></div>

      <Card className="w-full max-w-md relative z-10 border-white/10 shadow-2xl bg-slate-900/80 backdrop-blur-xl">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
             <Zap className="text-white fill-white" />
          </div>
          <CardTitle>Bem-vindo de volta</CardTitle>
          <p className="text-sm text-slate-400 mt-2">Acesse sua conta para continuar</p>
        </CardHeader>
        <CardContent>
          {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm flex items-start">
                  <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  {errorMsg}
              </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-600"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Senha</label>
              <input
                type="password"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20" isLoading={isLoading}>
              Entrar na Plataforma
            </Button>
          </form>
          <div className="mt-6 text-center text-xs text-slate-500 bg-slate-950/50 p-3 rounded-lg border border-white/5">
            <p className="mb-1 text-slate-400 font-bold">⚠️ Dados Iniciais (Seed):</p>
            <p>Admin: <span className="text-slate-300 font-mono">admin@admin.com</span></p>
            <p>Cliente: <span className="text-slate-300 font-mono">user@demo.com</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
