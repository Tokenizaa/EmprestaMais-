import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { supabaseService } from '../services/supabaseService';
import { UserRole } from '../types';
import { Zap } from 'lucide-react';

export const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      const { user } = await supabaseService.auth.signIn(email);
      if (user) {
        if (user.role === UserRole.ADMIN) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      alert('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Ambient background lights */}
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
            <p className="mb-1">Credenciais de Demonstração:</p>
            <p>Admin: <span className="text-slate-300 font-mono">admin@admin.com</span></p>
            <p>Cliente: <span className="text-slate-300 font-mono">user@demo.com</span> (qualquer outro)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};