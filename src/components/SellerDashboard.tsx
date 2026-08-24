import React, { useState, useEffect } from 'react';
import { Website, SellerMetrics, Order, LicenseRecord, SubscriptionRecord, SupportTicket } from '../types';
import { 
  DollarSign, 
  ShoppingCart, 
  Eye, 
  TrendingUp, 
  PlusCircle, 
  Sparkles, 
  CheckCircle2, 
  FileCode, 
  Upload, 
  FileCheck, 
  ExternalLink, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  EyeOff, 
  ShieldCheck, 
  Play, 
  UserCheck, 
  LogIn,
  Layers,
  Key,
  Users,
  MessageSquare,
  Activity,
  Server,
  Download,
  AlertTriangle,
  RotateCcw,
  Check,
  Search,
  Filter,
  Send,
  Loader2
} from 'lucide-react';
import { UploadVersionModal } from './UploadVersionModal';
import { DemoDeployModal } from './DemoDeployModal';
import { AdminTemplatesManager } from './admin/AdminTemplatesManager';
import { LivePreviewModal } from './LivePreviewModal';
import { useAuth } from '../lib/AuthContext';

interface SellerDashboardProps {
  onAddNewListing: (website: Website) => void;
  existingSites: Website[];
  onUpdateWebsites?: (websites: Website[]) => void;
  onOpenLiveDemo?: (website: Website) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  onAddNewListing,
  existingSites,
  onUpdateWebsites,
  onOpenLiveDemo,
}) => {
  const { user } = useAuth();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'templates' | 'metrics' | 'catalog' | 'create' | 'orders' | 'licenses' | 'subscriptions' | 'support' | 'automations'>('templates');

  // Admin products state
  const [adminProducts, setAdminProducts] = useState<Website[]>(existingSites);
  const [selectedSiteForVersion, setSelectedSiteForVersion] = useState<Website | null>(null);
  const [selectedSiteForDemo, setSelectedSiteForDemo] = useState<Website | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<Website | null>(null);

  // Keep admin products synced if existingSites changes
  useEffect(() => {
    setAdminProducts(existingSites);
  }, [existingSites]);

  const handleUpdateProductList = (updated: Website[]) => {
    setAdminProducts(updated);
    if (onUpdateWebsites) {
      onUpdateWebsites(updated);
    }
  };

  // Form State for New Product
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('ecommerce');
  const [standardPrice, setStandardPrice] = useState('189');
  const [promoPrice, setPromoPrice] = useState('149');
  const [extendedPrice, setExtendedPrice] = useState('499');
  const [installationPrice, setInstallationPrice] = useState('699');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [techStack, setTechStack] = useState('React 19, Tailwind CSS, TypeScript, Vite');
  const [keywords, setKeywords] = useState('');
  const [versionNumber, setVersionNumber] = useState('1.0.0');
  const [status, setStatus] = useState<'published' | 'draft' | 'hidden'>('published');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isSubmittingZip, setIsSubmittingZip] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');

  // AI Copy Generation
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState('');

  // Orders State
  const [orders, setOrders] = useState<any[]>([
    {
      id: 'ORD-982104',
      customerEmail: 'rodrigo.silva@empresa.com.br',
      customerName: 'Rodrigo Silva',
      websiteTitle: 'NovaStore Pro E-Commerce',
      amount: 189.00,
      paymentMethod: 'PIX Instantâneo',
      status: 'paid',
      date: '20/08/2026 14:32',
      licenseKey: 'LICENSE-NOVA-89A1-X920-B831'
    },
    {
      id: 'ORD-982103',
      customerEmail: 'marcos.barbearia@gmail.com',
      customerName: 'Marcos Vinicius',
      websiteTitle: 'BarberKing Studio',
      amount: 149.00,
      paymentMethod: 'Cartão de Crédito (3x)',
      status: 'paid',
      date: '20/08/2026 11:20',
      licenseKey: 'LICENSE-BARB-71F2-Q812-P901'
    },
    {
      id: 'ORD-982102',
      customerEmail: 'contato@bistroroyal.com.br',
      customerName: 'Camila Alencar',
      websiteTitle: 'Bistrô Gourmet & Delivery',
      amount: 169.00,
      paymentMethod: 'PIX Instantâneo',
      status: 'paid',
      date: '19/08/2026 18:45',
      licenseKey: 'LICENSE-BIST-44K1-Z109-M732'
    },
    {
      id: 'ORD-982101',
      customerEmail: 'hotel.villareal@outlook.com',
      customerName: 'Fernando Diniz',
      websiteTitle: 'Grand Hotel & Resort',
      amount: 229.00,
      paymentMethod: 'PayPal',
      status: 'paid',
      date: '19/08/2026 09:12',
      licenseKey: 'LICENSE-HOTL-99P3-W415-K221'
    },
  ]);

  // Licenses State
  const [licenses, setLicenses] = useState<any[]>([
    { key: 'LICENSE-NOVA-89A1-X920-B831', productTitle: 'NovaStore Pro E-Commerce', clientEmail: 'rodrigo.silva@empresa.com.br', type: 'Standard (1 Projeto)', status: 'active', date: '20/08/2026' },
    { key: 'LICENSE-BARB-71F2-Q812-P901', productTitle: 'BarberKing Studio', clientEmail: 'marcos.barbearia@gmail.com', type: 'Standard (1 Projeto)', status: 'active', date: '20/08/2026' },
    { key: 'LICENSE-BIST-44K1-Z109-M732', productTitle: 'Bistrô Gourmet & Delivery', clientEmail: 'contato@bistroroyal.com.br', type: 'Estendida (Ilimitada)', status: 'active', date: '19/08/2026' },
    { key: 'LICENSE-HOTL-99P3-W415-K221', productTitle: 'Grand Hotel & Resort', clientEmail: 'hotel.villareal@outlook.com', type: 'Com Instalação', status: 'active', date: '19/08/2026' },
  ]);

  // Subscriptions State
  const [subscriptions, setSubscriptions] = useState<any[]>([
    { id: 'SUB-101', clientName: 'Rodrigo Silva', clientEmail: 'rodrigo.silva@empresa.com.br', plan: 'Hospedagem Cloud Turbo + Manutenção VIP', price: 39.00, status: 'active', nextBilling: '20/09/2026' },
    { id: 'SUB-102', clientName: 'Marcos Vinicius', clientEmail: 'marcos.barbearia@gmail.com', plan: 'Hospedagem Cloud Turbo', price: 29.00, status: 'active', nextBilling: '20/09/2026' },
  ]);

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState<any[]>([
    { id: 'TCK-40192', clientEmail: 'cliente@exemplo.com.br', subject: 'Dúvida sobre configuração do domínio', status: 'open', date: '20/08/2026 10:15' },
    { id: 'TCK-40188', clientEmail: 'fernando@resort.com', subject: 'Como atualizar a logo do template', status: 'resolved', date: '19/08/2026 15:30' },
  ]);

  // Automation Logs
  const [automationLogs, setAutomationLogs] = useState<any[]>([
    { id: 'LOG-1', event: 'Novo Pedido Aprovado (PIX)', details: 'Licença gerada e e-mail de acesso disparado para rodrigo.silva@empresa.com.br', timestamp: '20/08/2026 14:32:05' },
    { id: 'LOG-2', event: 'Deploy Automático Concluído', details: 'Projeto novastore-pro publicado com sucesso na CDN edge', timestamp: '20/08/2026 14:33:10' },
    { id: 'LOG-3', event: 'Validação de Domínio DNS', details: 'Certificado SSL Let\'s Encrypt emitido para meunegocio.com.br', timestamp: '20/08/2026 14:35:22' },
    { id: 'LOG-4', event: 'Backup Noturno Cloud', details: 'Backup de 12 templates e repositórios concluído com integridade 100%', timestamp: '20/08/2026 03:00:00' },
  ]);

  // AI Copy Generation
  const handleGenerateAiCopy = async () => {
    if (!title.trim()) {
      alert('Digite pelo menos o título do site para a IA gerar o texto.');
      return;
    }

    setIsAiGenerating(true);
    setAiSuccessMessage('');

    try {
      const res = await fetch('/api/ai/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          keywords,
        }),
      });

      const data = await res.json();

      if (data.shortDescription) {
        setShortDescription(data.shortDescription);
      }
      if (data.fullDescription) {
        setFullDescription(data.fullDescription);
      }
      if (data.features && Array.isArray(data.features)) {
        setFeatures(data.features.join('\n'));
      }
      if (data.techStack && Array.isArray(data.techStack)) {
        setTechStack(data.techStack.join(', '));
      }

      setAiSuccessMessage('Copywriting e especificações gerados com sucesso pelo Gemini!');
    } catch (err: any) {
      console.error('Erro na IA:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Submit New Site
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newSite: Website = {
      id: `site-${Date.now()}`,
      slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      title,
      category: category as any,
      categoryName: category.charAt(0).toUpperCase() + category.slice(1),
      price: {
        standard: parseFloat(standardPrice) || 189,
        promoPrice: promoPrice ? parseFloat(promoPrice) : undefined,
        extended: parseFloat(extendedPrice) || 499,
        installation: parseFloat(installationPrice) || 699,
      },
      rating: 5.0,
      reviewsCount: 0,
      salesCount: 0,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      galleryImages: [thumbnail],
      demoUrl: '#',
      shortDescription: shortDescription || 'Site profissional com código limpo e alta velocidade.',
      fullDescription: fullDescription || 'Template completo para o seu negócio.',
      features: features ? features.split('\n').filter(Boolean) : ['Design Responsivo', 'SEO Otimizado', 'Código Limpo'],
      techStack: techStack ? techStack.split(',').map(s => s.trim()) : ['React', 'Tailwind CSS'],
      includedFiles: ['src/*', 'package.json', 'README.md', 'tailwind.config.js'],
      seller: {
        id: 'admin',
        name: 'WebMarket Staff',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        badge: 'Oficial',
        verified: true,
        salesCount: 1,
        rating: 5.0,
        responseTime: '< 1 hora',
      },
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      reviews: [],
      currentVersion: versionNumber || '1.0.0',
      status: status === 'hidden' ? 'hidden' : 'active',
      storageStatus: {
        hasPrivateZip: true,
        hasPublicDemo: true,
        currentVersion: versionNumber || '1.0.0',
        uploadedAt: new Date().toISOString(),
      },
    };

    onAddNewListing(newSite);
    setAdminProducts(prev => [newSite, ...prev]);
    setSubmitSuccess('Site cadastrado com sucesso no catálogo!');
    setTimeout(() => {
      setSubmitSuccess('');
      setActiveTab('catalog');
    }, 1500);
  };

  // Toggle Visibility
  const handleToggleHideSite = (siteId: string) => {
    setAdminProducts(prev => prev.map(s => {
      if (s.id === siteId) {
        const nextStatus = s.status === 'published' ? 'hidden' : 'published';
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  // Delete Site
  const handleDeleteSite = (siteId: string) => {
    if (confirm('Tem certeza que deseja excluir este site do catálogo?')) {
      setAdminProducts(prev => prev.filter(s => s.id !== siteId));
    }
  };

  // Refund Action
  const handleRefundOrder = (orderId: string) => {
    if (confirm(`Deseja estornar o pedido ${orderId}? A chave de licença associada será revogada automaticamente.`)) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'refunded' } : o));
    }
  };

  // Revoke License
  const handleRevokeLicense = (key: string) => {
    if (confirm(`Revogar a licença ${key}?`)) {
      setLicenses(prev => prev.map(l => l.key === key ? { ...l, status: 'revoked' } : l));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-xl shadow-lg">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">Painel do Administrador Master</h2>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                Online & Automatizado
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Controle global de catálogo, receita, licenças, pedidos e suporte
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('create')}
          className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Cadastrar Novo Site</span>
        </button>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex bg-white border border-slate-200 rounded-2xl p-1.5 gap-1 shadow-xs overflow-x-auto">
        {[
          { id: 'templates', label: `Templates (${adminProducts.length})`, icon: Sparkles, badge: 'Gemini IA' },
          { id: 'metrics', label: 'Visão Geral & Métricas', icon: TrendingUp },
          { id: 'catalog', label: `Catálogo de Sites (${adminProducts.length})`, icon: Layers },
          { id: 'create', label: 'Adicionar Site', icon: PlusCircle },
          { id: 'orders', label: `Pedidos & Vendas (${orders.length})`, icon: ShoppingCart },
          { id: 'licenses', label: `Licenças (${licenses.length})`, icon: Key },
          { id: 'subscriptions', label: `Assinaturas (${subscriptions.length})`, icon: Server },
          { id: 'support', label: `Suporte (${supportTickets.length})`, icon: MessageSquare },
          { id: 'automations', label: 'Logs de Automação', icon: Activity },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${tab.id === 'templates' && activeTab !== tab.id ? 'text-purple-600' : ''}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                  activeTab === tab.id ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 0: TEMPLATES & GEMINI AI MANAGEMENT */}
      {activeTab === 'templates' && (
        <AdminTemplatesManager
          websites={adminProducts}
          onUpdateWebsites={handleUpdateProductList}
          onPreviewTemplate={(tpl) => {
            if (onOpenLiveDemo) {
              onOpenLiveDemo(tpl);
            } else {
              setPreviewingTemplate(tpl);
            }
          }}
          onCreateNewTemplate={() => setActiveTab('create')}
        />
      )}

      {/* TAB 1: METRICS & REVENUE */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Receita Total</span>
              <p className="text-2xl font-black text-slate-900">R$ 18.490,00</p>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +24% em relação ao mês anterior
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total de Vendas</span>
              <p className="text-2xl font-black text-slate-900">94 sites</p>
              <span className="text-[10px] text-blue-600 font-bold">100% entregas automatizadas</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ticket Médio</span>
              <p className="text-2xl font-black text-slate-900">R$ 196,70</p>
              <span className="text-[10px] text-purple-600 font-bold">Incluindo serviços adicionais</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assinaturas Recorrentes</span>
              <p className="text-2xl font-black text-emerald-600">R$ 1.840,00<span className="text-xs font-bold text-slate-400">/mês</span></p>
              <span className="text-[10px] text-slate-500">48 clientes ativos em hospedagem</span>
            </div>
          </div>

          {/* Top selling templates & Recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900">Templates Mais Vendidos</h3>
              <div className="space-y-3">
                {adminProducts.slice(0, 4).map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-black flex items-center justify-center">
                        #{i + 1}
                      </span>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">{p.title}</h5>
                        <span className="text-[10px] text-slate-500">{p.salesCount || 18} vendas realizadas</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900">R$ {p.price.standard}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900">Últimas Transações Aprovadas</h3>
              <div className="space-y-3">
                {orders.slice(0, 4).map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{o.customerName}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 rounded">Pago</span>
                      </div>
                      <p className="text-[10px] text-slate-500">{o.websiteTitle} • {o.date}</p>
                    </div>
                    <span className="text-xs font-black text-emerald-600">R$ {o.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATALOG MANAGEMENT */}
      {activeTab === 'catalog' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Catálogo de Sites Cadastrados</h3>
              <p className="text-xs text-slate-500">Gerencie preços, versões, status de publicação e downloads</p>
            </div>

            <button
              onClick={() => setActiveTab('create')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Adicionar Novo Template</span>
            </button>
          </div>

          <div className="space-y-3">
            {adminProducts.map((p) => (
              <div
                key={p.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={p.thumbnail}
                    alt={p.title}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900">{p.title}</h4>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        p.status === 'hidden'
                          ? 'bg-amber-100 text-amber-800'
                          : p.status === 'draft'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.status === 'hidden' ? 'Oculto' : p.status === 'draft' ? 'Rascunho' : 'Publicado'}
                      </span>
                      <span className="text-[10px] text-slate-400">v{p.currentVersion || '1.0.0'}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{p.shortDescription}</p>

                    <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                      <span className="font-bold text-slate-900">Standard: R$ {p.price.standard}</span>
                      {p.price.promoPrice && (
                        <span className="text-emerald-600 font-bold">Promo: R$ {p.price.promoPrice}</span>
                      )}
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-500">{p.salesCount || 0} vendas</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => setSelectedSiteForVersion(p)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1"
                    title="Upload de Nova Versão ZIP"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Versões</span>
                  </button>

                  <button
                    onClick={() => handleToggleHideSite(p.id)}
                    className="p-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl transition"
                    title={p.status === 'published' ? 'Ocultar da Loja' : 'Publicar na Loja'}
                  >
                    {p.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => handleDeleteSite(p.id)}
                    className="p-2 bg-white border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition"
                    title="Excluir Template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CREATE NEW SITE */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateProduct} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Cadastrar Novo Site no Catálogo</h3>
              <p className="text-xs text-slate-500">Defina informações, faça upload do código ZIP e gere copy com Gemini IA</p>
            </div>

            <button
              type="button"
              disabled={isAiGenerating}
              onClick={handleGenerateAiCopy}
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              {isAiGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Gerando Copy com Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Gerar Descrições & Features com IA</span>
                </>
              )}
            </button>
          </div>

          {aiSuccessMessage && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-purple-900 font-bold text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              <span>{aiSuccessMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-[11px] font-bold text-slate-700">Título do Template</label>
              <input
                type="text"
                placeholder="Ex: BarberKing Pro — Barbearia & Agendamento"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-bold"
              >
                <option value="ecommerce">Loja Virtual (E-Commerce)</option>
                <option value="barbearia">Barbearia / Salão</option>
                <option value="restaurante">Restaurante / Delivery</option>
                <option value="hotel">Hotel / Pousada</option>
                <option value="agencia">Agência / Marketing</option>
                <option value="portfolio">Portfólio / Criativo</option>
                <option value="fotografia">Fotografia / Estúdio</option>
                <option value="escola">Escola / Cursos</option>
                <option value="igreja">Igreja / Comunidade</option>
                <option value="blog">Blog / Notícias</option>
                <option value="landing">Landing Page</option>
                <option value="saas">SaaS / App Web</option>
              </select>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="text-[10px] font-bold text-slate-700">Preço Standard (R$)</label>
              <input
                type="number"
                value={standardPrice}
                onChange={(e) => setStandardPrice(e.target.value)}
                className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-emerald-700">Preço Promocional (R$)</label>
              <input
                type="number"
                value={promoPrice}
                onChange={(e) => setPromoPrice(e.target.value)}
                placeholder="Opcional"
                className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-700"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-700">Licença Estendida (R$)</label>
              <input
                type="number"
                value={extendedPrice}
                onChange={(e) => setExtendedPrice(e.target.value)}
                className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-700">Com Instalação (R$)</label>
              <input
                type="number"
                value={installationPrice}
                onChange={(e) => setInstallationPrice(e.target.value)}
                className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700">Descrição Curta (Card do Produto)</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Uma frase chamativa de impacto"
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Descrição Completa</label>
              <textarea
                rows={3}
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                placeholder="Detalhes completos sobre o template"
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Funcionalidades (1 por linha)</label>
              <textarea
                rows={3}
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="Agendamento pelo WhatsApp&#10;Painel Administrativo&#10;Design Responsivo"
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Upload & Version */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700">Versão Inicial</label>
              <input
                type="text"
                value={versionNumber}
                onChange={(e) => setVersionNumber(e.target.value)}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
              >
                <option value="published">Publicado Imediatamente</option>
                <option value="draft">Salvar como Rascunho</option>
                <option value="hidden">Oculto</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">URL da Imagem / Screenshot</label>
              <input
                type="text"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          {submitSuccess && (
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> {submitSuccess}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Publicar Site no Catálogo</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-slate-900">Histórico Completo de Vendas & Pedidos</h3>
            <span className="text-xs font-bold text-slate-500">{orders.length} pedidos registrados</span>
          </div>

          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-900">{o.id}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                      o.status === 'refunded' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {o.status === 'refunded' ? 'Estornado' : 'Pago & Entregue'}
                    </span>
                    <span className="text-[10px] text-slate-400">{o.date}</span>
                  </div>

                  <p className="text-xs font-bold text-slate-900 mt-1">{o.websiteTitle} • R$ {o.amount.toFixed(2)} ({o.paymentMethod})</p>
                  <p className="text-[10px] text-slate-500">Cliente: {o.customerName} ({o.customerEmail}) • Licença: <code>{o.licenseKey}</code></p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => alert(`E-mail de acesso e link de download reenviados com sucesso para ${o.customerEmail}!`)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition"
                  >
                    Reenviar Acesso
                  </button>

                  {o.status !== 'refunded' && (
                    <button
                      onClick={() => handleRefundOrder(o.id)}
                      className="px-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl transition"
                    >
                      Estornar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: LICENSES */}
      {activeTab === 'licenses' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-slate-900">Gerenciamento de Licenças Emitidas</h3>
            <span className="text-xs font-bold text-slate-500">{licenses.length} licenças ativas</span>
          </div>

          <div className="space-y-3">
            {licenses.map((lic, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700">{lic.key}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                      lic.status === 'revoked' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {lic.status === 'revoked' ? 'Revogada' : 'Ativa'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-1">{lic.productTitle} • {lic.type}</p>
                  <p className="text-[10px] text-slate-500">Comprador: {lic.clientEmail} • Emitida em {lic.date}</p>
                </div>

                {lic.status !== 'revoked' && (
                  <button
                    onClick={() => handleRevokeLicense(lic.key)}
                    className="px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition self-end sm:self-center"
                  >
                    Revogar Licença
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: RECURRING SUBSCRIPTIONS */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-slate-900">Assinaturas Recorrentes & Hospedagem</h3>
            <span className="text-xs font-bold text-slate-500">{subscriptions.length} planos ativos</span>
          </div>

          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">{sub.clientName}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full">Ativo</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{sub.plan} • R$ {sub.price.toFixed(2)}/mês</p>
                  <p className="text-[10px] text-slate-400">Próxima fatura automática: {sub.nextBilling}</p>
                </div>

                <span className="text-sm font-black text-emerald-600">R$ {sub.price.toFixed(2)}/mês</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: SUPPORT TICKETS */}
      {activeTab === 'support' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-slate-900">Central de Atendimento ao Cliente</h3>
            <span className="text-xs font-bold text-slate-500">{supportTickets.length} chamados</span>
          </div>

          <div className="space-y-3">
            {supportTickets.map((t) => (
              <div key={t.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{t.id} • {t.subject}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                      t.status === 'open' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {t.status === 'open' ? 'Aberto' : 'Resolvido'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Cliente: {t.clientEmail} • {t.date}</p>
                </div>

                <button
                  onClick={() => alert(`Abrindo conversa do chamado ${t.id}`)}
                  className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-500 transition"
                >
                  Responder
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: AUTOMATION LOGS */}
      {activeTab === 'automations' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-black text-slate-900">Histórico de Eventos & Automações do Sistema</h3>
          <div className="space-y-2 font-mono text-xs">
            {automationLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-900 text-slate-100 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-emerald-400 font-bold">[{log.timestamp}]</span>{' '}
                  <span className="text-blue-300 font-bold">{log.event}:</span>{' '}
                  <span className="text-slate-300">{log.details}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for ZIP versioning */}
      {selectedSiteForVersion && (
        <UploadVersionModal
          isOpen={true}
          website={selectedSiteForVersion}
          onClose={() => setSelectedSiteForVersion(null)}
          onSuccess={() => {
            setSelectedSiteForVersion(null);
          }}
        />
      )}

      {/* Modal for Demo Deploy */}
      {selectedSiteForDemo && (
        <DemoDeployModal
          isOpen={true}
          website={selectedSiteForDemo}
          onClose={() => setSelectedSiteForDemo(null)}
        />
      )}

      {/* Modal for Live Preview */}
      {previewingTemplate && (
        <LivePreviewModal
          website={previewingTemplate}
          onClose={() => setPreviewingTemplate(null)}
          onAddToCart={() => {}}
        />
      )}

    </div>
  );
};
