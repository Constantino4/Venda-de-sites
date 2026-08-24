import React, { useState, useMemo } from 'react';
import { Website, CategoryType } from '../../types';
import { 
  Sparkles, 
  Search, 
  Filter, 
  Layers, 
  Eye, 
  Edit3, 
  Copy, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  Tag, 
  Calendar, 
  ShoppingBag, 
  ArrowUpDown, 
  Check, 
  MoreVertical,
  Wand2,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { CATEGORIES } from '../../data/mockSites';
import { GeminiTemplateEditorModal } from './GeminiTemplateEditorModal';
import { EditTemplateModal } from './EditTemplateModal';
import { AdminSeoAnalyzerModal } from './AdminSeoAnalyzerModal';
import { GeminiFileBridgeModal } from './GeminiFileBridgeModal';

interface AdminTemplatesManagerProps {
  websites: Website[];
  onUpdateWebsites: (websites: Website[]) => void;
  onPreviewTemplate: (website: Website) => void;
  onCreateNewTemplate: () => void;
}

export const AdminTemplatesManager: React.FC<AdminTemplatesManagerProps> = ({
  websites,
  onUpdateWebsites,
  onPreviewTemplate,
  onCreateNewTemplate,
}) => {
  // Filters and Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'sales' | 'price_desc' | 'price_asc' | 'name'>('updated');

  // Modals state
  const [geminiEditingTemplate, setGeminiEditingTemplate] = useState<Website | null>(null);
  const [metadataEditingTemplate, setMetadataEditingTemplate] = useState<Website | null>(null);
  const [seoModalOpen, setSeoModalOpen] = useState(false);
  const [seoSelectedTemplate, setSeoSelectedTemplate] = useState<Website | null>(null);
  const [fileBridgeOpen, setFileBridgeOpen] = useState(false);
  const [fileBridgeInitialPath, setFileBridgeInitialPath] = useState('src/site-b-ecommerce/components/NovaStoreHero.tsx');
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper to normalize template status
  const getTemplateStatus = (tpl: Website): 'published' | 'draft' | 'hidden' => {
    if (tpl.status === 'hidden') return 'hidden';
    if (tpl.status === 'draft') return 'draft';
    return 'published';
  };

  // Statistics calculation
  const stats = useMemo(() => {
    const total = websites.length;
    const published = websites.filter(w => getTemplateStatus(w) === 'published').length;
    const draft = websites.filter(w => getTemplateStatus(w) === 'draft').length;
    const hidden = websites.filter(w => getTemplateStatus(w) === 'hidden').length;

    // Best seller
    const sortedBySales = [...websites].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
    const topSeller = sortedBySales[0];

    // Recently updated
    const sortedByDate = [...websites].sort((a, b) => {
      const dateA = new Date(a.updatedDate || a.createdDate || '2026-01-01').getTime();
      const dateB = new Date(b.updatedDate || b.createdDate || '2026-01-01').getTime();
      return dateB - dateA;
    });
    const recentlyUpdated = sortedByDate[0];

    const totalRevenue = websites.reduce((acc, w) => acc + ((w.salesCount || 0) * w.price.standard), 0);

    return {
      total,
      published,
      draft,
      hidden,
      topSeller,
      recentlyUpdated,
      totalRevenue
    };
  }, [websites]);

  // Filtered and sorted templates
  const filteredTemplates = useMemo(() => {
    return websites.filter((tpl) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = tpl.title.toLowerCase().includes(query);
        const matchCat = tpl.categoryName.toLowerCase().includes(query);
        const matchDesc = (tpl.shortDescription || '').toLowerCase().includes(query);
        const matchPages = (tpl.pages || []).some(p => p.toLowerCase().includes(query));
        if (!matchTitle && !matchCat && !matchDesc && !matchPages) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && tpl.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all') {
        const tplStat = getTemplateStatus(tpl);
        if (tplStat !== selectedStatus) return false;
      }

      // Price range
      if (selectedPriceRange === 'under150' && tpl.price.standard > 150) return false;
      if (selectedPriceRange === '150to200' && (tpl.price.standard < 150 || tpl.price.standard > 200)) return false;
      if (selectedPriceRange === 'over200' && tpl.price.standard <= 200) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'sales') return (b.salesCount || 0) - (a.salesCount || 0);
      if (sortBy === 'price_desc') return b.price.standard - a.price.standard;
      if (sortBy === 'price_asc') return a.price.standard - b.price.standard;
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      // Default: updated date
      const dateA = new Date(a.updatedDate || a.createdDate || '2026-01-01').getTime();
      const dateB = new Date(b.updatedDate || b.createdDate || '2026-01-01').getTime();
      return dateB - dateA;
    });
  }, [websites, searchTerm, selectedCategory, selectedStatus, selectedPriceRange, sortBy]);

  // Actions
  const handleDuplicateTemplate = async (template: Website) => {
    try {
      const res = await fetch('/api/admin/templates/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          customTitle: `${template.title} (Cópia)`
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.template) {
          onUpdateWebsites([data.template, ...websites]);
          showNotification(`Template "${template.title}" duplicado com sucesso!`);
          return;
        }
      }

      // Fallback local duplication
      const newId = `tpl-copy-${Date.now()}`;
      const duplicated: Website = {
        ...template,
        id: newId,
        slug: `${template.slug}-copy-${Date.now().toString().slice(-4)}`,
        title: `${template.title} (Cópia)`,
        status: 'draft',
        salesCount: 0,
        reviewsCount: 0,
        rating: 5.0,
        createdDate: new Date().toISOString().split('T')[0],
        updatedDate: new Date().toISOString().split('T')[0],
      };
      onUpdateWebsites([duplicated, ...websites]);
      showNotification(`Template "${template.title}" duplicado com sucesso como Rascunho!`);
    } catch (e) {
      console.error(e);
      showNotification('Erro ao duplicar template.', 'info');
    }
  };

  const handleChangeStatus = (templateId: string, newStatus: 'published' | 'draft' | 'hidden') => {
    const updated = websites.map(w => {
      if (w.id === templateId) {
        return {
          ...w,
          status: newStatus,
          updatedDate: new Date().toISOString().split('T')[0]
        };
      }
      return w;
    });
    onUpdateWebsites(updated);
    showNotification(`Status do template atualizado para ${
      newStatus === 'published' ? '🟢 Publicado' : newStatus === 'draft' ? '🟡 Rascunho' : '🔴 Oculto'
    }!`);
  };

  const handleDeleteTemplate = (template: Website) => {
    if (window.confirm(`Tem certeza que deseja excluir o template "${template.title}"? Esta ação não afetará os sites já comprados pelos clientes.`)) {
      const updated = websites.filter(w => w.id !== template.id);
      onUpdateWebsites(updated);
      showNotification(`Template "${template.title}" removido com segurança.`);
    }
  };

  const handleSaveGeminiTemplate = (updatedTemplate: Website) => {
    const updatedList = websites.map(w => w.id === updatedTemplate.id ? updatedTemplate : w);
    onUpdateWebsites(updatedList);
    setGeminiEditingTemplate(updatedTemplate);
    showNotification(`Alterações do Gemini salvas no template "${updatedTemplate.title}"!`);
  };

  const handleSaveMetadata = (updatedTemplate: Website) => {
    const updatedList = websites.map(w => w.id === updatedTemplate.id ? updatedTemplate : w);
    onUpdateWebsites(updatedList);
    showNotification(`Metadados do template "${updatedTemplate.title}" atualizados com sucesso!`);
  };

  const handleApplySeoToWebsite = (websiteId: string, updatedFields: {
    title?: string;
    shortDescription?: string;
    fullDescription?: string;
    seoMeta?: any;
  }) => {
    const updatedList = websites.map(w => {
      if (w.id === websiteId) {
        return {
          ...w,
          ...(updatedFields.title ? { title: updatedFields.title } : {}),
          ...(updatedFields.shortDescription ? { shortDescription: updatedFields.shortDescription } : {}),
          ...(updatedFields.fullDescription ? { fullDescription: updatedFields.fullDescription } : {}),
          ...(updatedFields.seoMeta ? { seoMeta: updatedFields.seoMeta } : {}),
          updatedDate: new Date().toISOString().split('T')[0]
        };
      }
      return w;
    });
    onUpdateWebsites(updatedList);
    showNotification('Otimizações de SEO e metatags aplicadas com sucesso!');
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold shadow-lg transition-all animate-in slide-in-from-top duration-200 ${
          notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-white hover:opacity-80">
            ×
          </button>
        </div>
      )}

      {/* ================= SECTION 1: DASHBOARD STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Templates */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total de Templates</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.total}</h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-600">
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{stats.published} no ar</span>
            <span>•</span>
            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{stats.draft} rascunhos</span>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status do Catálogo</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-black text-emerald-600">🟢 {stats.published}</span>
                <span className="text-xs font-black text-amber-600">🟡 {stats.draft}</span>
                <span className="text-xs font-black text-red-600">🔴 {stats.hidden}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-500 font-medium">
            {((stats.published / (stats.total || 1)) * 100).toFixed(0)}% disponíveis para venda imediata
          </p>
        </div>

        {/* Best Seller */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="min-w-0 pr-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mais Vendido</p>
              <h3 className="text-sm font-black text-slate-900 mt-1 truncate">
                {stats.topSeller?.title.split('—')[0] || 'Barber Elite'}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-xs font-bold text-emerald-600 flex items-center gap-1">
            <span>{stats.topSeller?.salesCount || 0} licenças vendidas</span>
            <span className="text-slate-400 font-normal">({stats.topSeller?.categoryName})</span>
          </p>
        </div>

        {/* Recently Updated */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="min-w-0 pr-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Última Atualização</p>
              <h3 className="text-sm font-black text-slate-900 mt-1 truncate">
                {stats.recentlyUpdated?.title.split('—')[0] || 'Bistrô Gourmet'}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-600 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{stats.recentlyUpdated?.updatedDate || 'Recente'}</span>
          </p>
        </div>

      </div>

      {/* ================= SECTION 2: SEARCH & FILTERS BAR ================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        
        {/* Top Search & Actions Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por nome do template, nicho, páginas ou categoria..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Right Action: Create New Template & SEO Optimization & Gemini Bridge */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setFileBridgeInitialPath('src/site-b-ecommerce/components/NovaStoreHero.tsx');
                setFileBridgeOpen(true);
              }}
              className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 hover:from-purple-600 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-purple-600/25 transition flex items-center gap-2"
              title="Abrir a Ponte de Arquivos e Escrita Atômica do Gemini"
            >
              <Wand2 className="w-4 h-4 text-purple-200" />
              <span>Gemini File Bridge</span>
            </button>

            <button
              onClick={() => {
                setSeoSelectedTemplate(null);
                setSeoModalOpen(true);
              }}
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-indigo-500/25 transition flex items-center gap-2"
              title="Auditar e Otimizar SEO de todos os produtos com Gemini AI"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Otimizar SEO</span>
            </button>

            <button
              onClick={onCreateNewTemplate}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Template</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          
          {/* Category Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Categoria</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos os Status</option>
              <option value="published">🟢 Publicado</option>
              <option value="draft">🟡 Rascunho</option>
              <option value="hidden">🔴 Oculto</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Faixa de Preço</label>
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos os Preços</option>
              <option value="under150">Até R$ 150</option>
              <option value="150to200">R$ 150 a R$ 200</option>
              <option value="over200">Acima de R$ 200</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="updated">Mais Recentes</option>
              <option value="sales">Mais Vendidos</option>
              <option value="price_desc">Maior Preço</option>
              <option value="price_asc">Menor Preço</option>
              <option value="name">Nome (A-Z)</option>
            </select>
          </div>

        </div>

      </div>

      {/* ================= SECTION 3: TEMPLATES CARD GRID ================= */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <p className="text-xs font-bold text-slate-500">
            Exibindo <span className="text-slate-900 font-black">{filteredTemplates.length}</span> de <span className="text-slate-900 font-black">{websites.length}</span> templates cadastrados
          </p>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Nenhum template encontrado</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tente ajustar os filtros ou o termo de busca para visualizar os templates cadastrados.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSelectedPriceRange('all');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              Limpar Todos os Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredTemplates.map((template) => {
              const status = getTemplateStatus(template);
              const isPromo = template.price.promoPrice && template.price.promoPrice > 0;
              const displayPrice = isPromo ? template.price.promoPrice! : template.price.standard;

              return (
                <div
                  key={template.id}
                  className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition group flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail & Badges */}
                    <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                      <img
                        src={template.thumbnail}
                        alt={template.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      
                      {/* Top Overlay Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        {/* Status Badge */}
                        <div className="flex items-center gap-1">
                          {status === 'published' && (
                            <span className="bg-emerald-600/90 text-white backdrop-blur-md text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                              Publicado
                            </span>
                          )}
                          {status === 'draft' && (
                            <span className="bg-amber-500/90 text-white backdrop-blur-md text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-200" />
                              Rascunho
                            </span>
                          )}
                          {status === 'hidden' && (
                            <span className="bg-red-600/90 text-white backdrop-blur-md text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-200" />
                              Oculto
                            </span>
                          )}
                        </div>

                        {/* Page Count Badge */}
                        <span className="bg-slate-900/80 text-white backdrop-blur-md text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Layers className="w-3 h-3 text-blue-400" />
                          {template.pageCount || (template.pages ? template.pages.length : 6)} páginas
                        </span>
                      </div>

                      {/* Bottom Quick Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold">
                        <span className="bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-lg">
                          {template.categoryName}
                        </span>
                        <span className="bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3 text-emerald-400" />
                          {template.salesCount || 0} vendas
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-3">
                      
                      {/* Title & Description */}
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-snug line-clamp-1 group-hover:text-blue-600 transition">
                          {template.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {template.shortDescription}
                        </p>
                      </div>

                      {/* Pages preview tags */}
                      {template.pages && template.pages.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {template.pages.slice(0, 5).map((page, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                              {page}
                            </span>
                          ))}
                          {template.pages.length > 5 && (
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                              +{template.pages.length - 5}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price & Dates Grid */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Preço Comercial</p>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-base font-black text-slate-900">
                              R$ {displayPrice?.toFixed(2)}
                            </span>
                            {isPromo && (
                              <span className="text-xs text-slate-400 line-through font-semibold">
                                R$ {template.price.standard.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Atualizado em</p>
                          <p className="text-xs font-bold text-slate-600 mt-0.5">
                            {template.updatedDate || template.createdDate || '2026-08-18'}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Action Buttons Footer */}
                  <div className="p-4 bg-slate-50/80 border-t border-slate-100 space-y-2">
                    
                    {/* Primary Two Buttons: Gemini Editor & Live Demo */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setGeminiEditingTemplate(template)}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md shadow-purple-500/20 transition flex items-center justify-center gap-1.5"
                        title="Abrir Editor Visual com Gemini AI"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Editar c/ Gemini</span>
                      </button>

                      <button
                        onClick={() => onPreviewTemplate(template)}
                        className="w-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5"
                        title="Ver demonstração interativa do site"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Ver Demo</span>
                      </button>
                    </div>

                    {/* Secondary Actions: Edit Metadata, Duplicate, Status & Delete */}
                    <div className="flex items-center justify-between gap-1 pt-1">
                      
                      {/* SEO & Metatags Button */}
                      <button
                        onClick={() => {
                          setSeoSelectedTemplate(template);
                          setSeoModalOpen(true);
                        }}
                        className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                        title="Analisar e Otimizar SEO com Gemini"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">SEO</span>
                      </button>

                      {/* Edit Metadata */}
                      <button
                        onClick={() => setMetadataEditingTemplate(template)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                        title="Editar Informações e Preços"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Editar</span>
                      </button>

                      {/* Duplicate Template */}
                      <button
                        onClick={() => handleDuplicateTemplate(template)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                        title="Duplicar este Template"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Duplicar</span>
                      </button>

                      {/* Change Status Dropdown */}
                      <div className="relative">
                        <select
                          value={status}
                          onChange={(e) => handleChangeStatus(template.id, e.target.value as any)}
                          className="text-[11px] font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="published">🟢 Publicar</option>
                          <option value="draft">🟡 Rascunho</option>
                          <option value="hidden">🔴 Ocultar</option>
                        </select>
                      </div>

                      {/* Delete Template */}
                      <button
                        onClick={() => handleDeleteTemplate(template)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                        title="Excluir Template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ================= MODAL: VISUAL GEMINI EDITOR ================= */}
      {geminiEditingTemplate && (
        <GeminiTemplateEditorModal
          isOpen={true}
          template={geminiEditingTemplate}
          onClose={() => setGeminiEditingTemplate(null)}
          onSaveTemplate={handleSaveGeminiTemplate}
        />
      )}

      {/* ================= MODAL: EDIT METADATA ================= */}
      {metadataEditingTemplate && (
        <EditTemplateModal
          isOpen={true}
          template={metadataEditingTemplate}
          onClose={() => setMetadataEditingTemplate(null)}
          onSave={handleSaveMetadata}
        />
      )}

      {/* ================= MODAL: SEO & METATAGS ANALYZER (GEMINI) ================= */}
      {seoModalOpen && (
        <AdminSeoAnalyzerModal
          isOpen={seoModalOpen}
          onClose={() => {
            setSeoModalOpen(false);
            setSeoSelectedTemplate(null);
          }}
          websites={websites}
          initialSelectedWebsite={seoSelectedTemplate}
          onApplySeoToWebsite={handleApplySeoToWebsite}
        />
      )}

      {/* ================= MODAL: GEMINI FILE BRIDGE & ATOMIC WRITES ================= */}
      {fileBridgeOpen && (
        <GeminiFileBridgeModal
          isOpen={fileBridgeOpen}
          onClose={() => setFileBridgeOpen(false)}
          initialComponentPath={fileBridgeInitialPath}
          onApplySuccess={(filePath, hash) => {
            showNotification(`Componente ${filePath.split('/').pop()} atualizado com sucesso! (Hash: ${hash})`);
          }}
        />
      )}

    </div>
  );
};
