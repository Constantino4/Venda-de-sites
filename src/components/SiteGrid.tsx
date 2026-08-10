import React from 'react';
import { Website, FilterState } from '../types';
import { CATEGORIES } from '../data/mockSites';
import { SiteCard } from './SiteCard';
import { Filter, SlidersHorizontal, RotateCcw, SearchX } from 'lucide-react';

interface SiteGridProps {
  websites: Website[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onOpenDetails: (website: Website) => void;
  onOpenLiveDemo: (website: Website) => void;
  onAddToCart: (website: Website) => void;
}

export const SiteGrid: React.FC<SiteGridProps> = ({
  websites,
  filters,
  setFilters,
  onOpenDetails,
  onOpenLiveDemo,
  onAddToCart,
}) => {
  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'all',
      priceRange: [0, 1000],
      techStack: [],
      minRating: 0,
      sortBy: 'popular',
    });
  };

  const handleTechToggle = (tech: string) => {
    setFilters((prev) => {
      const exists = prev.techStack.includes(tech);
      return {
        ...prev,
        techStack: exists
          ? prev.techStack.filter((t) => t !== tech)
          : [...prev.techStack, tech],
      };
    });
  };

  const ALL_TECHS = ['React 19', 'Next.js', 'Express', 'Tailwind CSS', 'TypeScript', 'Gemini AI API', 'Stripe API', 'WhatsApp API'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span>Filtros de Busca</span>
            </div>
            <button
              onClick={resetFilters}
              className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar</span>
            </button>
          </div>

          {/* Categories Filter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Categorias</h4>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilters((f) => ({ ...f, category: cat.id }))}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    filters.category === cat.id
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    filters.category === cat.id ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Preço Máximo</h4>
              <span className="text-xs font-bold text-blue-600">
                Até R$ {filters.priceRange[1]}
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={filters.priceRange[1]}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  priceRange: [f.priceRange[0], parseInt(e.target.value)],
                }))
              }
              className="w-full accent-blue-600 bg-slate-100 rounded-lg cursor-pointer h-1.5"
            />
          </div>

          {/* Tech Stack Multi-select */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Tecnologias</h4>
            <div className="space-y-2">
              {ALL_TECHS.map((tech) => {
                const checked = filters.techStack.includes(tech);
                return (
                  <label
                    key={tech}
                    className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer select-none font-medium"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleTechToggle(tech)}
                      className="rounded accent-blue-600 bg-slate-100 border-slate-300 w-3.5 h-3.5"
                    />
                    <span>{tech}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Avaliação Mínima</h4>
            <select
              value={filters.minRating}
              onChange={(e) =>
                setFilters((f) => ({ ...f, minRating: parseFloat(e.target.value) }))
              }
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
            >
              <option value="0">Todas as avaliações</option>
              <option value="4.5">★ 4.5 ou superior</option>
              <option value="4.8">★ 4.8 ou superior</option>
              <option value="5.0">★ 5.0 (Perfeito)</option>
            </select>
          </div>

        </aside>

        {/* Right Main Grid Area */}
        <main className="flex-1">
          
          {/* Grid Top Bar (Results count & Sort option) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Sites em Destaque
              </h2>
              <p className="text-xs text-slate-500">
                Mostrando <strong className="text-slate-900">{websites.length}</strong> site(s) disponíveis para compra e download imediato
              </p>
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Ordenar por:</span>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, sortBy: e.target.value as any }))
                }
                className="bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600 cursor-pointer shadow-xs"
              >
                <option value="popular">Mais Vendidos</option>
                <option value="rating">Melhor Avaliação</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
                <option value="newest">Mais Recentes</option>
              </select>
            </div>
          </div>

          {/* Website Cards Grid */}
          {websites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {websites.map((website) => (
                <SiteCard
                  key={website.id}
                  website={website}
                  onOpenDetails={onOpenDetails}
                  onOpenLiveDemo={onOpenLiveDemo}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <SearchX className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Nenhum site encontrado</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                Não encontramos sites correspondentes aos filtros selecionados. Tente buscar por outros termos ou limpar os filtros.
              </p>
              <button
                onClick={resetFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition inline-flex items-center gap-2 shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restaurar Filtros</span>
              </button>
            </div>
          )}

        </main>

      </div>
    </div>
  );
};
