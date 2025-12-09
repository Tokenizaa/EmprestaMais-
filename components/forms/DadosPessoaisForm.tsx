
import React, { useState } from 'react';
import { useAuth } from '../../App';
import { Button } from '../ui/Button';
import { supabaseService } from '../../services/supabaseService';
import { UserProfile } from '../../types';
import { useUserPoints } from '../../hooks/useUserPoints';
import { validateCPF, validateCNPJ, validatePhone, formatCPF, formatPhone } from '../../utils/validators';
import { getFriendlyErrorMessage } from '../../utils/errorHandling';

export const DadosPessoaisForm: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { addPoints } = useUserPoints();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    nome_completo: user?.nome_completo || '',
    cpf_cnpj: user?.cpf_cnpj || '',
    telefone: user?.telefone || '',
    email: user?.email || '',
  });

  const handleChange = (field: keyof UserProfile, value: string) => {
    let formattedValue = value;
    
    // Aplica máscaras enquanto digita
    if (field === 'cpf_cnpj') formattedValue = formatCPF(value);
    if (field === 'telefone') formattedValue = formatPhone(value);

    setFormData(p => ({ ...p, [field]: formattedValue }));
    
    // Limpa erro do campo ao digitar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.nome_completo || formData.nome_completo.trim().length < 3) {
      newErrors.nome_completo = "Nome completo é obrigatório.";
    }

    const cleanDoc = (formData.cpf_cnpj || '').replace(/\D/g, '');
    if (!cleanDoc) {
      newErrors.cpf_cnpj = "Documento é obrigatório.";
    } else if (cleanDoc.length <= 11) {
      if (!validateCPF(cleanDoc)) newErrors.cpf_cnpj = "CPF inválido.";
    } else {
      if (!validateCNPJ(cleanDoc)) newErrors.cpf_cnpj = "CNPJ inválido.";
    }

    if (!formData.telefone || !validatePhone(formData.telefone)) {
      newErrors.telefone = "Telefone inválido. Formato: (XX) XXXXX-XXXX";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await supabaseService.auth.updateProfile(user.id, formData);
      await refreshUser(); 
      await addPoints(10, 'Atualização de Perfil');
      alert('Dados atualizados com sucesso! Você ganhou 10 pontos.');
    } catch (error) {
      alert(getFriendlyErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
          <input
            type="text"
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.nome_completo ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-500'}`}
            value={formData.nome_completo}
            onChange={(e) => handleChange('nome_completo', e.target.value)}
          />
          {errors.nome_completo && <p className="text-xs text-red-500 mt-1">{errors.nome_completo}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            disabled
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
            value={formData.email}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">CPF/CNPJ</label>
          <input
            type="text"
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.cpf_cnpj ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-500'}`}
            placeholder="000.000.000-00"
            value={formData.cpf_cnpj}
            onChange={(e) => handleChange('cpf_cnpj', e.target.value)}
          />
           {errors.cpf_cnpj && <p className="text-xs text-red-500 mt-1">{errors.cpf_cnpj}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
          <input
            type="tel"
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.telefone ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-500'}`}
            placeholder="(00) 00000-0000"
            value={formData.telefone}
            onChange={(e) => handleChange('telefone', e.target.value)}
          />
          {errors.telefone && <p className="text-xs text-red-500 mt-1">{errors.telefone}</p>}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading}>Salvar Alterações</Button>
      </div>
    </form>
  );
};
