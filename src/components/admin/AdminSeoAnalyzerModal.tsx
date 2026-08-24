import React, { useState, useEffect } from 'react';
import { Website, SeoAnalysisResult, CatalogSeoSummary } from '../../types';
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Globe,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Smartphone,
  Monitor,
  Share2,
  Code2,
  ListFilter,
  BarChart3,
  Layers,
  ArrowRight,
  Wand2,
  RefreshCw,
  Sliders,
  HelpCircle,
  Eye,
  Zap,
  Info,
  X
} from 'lucide-react';

interface AdminSeoAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  websites: Website[];
  initialSelectedWebsite?: Website | null;
  onApplySeoToWebsite: (websiteId: string, updatedFields: {
    title?: string;
    shortDescription?: string;
    fullDescription?: string;
    seoMeta?: any;
  }) => void;
}

export const AdminSeoAnalyzerModal: React.FC<AdminSeoAnalyzerModalProps> = ({
  isOpen,
  onClose,
  websites,
  initialSelectedWebsite,
  onApplySeoToWebsite,
}) => {
  if (!isOpen) return null;

  // Active Tab: Single product deep dive vs Catalog Batch Audit
  const [modalTab, setModalTab] = useState<'single' | 'catalog'>('single');

  // Currently selected website for single analysis
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    initialSelectedWebsite?.id || websites[0]?.id || ''
  );

  const currentWebsite = websites.find((w) => w.id === selectedSiteId) || websites[0];

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SeoAnalysisResult | null>(null);
  const [analysisSource, setAnalysisSource] = useState<'gemini_ai' | 'heuristic_engine' | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Sub-tab inside single product
  const [activeSubTab, setActiveSubTab] = useState<'serp' | 'titles' | 'keywords' | 'social' | 'schema' | 'checklist'>('serp');

  // SERP Preview Device Toggle
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewMode, setPreviewMode] = useState<'recommended' | 'current'>('recommended');

  // Batch catalog audit state
  const [isAuditingCatalog, setIsAuditingCatalog] = useState(false);
  const [catalogSummary, setCatalogSummary] = useState<CatalogSeoSummary | null>(null);

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [appliedSuccessNotice, setAppliedSuccessNotice] = useState<string | null>(null);

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Run SEO Analysis for the selected website
  const runAnalysis = async (siteToAnalyze: Website) => {
    if (!siteToAnalyze) return;
    setIsAnalyzing(true);
    setErrorNotice(null);
    setAppliedSuccessNotice(null);

    try {
      const res = await fetch('/api/admin/seo-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: siteToAnalyze.id,
          title: siteToAnalyze.title,
          shortDescription: siteToAnalyze.shortDescription,
          fullDescription: siteToAnalyze.fullDescription,
          category: siteToAnalyze.category,
          categoryName: siteToAnalyze.categoryName,
          techStack: siteToAnalyze.techStack,
          features: siteToAnalyze.features,
          price: siteToAnalyze.price?.standard,
          existingKeywords: siteToAnalyze.pages?.join(', ') || ''
        })
      });

      if (!res.ok) {
        throw new Error('Falha na resposta do servidor.');
      }

      const data = await res.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
        setAnalysisSource(data.source === 'gemini_ai' ? 'gemini_ai' : 'heuristic_engine');
      }
    } catch (err: any) {
      console.error('Erro na análise de SEO:', err);
      setErrorNotice('Não foi possível conectar à IA no momento. Exibindo diagnóstico heurístico.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run Catalog Audit
  const runCatalogAudit = async () => {
    setIsAuditingCatalog(true);
    try {
      const res = await fetch('/api/admin/seo-batch-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: websites })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.summary) {
          setCatalogSummary(data.summary);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuditingCatalog(false);
    }
  };

  // Trigger analysis when selected product changes
  useEffect(() => {
    if (currentWebsite) {
      runAnalysis(currentWebsite);
    }
  }, [selectedSiteId]);

  // Trigger catalog audit on opening if tab is catalog
  useEffect(() => {
    if (modalTab === 'catalog' && !catalogSummary && !isAuditingCatalog) {
      runCatalogAudit();
    }
  }, [modalTab]);

  // Apply optimizations to the current template
  const handleApplyAllOptimizations = async () => {
    if (!currentWebsite || !analysisResult) return;

    const newTitle = analysisResult.titleSuggestions.recommended;
    const newShortDesc = analysisResult.metaDescriptionSuggestions.recommended;
    const newFullDesc = currentWebsite.fullDescription;

    const seoMeta = {
      title: newTitle,
      metaDescription: newShortDesc,
      focusKeyword: analysisResult.focusKeyword,
      keywords: [
        analysisResult.keywordStrategy.primaryKeyword.keyword,
        ...analysisResult.keywordStrategy.secondaryKeywords.map((k) => k.keyword)
      ],
      ogTitle: analysisResult.openGraphTags.ogTitle,
      ogDescription: analysisResult.openGraphTags.ogDescription,
      score: analysisResult.score,
      lastAnalysis: analysisResult
    };

    try {
      const res = await fetch('/api/admin/seo-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: currentWebsite.id,
          title: newTitle,
          shortDescription: newShortDesc,
          fullDescription: newFullDesc,
          seoMeta
        })
      });

      if (res.ok) {
        onApplySeoToWebsite(currentWebsite.id, {
          title: newTitle,
          shortDescription: newShortDesc,
          seoMeta
        });
        setAppliedSuccessNotice('✨ Título, meta tags e palavras-chave aplicados com sucesso ao template!');
        setTimeout(() => setAppliedSuccessNotice(null), 4000);
      }
    } catch (e) {
      console.error(e);
      onApplySeoToWebsite(currentWebsite.id, {
        title: newTitle,
        shortDescription: newShortDesc,
        seoMeta
      });
      setAppliedSuccessNotice('✨ Otimizações salvas localmente no catálogo!');
      setTimeout(() => setAppliedSuccessNotice(null), 4000);
    }
  };

  // Custom single field application helper
  const handleApplySpecificField = (field: 'title' | 'description', value: string) => {
    if (!currentWebsite) return;

    if (field === 'title') {
      onApplySeoToWebsite(currentWebsite.id, { title: value });
      setAppliedSuccessNotice(`Título atualizado para "${value}"`);
    } else {
      onApplySeoToWebsite(currentWebsite.id, { shortDescription: value });
      setAppliedSuccessNotice('Meta description atualizada com sucesso!');
    }
    setTimeout(() => setAppliedSuccessNotice(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* ================= MODAL HEADER ================= */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  Analisador de SEO & Metatags
                </h2>
                <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                  Gemini AI
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                Auditoria inteligente de títulos, meta descriptions e palavras-chave para dominar o Google.
              </p>
            </div>
          </div>

          {/* Navigation Mode Switcher & Close */}
          <div className="flex items-center gap-2 self-end md:self-center">
            <div className="bg-white/10 p-1 rounded-2xl flex items-center gap-1 border border-white/10 text-xs font-bold">
              <button
                onClick={() => setModalTab('single')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  modalTab === 'single' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Por Produto</span>
              </button>
              <button
                onClick={() => setModalTab('catalog')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  modalTab === 'catalog' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Auditoria do Catálogo</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= MODAL BODY ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
          
          {/* Notification / Toast inside modal */}
          {appliedSuccessNotice && (
            <div className="p-4 bg-emerald-600 text-white text-xs font-bold rounded-2xl flex items-center justify-between gap-3 shadow-lg shadow-emerald-600/20 animate-in slide-in-from-top duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>{appliedSuccessNotice}</span>
              </div>
              <button onClick={() => setAppliedSuccessNotice(null)} className="text-white hover:opacity-80">
                ×
              </button>
            </div>
          )}

          {errorNotice && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorNotice}</span>
            </div>
          )}

          {/* ================= MODE A: SINGLE PRODUCT DEEP DIVE ================= */}
          {modalTab === 'single' && (
            <div className="space-y-6">
              
              {/* Product Selector Header Bar */}
              <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Selecione o Template para Analisar
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSiteId}
                      onChange={(e) => setSelectedSiteId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {websites.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.title} — ({w.categoryName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => currentWebsite && runAnalysis(currentWebsite)}
                    disabled={isAnalyzing}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2"
                    title="Reexecutar análise com Gemini"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-blue-600' : ''}`} />
                    <span>{isAnalyzing ? 'Analisando...' : 'Reanalisar SEO'}</span>
                  </button>

                  <button
                    onClick={handleApplyAllOptimizations}
                    disabled={!analysisResult || isAnalyzing}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Aplicar Tudo</span>
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {isAnalyzing && !analysisResult && (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto animate-pulse">
                    <Sparkles className="w-8 h-8 animate-spin" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    O Gemini está analisando os títulos, descrições e concorrência...
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Avaliando densidade de palavras-chave, tamanho da tag para a SERP do Google, relevância de intenção de compra e tags OpenGraph.
                  </p>
                </div>
              )}

              {/* Analysis Result Card */}
              {analysisResult && (
                <div className="space-y-6">
                  
                  {/* Score Overview & Key Metrics */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    
                    {/* Overall Score Gauge Card */}
                    <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">
                              SEO Health Score
                            </span>
                            <div className="flex items-baseline gap-2 mt-1">
                              <span className="text-4xl sm:text-5xl font-black tracking-tight">
                                {analysisResult.score}
                              </span>
                              <span className="text-lg text-slate-400 font-bold">/100</span>
                              <span className="ml-2 bg-emerald-500/20 text-emerald-300 text-xs font-black px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                                Grade {analysisResult.grade}
                              </span>
                            </div>
                          </div>
                          
                          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-blue-400">
                            <TrendingUp className="w-6 h-6" />
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-medium">Palavra-Chave Foco:</span>
                            <span className="text-blue-300 font-bold truncate max-w-[170px]" title={analysisResult.focusKeyword}>
                              {analysisResult.focusKeyword}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-medium">Intenção de Busca:</span>
                            <span className="text-emerald-300 font-bold uppercase text-[10px] tracking-wider bg-emerald-500/20 px-2 py-0.5 rounded-md">
                              {analysisResult.searchIntent}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-medium">Motor de Análise:</span>
                            <span className="text-purple-300 font-bold text-[10px]">
                              {analysisSource === 'gemini_ai' ? '✨ Gemini 2.5 Flash' : '⚡ Heurística SiteForge'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Background Glow */}
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                    </div>

                    {/* Breakdown Bars Card */}
                    <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                          Avaliação por Pilares de Desempenho
                        </h4>

                        <div className="space-y-3">
                          {/* Title Quality */}
                          <div>
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-slate-700 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-blue-600" />
                                Qualidade do Título & Densidade SERP
                              </span>
                              <span className="text-slate-900 font-black">
                                {analysisResult.scoreBreakdown.titleQuality.score}/{analysisResult.scoreBreakdown.titleQuality.max}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${(analysisResult.scoreBreakdown.titleQuality.score / analysisResult.scoreBreakdown.titleQuality.max) * 100}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 font-normal">
                              {analysisResult.scoreBreakdown.titleQuality.note}
                            </p>
                          </div>

                          {/* Meta Description Quality */}
                          <div>
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-slate-700 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                Meta Description & Potencial de Cliques (CTR)
                              </span>
                              <span className="text-slate-900 font-black">
                                {analysisResult.scoreBreakdown.metaDescriptionQuality.score}/{analysisResult.scoreBreakdown.metaDescriptionQuality.max}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${(analysisResult.scoreBreakdown.metaDescriptionQuality.score / analysisResult.scoreBreakdown.metaDescriptionQuality.max) * 100}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 font-normal">
                              {analysisResult.scoreBreakdown.metaDescriptionQuality.note}
                            </p>
                          </div>

                          {/* Keyword Relevance */}
                          <div>
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-slate-700 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-purple-600" />
                                Cobertura & Relevância de Palavras-Chave
                              </span>
                              <span className="text-slate-900 font-black">
                                {analysisResult.scoreBreakdown.keywordRelevance.score}/{analysisResult.scoreBreakdown.keywordRelevance.max}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${(analysisResult.scoreBreakdown.keywordRelevance.score / analysisResult.scoreBreakdown.keywordRelevance.max) * 100}%` }}
                              />
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Sub-Navigation Tabs */}
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
                    <button
                      onClick={() => setActiveSubTab('serp')}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                        activeSubTab === 'serp'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Simulador Google SERP</span>
                    </button>

                    <button
                      onClick={() => setActiveSubTab('titles')}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                        activeSubTab === 'titles'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Títulos & Metatags Sugeridos</span>
                    </button>

                    <button
                      onClick={() => setActiveSubTab('keywords')}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                        activeSubTab === 'keywords'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Estratégia de Palavras-Chave</span>
                    </button>

                    <button
                      onClick={() => setActiveSubTab('social')}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                        activeSubTab === 'social'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>OpenGraph & Redes Sociais</span>
                    </button>

                    <button
                      onClick={() => setActiveSubTab('schema')}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                        activeSubTab === 'schema'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Schema JSON-LD</span>
                    </button>

                    <button
                      onClick={() => setActiveSubTab('checklist')}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                        activeSubTab === 'checklist'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Checklist de Otimização ({analysisResult.actionableRecommendations.length})</span>
                    </button>
                  </div>

                  {/* ================= SUB-TAB 1: LIVE GOOGLE SERP SIMULATOR ================= */}
                  {activeSubTab === 'serp' && (
                    <div className="space-y-4">
                      
                      {/* Controls Bar for SERP */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500">Exibição:</span>
                          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
                            <button
                              onClick={() => setPreviewDevice('desktop')}
                              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
                                previewDevice === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                              }`}
                            >
                              <Monitor className="w-3.5 h-3.5" />
                              <span>Computador</span>
                            </button>
                            <button
                              onClick={() => setPreviewDevice('mobile')}
                              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
                                previewDevice === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                              }`}
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                              <span>Celular</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500">Versão:</span>
                          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
                            <button
                              onClick={() => setPreviewMode('recommended')}
                              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                                previewMode === 'recommended' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500'
                              }`}
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Sugerido c/ Gemini</span>
                            </button>
                            <button
                              onClick={() => setPreviewMode('current')}
                              className={`px-2.5 py-1 rounded-lg transition ${
                                previewMode === 'current' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                              }`}
                            >
                              Atual Cadastrado
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Google Search Result Box */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 text-slate-400 text-xs font-bold">
                          <Globe className="w-4 h-4 text-blue-600" />
                          <span>Prévia Fiel dos Resultados de Busca do Google (Google SERP Snippet)</span>
                        </div>

                        <div className={`space-y-1.5 ${previewDevice === 'mobile' ? 'max-w-md mx-auto p-4 bg-slate-50/70 border border-slate-200 rounded-2xl' : 'max-w-2xl'}`}>
                          
                          {/* Breadcrumb row */}
                          <div className="flex items-center gap-2 text-[12px] text-slate-600 font-normal">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-xs font-black">
                              SF
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-slate-900 leading-tight">SiteForge</span>
                              <span className="text-[11px] text-slate-500 leading-tight">
                                https://siteforge.com.br/templates/{currentWebsite?.slug || 'template'}
                              </span>
                            </div>
                          </div>

                          {/* Link Title */}
                          <h3 className="text-base sm:text-lg text-[#1a0dab] hover:underline font-medium cursor-pointer leading-snug pt-1">
                            {previewMode === 'recommended' 
                              ? analysisResult.titleSuggestions.recommended 
                              : currentWebsite?.title}
                          </h3>

                          {/* Snippet Description */}
                          <p className="text-xs sm:text-[13px] text-[#4d5156] leading-relaxed">
                            {previewMode === 'recommended'
                              ? analysisResult.metaDescriptionSuggestions.recommended
                              : currentWebsite?.shortDescription || currentWebsite?.fullDescription}
                          </p>

                        </div>

                        {/* Character Counter & Warnings */}
                        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          
                          {/* Title Length Indicator */}
                          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                            <div className="flex justify-between items-center font-bold">
                              <span className="text-slate-600">Comprimento do Título:</span>
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                                (previewMode === 'recommended' ? analysisResult.titleSuggestions.charCount : (currentWebsite?.title.length || 0)) <= 60
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {previewMode === 'recommended' ? analysisResult.titleSuggestions.charCount : currentWebsite?.title.length} / 60 caracteres
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Títulos abaixo de 60 caracteres não são cortados com "..." nas páginas do Google.
                            </p>
                          </div>

                          {/* Description Length Indicator */}
                          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                            <div className="flex justify-between items-center font-bold">
                              <span className="text-slate-600">Comprimento da Descrição:</span>
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                                (previewMode === 'recommended' ? analysisResult.metaDescriptionSuggestions.charCount : (currentWebsite?.shortDescription.length || 0)) <= 160
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {previewMode === 'recommended' ? analysisResult.metaDescriptionSuggestions.charCount : currentWebsite?.shortDescription.length} / 160 caracteres
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Tamanho ideal entre 145 e 158 caracteres para máximo impacto visual e conversão de cliques.
                            </p>
                          </div>

                        </div>

                      </div>
                    </div>
                  )}

                  {/* ================= SUB-TAB 2: TITLES & DESCRIPTIONS SUGGESTIONS ================= */}
                  {activeSubTab === 'titles' && (
                    <div className="space-y-5">
                      
                      {/* Recommended Title Card */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                            ✨ Título Principal Recomendado
                          </span>
                          <span className="text-xs text-slate-400 font-bold">
                            {analysisResult.titleSuggestions.charCount} caracteres
                          </span>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <p className="text-sm font-bold text-slate-900 leading-snug">
                            {analysisResult.titleSuggestions.recommended}
                          </p>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleCopyText(analysisResult.titleSuggestions.recommended, 'title_rec')}
                              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                            >
                              {copiedKey === 'title_rec' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedKey === 'title_rec' ? 'Copiado!' : 'Copiar'}</span>
                            </button>

                            <button
                              onClick={() => handleApplySpecificField('title', analysisResult.titleSuggestions.recommended)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition"
                            >
                              Aplicar Título
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 font-normal">
                          <strong className="font-bold text-slate-700">Por que funciona:</strong> {analysisResult.titleSuggestions.benefits}
                        </p>

                        {/* Title Variations A/B */}
                        {analysisResult.titleSuggestions.variations && analysisResult.titleSuggestions.variations.length > 0 && (
                          <div className="pt-3 border-t border-slate-100 space-y-2">
                            <p className="text-xs font-bold text-slate-600">Variações Alternativas para Teste A/B:</p>
                            <div className="space-y-2">
                              {analysisResult.titleSuggestions.variations.map((v, idx) => (
                                <div key={idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between gap-3 text-xs">
                                  <span className="font-medium text-slate-800">{v}</span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      onClick={() => handleCopyText(v, `title_v_${idx}`)}
                                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition"
                                      title="Copiar variação"
                                    >
                                      {copiedKey === `title_v_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                    <button
                                      onClick={() => handleApplySpecificField('title', v)}
                                      className="text-blue-600 hover:text-blue-700 font-bold text-[11px] px-2 py-1 hover:bg-blue-50 rounded-lg transition"
                                    >
                                      Usar este
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Recommended Meta Description Card */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                            ✨ Meta Description Otimizada
                          </span>
                          <span className="text-xs text-slate-400 font-bold">
                            {analysisResult.metaDescriptionSuggestions.charCount} caracteres
                          </span>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <p className="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed">
                            {analysisResult.metaDescriptionSuggestions.recommended}
                          </p>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleCopyText(analysisResult.metaDescriptionSuggestions.recommended, 'desc_rec')}
                              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                            >
                              {copiedKey === 'desc_rec' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedKey === 'desc_rec' ? 'Copiado!' : 'Copiar'}</span>
                            </button>

                            <button
                              onClick={() => handleApplySpecificField('description', analysisResult.metaDescriptionSuggestions.recommended)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition"
                            >
                              Aplicar Descrição
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 font-normal">
                          <strong className="font-bold text-slate-700">Impacto em CTR:</strong> {analysisResult.metaDescriptionSuggestions.ctrImpact}
                        </p>

                        {/* Description Variations */}
                        {analysisResult.metaDescriptionSuggestions.variations && analysisResult.metaDescriptionSuggestions.variations.length > 0 && (
                          <div className="pt-3 border-t border-slate-100 space-y-2">
                            <p className="text-xs font-bold text-slate-600">Variações Alternativas:</p>
                            <div className="space-y-2">
                              {analysisResult.metaDescriptionSuggestions.variations.map((d, idx) => (
                                <div key={idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between gap-3 text-xs">
                                  <span className="font-medium text-slate-800">{d}</span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      onClick={() => handleCopyText(d, `desc_v_${idx}`)}
                                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition"
                                      title="Copiar variação"
                                    >
                                      {copiedKey === `desc_v_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                    <button
                                      onClick={() => handleApplySpecificField('description', d)}
                                      className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px] px-2 py-1 hover:bg-emerald-50 rounded-lg transition"
                                    >
                                      Usar este
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* ================= SUB-TAB 3: KEYWORD STRATEGY ================= */}
                  {activeSubTab === 'keywords' && (
                    <div className="space-y-5">
                      
                      {/* Primary Keyword Banner */}
                      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-blue-300">
                            Palavra-Chave Foco (Alta Intenção de Compra)
                          </span>
                          <h3 className="text-xl font-black mt-1 text-white">
                            "{analysisResult.keywordStrategy.primaryKeyword.keyword}"
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-blue-200">
                            <span>Intenção: <strong className="text-white uppercase">{analysisResult.keywordStrategy.primaryKeyword.intent}</strong></span>
                            <span>•</span>
                            <span>Volume: <strong className="text-white uppercase">{analysisResult.keywordStrategy.primaryKeyword.volumeRating}</strong></span>
                            <span>•</span>
                            <span>Dificuldade: <strong className="text-white uppercase">{analysisResult.keywordStrategy.primaryKeyword.difficulty}</strong></span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleCopyText(analysisResult.keywordStrategy.primaryKeyword.keyword, 'kw_primary')}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center justify-center gap-2"
                        >
                          {copiedKey === 'kw_primary' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'kw_primary' ? 'Copiado!' : 'Copiar Termo'}</span>
                        </button>
                      </div>

                      {/* Secondary Keywords Grid */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                            Palavras-Chave Secundárias de Alta Relevância
                          </h4>
                          <button
                            onClick={() => handleCopyText(
                              analysisResult.keywordStrategy.secondaryKeywords.map((k) => k.keyword).join(', '),
                              'kw_all_sec'
                            )}
                            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Todas</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {analysisResult.keywordStrategy.secondaryKeywords.map((kw, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                  {kw.keyword}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-[10px] font-semibold text-slate-500">
                                  <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                    {kw.intent}
                                  </span>
                                  <span>Vol: {kw.volumeRating}</span>
                                  <span>Dif: {kw.difficulty}</span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleCopyText(kw.keyword, `kw_sec_${idx}`)}
                                className="p-2 hover:bg-slate-200 rounded-xl text-slate-500 transition"
                                title="Copiar palavra-chave"
                              >
                                {copiedKey === `kw_sec_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Long-Tail Keywords */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                          Oportunidades de Cauda Longa (Long-Tail Traffic)
                        </h4>

                        <div className="space-y-2.5">
                          {analysisResult.keywordStrategy.longTailKeywords.map((lt, idx) => (
                            <div key={idx} className="p-3.5 bg-purple-50/50 border border-purple-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <span className="text-xs font-bold text-purple-950">
                                  "{lt.keyword}"
                                </span>
                                <p className="text-[11px] text-purple-700 mt-0.5">
                                  {lt.trafficOpportunity}
                                </p>
                              </div>
                              <button
                                onClick={() => handleCopyText(lt.keyword, `kw_lt_${idx}`)}
                                className="self-start sm:self-center px-2.5 py-1 bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 text-[11px] font-bold rounded-lg transition flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Copiar</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ================= SUB-TAB 4: SOCIAL OPENGRAPH ================= */}
                  {activeSubTab === 'social' && (
                    <div className="space-y-5">
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                              Tags OpenGraph & Twitter Cards
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Controle a aparência dos links compartilhados no WhatsApp, Facebook, LinkedIn e Twitter.
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              const metaTags = `<!-- OpenGraph Tags -->
<meta property="og:title" content="${analysisResult.openGraphTags.ogTitle}" />
<meta property="og:description" content="${analysisResult.openGraphTags.ogDescription}" />
<meta property="og:type" content="${analysisResult.openGraphTags.ogType}" />
<meta property="og:url" content="https://siteforge.com.br/templates/${currentWebsite?.slug}" />
<meta property="og:image" content="${currentWebsite?.thumbnail}" />

<!-- Twitter Card Tags -->
<meta name="twitter:card" content="${analysisResult.openGraphTags.twitterCard}" />
<meta name="twitter:title" content="${analysisResult.openGraphTags.twitterTitle}" />
<meta name="twitter:description" content="${analysisResult.openGraphTags.twitterDescription}" />
<meta name="twitter:image" content="${currentWebsite?.thumbnail}" />`;
                              handleCopyText(metaTags, 'all_og_tags');
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedKey === 'all_og_tags' ? 'Tags Copiadas!' : 'Copiar Tags HTML'}</span>
                          </button>
                        </div>

                        {/* WhatsApp / Social Card Preview */}
                        <div className="p-4 bg-slate-900 rounded-2xl text-white max-w-md mx-auto space-y-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Prévia de Compartilhamento (WhatsApp / Redes)
                          </p>
                          <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                            <img
                              src={currentWebsite?.thumbnail}
                              alt="Thumbnail Preview"
                              className="w-full aspect-16/9 object-cover"
                            />
                            <div className="p-3 space-y-1">
                              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                                siteforge.com.br
                              </span>
                              <h5 className="text-xs font-bold text-white line-clamp-1">
                                {analysisResult.openGraphTags.ogTitle}
                              </h5>
                              <p className="text-[11px] text-slate-300 line-clamp-2 leading-snug">
                                {analysisResult.openGraphTags.ogDescription}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Tags Table */}
                        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                          <div className="p-3 bg-slate-50 rounded-xl flex justify-between gap-3">
                            <span className="font-mono text-slate-500">og:title</span>
                            <span className="font-bold text-slate-800 text-right">{analysisResult.openGraphTags.ogTitle}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl flex justify-between gap-3">
                            <span className="font-mono text-slate-500">og:description</span>
                            <span className="font-medium text-slate-800 text-right">{analysisResult.openGraphTags.ogDescription}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl flex justify-between gap-3">
                            <span className="font-mono text-slate-500">twitter:card</span>
                            <span className="font-bold text-slate-800 text-right">{analysisResult.openGraphTags.twitterCard}</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* ================= SUB-TAB 5: SCHEMA JSON-LD ================= */}
                  {activeSubTab === 'schema' && (
                    <div className="space-y-5">
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                              Schema.org Dados Estruturados (Product / SoftwareApplication)
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Exibe avaliações por estrelas e preço diretamente nos resultados orgânicos do Google (Rich Snippets).
                            </p>
                          </div>

                          <button
                            onClick={() => handleCopyText(
                              JSON.stringify(analysisResult.structuredDataJsonLd || {}, null, 2),
                              'json_ld'
                            )}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedKey === 'json_ld' ? 'JSON-LD Copiado!' : 'Copiar JSON-LD'}</span>
                          </button>
                        </div>

                        <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-2xl overflow-x-auto max-h-96 border border-slate-800">
                          <pre>{JSON.stringify(analysisResult.structuredDataJsonLd || {}, null, 2)}</pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ================= SUB-TAB 6: CHECKLIST & RECOMMENDATIONS ================= */}
                  {activeSubTab === 'checklist' && (
                    <div className="space-y-4">
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                          Plano de Ação Recomendado para Este Template
                        </h4>

                        <div className="space-y-3">
                          {analysisResult.actionableRecommendations.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    item.priority === 'high'
                                      ? 'bg-red-100 text-red-700'
                                      : item.priority === 'medium'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {item.priority === 'high' ? 'Alta Prioridade' : item.priority === 'medium' ? 'Média' : 'Sugestão'}
                                  </span>
                                  <h5 className="text-xs font-bold text-slate-900">
                                    {item.title}
                                  </h5>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                  {item.description}
                                </p>
                              </div>

                              {item.actionLabel && (
                                <button
                                  onClick={handleApplyAllOptimizations}
                                  className="self-start sm:self-center px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 font-bold text-xs rounded-xl transition whitespace-nowrap"
                                >
                                  {item.actionLabel}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* ================= MODE B: BATCH CATALOG AUDIT ================= */}
          {modalTab === 'catalog' && (
            <div className="space-y-6">
              
              {/* Top Catalog Summary Stats */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Auditoria Completa de SEO do Catálogo
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Visão global de visibilidade, palavras-chave e templates que necessitam de otimização no SiteForge.
                  </p>
                </div>

                <button
                  onClick={runCatalogAudit}
                  disabled={isAuditingCatalog}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 self-start sm:self-center"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAuditingCatalog ? 'animate-spin' : ''}`} />
                  <span>{isAuditingCatalog ? 'Auditoria em Andamento...' : 'Atualizar Auditoria'}</span>
                </button>
              </div>

              {catalogSummary && (
                <div className="space-y-6">
                  
                  {/* Metric Tiles */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Score Médio do Catálogo
                      </p>
                      <h3 className="text-3xl font-black text-slate-900 mt-1">
                        {catalogSummary.averageScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
                      </h3>
                      <p className="text-xs text-emerald-600 font-bold mt-2">
                        {catalogSummary.totalAnalyzed} templates avaliados
                      </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Templates Otimizados (85+)
                      </p>
                      <h3 className="text-3xl font-black text-emerald-600 mt-1">
                        {catalogSummary.scoreDistribution.excellent}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2">
                        {((catalogSummary.scoreDistribution.excellent / (catalogSummary.totalAnalyzed || 1)) * 100).toFixed(0)}% com SEO de ponta
                      </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Necessitam Atenção
                      </p>
                      <h3 className="text-3xl font-black text-amber-600 mt-1">
                        {catalogSummary.scoreDistribution.good + catalogSummary.scoreDistribution.needsWork}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2">
                        Títulos curtos ou sem meta tags ideais
                      </p>
                    </div>

                  </div>

                  {/* Top Store-Wide Opportunities */}
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-md space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300">
                      Principais Recomendações Globais para a Loja
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {catalogSummary.topOpportunities.map((opp, idx) => (
                        <div key={idx} className="p-3 bg-white/10 rounded-2xl border border-white/10 text-xs font-medium leading-relaxed flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{opp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Product SEO Table */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Classificação Individual por Template
                    </h4>

                    <div className="divide-y divide-slate-100">
                      {catalogSummary.products.map((p) => (
                        <div key={p.productId} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                                {p.title}
                              </h5>
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                {p.categoryName}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Foco: <span className="font-semibold text-slate-700">"{p.focusKeyword}"</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <div className="text-right">
                              <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                                p.score >= 85
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                Score {p.score}
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                setSelectedSiteId(p.productId);
                                setModalTab('single');
                              }}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs rounded-xl transition flex items-center gap-1"
                            >
                              <span>Otimizar</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

        {/* ================= MODAL FOOTER ================= */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Otimizador com inteligência artificial Gemini conectada ao SiteForge.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition"
            >
              Fechar
            </button>

            {modalTab === 'single' && analysisResult && (
              <button
                onClick={handleApplyAllOptimizations}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar & Aplicar Otimizações</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
