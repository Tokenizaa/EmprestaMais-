
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { supabaseService } from '../../services/supabaseService';
import { Badge } from '../../types';

export const AdminInsignias: React.FC = () => {
    const [badges, setBadges] = useState<Badge[]>([]);

    useEffect(() => {
        supabaseService.admin.getBadges().then(setBadges);
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Gestão de Insígnias</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map(b => (
                    <Card key={b.id}>
                        <CardContent className="p-4 text-center">
                            <h3 className="text-white font-bold">{b.name}</h3>
                            <p className="text-xs text-slate-500">{b.rarity}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
