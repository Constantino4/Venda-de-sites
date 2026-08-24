import React, { useState } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Mail, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Star, 
  Send, 
  Calendar, 
  ChevronRight, 
  Menu, 
  X,
  Sparkles,
  ShieldCheck,
  Award
} from 'lucide-react';

export interface ThemeColors {
  id: string;
  name: string;
  hex: string;
  bg: string;
  text: string;
  border: string;
  btn: string;
}

export const THEME_PRESETS: Record<string, ThemeColors> = {
  indigo: { id: 'indigo', name: 'Azul Indigo', hex: '#4f46e5', bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-600', btn: 'bg-indigo-600 hover:bg-indigo-700' },
  emerald: { id: 'emerald', name: 'Verde Esmeralda', hex: '#059669', bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-600', btn: 'bg-emerald-600 hover:bg-emerald-700' },
  rose: { id: 'rose', name: 'Vermelho Ruby', hex: '#e11d48', bg: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-600', btn: 'bg-rose-600 hover:bg-rose-700' },
  amber: { id: 'amber', name: 'Dourado Âmbar', hex: '#d97706', bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', btn: 'bg-amber-500 hover:bg-amber-600' },
  purple: { id: 'purple', name: 'Roxo Violeta', hex: '#7c3aed', bg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-600', btn: 'bg-purple-600 hover:bg-purple-700' },
  cyan: { id: 'cyan', name: 'Azul Turquesa', hex: '#0891b2', bg: 'bg-cyan-600', text: 'text-cyan-600', border: 'border-cyan-600', btn: 'bg-cyan-600 hover:bg-cyan-700' },
};

export interface SharedPageProps {
  isDark: boolean;
  theme: ThemeColors;
  businessName: string;
  businessTagline?: string;
  customPhone: string;
  customCta: string;
  currentPage: string;
  onNavigate: (page: string) => void;
  buttonColor?: string;
  buttonTextColor?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  pages?: string[];
  showWhatsAppButton?: boolean;
  whatsappNumber?: string;
  visibleSections?: Record<string, boolean | undefined>;
  testimonialsList?: Array<{ name: string; role?: string; comment?: string; text?: string; rating: number }>;
  servicesList?: Array<{ title: string; price: string; duration?: string; desc: string }>;
  faqList?: Array<{ question: string; answer: string }>;
  customPages?: Record<string, { title: string; subtitle?: string; content?: string }>;
}

/**
 * Resolves button styling (Tailwind classes or inline styles)
 */
export function getButtonStyles(buttonColor?: string, buttonTextColor: string = '#ffffff', fallbackThemeBtn: string = 'bg-blue-600 hover:bg-blue-700 text-white') {
  if (!buttonColor) {
    return { className: fallbackThemeBtn, style: {} };
  }

  const clean = buttonColor.toLowerCase().trim();
  if (clean === 'red' || clean === 'vermelho' || clean === '#ef4444' || clean === '#dc2626' || clean.includes('bg-red') || clean === 'rose') {
    return { className: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20', style: {} };
  }
  if (clean === 'blue' || clean === 'azul' || clean === '#2563eb' || clean === '#3b82f6' || clean.includes('bg-blue') || clean === 'indigo') {
    return { className: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20', style: {} };
  }
  if (clean === 'green' || clean === 'verde' || clean === '#10b981' || clean === '#059669' || clean.includes('bg-emerald') || clean === 'emerald') {
    return { className: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20', style: {} };
  }
  if (clean === 'amber' || clean === 'yellow' || clean === 'amarelo' || clean === 'dourado' || clean === '#f59e0b' || clean === '#d97706') {
    return { className: 'bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-md shadow-amber-500/20', style: {} };
  }
  if (clean === 'purple' || clean === 'roxo' || clean === '#8b5cf6' || clean === '#7c3aed' || clean.includes('bg-purple')) {
    return { className: 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20', style: {} };
  }
  if (clean.startsWith('#') || clean.startsWith('rgb')) {
    return { 
      className: 'hover:opacity-90 transition shadow-md', 
      style: { backgroundColor: buttonColor, color: buttonTextColor } 
    };
  }

  return { className: fallbackThemeBtn, style: {} };
}

// Floating WhatsApp Interactive Widget
export const FloatingWhatsAppWidget: React.FC<{
  enabled?: boolean;
  phoneNumber?: string;
  businessName?: string;
}> = ({ enabled = false, phoneNumber = '5511999999999', businessName = 'Empresa' }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!enabled) return null;

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(`Olá ${businessName}! Vim através do site e gostaria de tirar algumas dúvidas.`);
    window.open(`https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto select-none">
      {isOpen && (
        <div className="mb-3 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{businessName}</p>
                <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online agora
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="py-3 text-xs text-slate-600 dark:text-slate-300">
            👋 Olá! Como podemos ajudar você hoje? Clique abaixo para iniciar uma conversa no WhatsApp.
          </div>
          <button
            onClick={handleOpenWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Iniciar Conversa</span>
          </button>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir WhatsApp"
        className="bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center gap-2.5 group relative"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
        <MessageSquare className="w-6 h-6 fill-current" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-bold pr-1">
          Falar no WhatsApp
        </span>
      </button>
    </div>
  );
};

// Generic Dynamic Page Renderer for newly added pages (Sobre, Contactos, FAQ, etc.)
export const TemplateDynamicPage: React.FC<SharedPageProps> = ({
  currentPage,
  businessName,
  businessTagline,
  theme,
  isDark,
  customPhone,
  customCta,
  buttonColor,
  buttonTextColor,
  onNavigate
}) => {
  const btnStyle = getDynamicStyles(buttonColor, buttonTextColor, theme.btn);

  if (currentPage.toLowerCase().includes('sobre') || currentPage.toLowerCase().includes('about')) {
    return (
      <div className={`py-16 px-6 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-200 ${isDark ? 'text-white' : 'text-slate-900'}`}>
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-500/10 px-3 py-1 rounded-full">
            Sobre Nossa Empresa
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Compromisso com a Excelência e Qualidade
          </h1>
          <p className="text-base text-slate-500 leading-relaxed">
            A <strong>{businessName}</strong> nasceu para transformar o mercado com atendimento personalizado, tecnologia de ponta e foco total na satisfação de nossos clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-3 shadow-xs`}>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Nossa Missão</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Entregar resultados excepcionais com agilidade, transparência e o mais alto padrão técnico.
            </p>
          </div>

          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-3 shadow-xs`}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Nossos Valores</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ética, pontualidade, inovação contínua e valorização dos nossos parceiros e clientes.
            </p>
          </div>

          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-3 shadow-xs`}>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Nossa Visão</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ser a principal referência no nosso segmento, reconhecida pela confiabilidade e inovação.
            </p>
          </div>
        </div>

        <div className="text-center pt-8">
          <button
            onClick={() => onNavigate('Home')}
            className={`px-8 py-3.5 rounded-xl text-sm font-bold transition shadow-lg ${btnStyle.className}`}
            style={btnStyle.style}
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  if (currentPage.toLowerCase().includes('contacto') || currentPage.toLowerCase().includes('contato')) {
    return (
      <div className={`py-16 px-6 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-200 ${isDark ? 'text-white' : 'text-slate-900'}`}>
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-500/10 px-3 py-1 rounded-full">
            Canais de Atendimento
          </span>
          <h1 className="text-3xl sm:text-4xl font-black">Entre em Contacto Conosco</h1>
          <p className="text-sm text-slate-500">Estamos prontos para atender você com total dedicação.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className={`p-8 rounded-2xl border space-y-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
            <h3 className="font-bold text-lg">Informações Diretas</h3>
            <div className="space-y-4 text-xs text-slate-500">
              <p className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-600" />
                <span className="text-slate-800 dark:text-slate-200 font-bold">{customPhone}</span>
              </p>
              <p className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-slate-800 dark:text-slate-200">contato@{businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.br</span>
              </p>
              <p className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-slate-800 dark:text-slate-200">Atendimento presencial & online em todo o país</span>
              </p>
              <p className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-slate-800 dark:text-slate-200">Segunda a Sexta das 08h às 19h</span>
              </p>
            </div>
          </div>

          <div className={`p-8 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
            <h3 className="font-bold text-lg">Envie uma Mensagem</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Seu Nome</label>
                <input type="text" placeholder="Nome completo" className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs" />
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">WhatsApp ou Telefone</label>
                <input type="text" placeholder="(11) 99999-9999" className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs" />
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Mensagem</label>
                <textarea rows={3} placeholder="Como podemos ajudar?" className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs" />
              </div>
              <button 
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition shadow-md ${btnStyle.className}`}
                style={btnStyle.style}
              >
                Enviar Mensagem
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generic fallback page for any other added page title (FAQ, Depoimentos, etc.)
  return (
    <div className={`py-20 px-6 max-w-4xl mx-auto text-center space-y-6 animate-in fade-in duration-200 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-500/10 px-3.5 py-1.5 rounded-full">
        Página: {currentPage}
      </span>
      <h1 className="text-3xl sm:text-5xl font-black">{currentPage} — {businessName}</h1>
      <p className="text-base text-slate-500 max-w-xl mx-auto">
        Esta página foi criada e personalizada dinamicamente pelo Co-piloto Gemini AI para expandir a estrutura do seu website.
      </p>
      <div className="pt-4">
        <button
          onClick={() => onNavigate('Home')}
          className={`px-6 py-3 rounded-xl font-bold text-xs transition shadow-md ${btnStyle.className}`}
          style={btnStyle.style}
        >
          Voltar para Home
        </button>
      </div>
    </div>
  );
};

function getDynamicStyles(buttonColor?: string, buttonTextColor: string = '#ffffff', fallbackBtn: string = 'bg-blue-600 text-white') {
  return getButtonStyles(buttonColor, buttonTextColor, fallbackBtn);
}

// Sub-Navigation for all templates in live preview
export const TemplateNav: React.FC<{
  brandName: string;
  icon: React.ReactNode;
  pages: string[];
  currentPage: string;
  onNavigate: (page: string) => void;
  theme: ThemeColors;
  isDark: boolean;
  phone?: string;
  ctaText?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  onCtaClick?: () => void;
}> = ({
  brandName,
  icon,
  pages,
  currentPage,
  onNavigate,
  theme,
  isDark,
  phone = '(11) 98765-4321',
  ctaText = 'Contacto Rápido',
  buttonColor,
  buttonTextColor = '#ffffff',
  onCtaClick,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const btnStyle = getButtonStyles(buttonColor, buttonTextColor, theme.btn);

  return (
    <nav className={`p-4 border-b sticky top-0 z-30 backdrop-blur-md transition-colors ${
      isDark ? 'border-slate-800 bg-slate-950/90 text-slate-100' : 'border-slate-200/80 bg-white/95 text-slate-900 shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div 
          onClick={() => onNavigate(pages[0] || 'Home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
        >
          <div className={`w-9 h-9 rounded-xl ${theme.bg} text-white flex items-center justify-center font-black shadow-xs transition group-hover:scale-105`}>
            {icon}
          </div>
          <div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight block leading-tight">
              {brandName}
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase block">
              Website Oficial
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
          {pages.map((p, idx) => {
            const isActive = currentPage.toLowerCase() === p.toLowerCase();
            return (
              <button
                key={`nav-desktop-${p}-${idx}`}
                onClick={() => onNavigate(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? `${theme.bg} text-white shadow-xs`
                    : isDark 
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800/60' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2">
          {phone && (
            <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'} hidden md:inline`}>
              {phone}
            </span>
          )}
          <button
            onClick={onCtaClick || (() => {
              const waUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(`Olá! Gostaria de mais informações sobre ${brandName}.`)}`;
              window.open(waUrl, '_blank');
            })}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0 ${btnStyle.className}`}
            style={btnStyle.style}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{ctaText}</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2 rounded-xl border ${
              isDark ? 'border-slate-800 text-slate-200' : 'border-slate-200 text-slate-700'
            }`}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className={`lg:hidden pt-4 pb-2 border-t mt-3 space-y-1 ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          {pages.map((p, idx) => {
            const isActive = currentPage.toLowerCase() === p.toLowerCase();
            return (
              <button
                key={`nav-mobile-${p}-${idx}`}
                onClick={() => {
                  onNavigate(p);
                  setMobileOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                  isActive
                    ? `${theme.bg} text-white`
                    : isDark ? 'text-slate-300 hover:bg-slate-900' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{p}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};

// Shared Footer for all templates
export const TemplateFooter: React.FC<{
  brandName: string;
  tagline: string;
  pages: string[];
  onNavigate: (page: string) => void;
  theme: ThemeColors;
  isDark: boolean;
  phone?: string;
  email?: string;
  address?: string;
}> = ({
  brandName,
  tagline,
  pages,
  onNavigate,
  theme,
  isDark,
  phone = '(11) 98765-4321',
  email = 'contato@empresa.com.br',
  address = 'Av. Paulista, 1000 — São Paulo, SP',
}) => {
  return (
    <footer className={`mt-auto border-t p-8 md:p-12 transition-colors ${
      isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-300'
    }`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3 md:col-span-1">
          <h4 className="text-white font-black text-lg tracking-tight">{brandName}</h4>
          <p className="text-xs text-slate-400 leading-relaxed">{tagline}</p>
          <div className="flex items-center gap-2 pt-2">
            <span className="text-[10px] font-bold bg-white/10 text-slate-300 px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Empresa Verificada
            </span>
          </div>
        </div>

        <div>
          <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Navegação</h5>
          <ul className="space-y-2 text-xs">
            {pages.map((p, idx) => (
              <li key={`nav-footer-${p}-${idx}`}>
                <button
                  onClick={() => onNavigate(p)}
                  className="hover:text-white transition text-slate-400 hover:underline"
                >
                  {p}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Contactos</h5>
          <div className="space-y-2.5 text-xs text-slate-400">
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{phone}</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{email}</span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{address}</span>
            </p>
            <p className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Seg — Sáb: 08h às 20h</span>
            </p>
          </div>
        </div>

        <div>
          <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Atendimento Directo</h5>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Fale com nossa equipa em tempo real pelo WhatsApp ou agende seu horário online.
          </p>
          <a
            href={`https://wa.me/5511999999999?text=${encodeURIComponent(`Olá ${brandName}, vim através do site!`)}`}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-2 text-xs font-bold text-white px-4 py-2.5 rounded-xl ${theme.btn} transition shadow-md`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
        <p>© {new Date().getFullYear()} {brandName}. Todos os direitos reservados.</p>
        <p className="flex items-center gap-1 text-slate-400">
          <span>Desenvolvido com tecnologia de alta performance</span>
        </p>
      </div>
    </footer>
  );
};
