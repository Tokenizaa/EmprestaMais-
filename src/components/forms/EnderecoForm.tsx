import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { Button } from '../ui/Button';
import { supabaseService } from '../../services/supabaseService';
import { useUserPoints } from '../../hooks/useUserPoints';
import { getFriendlyErrorMessage } from '../../utils/errorHandling';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema, AddressFormData } from '../../utils/schemas';
import { Search } from 'lucide-react';

export const EnderecoForm: React.FC = () => {
  const { user } = useAuth();
  const { addPoints } = useUserPoints();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: ''
    }
  });

  // Carregar dados existentes
  useEffect(() => {
    if (user) {
      supabaseService.auth.getAddress(user.id).then(address => {
        if (address) {
          setValue('cep', address.cep);
          setValue('logradouro', address.logradouro);
          setValue('numero', address.numero);
          setValue('complemento', address.complemento || '');
          setValue('bairro', address.bairro);
          setValue('cidade', address.cidade);
          setValue('estado', address.estado);
        }
      });
    }
  }, [user, setValue]);

  // Monitorar CEP para busca automática
  const cepValue = watch('cep');

  useEffect(() => {
    const cleanCep = cepValue?.replace(/\D/g, '');
    
    if (cleanCep && cleanCep.length === 8) {
      setIsLoadingCEP(true);
      fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            // Added { shouldValidate: true } to ensure validation errors clear up instantly
            setValue('logradouro', data.logradouro, { shouldValidate: true });
            setValue('bairro', data.bairro, { shouldValidate: true });
            setValue('cidade', data.localidade, { shouldValidate: true });
            setValue('estado', data.uf, { shouldValidate: true });
          }
        })
        .catch(err => console.error("Erro ao buscar CEP", err))
        .finally(() => setIsLoadingCEP(false));
    }
  }, [cepValue, setValue]);

  const onSubmit = async (data: AddressFormData) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await supabaseService.auth.saveAddress(user.id, data);
      await addPoints(15, 'Cadastro de Endereço');
      alert('Endereço salvo com sucesso! Você ganhou 15 pontos.');
    } catch (error) {
      alert(getFriendlyErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        
        <div className="md:col-span-2 relative">
          <label className="block text-sm font-medium text-slate-400 mb-1">CEP</label>
          <div className="relative">
            <input
              {...register('cep')}
              type="text"
              maxLength={8}
              placeholder="00000000"
              className={`w-full rounded-md border bg-slate-950 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.cep ? 'border-red-500 focus:ring-red-200' : 'border-slate-700 focus:ring-indigo-500'}`}
            />
            {isLoadingCEP && (
              <div className="absolute right-3 top-2.5">
                <Search className="w-4 h-4 text-indigo-400 animate-spin" />
              </div>
            )}
          </div>
          {errors.cep && <p className="text-xs text-red-500 mt-1">{errors.cep.message}</p>}
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-slate-400 mb-1">Cidade</label>
          <input
            {...register('cidade')}
            type="text"
            className={`w-full rounded-md border bg-slate-950 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.cidade ? 'border-red-500 focus:ring-red-200' : 'border-slate-700 focus:ring-indigo-500'}`}
          />
          {errors.cidade && <p className="text-xs text-red-500 mt-1">{errors.cidade.message}</p>}
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-slate-400 mb-1">Estado</label>
          <input
            {...register('estado')}
            type="text"
            maxLength={2}
            className={`w-full rounded-md border bg-slate-950 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.estado ? 'border-red-500 focus:ring-red-200' : 'border-slate-700 focus:ring-indigo-500'}`}
          />
          {errors.estado && <p className="text-xs text-red-500 mt-1">{errors.estado.message}</p>}
        </div>

        <div className="md:col-span-4">
          <label className="block text-sm font-medium text-slate-400 mb-1">Logradouro</label>
          <input
            {...register('logradouro')}
            type="text"
            className={`w-full rounded-md border bg-slate-950 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.logradouro ? 'border-red-500 focus:ring-red-200' : 'border-slate-700 focus:ring-indigo-500'}`}
          />
          {errors.logradouro && <p className="text-xs text-red-500 mt-1">{errors.logradouro.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-400 mb-1">Número</label>
          <input
            {...register('numero')}
            type="text"
            className={`w-full rounded-md border bg-slate-950 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.numero ? 'border-red-500 focus:ring-red-200' : 'border-slate-700 focus:ring-indigo-500'}`}
          />
          {errors.numero && <p className="text-xs text-red-500 mt-1">{errors.numero.message}</p>}
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-slate-400 mb-1">Bairro</label>
          <input
            {...register('bairro')}
            type="text"
            className={`w-full rounded-md border bg-slate-950 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.bairro ? 'border-red-500 focus:ring-red-200' : 'border-slate-700 focus:ring-indigo-500'}`}
          />
          {errors.bairro && <p className="text-xs text-red-500 mt-1">{errors.bairro.message}</p>}
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-slate-400 mb-1">Complemento</label>
          <input
            {...register('complemento')}
            type="text"
            className="w-full rounded-md border border-slate-700 bg-slate-950 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

      </div>
      
      <div className="flex justify-end mt-4">
        <Button type="submit" isLoading={isSubmitting}>Salvar Endereço</Button>
      </div>
    </form>
  );
};