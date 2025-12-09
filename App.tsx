
import React, { createContext, useContext, useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Perfil } from './pages/Perfil';
import { Propostas } from './pages/Propostas';
import { Garantias } from './pages/Garantias';
import { Solicitacoes } from './pages/Solicitacoes';
import { QueroEmprestar } from './pages/QueroEmprestar';
import { GerenciarEmprestimos } from './pages/GerenciarEmprestimos';
import { Documentos } from './pages/Documentos';
import { Recompensas } from './pages/Recompensas';
import { Indicacoes } from './pages/Indicacoes';
import { Configuracoes } from './pages/Configuracoes';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsuarios } from './pages/admin/AdminUsuarios';
import { AdminEmprestimos } from './pages/admin/AdminEmprestimos';
import { AdminDesafios } from './pages/admin/AdminDesafios';
import { AdminRecompensas } from './pages/admin/AdminRecompensas';
import { AdminInsignias } from './pages/admin/AdminInsignias';
import { AdminNotificacoes } from './pages/admin/AdminNotificacoes';
import { AdminParceiros } from './pages/admin/AdminParceiros';
import { AdminConfiguracoes } from './pages/admin/AdminConfiguracoes';
import { UserLayout, AdminLayout } from './components/Layout';
import { supabaseService } from './services/supabaseService';
import { UserProfile, UserRole } from './types';

// Placeholder generic for admin pages that might be missing implementation details but need routing
const AdminPlaceholder = ({ title }: { title: string }) => (
  <div className="space-y-4">
    <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <p className="text-slate-500">Módulo administrativo em desenvolvimento.</p>
      <div className="mt-4 h-32 bg-slate-100 rounded animate-pulse"></div>
    </div>
  </div>
);

// Contexto de Autenticação
interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('credifacil_session_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const { user: loggedUser, error } = await supabaseService.auth.signIn(email);
    if (error || !loggedUser) throw new Error(error || 'Failed to login');
    setUser(loggedUser);
    localStorage.setItem('credifacil_session_user', JSON.stringify(loggedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('credifacil_session_user');
  };

  const refreshUser = async () => {
     if(!user) return;
     const users = JSON.parse(localStorage.getItem('credifacil_users') || '[]');
     const updated = users.find((u: UserProfile) => u.id === user.id);
     if(updated) {
       setUser(updated);
       localStorage.setItem('credifacil_session_user', JSON.stringify(updated));
     }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Rota Protegida com Layout Específico
interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: UserRole;
  layout: 'user' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role, layout }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Carregando...</div>;
  if (!user) return <Navigate to="/auth" />;
  
  // Regra de segurança: Se a rota exige ADMIN e o usuário não é ADMIN
  if (role === UserRole.ADMIN && user.role !== UserRole.ADMIN) {
    // Redireciona usuário comum tentando acessar área restrita
    return <Navigate to="/dashboard" />;
  }

  // Renderiza com o layout correto
  const LayoutComponent = layout === 'admin' ? AdminLayout : UserLayout;
  
  return <LayoutComponent>{children}</LayoutComponent>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* =================================================================
              ROTAS DE CLIENTE (Usuário Comum)
              Acessíveis via UserLayout em /dashboard e sub-rotas
             ================================================================= */}
          <Route path="/dashboard" element={<ProtectedRoute layout="user"><Dashboard /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute layout="user"><Perfil /></ProtectedRoute>} />
          <Route path="/propostas" element={<ProtectedRoute layout="user"><Propostas /></ProtectedRoute>} />
          <Route path="/garantias" element={<ProtectedRoute layout="user"><Garantias /></ProtectedRoute>} />
          <Route path="/solicitacoes" element={<ProtectedRoute layout="user"><Solicitacoes /></ProtectedRoute>} />
          <Route path="/quero-emprestar" element={<ProtectedRoute layout="user"><QueroEmprestar /></ProtectedRoute>} />
          <Route path="/gerenciar-emprestimos" element={<ProtectedRoute layout="user"><GerenciarEmprestimos /></ProtectedRoute>} />
          <Route path="/documentos" element={<ProtectedRoute layout="user"><Documentos /></ProtectedRoute>} />
          <Route path="/recompensas" element={<ProtectedRoute layout="user"><Recompensas /></ProtectedRoute>} />
          <Route path="/indicacoes" element={<ProtectedRoute layout="user"><Indicacoes /></ProtectedRoute>} />
          <Route path="/configuracoes" element={<ProtectedRoute layout="user"><Configuracoes /></ProtectedRoute>} />

          {/* =================================================================
              ROTAS DE ADMINISTRADOR (Gestão da Empresa)
              Acessíveis via AdminLayout apenas para Role = ADMIN
             ================================================================= */}
          <Route path="/admin" element={<ProtectedRoute role={UserRole.ADMIN} layout="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/usuarios" element={<ProtectedRoute role={UserRole.ADMIN} layout="admin"><AdminUsuarios /></ProtectedRoute>} />
          <Route path="/admin/emprestimos" element={<ProtectedRoute role={UserRole.ADMIN} layout="admin"><AdminEmprestimos /></ProtectedRoute>} />
          <Route path="/admin/desafios" element={<ProtectedRoute role={UserRole.ADMIN} layout="admin"><AdminDesafios /></ProtectedRoute>} />
          <Route path="/admin/recompensas" element={<ProtectedRoute role={UserRole.ADMIN} layout="admin"><AdminRecompensas /></ProtectedRoute>} />
          <Route path="/admin/insignias" element={<ProtectedRoute role={UserRole.ADMIN} layout="admin"><AdminInsignias /></ProtectedRoute>} />
          <Route path="/admin/parceiros" element={<ProtectedRoute role={UserRole.ADMIN} layout="admin"><AdminParceiros /></ProtectedRoute>} />
          <Route path="/admin/notificacoes" element={<ProtectedRoute role={UserRole.ADMIN} layout="admin"><AdminNotificacoes /></ProtectedRoute>} />
          <Route path="/admin/configuracoes" element={<ProtectedRoute role={UserRole.ADMIN} layout="admin"><AdminConfiguracoes /></ProtectedRoute>} />
          
          {/* Risco (Placeholder) */}
          <Route path="/admin/risco" element={<ProtectedRoute role={UserRole.ADMIN} layout="admin"><AdminPlaceholder title="Análise de Risco" /></ProtectedRoute>} />

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
