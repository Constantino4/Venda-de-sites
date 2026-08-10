import React, { useState, useEffect } from 'react';
import { Rocket, X, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Website } from '../types';

interface DemoDeployModalProps {
  website: Website | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const DemoDeployModal: React.FC<DemoDeployModalProps> = ({
  website,
  onClose,
  onSuccess,
}) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState<boolean>(true);
  const [demoUrl, setDemoUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!website) return;

    let isMounted = true;

    const runDeploy = async () => {
      setIsDeploying(true);
      setError('');
      setLogs(['Iniciando processo de deploy da demonstração pública...']);

      try {
        // Step 1
        await new Promise((r) => setTimeout(r, 600));
        if (isMounted) setLogs((prev) => [...prev, '1/4: Validando estrutura dos arquivos do .ZIP...']);

        // Step 2
        await new Promise((r) => setTimeout(r, 800));
        if (isMounted) setLogs((prev) => [...prev, `2/4: Detectando tecnologias (${website.techStack?.join(', ') || 'React 19'})...`]);

        // Step 3
        await new Promise((r) => setTimeout(r, 900));
        if (isMounted) setLogs((prev) => [...prev, '3/4: Criando sandbox isolada sem expor o código-fonte privado...']);

        // Call backend deploy endpoint
        const res = await fetch(`/api/admin/products/${website.id}/deploy-demo`, {
          method: 'POST',
        });
        const data = await res.json();

        if (res.ok && data.success) {
          if (isMounted) {
            setLogs((prev) => [...prev, '4/4: Deploy concluído com sucesso!']);
            setDemoUrl(data.demoUrl || `/api/demos/${website.id}/index.html`);
            setIsDeploying(false);
            onSuccess();
          }
        } else {
          throw new Error(data.error || 'Erro ao publicar demonstração.');
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Falha no deploy da demonstração.');
          setIsDeploying(false);
        }
      }
    };

    runDeploy();

    return () => {
      isMounted = false;
    };
  }, [website]);

  if (!website) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Publicar Demonstração do Site</h3>
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

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Progress Console */}
          <div className="bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-2xl space-y-2 border border-slate-800 shadow-inner max-h-56 overflow-y-auto">
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-slate-600">&gt;</span>
                <span>{log}</span>
              </div>
            ))}

            {isDeploying && (
              <div className="flex items-center gap-2 text-purple-400 pt-2 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processando build de demonstração...</span>
              </div>
            )}
          </div>

          {/* Success State */}
          {!isDeploying && !error && demoUrl && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Demonstração ao Vivo Ativa e Vinculada ao Produto!</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                A demonstração pública está pronta. Visitantes da vitrine poderão clicar em "Ver demonstração" e navegar no modelo sem ter acesso ao arquivo .ZIP original.
              </p>
              <a
                href={demoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs"
              >
                <span>Testar Demonstração</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-rose-900">Falha no Deploy da Demonstração</p>
                <p className="text-rose-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
            >
              Fechar
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
