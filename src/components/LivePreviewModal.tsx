import React, { useState } from 'react';
import { Website, CustomizerConfig } from '../types';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  X, 
  Sparkles, 
  ShoppingBag, 
  Moon, 
  Sun, 
  Sliders, 
  RotateCcw,
  ShieldCheck,
  Layers,
  Phone
} from 'lucide-react';
import { TemplateMasterRouter } from './templates/TemplateMasterRouter';
import { THEME_PRESETS, ThemeColors } from './templates/TemplateShared';

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
  const [customizer, setCustomizer] = useState<CustomizerConfig>({
    accentColor: 'indigo',
    isDark: false,
    businessName: website ? website.title.split('—')[0].split('-')[0].trim() : 'Meu Negócio',
    businessTagline: website ? website.shortDescription : 'Descrição do negócio',
    viewport: 'desktop',
  });

  const [showCustomizerDrawer, setShowCustomizerDrawer] = useState(true);
  const [customPhone, setCustomPhone] = useState('(11) 98765-4321');
  const [customCta, setCustomCta] = useState('Entrar em Contato');

  // Keep customizer synced when website changes
  React.useEffect(() => {
    if (website) {
      setCustomizer((c) => ({
        ...c,
        businessName: website.title.split('—')[0].split('-')[0].trim(),
        businessTagline: website.shortDescription,
      }));
    }
  }, [website]);

  if (!website) return null;

  // Accent color themes definition
  const ACCENT_COLORS: { id: string; name: string; hex: string; theme: ThemeColors }[] = [
    { id: 'indigo', name: 'Azul Indigo', hex: '#4f46e5', theme: THEME_PRESETS.indigo },
    { id: 'emerald', name: 'Verde Esmeralda', hex: '#059669', theme: THEME_PRESETS.emerald },
    { id: 'rose', name: 'Vermelho Ruby', hex: '#e11d48', theme: THEME_PRESETS.rose },
    { id: 'amber', name: 'Dourado Âmbar', hex: '#d97706', theme: THEME_PRESETS.amber },
    { id: 'purple', name: 'Roxo Violeta', hex: '#7c3aed', theme: THEME_PRESETS.purple },
    { id: 'cyan', name: 'Azul Turquesa', hex: '#0891b2', theme: THEME_PRESETS.cyan },
  ];

  const currentThemeObj = ACCENT_COLORS.find(c => c.id === customizer.accentColor) || ACCENT_COLORS[0];
  const currentTheme = currentThemeObj.theme;

  // Viewport container width
  const getViewportContainerClass = () => {
    switch (customizer.viewport) {
      case 'mobile':
        return 'w-[380px] h-[720px] my-auto border-8 border-slate-800 rounded-[40px] shadow-2xl overflow-hidden relative transition-all duration-300 bg-white';
      case 'tablet':
        return 'w-[740px] h-[800px] my-auto border-8 border-slate-800 rounded-[32px] shadow-2xl overflow-hidden relative transition-all duration-300 bg-white';
      default:
        return 'w-full h-full rounded-2xl shadow-xl overflow-hidden relative transition-all duration-300 bg-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col">
      
      {/* Top Modal Navigation Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 text-white">
        
        {/* Left Info */}
        <div className="flex items-center gap-3">
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Preview Interativo Multi-Páginas
          </span>
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {website.pageCount || 6} páginas funcionais
          </span>
          <h2 className="text-xs sm:text-sm font-black text-white truncate max-w-xs sm:max-w-md hidden md:block">
            {website.title}
          </h2>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setCustomizer((c) => ({ ...c, viewport: 'desktop' }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              customizer.viewport === 'desktop'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>

          <button
            onClick={() => setCustomizer((c) => ({ ...c, viewport: 'tablet' }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              customizer.viewport === 'tablet'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>

          <button
            onClick={() => setCustomizer((c) => ({ ...c, viewport: 'mobile' }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              customizer.viewport === 'mobile'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCustomizerDrawer(!showCustomizerDrawer)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
              showCustomizerDrawer
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Personalizar Cores & Textos</span>
          </button>

          <button
            onClick={() => {
              onAddToCart(website);
              onClose();
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Comprar R$ {website.price.standard}</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage & Side Panel */}
      <div className="flex-1 relative flex overflow-hidden">
        
        {/* Customizer Sidebar (Live Controls) */}
        {showCustomizerDrawer && (
          <aside className="w-80 bg-slate-900 border-r border-slate-800 p-4 text-white overflow-y-auto space-y-4 shrink-0 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-black flex items-center gap-1.5 text-purple-400">
                <Sparkles className="w-3.5 h-3.5" />
                Personalização ao Vivo
              </span>
              <button
                onClick={() => setCustomizer({
                  accentColor: 'indigo',
                  isDark: false,
                  businessName: website.title.split('—')[0].split('-')[0].trim(),
                  businessTagline: website.shortDescription,
                  viewport: customizer.viewport,
                })}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar</span>
              </button>
            </div>

            {/* Business Name Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">Nome da Empresa / Marca:</label>
              <input
                type="text"
                value={customizer.businessName}
                onChange={(e) => setCustomizer((c) => ({ ...c, businessName: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Custom Phone / WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">WhatsApp / Telefone de Contato:</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Color Palette Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300">Paleta de Cores:</label>
              <div className="grid grid-cols-3 gap-2">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCustomizer((prev) => ({ ...prev, accentColor: c.id as any }))}
                    className={`p-2 rounded-xl border text-[10px] font-bold transition flex items-center gap-1.5 ${
                      customizer.accentColor === c.id
                        ? 'bg-slate-800 border-purple-500 text-white shadow-xs'
                        : 'border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: c.hex }} />
                    <span className="truncate">{c.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Light / Dark Mode Toggle */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">Modo de Exibição:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCustomizer((c) => ({ ...c, isDark: false }))}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    !customizer.isDark
                      ? 'bg-white text-slate-950 border-white shadow-xs'
                      : 'border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Modo Claro</span>
                </button>

                <button
                  onClick={() => setCustomizer((c) => ({ ...c, isDark: true }))}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    customizer.isDark
                      ? 'bg-purple-600 text-white border-purple-500 shadow-xs'
                      : 'border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Modo Escuro</span>
                </button>
              </div>
            </div>

            {/* Template Pages List */}
            {website.pages && website.pages.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  Páginas Inclusas no Template ({website.pages.length}):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {website.pages.map((p) => (
                    <span key={p} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Guarantee badge */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 text-xs text-slate-300 space-y-1.5">
              <p className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Garantia de Satisfação
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Ao comprar, você receberá o código-fonte 100% aberto com todas as alterações aplicadas automaticamente.
              </p>
            </div>
          </aside>
        )}

        {/* Live Stage Display */}
        <div className="flex-1 relative flex items-center justify-center p-2 sm:p-6 bg-slate-950 overflow-auto">
          <div className={getViewportContainerClass()}>
            <div className="w-full h-full overflow-y-auto">
              <TemplateMasterRouter
                website={website}
                isDark={customizer.isDark}
                theme={currentTheme}
                businessName={customizer.businessName}
                customPhone={customPhone}
                customCta={customCta}
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

