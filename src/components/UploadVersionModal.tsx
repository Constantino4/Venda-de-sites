import React, { useState } from 'react';
import { Upload, X, FileCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { Website } from '../types';

interface UploadVersionModalProps {
  website: Website | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadVersionModal: React.FC<UploadVersionModalProps> = ({
  website,
  onClose,
  onSuccess,
}) => {
  const [versionNumber, setVersionNumber] = useState('');
  const [changelog, setChangelog] = useState('');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!website) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setZipFile(e.target.files[0]);
    }
  };

  const handleUploadNewVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipFile) {
      alert('Selecione o arquivo .ZIP com os arquivos da nova versão.');
      return;
    }

    setIsUploading(true);
    setStatusMessage('Enviando arquivo .ZIP e analisando nova estrutura...');

    try {
      const formData = new FormData();
      formData.append('zipFile', zipFile);
      formData.append('versionNumber', versionNumber || '1.1.0');
      formData.append('changelog', changelog || 'Atualização de melhorias e correções.');

      const res = await fetch(`/api/admin/products/${website.id}/versions`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage('Nova versão e demonstração atualizadas com sucesso!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      } else {
        alert(data.error || 'Erro ao fazer upload da nova versão.');
      }
    } catch (err: any) {
      alert('Falha na comunicação com o servidor: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Adicionar Nova Versão do Site</h3>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-xs">{website.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleUploadNewVersion} className="p-6 space-y-5">
          
          {/* Current version info & Firebase info */}
          <div className="space-y-2">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Versão Atual Publicada:</span>
              <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                v{website.currentVersion || '1.0.0'}
              </span>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/80 p-2.5 rounded-xl flex items-center justify-between text-[11px] text-blue-900 font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Firebase Storage Ativo</span>
              </div>
              <span className="font-mono text-[10px] text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                boreal-protocol-rxctm.firebasestorage.app
              </span>
            </div>
          </div>

          {/* New Version Number & File Input */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Número da Nova Versão *</label>
              <input
                type="text"
                required
                placeholder="Ex: 1.1.0 ou 2.0.0"
                value={versionNumber}
                onChange={(e) => setVersionNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Novo Arquivo .ZIP do Projeto Completo *</label>
              <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50 rounded-2xl p-5 text-center cursor-pointer transition">
                <input
                  type="file"
                  accept=".zip"
                  required
                  onChange={handleFileChange}
                  className="hidden"
                  id="version-zip-input"
                />
                <label htmlFor="version-zip-input" className="cursor-pointer block space-y-2">
                  <div className="w-10 h-10 mx-auto bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  {zipFile ? (
                    <div>
                      <p className="text-xs font-bold text-slate-900">{zipFile.name}</p>
                      <p className="text-[10px] text-blue-600 font-semibold">{(zipFile.size / (1024 * 1024)).toFixed(2)} MB - Pronto para Upload</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-700">Clique para selecionar o novo arquivo .ZIP</p>
                      <p className="text-[10px] text-slate-400">Tamanho máximo: 100 MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Changelog / O que mudou nesta versão</label>
              <textarea
                rows={3}
                placeholder="Descreva as atualizações de recursos, novas telas ou correções implementadas nesta versão..."
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {statusMessage && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs font-bold text-blue-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50"
            >
              {isUploading ? 'Enviando...' : 'Publicar Nova Versão'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
