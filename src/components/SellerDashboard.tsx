import React, { useState, useEffect } from 'react';
import { Website, SellerMetrics } from '../types';
import { DollarSign, ShoppingCart, Eye, TrendingUp, PlusCircle, Sparkles, CheckCircle2, FileCode, Upload, FileCheck, ExternalLink, RefreshCw, Trash2, Edit3, EyeOff, ShieldCheck, Play } from 'lucide-react';
import { UploadVersionModal } from './UploadVersionModal';
import { DemoDeployModal } from './DemoDeployModal';

interface SellerDashboardProps {
  onAddNewListing: (website: Website) => void;
  existingSites: Website[];
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  onAddNewListing,
  existingSites,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'create' | 'manage'>('manage');

  // Admin products state fetched from server
  const [adminProducts, setAdminProducts] = useState<Website[]>(existingSites);
  const [selectedSiteForVersion, setSelectedSiteForVersion] = useState<Website | null>(null);
  const [selectedSiteForDemo, setSelectedSiteForDemo] = useState<Website | null>(null);

  // AI Copy Generation State
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('ecommerce');
  const [standardPrice, setStandardPrice] = useState('189');
  const [extendedPrice, setExtendedPrice] = useState('499');
  const [installationPrice, setInstallationPrice] = useState('699');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [techStack, setTechStack] = useState('React 19, Tailwind CSS, TypeScript');
  const [keywords, setKeywords] = useState('');
  const [versionNumber, setVersionNumber] = useState('1.0.0');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isSubmittingZip, setIsSubmittingZip] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Firebase Storage Status State
  const [storageStatus, setStorageStatus] = useState<{
    status: string;
    bucketName: string;
    privateBucketPath: string;
    publicBucketPath: string;
    totalProductsInStorage: number;
    activeZipCount: number;
  }>({
    status: 'connected',
    bucketName: 'boreal-protocol-rxctm.firebasestorage.app',
    privateBucketPath: 'gs://boreal-protocol-rxctm.firebasestorage.app/private_zips/',
    publicBucketPath: 'gs://boreal-protocol-rxctm.firebasestorage.app/public_demos/',
    totalProductsInStorage: 0,
    activeZipCount: 0
  });

  // Fetch admin products & Firebase Storage status from backend
  const fetchAdminProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          setAdminProducts(data.products);
        }
      }

      const storageRes = await fetch('/api/firebase/storage-status');
      if (storageRes.ok) {
        const sData = await storageRes.json();
        setStorageStatus(sData);
      }
    } catch (e) {
      console.error('Erro ao buscar produtos e status do Firebase Storage:', e);
    }
  };

  useEffect(() => {
    fetchAdminProducts();
  }, []);

  // Metrics calculation
  const metrics: SellerMetrics = {
    totalEarnings: 18490.00,
    totalSales: 94,
    activeListings: adminProducts.length,
    conversionRate: 5.2,
    monthlyRevenue: [
      { month: 'Mar', amount: 1800 },
      { month: 'Abr', amount: 2600 },
      { month: 'Mai', amount: 3400 },
      { month: 'Jun', amount: 4800 },
      { month: 'Jul', amount: 5890 },
    ],
  };

  // Generate copy via Gemini API
  const handleGenerateAiCopy = async () => {
    if (!title.trim()) {
      alert('Por favor, informe pelo menos o Título do site antes de gerar com IA.');
      return;
    }

    setIsAiGenerating(true);
    setAiSuccessMessage('');

    try {
      const res = await fetch('/api/ai/describe-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          keywords,
        }),
      });

      const data = await res.json();

      if (data.shortDescription) setShortDescription(data.shortDescription);
      if (data.fullDescription) setFullDescription(data.fullDescription);
      if (data.features && Array.isArray(data.features)) setFeatures(data.features.join('\n'));
      if (data.techStack && Array.isArray(data.techStack)) setTechStack(data.techStack.join(', '));

      setAiSuccessMessage('Descrição e recursos gerados com sucesso pela IA Gemini!');
    } catch (err) {
      console.error('Erro ao chamar IA Gemini:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Submit Product + ZIP upload to backend
  const handleUploadNewSite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('O título do site é obrigatório.');
      return;
    }

    if (!zipFile) {
      alert('Por favor, faça o upload do arquivo .ZIP contendo o projeto do site.');
      return;
    }

    setIsSubmittingZip(true);
    setSubmitSuccess('');

    try {
      const formData = new FormData();
      formData.append('zipFile', zipFile);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('priceStandard', standardPrice);
      formData.append('priceExtended', extendedPrice);
      formData.append('priceInstallation', installationPrice);
      formData.append('thumbnail', thumbnail);
      formData.append('shortDescription', shortDescription || 'Website profissional de alta conversão.');
      formData.append('fullDescription', fullDescription || shortDescription);
      formData.append('version', versionNumber || '1.0.0');
      formData.append('features', JSON.stringify(features.split('\n').filter(Boolean)));
      formData.append('techStack', JSON.stringify(techStack.split(',').map(s => s.trim()).filter(Boolean)));

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success && data.product) {
        setSubmitSuccess('Site, versão e demonstração pública cadastrados com sucesso!');
        onAddNewListing(data.product);
        await fetchAdminProducts();
        setTimeout(() => {
          setActiveTab('manage');
        }, 1500);
      } else {
        alert(data.error || 'Erro ao cadastrar o site.');
      }
    } catch (err: any) {
      alert('Erro de envio: ' + err.message);
    } finally {
      setIsSubmittingZip(false);
    }
  };

  // Toggle Status (Active / Hidden)
  const handleToggleStatus = async (site: Website) => {
    const newStatus = site.status === 'hidden' ? 'active' : 'hidden';
    try {
      const res = await fetch(`/api/admin/products/${site.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchAdminProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja eliminar este produto? Os arquivos de demonstração e ZIP serão removidos.')) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAdminProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-900">
      
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Painel do Administrador</h1>
          <p className="text-xs text-slate-500 font-medium">
            Gerencie o catálogo de sites, faça upload de ficheiros .ZIP, publique demonstrações e acompanhe versões.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'manage'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gerenciar Anúncios ({adminProducts.length})
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Adicionar Novo Site</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'metrics'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Métricas de Vendas
          </button>
        </div>
      </div>

      {/* TAB 1: Admin Manage Products Table */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          
          {/* Firebase Storage Status Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 border border-blue-800 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Firebase Storage Ativo
                  </span>
                  <span className="text-slate-300 text-xs font-mono">
                    {storageStatus.bucketName}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white">Armazenamento em Nuvem Seguro de Ficheiros .ZIP</h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Os ficheiros dos sites estão segregados no Firebase Storage com políticas de acesso isoladas:
                  arquivos fonte privados para compradores de licenças e demonstrações públicas em CDN para clientes em potencial.
                </p>
              </div>

              {/* Bucket details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-300 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Bucket Privado (Venda)</span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-mono">path: /private_zips/&#123;id&#125;/</p>
                  <p className="text-[10px] text-emerald-400 font-semibold">Acesso via Token Temporário</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                    <Eye className="w-4 h-4 text-purple-400" />
                    <span>Bucket Público (Demo)</span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-mono">path: /public_demos/&#123;id&#125;/</p>
                  <p className="text-[10px] text-purple-300 font-semibold">CDN de Demonstração Live</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
              <div>
                <h3 className="text-base font-black text-slate-900">Catálogo de Sites Cadastrados</h3>
                <p className="text-xs text-slate-500 font-medium">Visualização completa das versões, demonstrações ao vivo e estado de publicação.</p>
              </div>

              <button
                onClick={() => setActiveTab('create')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-2 self-start"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Adicionar Novo Site</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-600 uppercase tracking-wider text-[10px] font-black border-b border-slate-200">
                  <tr>
                    <th className="p-4">Produto</th>
                    <th className="p-4">Versão</th>
                    <th className="p-4">Demonstração</th>
                    <th className="p-4">Preço Padrão</th>
                    <th className="p-4">Vendas</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {adminProducts.map((site) => (
                    <tr key={site.id} className="hover:bg-slate-50 transition">
                      
                      {/* Produto */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={site.thumbnail}
                            alt={site.title}
                            className="w-12 h-9 rounded-xl object-cover border border-slate-200 shadow-xs"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-xs truncate max-w-xs">{site.title}</p>
                            <p className="text-[10px] text-slate-500 font-semibold">{site.categoryName || site.category}</p>
                          </div>
                        </div>
                      </td>

                      {/* Versão */}
                      <td className="p-4">
                        <span className="font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                          v{site.currentVersion || '1.0.0'}
                        </span>
                      </td>

                      {/* Demo */}
                      <td className="p-4">
                        {site.demoUrl ? (
                          <a
                            href={site.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg transition"
                          >
                            <span>Ativa</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg font-bold">
                            Pendente
                          </span>
                        )}
                      </td>

                      {/* Preço */}
                      <td className="p-4 text-slate-900 font-black">
                        R$ {site.price?.standard || 149}
                      </td>

                      {/* Vendas */}
                      <td className="p-4 text-slate-600 font-bold">
                        {site.salesCount || 0} vendas
                      </td>

                      {/* Estado */}
                      <td className="p-4">
                        {site.status === 'hidden' ? (
                          <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
                            Oculto
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
                            Ativo na Vitrine
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Publicar/Atualizar Demonstração */}
                          <button
                            onClick={() => setSelectedSiteForDemo(site)}
                            title="Publicar ou Atualizar Demonstração"
                            className="p-1.5 text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition font-bold flex items-center gap-1 text-[11px]"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">Publicar Demo</span>
                          </button>

                          {/* Upload Nova Versão */}
                          <button
                            onClick={() => setSelectedSiteForVersion(site)}
                            title="Adicionar Nova Versão (.ZIP)"
                            className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition font-bold flex items-center gap-1 text-[11px]"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">Nova Versão</span>
                          </button>

                          {/* Ocultar/Exibir */}
                          <button
                            onClick={() => handleToggleStatus(site)}
                            title={site.status === 'hidden' ? 'Exibir na Vitrine' : 'Ocultar da Vitrine'}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                          >
                            {site.status === 'hidden' ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                          </button>

                          {/* Eliminar */}
                          <button
                            onClick={() => handleDeleteProduct(site.id)}
                            title="Eliminar Site"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Upload New Site & Processing ZIP */}
      {activeTab === 'create' && (
        <form onSubmit={handleUploadNewSite} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md max-w-3xl mx-auto space-y-6">
          
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-xl font-black text-slate-900">Adicionar Novo Site no Catálogo</h3>
            <p className="text-xs text-slate-500 font-medium">
              Faça o upload do arquivo .ZIP completo do projeto. O servidor irá validar a estrutura e criar a versão de demonstração.
            </p>
          </div>

          {/* AI Copy Generator Header Banner */}
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Gerador de Copy e Descrição com IA Gemini</p>
                <p className="text-[11px] text-purple-800 font-medium">Informe o título e clique no botão para a IA criar todo o texto de vendas!</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateAiCopy}
              disabled={isAiGenerating}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs shrink-0 flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAiGenerating ? 'IA Gerando...' : 'Gerar Texto com IA'}</span>
            </button>
          </div>

          {aiSuccessMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{aiSuccessMessage}</span>
            </div>
          )}

          {/* Upload .ZIP Dropzone */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Upload do Ficheiro .ZIP do Site *</label>
            <div className="border-2 border-dashed border-blue-300 hover:border-blue-600 bg-blue-50/50 rounded-2xl p-6 text-center cursor-pointer transition">
              <input
                type="file"
                accept=".zip"
                required
                onChange={(e) => e.target.files?.[0] && setZipFile(e.target.files[0])}
                className="hidden"
                id="main-zip-upload"
              />
              <label htmlFor="main-zip-upload" className="cursor-pointer block space-y-2">
                <div className="w-12 h-12 mx-auto bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                {zipFile ? (
                  <div>
                    <p className="text-sm font-black text-slate-900">{zipFile.name}</p>
                    <p className="text-xs text-blue-600 font-bold">{(zipFile.size / (1024 * 1024)).toFixed(2)} MB - Ficheiro .ZIP pronto para processamento</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-900">Clique para selecionar o arquivo .ZIP do código fonte completo</p>
                    <p className="text-[11px] text-slate-500">Validação automática de estrutura (React, Vite, Next.js, HTML)</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Title & Version */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Nome do Site / Produto *</label>
              <input
                type="text"
                required
                placeholder="Ex: AutoClinic Pro - Sistema para Oficinas"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Versão Inicial *</label>
              <input
                type="text"
                required
                value={versionNumber}
                onChange={(e) => setVersionNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Category & Cover Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Categoria *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="ecommerce">Loja Virtual & E-Commerce</option>
                <option value="saas">SaaS & Software</option>
                <option value="medical">Saúde & Medicina</option>
                <option value="realestate">Imobiliária & Corretores</option>
                <option value="restaurant">Restaurantes & Delivery</option>
                <option value="portfolio">Portfólio & Criativos</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">URL da Imagem de Capa (Thumbnail)</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Pricing Grid */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Preço das Licenças (R$) *</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[11px] text-slate-500 block mb-1 font-medium">Licença Padrão</span>
                <input
                  type="number"
                  value={standardPrice}
                  onChange={(e) => setStandardPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1 font-medium">Licença Agência</span>
                <input
                  type="number"
                  value={extendedPrice}
                  onChange={(e) => setExtendedPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1 font-medium">Com Instalação</span>
                <input
                  type="number"
                  value={installationPrice}
                  onChange={(e) => setInstallationPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Descrição Curta (Vitrine)</label>
            <input
              type="text"
              placeholder="Frase chamativa para o card do produto"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Descrição Detalhada e Informações do Site</label>
            <textarea
              rows={3}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Features */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Funcionalidades do Site (1 por linha)</label>
            <textarea
              rows={3}
              placeholder="Design 100% Responsivo&#10;Integração nativa com PIX e Cartão&#10;Painel Admin de Produtos"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Tech Stack */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Tecnologias Utilizadas (separadas por vírgula)</label>
            <input
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          {submitSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{submitSuccess}</span>
            </div>
          )}

          {/* Submit CTA Button */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmittingZip}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-3.5 rounded-2xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isSubmittingZip ? 'Processando Ficheiro e Criando Demonstração...' : 'Upload do Site e Publicar'}</span>
            </button>
          </div>

        </form>
      )}

      {/* TAB 3: Metrics */}
      {activeTab === 'metrics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Receita Total</span>
              <p className="text-2xl font-black text-slate-900">R$ {metrics.totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +28% este mês
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Vendas Realizadas</span>
              <p className="text-2xl font-black text-slate-900">{metrics.totalSales} licenças</p>
              <p className="text-[11px] text-slate-500 font-medium">Entregas em .ZIP concluídas</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Conversão</span>
              <p className="text-2xl font-black text-slate-900">{metrics.conversionRate}%</p>
              <p className="text-[11px] text-blue-600 font-bold">Acima da média nacional</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Modelos no Ar</span>
              <p className="text-2xl font-black text-slate-900">{adminProducts.length} sites</p>
              <p className="text-[11px] text-slate-500 font-medium">Com demonstração ativa</p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <UploadVersionModal
        website={selectedSiteForVersion}
        onClose={() => setSelectedSiteForVersion(null)}
        onSuccess={fetchAdminProducts}
      />

      <DemoDeployModal
        website={selectedSiteForDemo}
        onClose={() => setSelectedSiteForDemo(null)}
        onSuccess={fetchAdminProducts}
      />

    </div>
  );
};
