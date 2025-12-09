
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { supabaseService } from '../../services/supabaseService';
import { SystemSettings } from '../../types';

export const AdminConfiguracoes: React.FC = () => {
    const [settings, setSettings] = useState<SystemSettings | null>(null);

    useEffect(() => {
        supabaseService.admin.getSystemSettings().then(setSettings);
    }, []);

    if(!settings) return <div>Carregando...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Configurações do Sistema</h1>
            <Card>
                <CardContent className="p-6 space-y-4">
                    <div>
                        <p className="text-slate-400">Nome da Plataforma</p>
                        <p className="text-white font-bold">{settings.platform_name}</p>
                    </div>
                    <div>
                        <p className="text-slate-400">Taxa Base de Juros</p>
                        <p className="text-white font-bold">{settings.base_interest_rate}%</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
