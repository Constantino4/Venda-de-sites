import React, { useState } from 'react';
import { Website, CustomizerConfig } from '../types';
import { Monitor, Tablet, Smartphone, X, Sparkles, ShoppingBag, Palette, Moon, Sun, Check } from 'lucide-react';

interface LivePreviewModalProps {
  website: Website | null;
  onClose: () => void;
  onAddToCart: (website: Website) => void;
}

export const LivePreviewModal: React.FC<LivePreviewModalProps> = ({
  website,
  onClose,
  onAddToCart,
}) => {
  if (!website) return null;

  const [customizer, setCustomizer] = useState<CustomizerConfig>({
    accentColor: 'emerald',
    isDark: true,
    businessName: website.title.split('-')[0].trim(),
    businessTagline: website.shortDescription,
    viewport: 'desktop',
  });

  const [showCustomizerPanel, setShowCustomizerPanel] = useState(true);

  // Map theme colors
  const ACCENT_CLASSES: Record<string, { bg: string; text: string; border: string; button: string }> = {
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500', button: 'bg-emerald-500 hover:bg-emerald-600 text-slate-950' },
    indigo: { bg: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500', button: 'bg-indigo-500 hover:bg-indigo-600 text-white' },
    rose: { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500', button: 'bg-rose-500 hover:bg-rose-600 text-white' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500', button: 'bg-amber-500 hover:bg-amber-600 text-slate-950' },
    cyan: { bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-500', button: 'bg-cyan-500 hover:bg-cyan-600 text-slate-950' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500', button: 'bg-purple-500 hover:bg-purple-600 text-white' },
  };

  const currentTheme = ACCENT_CLASSES[customizer.accentColor];

  // Get viewport max-width style
  const getViewportWidth = () => {
    switch (customizer.viewport) {
      case 'mobile':
        return 'max-w-[375px] h-[667px] my-auto border-x-8 border-y-[16px] border-slate-800 rounded-[36px] shadow-2xl';
      case 'tablet':
        return 'max-w-[768px] h-[800px] my-auto border-8 border-slate-800 rounded-[28px] shadow-2xl';
      default:
        return 'w-full h-full rounded-b-xl';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col">
      
      {/* Top Modal Navigation Control Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-4 text-slate-900">
        
        {/* Left Info */}
        <div className="flex items-center gap-3">
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Demo Interativa
          </span>
          <h2 className="text-sm sm:text-base font-black text-slate-900 truncate max-w-xs sm:max-w-md">
            {website.title}
          </h2>
        </div>

        {/* Middle Viewport Controls */}
        <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setCustomizer((c) => ({ ...c, viewport: 'desktop' }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              customizer.viewport === 'desktop'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>

          <button
            onClick={() => setCustomizer((c) => ({ ...c, viewport: 'tablet' }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              customizer.viewport === 'tablet'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>

          <button
            onClick={() => setCustomizer((c) => ({ ...c, viewport: 'mobile' }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              customizer.viewport === 'mobile'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCustomizerPanel(!showCustomizerPanel)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 transition"
          >
            <Palette className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Customizar Cores</span>
          </button>

          <button
            onClick={() => {
              onAddToCart(website);
              onClose();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md shadow-blue-500/10 transition flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Comprar R$ {website.price.standard}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage & Floating Customizer Drawer */}
      <div className="flex-1 relative flex items-center justify-center p-4 bg-slate-950 overflow-auto">
        
        {/* Customizer Drawer Panel */}
        {showCustomizerPanel && (
          <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl w-72 space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>Personalize em Tempo Real</span>
              </div>
              <button
                onClick={() => setShowCustomizerPanel(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Business Title live edit */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Nome da sua Empresa
              </label>
              <input
                type="text"
                value={customizer.businessName}
                onChange={(e) =>
                  setCustomizer((c) => ({ ...c, businessName: e.target.value }))
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Accent Color picker */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-2">
                Cor de Destaque da Marca
              </label>
              <div className="flex items-center gap-2">
                {(['emerald', 'indigo', 'rose', 'amber', 'cyan', 'purple'] as const).map(
                  (color) => (
                    <button
                      key={color}
                      onClick={() => setCustomizer((c) => ({ ...c, accentColor: color }))}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                        ACCENT_CLASSES[color].bg
                      } ${customizer.accentColor === color ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'}`}
                    >
                      {customizer.accentColor === color && (
                        <Check className="w-3.5 h-3.5 text-slate-950 font-bold" />
                      )}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Light / Dark Mode Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs font-medium text-slate-300">Modo Escuro / Claro</span>
              <button
                onClick={() => setCustomizer((c) => ({ ...c, isDark: !c.isDark }))}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition"
              >
                {customizer.isDark ? (
                  <Moon className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Simulated Website Render inside Device Frame */}
        <div
          className={`mx-auto transition-all duration-300 overflow-hidden flex flex-col ${getViewportWidth()} ${
            customizer.isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
          }`}
        >
          {/* Simulated Site Header */}
          <nav
            className={`px-6 py-4 flex items-center justify-between border-b ${
              customizer.isDark ? 'border-slate-800/80 bg-slate-900/90' : 'border-slate-200 bg-white/90'
            }`}
          >
            <span className={`text-lg font-black tracking-tight ${currentTheme.text}`}>
              {customizer.businessName || 'Sua Marca'}
            </span>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="cursor-pointer hover:underline opacity-80">Início</span>
              <span className="cursor-pointer hover:underline opacity-80">Serviços</span>
              <span className="cursor-pointer hover:underline opacity-80">Sobre</span>
              <button className={`px-3 py-1.5 rounded-lg font-bold text-xs ${currentTheme.button}`}>
                Contato
              </button>
            </div>
          </nav>

          {/* Simulated Hero Section */}
          <div className="p-8 sm:p-12 text-center my-auto max-w-2xl mx-auto space-y-6">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${currentTheme.bg} text-slate-950`}>
              {website.categoryName}
            </span>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {customizer.businessName}: Soluções Inteligentes para seu Negócio
            </h1>

            <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
              {customizer.businessTagline}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button className={`px-6 py-3 rounded-xl font-extrabold text-sm shadow-lg transition ${currentTheme.button}`}>
                Começar Agora
              </button>
              <button
                className={`px-5 py-3 rounded-xl font-semibold text-sm border transition ${
                  customizer.isDark
                    ? 'border-slate-700 hover:bg-slate-800'
                    : 'border-slate-300 hover:bg-slate-100'
                }`}
              >
                Saber Mais
              </button>
            </div>

            {/* Features preview list */}
            <div className="grid grid-cols-2 gap-3 pt-8 text-left text-xs">
              {website.features.slice(0, 4).map((feat, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border ${
                    customizer.isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <p className="font-bold text-xs mb-1">✓ {feat}</p>
                  <p className="opacity-70 text-[10px]">Otimizado e pronto para produção</p>
                </div>
              ))}
            </div>
          </div>

          {/* Simulated Footer */}
          <footer
            className={`px-6 py-3 text-center text-[11px] opacity-60 border-t ${
              customizer.isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-100'
            }`}
          >
            © 2026 {customizer.businessName}. Todos os direitos reservados.
          </footer>
        </div>

      </div>
    </div>
  );
};
