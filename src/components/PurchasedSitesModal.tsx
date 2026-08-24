import React, { useState, useEffect } from 'react';
import { PurchasedSite, DomainRecord, LicenseRecord, SubscriptionRecord, SupportTicket, InvoiceRecord, SiteCustomizationData, Website } from '../types';
import { 
  Download, 
  CheckCircle2, 
  Copy, 
  Check, 
  Terminal, 
  Key, 
  Rocket, 
  ExternalLink, 
  Github, 
  Globe, 
  ShieldCheck, 
  Loader2, 
  FileCode, 
  FileText, 
  Settings, 
  FolderArchive,
  PackageCheck,
  Sparkles,
  Info,
  ChevronRight,
  User,
  LogIn,
  Layers,
  X,
  CreditCard,
  MessageSquare,
  HelpCircle,
  Clock,
  Printer,
  Server,
  RefreshCw,
  Plus,
  Send,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { SiteCustomizerModal } from './SiteCustomizerModal';

interface PurchasedSitesModalProps {
  purchasedSites: PurchasedSite[];
  onClose: () => void;
  onOpenGithubDeploy?: (product?: { id: string; title: string; slug?: string }) => void;
  onOpenLiveDemo?: (website: Website) => void;
}

export const PurchasedSitesModal: React.FC<PurchasedSitesModalProps> = ({
  purchasedSites,
  onClose,
  onOpenGithubDeploy,
  onOpenLiveDemo,
}) => {
  const { user, openAuthModal } = useAuth();
  
  // Navigation tabs for the client portal
  const [activeTab, setActiveTab] = useState<'sites' | 'domains' | 'licenses' | 'invoices' | 'subscriptions' | 'support'>('sites');

  // Customizer modal state
  const [customizingSite, setCustomizingSite] = useState<Website | null>(null);

  // Clipboard copies
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  // Domains State
  const [domains, setDomains] = useState<DomainRecord[]>([
    {
      id: 'dom-1',
      domain: 'meunegocio.com.br',
      siteId: purchasedSites[0]?.website?.id || 'novastore-pro-ecommerce',
      siteTitle: purchasedSites[0]?.website?.title || 'Meu Site',
      status: 'active',
      sslActive: true,
      dnsRecords: [
        { type: 'A', name: '@', value: '76.76.21.21', status: 'configured' },
        { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com', status: 'configured' }
      ],
      createdAt: '2026-08-20'
    }
  ]);
  const [newDomainInput, setNewDomainInput] = useState('');
  const [isVerifyingDomain, setIsVerifyingDomain] = useState(false);
  const [domainVerifyMessage, setDomainVerifyMessage] = useState<string | null>(null);

  // Invoices State
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(() => {
    return purchasedSites.map((item, idx) => ({
      id: `INV-${202600 + idx}`,
      orderId: item.orderId,
      date: item.purchaseDate,
      productTitle: item.website.title,
      licenseType: item.licenseType,
      amount: item.pricePaid,
      paymentMethod: 'PIX Instantâneo',
      status: 'paid',
      pdfDownloadUrl: '#'
    }));
  });

  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<InvoiceRecord | null>(null);

  // Subscriptions State
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([
    {
      id: 'SUB-982104',
      orderId: purchasedSites[0]?.orderId || 'ORD-982104',
      productTitle: purchasedSites[0]?.website?.title || 'Website Profissional',
      planName: 'Hospedagem Cloud Turbo + Manutenção VIP',
      priceMonthly: 39.00,
      billingCycle: 'monthly',
      status: 'active',
      nextBillingDate: '20/09/2026',
      features: [
        'Hospedagem Cloud de Alta Performance',
        'Certificado SSL Gratuito Renovado Automaticamente',
        'Backups Diários em Nuvem',
        'Suporte Técnico Prioritário'
      ]
    }
  ]);

  // Support Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'TCK-40192',
      customerEmail: user?.email || 'cliente@exemplo.com.br',
      subject: 'Dúvida sobre configuração do domínio personalizado',
      category: 'domain',
      priority: 'normal',
      status: 'open',
      createdAt: '20/08/2026 10:15',
      messages: [
        {
          sender: 'customer',
          text: 'Olá! Já apontei o Tipo A e CNAME no Registro.br. Quanto tempo costuma demorar a propagação do SSL?',
          timestamp: '20/08/2026 10:15'
        },
        {
          sender: 'support',
          text: 'Olá! No Registro.br a propagação leva em média de 30 minutos a 2 horas. O certificado SSL é emitido automaticamente assim que os apontamentos responderem aos nossos servidores.',
          timestamp: '20/08/2026 10:18'
        }
      ]
    }
  ]);

  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState<'customization' | 'domain' | 'technical' | 'billing'>('customization');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Client 1-Click Deployment modal state
  const [deployingSite, setDeployingSite] = useState<PurchasedSite | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [deployedUrl, setDeployedUrl] = useState<string>('');

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Download Package with signed token or direct stream
  const handleDownloadPackage = async (item: PurchasedSite) => {
    setDownloadingId(item.orderId);
    setDownloadSuccessId(null);

    try {
      const res = await fetch(`/api/orders/${item.orderId}/download-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.website.id || 'novastore-pro-ecommerce',
          customerEmail: user?.email || 'cliente@exemplo.com'
        })
      });

      const data = await res.json().catch(() => ({}));
      let downloadHref = `/api/purchased-sites/${item.website.id || 'novastore-pro-ecommerce'}/download-package`;
      if (res.ok && data.downloadUrl) {
        downloadHref = data.downloadUrl;
      }

      const a = document.createElement('a');
      a.href = downloadHref;
      a.download = `${item.website.slug || 'site-completo'}-v${item.website.currentVersion || '1.0.0'}-pacote-completo.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadSuccessId(item.orderId);
      setTimeout(() => setDownloadSuccessId(null), 4000);
    } catch (err: any) {
      window.location.href = `/api/purchased-sites/${item.website.id || 'novastore-pro-ecommerce'}/download-package`;
    } finally {
      setDownloadingId(null);
    }
  };

  // Domain Verification
  const handleAddAndVerifyDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainInput.trim() || isVerifyingDomain) return;

    setIsVerifyingDomain(true);
    setDomainVerifyMessage(null);

    try {
      const res = await fetch('/api/domains/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomainInput.trim() })
      });

      const data = await res.json();

      if (data.success) {
        const newDom: DomainRecord = {
          id: `dom-${Date.now()}`,
          domain: data.domain,
          siteId: purchasedSites[0]?.website?.id || 'site',
          siteTitle: purchasedSites[0]?.website?.title || 'Meu Site',
          status: 'active',
          sslActive: true,
          dnsRecords: data.dnsRecords || [
            { type: 'A', name: '@', value: '76.76.21.21', status: 'configured' },
            { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com', status: 'configured' }
          ],
          createdAt: new Date().toISOString().split('T')[0]
        };

        setDomains(prev => [newDom, ...prev]);
        setNewDomainInput('');
        setDomainVerifyMessage(`Domínio ${data.domain} verificado e ativo com certificado SSL!`);
      }
    } catch (err) {
      console.error('Erro ao verificar domínio:', err);
    } finally {
      setIsVerifyingDomain(false);
    }
  };

  // Support Ticket Submission
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketMessage.trim() || isSubmittingTicket) return;

    setIsSubmittingTicket(true);

    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: user?.email || 'cliente@exemplo.com.br',
          subject: newTicketSubject,
          category: newTicketCategory,
          message: newTicketMessage,
        })
      });

      const data = await res.json();
      if (data.ticket) {
        setTickets(prev => [data.ticket, ...prev]);
        setNewTicketSubject('');
        setNewTicketMessage('');
      }
    } catch (err) {
      console.error('Erro ao abrir chamado:', err);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  // 1-Click Deployment Pipeline
  const handleStartDeploy = async (item: PurchasedSite) => {
    setDeployingSite(item);
    setIsDeploying(true);
    setDeployedUrl('');
    setDeployLogs(['Iniciando pipeline de publicação automatizada...']);

    try {
      await new Promise(r => setTimeout(r, 600));
      setDeployLogs(prev => [...prev, '1/4: Gerando repositório Git e aplicando licença...']);
      await new Promise(r => setTimeout(r, 800));
      setDeployLogs(prev => [...prev, '2/4: Otimizando imagens e compilando build de produção...']);
      await new Promise(r => setTimeout(r, 900));
      setDeployLogs(prev => [...prev, '3/4: Conectando rede de borda e emitindo SSL...']);
      await new Promise(r => setTimeout(r, 700));

      const fakeUrl = `https://${item.website.slug || 'novastore'}-${Math.floor(1000 + Math.random() * 9000)}.vercel.app`;
      setDeployedUrl(fakeUrl);
      setDeployLogs(prev => [...prev, `4/4: Sucesso! Site publicado e online em: ${fakeUrl}`]);
    } catch (err) {
      setDeployLogs(prev => [...prev, 'Falha no deploy. Tente novamente ou baixe o arquivo ZIP.']);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-5xl rounded-3xl shadow-2xl text-slate-900 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Área do Cliente & Meus Sites</h3>
              <p className="text-xs text-slate-500 font-bold">
                Painel central: Gerencie códigos, licenças, domínios e suporte
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 text-xs font-bold gap-4 overflow-x-auto">
          {[
            { id: 'sites', label: `Meus Sites (${purchasedSites.length})`, icon: Layers },
            { id: 'domains', label: 'Domínios Personalizados', icon: Globe },
            { id: 'licenses', label: 'Licenças & Termos', icon: Key },
            { id: 'invoices', label: 'Faturas & Recibos', icon: FileText },
            { id: 'subscriptions', label: 'Assinaturas & Hospedagem', icon: Server },
            { id: 'support', label: 'Suporte Prioritário', icon: MessageSquare },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* TAB 1: MEUS SITES */}
          {activeTab === 'sites' && (
            <div className="space-y-4">
              {purchasedSites.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <PackageCheck className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-700">Nenhum site adquirido ainda</h4>
                  <p className="text-xs text-slate-500">Escolha um template no catálogo para iniciar!</p>
                </div>
              ) : (
                purchasedSites.map((item, idx) => (
                  <div
                    key={item.orderId || idx}
                    className="bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition"
                  >
                    {/* Site Info Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.website.thumbnail}
                          alt={item.website.title}
                          className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Pronto 🚀
                            </span>
                            <span className="text-[10px] text-slate-500">Adquirido em {item.purchaseDate}</span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900 mt-1">{item.website.title}</h4>
                          <p className="text-[11px] text-slate-500">
                            Versão {item.currentVersion} • Licença {item.licenseType === 'extended' ? 'Estendida' : item.licenseType === 'installation' ? 'Com Instalação' : 'Padrão'}
                          </p>
                        </div>
                      </div>

                      {/* License Key Box */}
                      <div className="bg-white border border-slate-200 p-2.5 rounded-2xl flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">Chave de Licença</span>
                          <span className="font-mono text-xs font-bold text-blue-700">{item.licenseKey}</span>
                        </div>
                        <button
                          onClick={() => handleCopyKey(item.licenseKey)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Copiar Chave"
                        >
                          {copiedKey === item.licenseKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Quick Actions Bar */}
                    <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {onOpenLiveDemo && (
                          <button
                            onClick={() => onOpenLiveDemo(item.website)}
                            className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                          >
                            <Globe className="w-3.5 h-3.5 text-blue-600" />
                            <span>Abrir Site / Testar</span>
                          </button>
                        )}

                        <button
                          onClick={() => setCustomizingSite(item.website)}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          <span>Personalizar com IA</span>
                        </button>

                        <button
                          onClick={() => setActiveTab('domains')}
                          className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                        >
                          <Globe className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Conectar Domínio</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          disabled={downloadingId === item.orderId}
                          onClick={() => handleDownloadPackage(item)}
                          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5"
                        >
                          {downloadingId === item.orderId ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Baixando...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>Baixar Código ZIP</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleStartDeploy(item)}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                        >
                          <Rocket className="w-3.5 h-3.5 text-amber-400" />
                          <span>Publicar em 1 Clique</span>
                        </button>
                      </div>
                    </div>

                    {downloadSuccessId === item.orderId && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Download do pacote iniciado com sucesso! Extraia o arquivo ZIP para rodar com <code>npm run dev</code>.</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: DOMÍNIOS PERSONALIZADOS */}
          {activeTab === 'domains' && (
            <div className="space-y-6">
              
              {/* DNS Instruction Guide */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <h4 className="text-sm font-black text-blue-950">Como Apontar seu Próprio Domínio (DNS)</h4>
                </div>
                <p className="text-xs text-blue-900 leading-relaxed">
                  Acesse o painel do seu registrador (Registro.br, GoDaddy, Hostinger, Cloudflare) e crie os 2 registros DNS abaixo:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-white border border-blue-200 p-3 rounded-2xl space-y-1">
                    <span className="text-[10px] font-black text-blue-600 uppercase">Registro 1 (Tipo A)</span>
                    <div className="text-xs font-mono font-bold flex justify-between items-center text-slate-800">
                      <span>Nome: <b>@</b></span>
                      <span>Valor: <b>76.76.21.21</b></span>
                    </div>
                  </div>

                  <div className="bg-white border border-blue-200 p-3 rounded-2xl space-y-1">
                    <span className="text-[10px] font-black text-blue-600 uppercase">Registro 2 (CNAME)</span>
                    <div className="text-xs font-mono font-bold flex justify-between items-center text-slate-800">
                      <span>Nome: <b>www</b></span>
                      <span className="truncate">Valor: <b>cname.vercel-dns.com</b></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add New Domain Form */}
              <form onSubmit={handleAddAndVerifyDomain} className="bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Adicionar Novo Domínio
                </h4>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Ex: meunegocio.com.br"
                    value={newDomainInput}
                    onChange={(e) => setNewDomainInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newDomainInput.trim() || isVerifyingDomain}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
                  >
                    {isVerifyingDomain ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verificando DNS...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar & Validar SSL</span>
                      </>
                    )}
                  </button>
                </div>

                {domainVerifyMessage && (
                  <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> {domainVerifyMessage}
                  </p>
                )}
              </form>

              {/* Configured Domains List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Domínios Conectados
                </h4>

                {domains.map((d) => (
                  <div key={d.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-black text-xs text-slate-900">{d.domain}</h5>
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> SSL Ativo
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Apontando para: {d.siteTitle}</p>
                      </div>
                    </div>

                    <a
                      href={`https://${d.domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>Testar Acesso</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LICENÇAS & TERMOS */}
          {activeTab === 'licenses' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Certificados de Licença de Uso
                </h4>

                <div className="space-y-3">
                  {purchasedSites.map((item, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-slate-900">{item.website.title}</span>
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-blue-100">
                          {item.licenseType === 'extended' ? 'Licença Estendida Comercial' : 'Licença Standard (1 Projeto)'}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-xs font-bold text-blue-800 flex justify-between items-center">
                        <span>{item.licenseKey}</span>
                        <button
                          onClick={() => handleCopyKey(item.licenseKey)}
                          className="text-[10px] text-slate-500 hover:text-slate-900"
                        >
                          Copiar Chave
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-500">
                        ✓ Permitido uso comercial • Código 100% aberto • Sem royalties • Suporte por 12 meses.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FATURAS & RECIBOS */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Histórico de Pedidos & Faturas
                </h4>
              </div>

              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div key={inv.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-black text-xs text-slate-900">{inv.id} • {inv.productTitle}</h5>
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                            Pago ({inv.paymentMethod})
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Data: {inv.date} • Total: R$ {inv.amount.toFixed(2)}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedInvoiceForPrint(inv)}
                      className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Ver Recibo Formal</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Printable Invoice Modal view */}
              {selectedInvoiceForPrint && (
                <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 text-slate-900 space-y-4 shadow-2xl">
                    <div className="flex justify-between items-start border-b pb-4">
                      <div>
                        <h4 className="text-base font-black">WEBMARKET TECNOLOGIA S/A</h4>
                        <p className="text-[10px] text-slate-500">CNPJ: 12.345.678/0001-90 • Comprovante de Pagamento</p>
                      </div>
                      <button onClick={() => setSelectedInvoiceForPrint(null)} className="text-slate-400 hover:text-slate-900">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Número da Fatura:</span>
                        <span className="font-bold">{selectedInvoiceForPrint.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Data de Emissão:</span>
                        <span className="font-bold">{selectedInvoiceForPrint.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Item Adquirido:</span>
                        <span className="font-bold">{selectedInvoiceForPrint.productTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Forma de Pagamento:</span>
                        <span className="font-bold">{selectedInvoiceForPrint.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 text-sm font-black">
                        <span>Total Pago:</span>
                        <span className="text-emerald-600">R$ {selectedInvoiceForPrint.amount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => window.print()}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir / Salvar PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ASSINATURAS & HOSPEDAGEM */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Planos de Hospedagem & Manutenção Ativos
              </h4>

              {subscriptions.map((sub) => (
                <div key={sub.id} className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                        Assinatura Ativa
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-1">{sub.planName}</h4>
                      <p className="text-[11px] text-slate-500">Vinculado a: {sub.productTitle}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-slate-900">R$ {sub.priceMonthly.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400 block">/mês</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-1">
                    {sub.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-700 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-between items-center text-[11px] text-slate-500">
                    <span>Próxima cobrança automática: <b>{sub.nextBillingDate}</b></span>
                    <button className="text-red-600 hover:text-red-700 font-bold">Gerenciar Assinatura</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: SUPORTE PRIORITÁRIO */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              
              {/* Open Ticket Form */}
              <form onSubmit={handleCreateTicket} className="bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Abrir Novo Chamado de Suporte
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Assunto</label>
                    <input
                      type="text"
                      placeholder="Ex: Ajuda para alterar fotos do template"
                      value={newTicketSubject}
                      onChange={(e) => setNewTicketSubject(e.target.value)}
                      className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Categoria</label>
                    <select
                      value={newTicketCategory}
                      onChange={(e) => setNewTicketCategory(e.target.value as any)}
                      className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="customization">Personalização do Site</option>
                      <option value="domain">Configuração de Domínio</option>
                      <option value="technical">Dúvida Técnica / Código</option>
                      <option value="billing">Faturamento & Pagamento</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700">Descrição da sua dúvida ou solicitação</label>
                  <textarea
                    rows={3}
                    placeholder="Descreva detalhadamente o que você precisa..."
                    value={newTicketMessage}
                    onChange={(e) => setNewTicketMessage(e.target.value)}
                    className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={!newTicketSubject.trim() || !newTicketMessage.trim() || isSubmittingTicket}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    {isSubmittingTicket ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Enviando Chamado...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar Chamado de Suporte</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Tickets List */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Seus Chamados Anteriores
                </h4>

                {tickets.map((tck) => (
                  <div key={tck.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{tck.id} • {tck.subject}</span>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black px-2 py-0.5 rounded-full">
                          {tck.status === 'open' ? 'Em Atendimento' : 'Resolvido'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{tck.createdAt}</span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {tck.messages.map((m, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-xl text-xs ${
                            m.sender === 'customer'
                              ? 'bg-slate-50 border border-slate-200 text-slate-800'
                              : 'bg-blue-50/80 border border-blue-200 text-blue-950 font-medium'
                          }`}
                        >
                          <span className="font-bold text-[10px] block mb-0.5 text-slate-500">
                            {m.sender === 'customer' ? 'Você:' : 'Suporte Técnico WebMarket:'}
                          </span>
                          <p>{m.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Garantia de 7 dias e suporte técnico ativo em todos os sites.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition"
          >
            Fechar Painel
          </button>
        </div>

      </div>

      {/* Embedded Site Customizer Modal */}
      {customizingSite && (
        <SiteCustomizerModal
          isOpen={true}
          website={customizingSite}
          onClose={() => setCustomizingSite(null)}
          onSaveCustomization={(data) => {
            console.log('Customização salva:', data);
          }}
        />
      )}

      {/* 1-Click Deployment Progress Modal */}
      {deployingSite && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 text-slate-900 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-black flex items-center gap-2">
                <Rocket className="w-4 h-4 text-blue-600" />
                <span>Publicação Automática (Deploy)</span>
              </h4>
              {!isDeploying && (
                <button onClick={() => setDeployingSite(null)} className="text-slate-400 hover:text-slate-900">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="bg-slate-950 text-slate-100 p-4 rounded-2xl font-mono text-xs space-y-1.5 max-h-48 overflow-y-auto">
              {deployLogs.map((log, i) => (
                <p key={i} className="text-slate-300">{log}</p>
              ))}
              {isDeploying && <p className="text-blue-400 animate-pulse">Processando etapa na nuvem...</p>}
            </div>

            {deployedUrl && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Site Publicado com Sucesso!
                </span>
                <a
                  href={deployedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>{deployedUrl}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {!isDeploying && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setDeployingSite(null)}
                  className="bg-blue-600 text-white font-bold text-xs px-5 py-2 rounded-xl"
                >
                  Concluir
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
