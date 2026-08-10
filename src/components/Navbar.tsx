import React from 'react';
import { Globe, ShoppingBag, Download, PlusCircle, Sparkles, Search, Layers } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  purchasedCount: number;
  activeView: 'marketplace' | 'seller' | 'downloads';
  setActiveView: (view: 'marketplace' | 'seller' | 'downloads') => void;
  onOpenCart: () => void;
  onOpenAiAssistant: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  purchasedCount,
  activeView,
  setActiveView,
  onOpenCart,
  onOpenAiAssistant,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('marketplace')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 p-0.5 shadow-md shadow-blue-500/10">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                Web<span className="text-blue-600">Market</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                Mercado de Sites
              </span>
            </div>
          </div>

          {/* Quick Search in Navbar */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por e-commerce, saas, clínica, React..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/80 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition"
            />
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* AI Assistant Button */}
            <button
              onClick={onOpenAiAssistant}
              className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200/80 text-indigo-700 text-xs font-semibold px-3 py-2 rounded-xl transition shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span>IA Recomenda</span>
            </button>

            {/* Catalog View */}
            <button
              onClick={() => setActiveView('marketplace')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeView === 'marketplace'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Vitrine</span>
            </button>

            {/* Seller Hub View */}
            <button
              onClick={() => setActiveView('seller')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeView === 'seller'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Vender Site</span>
            </button>

            {/* Purchased Sites / Downloads View */}
            <button
              onClick={() => setActiveView('downloads')}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeView === 'downloads'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Meus Downloads</span>
              {purchasedCount > 0 && (
                <span className="bg-emerald-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center ml-1">
                  {purchasedCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-200 transition"
              aria-label="Carrinho"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white font-black text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
