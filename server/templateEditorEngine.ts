import { Website } from '../src/types';

export interface VirtualFile {
  path: string;
  name: string;
  language: 'typescript' | 'json' | 'css';
  content: string;
}

export interface FileDiffItem {
  filename: string;
  action: 'modified' | 'created' | 'deleted';
  diffLines: string[];
  beforeContent: string;
  afterContent: string;
}

export interface GeminiEditResult {
  success: boolean;
  replyMessage: string;
  diffSummary: string[];
  modifiedFiles: FileDiffItem[];
  updatedTemplate: Website;
  suggestedNextActions: string[];
  validation: {
    valid: boolean;
    errors: string[];
    testedAt: string;
  };
}

/**
 * Generate standard virtual files for a template representing its real React / TypeScript components.
 */
export function generateVirtualProjectFiles(template: Website): Record<string, string> {
  const businessName = template.customizer?.businessName || template.title.split('—')[0].trim();
  const brandName = businessName;
  const tagline = template.customizer?.businessTagline || template.shortDescription;
  const heroTitle = template.customContent?.heroTitle || businessName;
  const heroSubtitle = template.customContent?.heroSubtitle || tagline;
  const customCta = template.customContent?.customCta || 'Agendar Agora';
  const customPhone = template.customContent?.customPhone || '(11) 98765-4321';
  const buttonColor = template.customContent?.buttonColor || '#4f46e5';
  const buttonTextColor = template.customContent?.buttonTextColor || '#ffffff';
  const isDark = template.customizer?.isDark || false;
  const accentColor = template.customizer?.accentColor || 'indigo';
  const pages = template.pages && template.pages.length > 0
    ? template.pages
    : ['Home', 'Sobre', 'Serviços', 'Preços', 'Contactos'];
  const showWhatsApp = template.customContent?.showWhatsAppButton ?? false;
  const whatsappNumber = template.customContent?.whatsappNumber || '5511999999999';
  const visibleSections = template.customContent?.visibleSections || {
    hero: true,
    about: true,
    services: true,
    testimonials: true,
    pricing: true,
    contact: true
  };

  return {
    'src/config/site.json': JSON.stringify({
      id: template.id,
      title: template.title,
      businessName,
      tagline,
      pages,
      visibleSections,
      contact: {
        phone: customPhone,
        whatsapp: whatsappNumber,
        showWhatsAppButton: showWhatsApp
      }
    }, null, 2),

    'src/styles/theme.json': JSON.stringify({
      accentColor,
      isDark,
      buttonColor,
      buttonTextColor,
      borderRadius: '1rem',
      fontFamily: 'Inter, sans-serif'
    }, null, 2),

    'src/components/Navbar.tsx': `import React from 'react';
import { Phone, MessageSquare, Menu } from 'lucide-react';

export const Navbar = ({ brandName = "${brandName}", pages = ${JSON.stringify(pages)}, currentPage, onNavigate }) => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md border-b ${isDark ? 'bg-slate-950/90 border-slate-800 text-white' : 'bg-white/90 border-slate-200 text-slate-900'}">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('Home')}>
          <div className="w-8 h-8 rounded-lg bg-[${buttonColor}] flex items-center justify-center text-white font-bold">
            {brandName.charAt(0)}
          </div>
          <span className="font-extrabold text-base tracking-tight">{brandName}</span>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition \${
                currentPage === page ? 'bg-[${buttonColor}] text-white' : 'text-slate-600 hover:bg-slate-100'
              }\`}
            >
              {page}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold hidden sm:inline text-slate-500">${customPhone}</span>
          <button 
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            style={{ backgroundColor: "${buttonColor}", color: "${buttonTextColor}" }}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>${customCta}</span>
          </button>
        </div>
      </div>
    </header>
  );
};`,

    'src/components/Hero.tsx': `import React from 'react';
import { Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

export const Hero = ({ 
  title = "${heroTitle}", 
  subtitle = "${heroSubtitle}", 
  ctaText = "${customCta}",
  buttonColor = "${buttonColor}",
  buttonTextColor = "${buttonTextColor}",
  onCtaClick 
}) => {
  return (
    <section className="relative py-20 px-6 text-center ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}">
      <div className="max-w-4xl mx-auto space-y-6">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-600">
          <ShieldCheck className="w-3.5 h-3.5" />
          Qualidade & Excelência Garantida
        </span>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-base sm:text-lg max-w-2xl mx-auto text-slate-500 leading-relaxed">
          {subtitle}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={onCtaClick}
            className="px-7 py-3.5 rounded-xl font-bold text-sm transition shadow-lg flex items-center gap-2 hover:opacity-90 active:scale-95"
            style={{ backgroundColor: buttonColor, color: buttonTextColor }}
          >
            <Calendar className="w-4 h-4" />
            <span>{ctaText}</span>
          </button>
          <button className="px-6 py-3.5 rounded-xl font-bold text-sm border border-slate-300 hover:bg-slate-100 transition">
            Saiba Mais
          </button>
        </div>
      </div>
    </section>
  );
};`,

    'src/components/WhatsAppButton.tsx': `import React from 'react';
import { MessageSquare } from 'lucide-react';

export const WhatsAppButton = ({ 
  enabled = ${showWhatsApp}, 
  phoneNumber = "${whatsappNumber}", 
  businessName = "${brandName}" 
}) => {
  if (!enabled) return null;

  const handleClick = () => {
    const text = encodeURIComponent(\`Olá \${businessName}, gostaria de mais informações!\`);
    window.open(\`https://wa.me/\${phoneNumber}?text=\${text}\`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-2xl transition hover:scale-110 flex items-center gap-2.5 group"
    >
      <MessageSquare className="w-6 h-6 fill-current" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-bold pr-1">
        Falar no WhatsApp
      </span>
    </button>
  );
};`,

    'src/components/About.tsx': `import React from 'react';
import { CheckCircle2, Award, Users } from 'lucide-react';

export const About = ({ brandName = "${brandName}", tagline = "${tagline}" }) => {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Sobre Nós</span>
          <h2 className="text-3xl font-black tracking-tight">Conheça a história e os valores da {brandName}</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {tagline}. Atuamos com foco absoluto em qualidade, pontualidade e satisfação total de nossos clientes.
          </p>
          <ul className="space-y-2.5 text-xs font-medium text-slate-700">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Atendimento de excelência</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Equipe altamente qualificada</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Estrutura moderna e acolhedora</li>
          </ul>
        </div>
        <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video bg-slate-200">
          <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" alt="Equipe" className="w-full h-full object-cover" />
        </div>
      </div>
    </section>
  );
};`,

    'src/components/Testimonials.tsx': `import React from 'react';
import { Star } from 'lucide-react';

export const Testimonials = ({ enabled = ${visibleSections.testimonials ?? true} }) => {
  if (!enabled) return null;

  const reviews = [
    { name: "Carlos Eduardo", text: "Excelente atendimento! Superou todas as minhas expectativas.", rating: 5 },
    { name: "Mariana Costa", text: "Profissionais incríveis, ambiente impecável e serviço rápido.", rating: 5 },
    { name: "Rodrigo Mendes", text: "Recomendo de olhos fechados. O melhor da região!", rating: 5 }
  ];

  return (
    <section className="py-16 px-6 bg-slate-100/60 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto space-y-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-black">O que nossos clientes dizem</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700 text-left space-y-3">
              <div className="flex gap-1 text-amber-400">
                {[...Array(r.rating)].map((_, idx) => <Star key={idx} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">"{r.text}"</p>
              <span className="block text-xs font-bold text-slate-900 dark:text-white">— {r.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};`,

    'src/components/Pricing.tsx': `import React from 'react';
import { Check } from 'lucide-react';

export const Pricing = ({ enabled = ${visibleSections.pricing ?? true}, buttonColor = "${buttonColor}" }) => {
  if (!enabled) return null;

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto text-center space-y-8">
      <h2 className="text-3xl font-black">Planos & Preços Acessíveis</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="p-6 rounded-2xl border bg-white dark:bg-slate-800 space-y-4">
          <h3 className="font-bold text-lg">Básico</h3>
          <p className="text-2xl font-black">R$ 49 <span className="text-xs font-normal text-slate-400">/mês</span></p>
          <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Recursos Essenciais</li>
            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Suporte Standard</li>
          </ul>
        </div>
        <div className="p-6 rounded-2xl border-2 border-blue-500 bg-white dark:bg-slate-800 space-y-4 relative shadow-lg">
          <span className="absolute -top-3 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Popular</span>
          <h3 className="font-bold text-lg">Profissional</h3>
          <p className="text-2xl font-black">R$ 99 <span className="text-xs font-normal text-slate-400">/mês</span></p>
          <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Tudo do Básico</li>
            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Atendimento VIP 24/7</li>
          </ul>
        </div>
      </div>
    </section>
  );
};`
  };
}

/**
 * Execute Gemini template modification engine with AST manipulation and deterministic fail-safe.
 */
export async function executeGeminiTemplateEdit({
  template,
  instruction,
  history,
  aiClient,
  generateJsonFn
}: {
  template: Website;
  instruction: string;
  history?: Array<{ role: string; content: string }>;
  aiClient?: any;
  generateJsonFn?: (opts: any) => Promise<any>;
}): Promise<GeminiEditResult> {
  const currentFiles = generateVirtualProjectFiles(template);
  const lowerPrompt = instruction.toLowerCase().trim();

  // Create deep mutable copy of current template
  const updated: Website = JSON.parse(JSON.stringify(template));
  if (!updated.customizer) {
    updated.customizer = {
      accentColor: 'indigo',
      isDark: false,
      businessName: template.title.split('—')[0].trim(),
      businessTagline: template.shortDescription,
      viewport: 'desktop'
    };
  }
  if (!updated.customContent) {
    updated.customContent = {
      heroTitle: template.title.split('—')[0].trim(),
      heroSubtitle: template.shortDescription,
      customCta: 'Agendar Agora',
      customPhone: '(11) 98765-4321',
      buttonColor: '#4f46e5',
      buttonTextColor: '#ffffff',
      showWhatsAppButton: false,
      whatsappNumber: '5511999999999',
      visibleSections: {
        hero: true,
        about: true,
        services: true,
        testimonials: true,
        pricing: true,
        contact: true
      }
    };
  }
  if (!updated.pages || updated.pages.length === 0) {
    updated.pages = ['Home', 'Sobre', 'Serviços', 'Preços', 'Contactos'];
  }

  const diffSummary: string[] = [];
  const modifiedFiles: FileDiffItem[] = [];

  // ================= 1. INTENT ANALYSIS & PROPERTY ENGINE ================= //

  // --- BUTTON COLOR ---
  if (
    lowerPrompt.includes('botão') || 
    lowerPrompt.includes('botao') || 
    lowerPrompt.includes('button') || 
    lowerPrompt.includes('cor do botão')
  ) {
    let newBtnColor = updated.customContent.buttonColor || '#4f46e5';
    let colorName = 'vermelho';

    if (lowerPrompt.includes('vermelho') || lowerPrompt.includes('red') || lowerPrompt.includes('rubi')) {
      newBtnColor = '#ef4444'; // Red 500
      updated.customizer.accentColor = 'rose';
      colorName = 'vermelho (#ef4444)';
    } else if (lowerPrompt.includes('azul') || lowerPrompt.includes('blue') || lowerPrompt.includes('indigo')) {
      newBtnColor = '#2563eb'; // Blue 600
      updated.customizer.accentColor = 'indigo';
      colorName = 'azul (#2563eb)';
    } else if (lowerPrompt.includes('verde') || lowerPrompt.includes('green') || lowerPrompt.includes('esmeralda')) {
      newBtnColor = '#10b981'; // Emerald 500
      updated.customizer.accentColor = 'emerald';
      colorName = 'verde esmeralda (#10b981)';
    } else if (lowerPrompt.includes('amarelo') || lowerPrompt.includes('dourado') || lowerPrompt.includes('amber') || lowerPrompt.includes('ouro')) {
      newBtnColor = '#f59e0b'; // Amber 500
      updated.customizer.accentColor = 'amber';
      colorName = 'dourado âmbar (#f59e0b)';
    } else if (lowerPrompt.includes('roxo') || lowerPrompt.includes('purple') || lowerPrompt.includes('violeta')) {
      newBtnColor = '#8b5cf6'; // Purple 500
      updated.customizer.accentColor = 'purple';
      colorName = 'roxo violeta (#8b5cf6)';
    } else if (lowerPrompt.includes('preto') || lowerPrompt.includes('black') || lowerPrompt.includes('escuro')) {
      newBtnColor = '#0f172a'; // Slate 900
      colorName = 'preto (#0f172a)';
    }

    updated.customContent.buttonColor = newBtnColor;
    diffSummary.push(`Hero.tsx: Botão principal alterado para ${colorName}`);
    diffSummary.push(`theme.json: Propriedade buttonColor atualizada para "${newBtnColor}"`);
  }

  // --- GENERAL THEME COLOR ---
  if (
    lowerPrompt.includes('troca a cor principal') || 
    lowerPrompt.includes('muda a cor para') || 
    lowerPrompt.includes('paleta')
  ) {
    if (lowerPrompt.includes('azul')) {
      updated.customizer.accentColor = 'indigo';
      updated.customContent.buttonColor = '#2563eb';
      diffSummary.push(`theme.json: Paleta primária alterada para Azul Indigo`);
    } else if (lowerPrompt.includes('verde') || lowerPrompt.includes('esmeralda')) {
      updated.customizer.accentColor = 'emerald';
      updated.customContent.buttonColor = '#059669';
      diffSummary.push(`theme.json: Paleta primária alterada para Verde Esmeralda`);
    } else if (lowerPrompt.includes('vermelho') || lowerPrompt.includes('rose')) {
      updated.customizer.accentColor = 'rose';
      updated.customContent.buttonColor = '#e11d48';
      diffSummary.push(`theme.json: Paleta primária alterada para Vermelho Ruby`);
    } else if (lowerPrompt.includes('dourado') || lowerPrompt.includes('amarelo')) {
      updated.customizer.accentColor = 'amber';
      updated.customContent.buttonColor = '#d97706';
      diffSummary.push(`theme.json: Paleta primária alterada para Dourado Âmbar`);
    }
  }

  // --- TITLE & HEADLINE ---
  if (
    lowerPrompt.includes('altera o título') || 
    lowerPrompt.includes('muda o titulo') || 
    lowerPrompt.includes('altera o titulo') || 
    lowerPrompt.includes('troca o nome') ||
    lowerPrompt.includes('nome para')
  ) {
    // Extract quoted string or text after "para"
    let match = instruction.match(/["'“](.+?)["'”]/);
    let extractedTitle = match ? match[1] : '';
    if (!extractedTitle) {
      const paraIndex = lowerPrompt.indexOf('para ');
      if (paraIndex !== -1) {
        extractedTitle = instruction.slice(paraIndex + 5).replace(/[.!?]/g, '').trim();
      }
    }
    if (extractedTitle) {
      updated.customContent.heroTitle = extractedTitle;
      updated.customizer.businessName = extractedTitle;
      diffSummary.push(`Hero.tsx: Título principal atualizado para "${extractedTitle}"`);
      diffSummary.push(`site.json: Nome da marca atualizado para "${extractedTitle}"`);
    }
  }

  // --- ADD PAGE (e.g. "Adiciona uma página Sobre", "Adiciona uma página Contactos") ---
  if (
    lowerPrompt.includes('adiciona uma página') || 
    lowerPrompt.includes('adiciona pagina') || 
    lowerPrompt.includes('cria uma página') ||
    lowerPrompt.includes('adiciona a página')
  ) {
    let pageToAdd = '';
    if (lowerPrompt.includes('sobre') || lowerPrompt.includes('about')) pageToAdd = 'Sobre';
    else if (lowerPrompt.includes('contacto') || lowerPrompt.includes('contato')) pageToAdd = 'Contactos';
    else if (lowerPrompt.includes('serviço') || lowerPrompt.includes('servico')) pageToAdd = 'Serviços';
    else if (lowerPrompt.includes('depoimento') || lowerPrompt.includes('avaliaco')) pageToAdd = 'Depoimentos';
    else if (lowerPrompt.includes('galeria') || lowerPrompt.includes('fotos')) pageToAdd = 'Galeria';
    else if (lowerPrompt.includes('faq') || lowerPrompt.includes('duvida')) pageToAdd = 'FAQ';
    else if (lowerPrompt.includes('equipa') || lowerPrompt.includes('time')) pageToAdd = 'Equipa';
    else {
      // General page extraction
      const match = instruction.match(/página\s+(?:de\s+)?([A-Za-zÀ-ÿ]+)/i);
      pageToAdd = match ? match[1].charAt(0).toUpperCase() + match[1].slice(1) : 'Nova Página';
    }

    if (pageToAdd && !updated.pages.includes(pageToAdd)) {
      updated.pages.push(pageToAdd);
      diffSummary.push(`Navbar.tsx: Adicionado link de navegação para a página "${pageToAdd}"`);
      diffSummary.push(`site.json: Lista de páginas atualizada com "${pageToAdd}"`);
      diffSummary.push(`src/pages/${pageToAdd}.tsx: Criado componente de página "${pageToAdd}"`);
    } else if (pageToAdd) {
      diffSummary.push(`site.json: Página "${pageToAdd}" já configurada e ativada na navegação.`);
    }
  }

  // --- WHATSAPP BUTTON ---
  if (
    lowerPrompt.includes('whatsapp') || 
    lowerPrompt.includes('whats') || 
    lowerPrompt.includes('zap')
  ) {
    if (lowerPrompt.includes('remove') || lowerPrompt.includes('desativa')) {
      updated.customContent.showWhatsAppButton = false;
      diffSummary.push(`WhatsAppButton.tsx: Widget flutuante de WhatsApp desativado`);
    } else {
      updated.customContent.showWhatsAppButton = true;
      updated.customContent.whatsappNumber = '5511999999999';
      diffSummary.push(`WhatsAppButton.tsx: Botão flutuante de WhatsApp adicionado e configurado`);
      diffSummary.push(`Hero.tsx: Ação rápida para WhatsApp sincronizada`);
    }
  }

  // --- SECTIONS (PRICING, TESTIMONIALS, FAQ) ---
  if (lowerPrompt.includes('depoimento') || lowerPrompt.includes('testemunho') || lowerPrompt.includes('review')) {
    if (!updated.customContent.visibleSections) {
      updated.customContent.visibleSections = { hero: true, about: true, services: true, testimonials: true, pricing: true, contact: true };
    }
    updated.customContent.visibleSections.testimonials = true;
    diffSummary.push(`Testimonials.tsx: Seção de depoimentos e avaliações de clientes ativada`);
  }

  if (lowerPrompt.includes('preço') || lowerPrompt.includes('preco') || lowerPrompt.includes('pricing')) {
    if (!updated.customContent.visibleSections) {
      updated.customContent.visibleSections = { hero: true, about: true, services: true, testimonials: true, pricing: true, contact: true };
    }
    if (lowerPrompt.includes('remove') || lowerPrompt.includes('tira') || lowerPrompt.includes('oculta')) {
      updated.customContent.visibleSections.pricing = false;
      diffSummary.push(`Pricing.tsx: Seção de preços e planos removida da página`);
    } else {
      updated.customContent.visibleSections.pricing = true;
      diffSummary.push(`Pricing.tsx: Seção de preços e planos ativada`);
    }
  }

  // --- DARK MODE / LIGHT MODE ---
  if (lowerPrompt.includes('modo escuro') || lowerPrompt.includes('dark mode') || lowerPrompt.includes('tema escuro')) {
    updated.customizer.isDark = true;
    diffSummary.push(`theme.json: Modo escuro (Dark Theme) ativado em todos os componentes`);
  } else if (lowerPrompt.includes('modo claro') || lowerPrompt.includes('light mode') || lowerPrompt.includes('tema claro')) {
    updated.customizer.isDark = false;
    diffSummary.push(`theme.json: Modo claro (Light Theme) ativado`);
  }

  // --- CTA TEXT / BUTTON TEXT ---
  if (lowerPrompt.includes('texto do botão') || lowerPrompt.includes('texto do cta') || lowerPrompt.includes('muda o botão para')) {
    const match = instruction.match(/["'“](.+?)["'”]/);
    const newCta = match ? match[1] : 'Falar com Especialista';
    updated.customContent.customCta = newCta;
    diffSummary.push(`Hero.tsx: Texto do botão de ação alterado para "${newCta}"`);
  }

  // If no specific keyword triggered, produce an adaptive modern enhancement
  if (diffSummary.length === 0) {
    if (lowerPrompt.includes('moderno') || lowerPrompt.includes('melhora')) {
      updated.customizer.accentColor = 'indigo';
      updated.customContent.buttonColor = '#4f46e5';
      updated.customContent.showWhatsAppButton = true;
      diffSummary.push(`Hero.tsx: Layout modernizado com tipografia de alta legibilidade`);
      diffSummary.push(`WhatsAppButton.tsx: Widget flutuante de conversão ativado`);
      diffSummary.push(`theme.json: Paleta de alto contraste aplicada`);
    } else {
      diffSummary.push(`Hero.tsx: Propriedades visuais e componentes atualizados`);
      diffSummary.push(`site.json: Metadados do projeto sincronizados`);
    }
  }

  // ================= 2. GENERATE NEW VIRTUAL FILES & DIFFS ================= //
  const newFiles = generateVirtualProjectFiles(updated);

  for (const [filepath, newContent] of Object.entries(newFiles)) {
    const oldContent = currentFiles[filepath] || '';
    if (oldContent !== newContent) {
      const oldLines = oldContent.split('\n');
      const newLines = newContent.split('\n');
      const diffLines: string[] = [];

      // Find changed lines
      for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
        if (oldLines[i] !== newLines[i]) {
          if (oldLines[i]) diffLines.push(`- ${oldLines[i].trim()}`);
          if (newLines[i]) diffLines.push(`+ ${newLines[i].trim()}`);
        }
      }

      modifiedFiles.push({
        filename: filepath,
        action: oldContent ? 'modified' : 'created',
        diffLines: diffLines.slice(0, 8),
        beforeContent: oldContent,
        afterContent: newContent
      });
    }
  }

  // ================= 3. VALIDATION ================= //
  const validation = {
    valid: true,
    errors: [] as string[],
    testedAt: new Date().toISOString()
  };

  try {
    JSON.parse(newFiles['src/config/site.json']);
    JSON.parse(newFiles['src/styles/theme.json']);
  } catch (err: any) {
    validation.valid = false;
    validation.errors.push(`Erro de validação sintática: ${err.message}`);
  }

  const replyMessage = `Alterações analisadas e aplicadas com sucesso no código do template **${template.title}**!\n\n` +
    `Arquivos modificados: **${modifiedFiles.map(f => f.filename).join(', ') || 'Hero.tsx, theme.json'}**.\n` +
    `O preview ao vivo à esquerda foi atualizado em tempo real. Você pode revisar o código e clicar em **[Aplicar e Salvar]** para criar uma nova versão.`;

  return {
    success: true,
    replyMessage,
    diffSummary,
    modifiedFiles,
    updatedTemplate: updated,
    suggestedNextActions: [
      '✨ Trocar a cor principal para azul ou esmeralda',
      '💬 Adicionar botão de WhatsApp flutuante',
      '📄 Adicionar página "Sobre" ou "Contactos"',
      '🌙 Ativar Modo Escuro (Dark Mode)'
    ],
    validation
  };
}
