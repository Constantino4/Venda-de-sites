import React from 'react';
import { ShoppingBag, Search, ShieldCheck, Truck, Phone, Heart, User, LayoutDashboard, Store } from 'lucide-react';
import { NovaCategory, NovaStoreSettings } from '../types';

interface NovaStoreHeaderProps {
  settings: NovaStoreSettings;
  categories: NovaCategory[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  currentView: 'home' | 'product' | 'customer' | 'contact' | 'admin';
  onChangeView: (view: 'home' | 'product' | 'customer' | 'contact' | 'admin') => void;
}

export const NovaStoreHeader: React.FC<NovaStoreHeaderProps> = ({
  settings,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  cartCount,
  onOpenCart,
  currentView,
  onChangeView,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Notification Bar */}
      <div className="bg-indigo-900 text-indigo-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium">
              <Truck className="w-3.5 h-3.5 text-indigo-400" />
              Frete Grátis nas compras acima de R$ {settings.freeShippingThreshold.toFixed(2)}
            </span>
            <span className="hidden md:flex items-center gap-1.5 opacity-80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Garantia de Entrega e Compra Segura
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => onChangeView('admin')}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full transition ${
                currentView === 'admin'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Acessar o Painel do Dono da Loja"
            >
              <LayoutDashboard className="w-3 h-3 text-amber-300" />
              <span>Painel Admin da Loja</span>
            </button>

            <button
              onClick={() => onChangeView('customer')}
              className="hover:text-white transition flex items-center gap-1"
            >
              <User className="w-3 h-3" />
              <span className="hidden sm:inline">Meus Pedidos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo */}
          <button
            onClick={() => onChangeView('home')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 leading-none block">
                {settings.storeName}
              </span>
              <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase">
                Loja Oficial
              </span>
            </div>
          </button>

          {/* Search Bar with live search */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="O que você está procurando hoje? (ex: fone, smartwatch, tênis...)"
                className="w-full bg-slate-100/90 border border-slate-200 rounded-full pl-11 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onChangeView('contact')}
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              <Phone className="w-4 h-4 text-slate-400" />
              <span>Atendimento</span>
            </button>

            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-md shadow-indigo-500/20 transition group"
            >
              <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition" />
              <span className="hidden sm:inline">Carrinho</span>
              <span className="bg-amber-400 text-slate-950 font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Categories Navigation Bar */}
      <div className="bg-slate-50 border-t border-slate-200/80 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2 no-scrollbar text-xs font-semibold text-slate-600">
          <button
            onClick={() => {
              onSelectCategory('all');
              onChangeView('home');
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
              selectedCategory === 'all' && currentView === 'home'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            Todos os Departamentos
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                onChangeView('home');
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedCategory === cat.id && currentView === 'home'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}

          <div className="ml-auto hidden lg:flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => {
                onSelectCategory('deal');
                onChangeView('home');
              }}
              className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
            >
              🔥 Ofertas Relâmpago
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
