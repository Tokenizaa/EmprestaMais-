import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowRight, ShieldCheck, Zap, Users, Lock, ChevronRight } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary selection:text-white">
      {/* Navbar */}
      <header className="fixed w-full top-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
               <Zap className="text-white w-5 h-5 fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">CrediFacil</span>
          </div>
          <div className="flex gap-4">
             <Link to="/auth">
               <Button variant="ghost" size="sm">Entrar</Button>
             </Link>
             <Link to="/auth">
               <Button variant="primary" size="sm">Criar Conta</Button>
             </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 text-center max-w-5xl mx-auto">
        {/* Background Gradients */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-40 right-20 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative z-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-6">
               <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
               Nova Plataforma P2P 2.0
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              O Futuro do Crédito é <br/>
              <span className="text-transparent bg-clip-text bg-gradient-primary">Descentralizado.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Conectamos investidores e tomadores em um ambiente seguro, transparente e gamificado. Sem bancos, sem burocracia excessiva.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto flex items-center gap-2 shadow-lg shadow-primary/25">
                  Começar Agora <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-700 bg-slate-900/50">
                  Simular Empréstimo
                </Button>
              </Link>
            </div>
        </div>
      </section>

      {/* Stats Strip */}
      <div className="border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
         <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
               <div className="text-3xl font-bold text-white mb-1">R$ 4.5M+</div>
               <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Emprestados</div>
            </div>
            <div>
               <div className="text-3xl font-bold text-white mb-1">12k+</div>
               <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Usuários</div>
            </div>
            <div>
               <div className="text-3xl font-bold text-white mb-1">98%</div>
               <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Aprovação</div>
            </div>
             <div>
               <div className="text-3xl font-bold text-white mb-1">24/7</div>
               <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Suporte</div>
            </div>
         </div>
      </div>

      {/* Features Cards */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-white/10 hover:border-primary/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Aprovação Relâmpago</h3>
              <p className="text-slate-400 leading-relaxed">
                Nossa IA analisa seu perfil em segundos. O dinheiro cai na conta via PIX instantaneamente após a aprovação do contrato.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Segurança Blockchain</h3>
              <p className="text-slate-400 leading-relaxed">
                Todos os contratos são criptografados e imutáveis. Sua segurança é nossa prioridade máxima com validação biométrica.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-white/10 hover:border-purple-500/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Sistema de Níveis</h3>
              <p className="text-slate-400 leading-relaxed">
                Quanto mais você usa e paga em dia, maior seu nível. Desbloqueie taxas menores e limites maiores conforme evolui.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-20 px-4">
         <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-900 to-purple-900 p-12 text-center relative overflow-hidden border border-white/10">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="relative z-10">
               <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Pronto para evoluir sua vida financeira?</h2>
               <p className="text-indigo-200 mb-8 max-w-xl mx-auto">Junte-se a milhares de usuários que já estão economizando com taxas justas e transparentes.</p>
               <Link to="/auth">
                  <Button variant="premium" size="lg" className="shadow-xl">
                    Criar Conta Grátis
                  </Button>
               </Link>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <p className="text-slate-500 text-sm">© 2024 CrediFacil Plataforma Financeira LTDA. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};