import React, { useState, useRef, useEffect } from 'react';
import { 
  Globe, 
  ShoppingBag, 
  Download, 
  PlusCircle, 
  Sparkles, 
  Search, 
  Layers, 
  Github,
  LogIn,
  LogOut,
  User as UserIcon,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

interface NavbarProps {
  cartCount: number;
  purchasedCount: number;
  activeView: 'marketplace' | 'seller' | 'downloads';
  setActiveView: (view: 'marketplace' | 'seller' | 'downloads') => void;
  onOpenCart: () => void;
  onOpenAiAssistant: () => void;
  onOpenGithubDeploy: () => void;
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
  onOpenGithubDeploy,
  searchQuery,
  setSearchQuery,
}) => {
  const { user, loading, logout, openAuthModal } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    await logout();
  };

  // Provider badge name
  const providerId = user?.providerData?.[0]?.providerId || '';
  const providerName = providerId.includes('google')
    ? 'Google'
    : providerId.includes('github')
    ? 'GitHub'
    : 'Firebase';

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
                Site<span className="text-blue-600">Forge</span>
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
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* AI Assistant Button */}
            <button
              onClick={onOpenAiAssistant}
              className="hidden xl:flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200/80 text-indigo-700 text-xs font-semibold px-3 py-2 rounded-xl transition shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span>IA Recomenda</span>
            </button>

            {/* Deploy para GitHub Button */}
            <button
              onClick={onOpenGithubDeploy}
              className="hidden lg:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-xs"
              title="Abrir Assistente de Deploy para GitHub"
            >
              <Github className="w-4 h-4 text-purple-400" />
              <span>Deploy GitHub</span>
            </button>

            {/* Catalog View */}
            <button
              onClick={() => setActiveView('marketplace')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeView === 'marketplace'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Vitrine</span>
            </button>

            {/* Seller / Admin Hub View */}
            <button
              onClick={() => setActiveView('seller')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeView === 'seller'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="hidden sm:inline">Admin & Templates</span>
            </button>

            {/* Purchased Sites / Downloads View */}
            <button
              onClick={() => setActiveView('downloads')}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeView === 'downloads'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Downloads</span>
              {purchasedCount > 0 && (
                <span className="bg-emerald-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center ml-0.5">
                  {purchasedCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-200 transition"
              aria-label="Carrinho"
            >
              <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-200 mx-0.5 hidden sm:block" />

            {/* Firebase Auth User Profile / Login Button */}
            {loading ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-xs text-slate-500 hidden sm:inline">Carregando...</span>
              </div>
            ) : user ? (
              /* User is Authenticated */
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition"
                  aria-expanded={isProfileMenuOpen}
                  title={user.displayName || user.email || 'Minha Conta'}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Avatar'}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-2xs"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                      {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                    </div>
                  )}

                  <div className="text-left hidden md:block max-w-[110px]">
                    <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      {providerName}
                    </p>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-3xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    
                    {/* Header info */}
                    <div className="px-4 py-3 border-b border-slate-100 flex items-start gap-3">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                          {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate">
                          {user.displayName || 'Usuário WebMarket'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {user.email}
                        </p>
                        <div className="mt-1 flex items-center gap-1">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" />
                            {providerName} Auth
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu links */}
                    <div className="p-2 space-y-1 text-xs">
                      <button
                        onClick={() => {
                          setActiveView('downloads');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl transition font-medium"
                      >
                        <Download className="w-4 h-4 text-blue-600" />
                        <span>Meus Downloads & Licenças</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('seller');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl transition font-medium"
                      >
                        <PlusCircle className="w-4 h-4 text-emerald-600" />
                        <span>Painel do Vendedor</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenGithubDeploy();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl transition font-medium"
                      >
                        <Github className="w-4 h-4 text-slate-900" />
                        <span>Deploy para GitHub</span>
                      </button>
                    </div>

                    {/* Logout button */}
                    <div className="p-2 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition text-xs font-bold"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Sair da Conta</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              /* User is Not Authenticated */
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-xl shadow-xs hover:shadow-md transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};

