import React from 'react';
import { Search, ShieldCheck, Code, Zap, Sparkles, Eye, ArrowUpRight, TrendingUp } from 'lucide-react';
import { CATEGORIES } from '../data/mockSites';

interface HeroBannerProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onOpenAiAssistant: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onOpenAiAssistant,
}) => {
  return (
    <div className="bg-slate-50 border-b border-slate-200 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Bento Grid Header Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Bento Item 1: Main Search & Value Proposition (8 cols) */}
          <div className="md:col-span-8 bg-white border border-slate-200 rounded-[2rem] p-8 lg:p-10 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold mb-4">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Mercado #1 de Venda & Compra de Sites no Brasil</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-4">
                Compre e Venda Sites Prontos com <span className="text-blue-600">Código Fonte Completo</span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed max-w-2xl">
                Sistemas, SaaS, e-commerces e landing pages de alta conversão. Teste interativamente antes de comprar e receba os arquivos fonte em <strong>.ZIP</strong> com licença aberta.
              </p>
            </div>

            {/* Main Bento Search Input */}
            <div className="relative">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10 transition shadow-inner">
                <Search className="w-5 h-5 ml-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Qual site você precisa hoje? Ex: E-commerce, Odontologia, SaaS..."
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
                <button
                  onClick={onOpenAiAssistant}
                  className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-3 rounded-xl transition shadow-md shadow-blue-500/10 whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Recomendação IA</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bento Item 2: Revenue & Sales Metric Box (4 cols - Blue Accent) */}
          <div className="md:col-span-4 bg-blue-600 text-white rounded-[2rem] p-8 shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-blue-500 rounded-full blur-2xl opacity-60 pointer-events-none" />
            
            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-md">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Volume de Vendas</span>
              </div>
              <p className="text-4xl font-black tracking-tight pt-2">R$ 480k+</p>
              <p className="text-xs text-blue-100 font-medium leading-relaxed">
                Transacionados em código fonte e templates prontos com licença direta no Brasil.
              </p>
            </div>

            <div className="pt-6 border-t border-blue-500/80 relative z-10 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1">
                <Code className="w-4 h-4 text-emerald-300" /> Download .ZIP Instantâneo
              </span>
              <ArrowUpRight className="w-5 h-5 text-blue-200 group-hover:translate-x-1 group-hover:-translate-y-1 transition" />
            </div>
          </div>

          {/* Bento Item 3: Category Quick Filter Cards (8 cols) */}
          <div className="md:col-span-8 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Categorias em Destaque
              </h3>
              <span className="text-xs text-blue-600 font-bold">Ver catálogo completo</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    selectedCategory === cat.id ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bento Item 4: Emerald Verified Guarantee Box (4 cols) */}
          <div className="md:col-span-4 bg-emerald-50 border border-emerald-200 rounded-[2rem] p-6 text-emerald-950 flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-emerald-900">Garantia WebMarket</p>
                <p className="text-[11px] text-emerald-700">Código 100% verificado</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-emerald-900 font-medium">
              <p className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Liberação imediata após o PIX</span>
              </p>
              <p className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Demo interativa em tempo real</span>
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
