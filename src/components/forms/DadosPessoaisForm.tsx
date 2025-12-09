
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { Button } from '../ui/Button';
import { supabaseService } from '../../services/supabaseService';
import { useUserPoints } from '../../hooks/useUserPoints';
import { formatCPF, formatPhone } from '../../utils/validators';
import { getFriendlyErrorMessage } from '../../utils/errorHandling';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userProfileSchema, UserProfileFormData } from '../../utils/schemas';

export const DadosPessoaisForm: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { addPoints } = useUserPoints();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      nome_completo: user?.nome_completo || '',
      cpf_cnpj: user?.cpf_cnpj || '',
      telefone: user?.telefone || '',
      email: user?.email || '',
      data_nascimento: user?.data_nascimento || '',
    },
    mode: 'onChange'
  });

  // Observa mudanças para aplicar máscaras
  const cpfValue = watch('cpf_cnpj');
  const phoneValue = watch('telefone');

  useEffect(() => {
    if (cpfValue) {
      setValue('cpf_cnpj', formatCPF(cpfValue), { shouldValidate: true });
    }
  }, [cpfValue, setValue]);

  useEffect(() => {
    if (phoneValue) {
      setValue('telefone', formatPhone(phoneValue), { shouldValidate: true });
    }
  }, [phoneValue, setValue]);

  const onSubmit = async (data: UserProfileFormData) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await supabaseService.auth.updateProfile(user.id, data);
      await refreshUser();
      await addPoints(10, 'Atualização de Perfil');
      alert('Dados atualizados com sucesso! Você ganhou 10 pontos.');
    } catch (error) {
      alert(getFriendlyErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Nome Completo</label>
          <input
            {...register('nome_completo')}
            type="text"
            className={`w-full rounded-md border bg-slate-950 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.nome_completo ? 'border-red-500 focus:ring-red-200' : 'border-slate-700 focus:ring-indigo-500'}`}
          />
          {errors.nome_completo && <p className="text-xs text-red-500 mt-1">{errors.nome_completo.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
          <input
            {...register('email')}
            type="email"
            disabled
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Data de Nascimento</label>
          <input
            {...register('data_nascimento')}
            type="date"
            className={`w-full rounded-md border bg-slate-950 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.data_nascimento ? 'border-red-500 focus:ring-red-200' : 'border-slate-700 focus:ring-indigo-500'}`}
          />
          {errors.data_nascimento && <p className="text-xs text-red-500 mt-1">{errors.data_nascimento.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">CPF/CNPJ</label>
          <input
            {...register('cpf_cnpj')}
            type="text"
            placeholder="000.000.000-00"
            className={`w-full rounded-md border bg-slate-950 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.cpf_cnpj ? 'border-red-500 focus:ring-red-200' : 'border-slate-700 focus:ring-indigo-500'}`}
          />
          {errors.cpf_cnpj && <p className="text-xs text-red-500 mt-1">{errors.cpf_cnpj.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Telefone</label>
          <input
            {...register('telefone')}
            type="tel"
            placeholder="(00) 00000-0000"
            className={`w-full rounded-md border bg-slate-950 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.telefone ? 'border-red-500 focus:ring-red-200' : 'border-slate-700 focus:ring-indigo-500'}`}
          />
          {errors.telefone && <p className="text-xs text-red-500 mt-1">{errors.telefone.message}</p>}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting}>Salvar Alterações</Button>
      </div>
    </form>
  );
};