
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { supabaseService } from '../../services/supabaseService';
import { Challenge } from '../../types';

export const AdminDesafios: React.FC = () => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);

    useEffect(() => {
        supabaseService.admin.getChallenges().then(setChallenges);
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Gestão de Desafios</h1>
            <div className="grid gap-4">
                {challenges.map(c => (
                    <Card key={c.id}>
                        <CardHeader>
                            <CardTitle>{c.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-400">{c.description}</p>
                            <p className="text-amber-400 mt-2 font-bold">{c.xp_reward} XP</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
