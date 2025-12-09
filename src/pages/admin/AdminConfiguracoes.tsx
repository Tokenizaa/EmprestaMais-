
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { supabaseService } from '../../services/supabaseService';
import { logger } from '../../utils/logger';
import { Database, Server, ShieldCheck, AlertCircle } from 'lucide-react';

export const AdminConfiguracoes: React.FC = () => {
    const [config, setConfig] = useState({
        platform_name: '',
        supabase_url: '',
        supabase_key: ''
    });
    const [isConnected, setIsConnected] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        supabaseService.admin.getSystemSettings().then(settings => {
            setConfig(prev => ({ ...prev, platform_name: settings.platform_name }));
        });

        // Carrega credenciais atuais do storage local
        const stored = localStorage.getItem('emprestamais_config');
        if (stored) {
            const parsed = JSON.parse(stored);
            setConfig(prev => ({ ...prev, supabase_url: parsed.url || '', supabase_key: parsed.key || '' }));
        }

        setIsConnected(supabaseService.isConnected());
        
        // Carrega logs locais do logger system
        setLogs(logger.getLocalLogs());
    }, []);

    const handleSaveSupabase = () => {
        if (!config.supabase_url || !config.supabase_key) {
            alert("Preencha ambos os campos.");
            return;
        }
        if (confirm("Isso irá recarregar a aplicação para tentar conectar ao Supabase real. Continuar?")) {
            supabaseService.updateCredentials(config.supabase_url, config.supabase_key);
        }
    };

    const handleClearConfig = () => {
        localStorage.removeItem('emprestamais_config');
        window.location.reload();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Configurações do Sistema</h1>
                    <p className="text-slate-400">Gerencie conexões e parâmetros globais.</p>
                </div>
                <div className={`px-4 py-2 rounded-full border ${isConnected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'} flex items-center gap-2`}>
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                    <span className="text-xs font-bold uppercase">{isConnected ? 'Backend Conectado' : 'Modo Mock / Demo'}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-indigo-400" /> Integração Supabase
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 mb-4">
                            <p className="text-sm text-slate-300 mb-2">
                                Para persistir dados reais, configure seu projeto Supabase. 
                                <br/><span className="text-xs text-slate-500">Deixe em branco para usar o modo de demonstração (Local Storage).</span>
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Project URL</label>
                            <input 
                                type="text" 
                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono text-sm"
                                placeholder="https://xyz.supabase.co"
                                value={config.supabase_url}
                                onChange={e => setConfig({...config, supabase_url: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Anon Key (Public)</label>
                            <input 
                                type="password" 
                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono text-sm"
                                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                value={config.supabase_key}
                                onChange={e => setConfig({...config, supabase_key: e.target.value})}
                            />
                        </div>
                        
                        <div className="flex gap-2 justify-end pt-2">
                             {isConnected && (
                                 <Button variant="outline" className="border-red-900 text-red-500 hover:bg-red-950" onClick={handleClearConfig}>
                                     Desconectar
                                 </Button>
                             )}
                             <Button onClick={handleSaveSupabase}>
                                 {isConnected ? 'Atualizar Credenciais' : 'Conectar Supabase'}
                             </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="h-5 w-5 text-emerald-400" /> Logs de Sistema & Saúde
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] overflow-y-auto bg-slate-950 rounded-lg p-4 font-mono text-xs border border-slate-800 custom-scrollbar">
                            {logs.length === 0 && <p className="text-slate-600 italic">Nenhum log registrado na sessão atual.</p>}
                            {logs.map((log, idx) => (
                                <div key={idx} className="mb-2 border-b border-slate-900 pb-2 last:border-0">
                                    <div className="flex gap-2 mb-1">
                                        <span className={`font-bold ${
                                            log.level === 'ERROR' ? 'text-red-500' : 
                                            log.level === 'WARN' ? 'text-amber-500' : 'text-blue-400'
                                        }`}>[{log.level}]</span>
                                        <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-slate-300 break-words">{log.message}</p>
                                    {log.details && (
                                        <pre className="mt-1 text-slate-600 overflow-x-auto">
                                            {JSON.stringify(log.details, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-between items-center text-xs text-slate-500">
                             <span>Mostrando últimos 100 eventos locais.</span>
                             <div className="flex items-center gap-1">
                                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                 Logger Ativo
                             </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
