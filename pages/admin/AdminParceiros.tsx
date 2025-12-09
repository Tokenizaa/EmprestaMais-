
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { supabaseService } from '../../services/supabaseService';
import { Partner } from '../../types';

export const AdminParceiros: React.FC = () => {
    const [partners, setPartners] = useState<Partner[]>([]);

    useEffect(() => {
        supabaseService.admin.getPartners().then(setPartners);
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Gestão de Parceiros</h1>
            <div className="grid gap-4">
                {partners.map(p => (
                    <Card key={p.id}>
                        <CardContent className="p-4">
                            <h3 className="text-white font-bold">{p.name}</h3>
                            <p className="text-sm text-slate-400">{p.type} - {p.status}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
