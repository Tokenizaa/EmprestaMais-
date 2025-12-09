
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabaseService } from '../services/supabaseService';
import { Documento } from '../types';
import { useAuth } from '../App';
import { FileText, Upload, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { getFriendlyErrorMessage } from '../src/utils/errorHandling';

export const Documentos: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Documento[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('RG/CPF');

  useEffect(() => {
    if (user) {
      supabaseService.db.getDocuments(user.id).then(setDocuments);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFile) return;

    setUploading(true);
    try {
      await supabaseService.db.uploadDocument(user.id, docType, selectedFile);
      alert('Documento enviado com sucesso! Aguarde a análise.');
      setSelectedFile(null);
      // Refresh list
      const updated = await supabaseService.db.getDocuments(user.id);
      setDocuments(updated);
    } catch (error) {
      alert(getFriendlyErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
        case 'APPROVED': return <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> Aprovado</span>;
        case 'REJECTED': return <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12} /> Rejeitado</span>;
        default: return <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12} /> Em Análise</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Meus Documentos</h1>
        <p className="text-slate-400">Gerencie seus documentos para análise de crédito.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Form */}
          <Card className="lg:col-span-1">
              <CardHeader>
                  <CardTitle>Novo Documento</CardTitle>
              </CardHeader>
              <CardContent>
                  <form onSubmit={handleUpload} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Documento</label>
                          <select 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-primary"
                            value={docType}
                            onChange={(e) => setDocType(e.target.value)}
                          >
                              <option>RG/CPF</option>
                              <option>Comprovante de Renda</option>
                              <option>Comprovante de Residência</option>
                              <option>Extrato Bancário</option>
                              <option>Outros</option>
                          </select>
                      </div>

                      <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:bg-slate-800/50 transition-colors cursor-pointer relative">
                          <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <Upload className="mx-auto h-10 w-10 text-slate-500 mb-2" />
                          <p className="text-sm text-slate-400">
                              {selectedFile ? selectedFile.name : "Clique ou arraste para enviar"}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">PDF ou Imagem (Max 5MB)</p>
                      </div>

                      <Button type="submit" className="w-full" disabled={!selectedFile} isLoading={uploading}>
                          Enviar para Análise
                      </Button>
                  </form>
              </CardContent>
          </Card>

          {/* Documents List */}
          <div className="lg:col-span-2 space-y-4">
              {documents.length === 0 && (
                  <Card>
                      <CardContent className="p-8 text-center text-slate-500">
                          <AlertCircle className="mx-auto h-12 w-12 mb-2 opacity-50" />
                          <p>Nenhum documento enviado ainda.</p>
                      </CardContent>
                  </Card>
              )}
              {documents.map((doc) => (
                  <Card key={doc.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className="bg-slate-800 p-3 rounded-lg text-indigo-400">
                                  <FileText size={24} />
                              </div>
                              <div>
                                  <h3 className="font-bold text-white">{doc.tipo}</h3>
                                  <p className="text-xs text-slate-400">{doc.nome_arquivo} • {new Date(doc.data_envio).toLocaleDateString()}</p>
                              </div>
                          </div>
                          <div>
                              {getStatusBadge(doc.status)}
                          </div>
                      </CardContent>
                  </Card>
              ))}
          </div>
      </div>
    </div>
  );
};
