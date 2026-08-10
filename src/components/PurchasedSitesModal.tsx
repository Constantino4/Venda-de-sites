import React, { useState } from 'react';
import { PurchasedSite } from '../types';
import { Download, CheckCircle2, Copy, Check, Terminal, Key, Rocket, ExternalLink, RefreshCw, Github, Globe, ShieldCheck, Loader2 } from 'lucide-react';

interface PurchasedSitesModalProps {
  purchasedSites: PurchasedSite[];
  onClose: () => void;
}

export const PurchasedSitesModal: React.FC<PurchasedSitesModalProps> = ({
  purchasedSites,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Client Deployment State
  const [selectedDeploySite, setSelectedDeploySite] = useState<PurchasedSite | null>(null);
  const [deployTarget, setDeployTarget] = useState<'github' | 'vercel' | 'both'>('vercel');
  const [githubRepoName, setGithubRepoName] = useState('');
  const [vercelProjectName, setVercelProjectName] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [deployedUrl, setDeployedUrl] = useState<string>('');

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  // Secure Server Download via Token
  const handleSecureDownload = async (item: PurchasedSite) => {
    setDownloadingId(item.orderId);

    try {
      // Request download token from server
      const res = await fetch(`/api/orders/${item.orderId}/download-token`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok && data.downloadUrl) {
        // Trigger file download
        const a = document.createElement('a');
        a.href = data.downloadUrl;
        a.download = `${item.website.slug || 'site'}-codigo.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert(data.error || 'Erro ao gerar token seguro de download.');
      }
    } catch (err: any) {
      alert('Falha na requisição de download: ' + err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle Client 1-Click Deployment to GitHub/Vercel
  const handleStartDeployment = async (item: PurchasedSite) => {
    setIsDeploying(true);
    setDeployedUrl('');
    setDeployLogs(['Iniciando pipeline de publicação automática...']);

    try {
      await new Promise((r) => setTimeout(r, 600));
      setDeployLogs((prev) => [...prev, '1/3: Extraindo código-fonte e compilando assets de produção...']);

      await new Promise((r) => setTimeout(r, 800));
      setDeployLogs((prev) => [...prev, `2/3: Conectando com plataforma de hospedagem (${deployTarget.toUpperCase()})...`]);

      const res = await fetch(`/api/orders/${item.orderId}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: deployTarget,
          githubRepoName: githubRepoName || `${item.website.slug || 'site'}-deploy`,
          vercelProjectName: vercelProjectName || `${item.website.slug || 'site'}-webmarket`,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await new Promise((r) => setTimeout(r, 600));
        setDeployLogs((prev) => [...prev, '3/3: Publicação concluída com sucesso! Seu site está no ar.']);
        setDeployedUrl(data.deploymentUrl || `https://${item.website.slug || 'site'}.vercel.app`);
      } else {
        throw new Error(data.error || 'Falha ao realizar deploy.');
      }
    } catch (err: any) {
      alert('Erro ao publicar site: ' + err.message);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-900">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Download className="w-6 h-6 text-blue-600" />
            <span>Meus Sites Comprados & Licenças</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Baixe o código fonte em .ZIP, acompanhe atualizações de versão e publique seu site no Vercel/GitHub em 1 clique.
          </p>
        </div>
      </div>

      {/* Purchased Items List */}
      {purchasedSites.length > 0 ? (
        <div className="space-y-6">
          {purchasedSites.map((item, idx) => (
            <div
              key={`${item.orderId}-${idx}`}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6"
            >
              
              {/* Top Row Info */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                
                {/* Left Product Specs */}
                <div className="flex items-start gap-4 flex-1">
                  <img
                    src={item.website.thumbnail}
                    alt={item.website.title}
                    className="w-24 h-16 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
                  />

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase">
                        COMPRA CONFIRMADA
                      </span>
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200 uppercase">
                        Licença {item.licenseType}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">Data: {item.purchaseDate}</span>
                    </div>

                    <h3 className="text-base font-black text-slate-900">{item.website.title}</h3>

                    {/* License Key Box */}
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 flex items-center gap-2 text-xs font-mono text-blue-700 font-bold">
                        <Key className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.licenseKey}</span>
                      </div>

                      <button
                        onClick={() => handleCopyKey(item.licenseKey)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                        title="Copiar Chave de Ativação"
                      >
                        {copiedKey === item.licenseKey ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
                  
                  {/* Publicar meu site modal trigger */}
                  <button
                    onClick={() => {
                      setSelectedDeploySite(item);
                      setGithubRepoName(`${item.website.slug || 'meu-site'}-repo`);
                      setVercelProjectName(`${item.website.slug || 'meu-site'}-app`);
                    }}
                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-3 px-4 rounded-2xl shadow-xs transition flex items-center justify-center gap-2 shrink-0"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>Publicar Meu Site</span>
                  </button>

                  {/* Secure ZIP Download Button */}
                  <button
                    onClick={() => handleSecureDownload(item)}
                    disabled={downloadingId === item.orderId}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 px-5 rounded-2xl shadow-md transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {downloadingId === item.orderId ? 'Gerando Token...' : 'Baixar Site (.ZIP)'}
                    </span>
                  </button>

                </div>

              </div>

              {/* Version History & Dev Instructions Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700">Versão Disponível para Download:</span>
                  <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg font-bold text-blue-600 shadow-2xs">
                    v{item.website.currentVersion || '1.0.0'}
                  </span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Atualizações ilimitadas incluídas
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex items-center justify-between gap-3 text-xs font-mono text-slate-200 self-stretch sm:self-auto">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-[11px]">npm install && npm run dev</span>
                  </div>
                  <button
                    onClick={() => handleCopyCmd('npm install && npm run dev')}
                    className="p-1 hover:bg-slate-800 rounded transition text-slate-400 hover:text-white"
                  >
                    {copiedCmd === 'npm install && npm run dev' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
          <Download className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-900">Você ainda não comprou nenhum site</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Navegue pela vitrine na aba de início, escolha um modelo e finalize a compra para acessar o código completo.
          </p>
        </div>
      )}

      {/* Deployment Modal */}
      {selectedDeploySite && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden text-slate-900 space-y-5 p-6">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-black text-slate-900">Publicação do Site em 1 Clique</h3>
              </div>
              <button
                onClick={() => setSelectedDeploySite(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-900"
              >
                Fechar
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Selecione a Plataforma de Hospedagem</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setDeployTarget('vercel')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      deployTarget === 'vercel'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-slate-900" />
                    <span>Vercel</span>
                  </button>

                  <button
                    onClick={() => setDeployTarget('github')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      deployTarget === 'github'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Github className="w-4 h-4 text-slate-900" />
                    <span>GitHub</span>
                  </button>

                  <button
                    onClick={() => setDeployTarget('both')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      deployTarget === 'both'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Rocket className="w-4 h-4 text-purple-600" />
                    <span>GitHub + Vercel</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nome do Repositório / Projeto</label>
                <input
                  type="text"
                  value={vercelProjectName}
                  onChange={(e) => setVercelProjectName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                />
              </div>

              {/* Progress Console */}
              {deployLogs.length > 0 && (
                <div className="bg-slate-950 text-emerald-400 font-mono text-xs p-3.5 rounded-xl space-y-1.5 border border-slate-800">
                  {deployLogs.map((log, idx) => (
                    <p key={idx}>&gt; {log}</p>
                  ))}
                  {isDeploying && (
                    <div className="flex items-center gap-2 text-purple-400 pt-1 animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Compilando e publicando...</span>
                    </div>
                  )}
                </div>
              )}

              {deployedUrl && (
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl space-y-2 text-xs">
                  <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Site publicado e online!
                  </p>
                  <a
                    href={deployedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-purple-700 font-bold underline"
                  >
                    <span>{deployedUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <button
                onClick={() => handleStartDeployment(selectedDeploySite)}
                disabled={isDeploying}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black text-xs py-3 rounded-xl transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Rocket className="w-4 h-4" />
                <span>{isDeploying ? 'Publicando...' : 'Iniciar Deploy do Meu Site'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
