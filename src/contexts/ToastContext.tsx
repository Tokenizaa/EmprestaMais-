import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastMessage, ToastType } from '../types';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface ToastContextData {
  addToast: (message: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addToast = useCallback(({ type, title, message, duration = 4000 }: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = { id, type, title, message, duration };

    setMessages((state) => [...state, toast]);

    if (duration > 0) {
        setTimeout(() => {
            removeToast(id);
        }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setMessages((state) => state.filter((message) => message.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {messages.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto relative flex items-start p-4 rounded-lg shadow-xl border backdrop-blur-md animate-fade-in transition-all duration-300 transform translate-x-0 ${
              toast.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-50' :
              toast.type === 'error' ? 'bg-red-900/90 border-red-500/50 text-red-50' :
              toast.type === 'warning' ? 'bg-amber-900/90 border-amber-500/50 text-amber-50' :
              'bg-slate-800/90 border-slate-600/50 text-slate-50'
            }`}
          >
            <div className="mr-3 mt-0.5">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
            </div>
            <div className="flex-1">
              {toast.title && <h3 className="font-bold text-sm mb-1">{toast.title}</h3>}
              <p className="text-sm opacity-90 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-white/50 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};