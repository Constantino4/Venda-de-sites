import React, { useState } from 'react';
import { NovaProduct } from '../types';
import { Star, ShoppingBag, Eye, Zap, Flame, Check, ArrowRight } from 'lucide-react';

interface NovaStoreProductGridProps {
  products: NovaProduct[];
  selectedCategory: string;
  searchQuery: string;
  onSelectProduct: (prod: NovaProduct) => void;
  onAddToCart: (prod: NovaProduct) => void;
}

export const NovaStoreProductGrid: React.FC<NovaStoreProductGridProps> = ({
  products,
  selectedCategory,
  searchQuery,
  onSelectProduct,
  onAddToCart,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'deals' | 'bestsellers'>('all');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleQuickAdd = (e: React.MouseEvent, prod: NovaProduct) => {
    e.stopPropagation();
    onAddToCart(prod);
    setAddedIds(prev => ({ ...prev, [prod.id]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [prod.id]: false }));
    }, 1500);
  };

  // Filter products based on selected tab, category, and search query
  const filteredProducts = products.filter((prod) => {
    if (selectedCategory !== 'all' && selectedCategory !== 'deal') {
      if (prod.category !== selectedCategory) return false;
    }

    if (selectedCategory === 'deal' || activeTab === 'deals') {
      if (prod.status !== 'deal' && !prod.promoPrice) return false;
    }

    if (activeTab === 'featured') {
      if (prod.status !== 'featured' && prod.rating < 4.8) return false;
    }

    if (activeTab === 'bestsellers') {
      if (prod.reviewsCount < 40) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = prod.name.toLowerCase().includes(q);
      const matchDesc = prod.description.toLowerCase().includes(q);
      const matchCat = prod.categoryName.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }

    return true;
  });

  return (
    <section className="mb-12">
      {/* Tab Filter Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span>Catálogo de Produtos</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full">
              {filteredProducts.length} itens
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            {searchQuery
              ? `Resultados para "${searchQuery}"`
              : selectedCategory !== 'all'
              ? `Exibindo produtos da categoria selecionada`
              : 'Produtos originais com garantia e nota fiscal'}
          </p>
        </div>

        {/* Filters Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'all'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveTab('featured')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              activeTab === 'featured'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Destaques</span>
          </button>
          <button
            onClick={() => setActiveTab('deals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              activeTab === 'deals'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Promoções</span>
          </button>
          <button
            onClick={() => setActiveTab('bestsellers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'bestsellers'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mais Vendidos
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Nenhum produto encontrado</h3>
          <p className="text-xs text-slate-500 mb-4">
            Tente remover os filtros ou pesquisar por outro termo.
          </p>
          <button
            onClick={() => {
              setActiveTab('all');
            }}
            className="bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
          >
            Ver Todos os Produtos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((prod) => {
            const hasPromo = prod.promoPrice && prod.promoPrice < prod.price;
            const discountPercent = hasPromo
              ? Math.round(((prod.price - (prod.promoPrice || prod.price)) / prod.price) * 100)
              : 0;
            const isAdded = !!addedIds[prod.id];

            return (
              <div
                key={prod.id}
                onClick={() => onSelectProduct(prod)}
                className="group bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Image Container with Badges */}
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  {/* Discount Badge */}
                  {hasPromo && (
                    <div className="absolute top-3 left-3 bg-rose-500 text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span>-{discountPercent}% OFF</span>
                    </div>
                  )}

                  {/* Status / Tag badge */}
                  {prod.isNew && !hasPromo && (
                    <div className="absolute top-3 left-3 bg-indigo-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-xl shadow-md uppercase tracking-wider">
                      Lançamento
                    </div>
                  )}

                  {/* Stock Low Warning */}
                  {prod.stock <= 10 && (
                    <div className="absolute top-3 right-3 bg-amber-500/90 backdrop-blur-xs text-white font-bold text-[10px] px-2 py-0.5 rounded-lg shadow-xs">
                      Restam {prod.stock} un
                    </div>
                  )}

                  {/* Quick Action Overlay button */}
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(prod);
                      }}
                      className="bg-white/95 text-slate-900 font-bold text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5 hover:bg-white transform translate-y-2 group-hover:translate-y-0 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Detalhes</span>
                    </button>
                  </div>
                </div>

                {/* Card Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Category & Rating */}
                    <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                      <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                        {prod.categoryName}
                      </span>
                      <div className="flex items-center gap-1 text-slate-700 font-bold text-xs bg-slate-100 px-2 py-0.5 rounded-md">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{prod.rating.toFixed(1)}</span>
                        <span className="text-slate-400 font-normal">({prod.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-indigo-600 transition">
                      {prod.name}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                      {prod.shortDescription || prod.description}
                    </p>
                  </div>

                  {/* Pricing and Buy Button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      {hasPromo && (
                        <span className="text-[11px] text-slate-400 line-through block">
                          R$ {prod.price.toFixed(2)}
                        </span>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-slate-900">
                          R$ {(prod.promoPrice || prod.price).toFixed(2)}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        ou 12x de R$ {(((prod.promoPrice || prod.price) / 12) * 1.05).toFixed(2)}
                      </span>
                    </div>

                    {/* Add to Cart button */}
                    <button
                      onClick={(e) => handleQuickAdd(e, prod)}
                      className={`font-black text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Adicionado!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Comprar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
