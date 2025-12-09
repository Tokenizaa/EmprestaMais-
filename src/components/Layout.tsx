
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
  LayoutDashboard, User, FileText, DollarSign, Award, Settings, LogOut, 
  Menu, ShieldCheck, PieChart, Users, FileCheck, 
  ShieldAlert, Lock, Home, Bell, Gift, Share2, Trophy, Briefcase
} from 'lucide-react';
import { useAuth } from '../App';

const { Link, useLocation, useNavigate } = ReactRouterDOM;

interface LayoutProps {
  children: React.ReactNode;
}

// --- SHARED COMPONENTS ---

const MobileHeader: React.FC<{ 
  onToggle: () => void; 
  title: string; 
}> = ({ onToggle, title }) => (
  <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 bg-background lg:hidden sticky top-0 z-40 backdrop-blur-md bg-background/80">
    <span className="font-bold text-white">{title}</span>
    <button onClick={onToggle} className="p-2">
      <Menu className="text-slate-400 hover:text-white transition-colors" />
    </button>
  </header>
);

const UserInfo: React.FC<{ user: any; variant: 'user' | 'admin' }> = ({ user, variant }) => {
  const isUser = variant === 'user';
  return (
    <div className={`flex items-center space-x-3 mb-6 px-3 py-3 rounded-lg border ${
      isUser 
        ? 'bg-primary/10 border-primary/20' 
        : 'bg-red-500/10 border-red-500/20'
    }`}>
      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg ${
        isUser 
          ? 'bg-gradient-primary text-white' 
          : 'bg-red-600 text-white'
      }`}>
        {user?.nome_completo?.charAt(0) || 'U'}
      </div>
      <div className="overflow-hidden">
        <p className="text-sm font-medium truncate text-white">
          {user?.nome_completo}
        </p>
        <p className={`text-xs truncate font-medium ${isUser ? 'text-indigo-300' : 'text-red-300'}`}>
          {isUser ? `Nível ${user?.level} • ${user?.points} XP` : 'Administrador'}
        </p>
      </div>
    </div>
  );
};

// --- USER LAYOUT (CUSTOMER) ---

export const UserLayout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Visão Geral', icon: <Home size={20} />, path: '/dashboard' },
    { label: 'Meu Perfil', icon: <User size={20} />, path: '/perfil' },
    { label: 'Propostas', icon: <DollarSign size={20} />, path: '/propostas' },
    { label: 'Solicitações', icon: <FileCheck size={20} />, path: '/solicitacoes' },
    { label: 'Meus Documentos', icon: <FileText size={20} />, path: '/documentos' },
    { label: 'Garantias', icon: <ShieldCheck size={20} />, path: '/garantias' },
    { label: 'Investir', icon: <PieChart size={20} />, path: '/quero-emprestar' },
    { label: 'Gestão Empr.', icon: <LayoutDashboard size={20} />, path: '/gerenciar-emprestimos' },
    { label: 'Recompensas', icon: <Gift size={20} />, path: '/recompensas' },
    { label: 'Indicações', icon: <Share2 size={20} />, path: '/indicacoes' },
    { label: 'Configurações', icon: <Settings size={20} />, path: '/configuracoes' },
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-background flex text-slate-100 font-sans">
      {isMobileOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B1121] border-r border-white/5 transform transition-transform duration-300 lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-primary">Empresta+</span>
          <span className="ml-2 text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Beta</span>
        </div>

        <div className="p-4 h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
          <UserInfo user={user} variant="user" />
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group ${
                    isActive
                      ? 'bg-primary/15 text-white shadow-[0_0_15px_rgba(124,58,237,0.15)] border border-primary/20' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className={isActive ? 'text-primary' : 'text-slate-500 group-hover:text-white'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/5 bg-[#0B1121]">
          <button onClick={handleLogout} className="flex w-full items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader onToggle={() => setIsMobileOpen(true)} title="Área do Cliente" />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
           {/* Background Glow Effect */}
           <div className="absolute top-0 left-0 w-full h-[500px] bg-primary/5 blur-[100px] pointer-events-none rounded-full translate-y-[-50%]"></div>
            {children}
        </main>
      </div>
    </div>
  );
};

// --- ADMIN LAYOUT (COMPANY) ---

export const AdminLayout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard Geral', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { label: 'Gestão de Usuários', icon: <Users size={20} />, path: '/admin/usuarios' },
    { label: 'Gestão de Contratos', icon: <FileText size={20} />, path: '/admin/emprestimos' },
    { label: 'Gestão de Desafios', icon: <Trophy size={20} />, path: '/admin/desafios' },
    { label: 'Gestão de Recompensas', icon: <Gift size={20} />, path: '/admin/recompensas' },
    { label: 'Gestão de Insígnias', icon: <Award size={20} />, path: '/admin/insignias' },
    { label: 'Parceiros', icon: <Briefcase size={20} />, path: '/admin/parceiros' },
    { label: 'Análise de Risco', icon: <ShieldAlert size={20} />, path: '/admin/risco' },
    { label: 'Notificações', icon: <Bell size={20} />, path: '/admin/notificacoes' },
    { label: 'Config. Sistema', icon: <Settings size={20} />, path: '/admin/configuracoes' },
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100">
      {isMobileOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Lock className="text-red-500 mr-2" size={20} />
          <span className="text-xl font-bold text-white tracking-tight">Admin<span className="text-red-500">Panel</span></span>
        </div>

        <div className="p-4 h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
          <UserInfo user={user} variant="admin" />
          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-4">Gestão</p>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  location.pathname === item.path 
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-8">Acesso Rápido</p>
            <Link to="/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800">
               <Home size={20} />
               <span>Ver como Cliente</span>
            </Link>
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-900">
          <button onClick={handleLogout} className="flex w-full items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <LogOut size={20} />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader onToggle={() => setIsMobileOpen(true)} title="Administração" />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950">
            {/* Admin Banner */}
            <div className="mb-6 bg-red-900/20 border border-red-500/30 text-red-200 p-4 rounded-lg flex justify-between items-center backdrop-blur-sm">
              <div className="flex items-center">
                <ShieldAlert className="mr-3 text-red-500" />
                <div>
                  <p className="font-bold">Modo Administrador</p>
                  <p className="text-sm opacity-80">Alterações aqui impactam toda a plataforma.</p>
                </div>
              </div>
            </div>
            {children}
        </main>
      </div>
    </div>
  );
};
