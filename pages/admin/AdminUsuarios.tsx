
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { supabaseService } from '../../services/supabaseService';
import { UserProfile } from '../../types';
import { Users, Search, MoreVertical } from 'lucide-react';

export const AdminUsuarios: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    supabaseService.admin.getUsers().then(setUsers);
  }, []);

  return (
    <div className="space-y-6">
       <div>
           <h1 className="text-2xl font-bold text-white">Gestão de Usuários</h1>
           <p className="text-slate-400">Gerencie todos os usuários cadastrados na plataforma.</p>
       </div>

       <Card>
           <CardHeader>
               <div className="flex justify-between items-center">
                   <CardTitle>Base de Usuários</CardTitle>
                   <div className="relative">
                       <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                       <input 
                         type="text" 
                         placeholder="Buscar usuário..." 
                         className="bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                       />
                   </div>
               </div>
           </CardHeader>
           <CardContent>
               <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left">
                       <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                           <tr>
                               <th className="px-6 py-3">Usuário</th>
                               <th className="px-6 py-3">Email</th>
                               <th className="px-6 py-3">Nível</th>
                               <th className="px-6 py-3">Pontos</th>
                               <th className="px-6 py-3">Status</th>
                               <th className="px-6 py-3">Ações</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-800">
                           {users.map((u) => (
                               <tr key={u.id} className="hover:bg-slate-800/30">
                                   <td className="px-6 py-4 font-medium text-white">{u.nome_completo}</td>
                                   <td className="px-6 py-4 text-slate-400">{u.email}</td>
                                   <td className="px-6 py-4"><span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-xs font-bold">Lvl {u.level}</span></td>
                                   <td className="px-6 py-4 text-amber-400 font-mono">{u.points} XP</td>
                                   <td className="px-6 py-4"><span className="text-emerald-400 text-xs">Ativo</span></td>
                                   <td className="px-6 py-4 text-slate-400 cursor-pointer hover:text-white"><MoreVertical size={16} /></td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
           </CardContent>
       </Card>
    </div>
  );
};
