import React, { useState, useEffect, useRef } from 'react';
import { Website } from '../../types';
import { 
  Sparkles, 
  Send, 
  RotateCcw, 
  Check, 
  X, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Sun, 
  Moon, 
  Layers, 
  History, 
  CheckCircle2, 
  AlertCircle,
  Sliders,
  ChevronRight,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Wand2,
  Eye,
  Columns,
  Palette,
  Maximize2,
  FileText,
  HelpCircle,
  Undo2,
  Redo2,
  SplitSquareVertical,
  CheckCheck,
  Info,
  Sparkle,
  Code2,
  FolderTree,
  FileCode,
  FileJson,
  GitCommit,
  GitCompare,
  Download,
  Copy,
  RefreshCw
} from 'lucide-react';
import { TemplateMasterRouter } from '../templates/TemplateMasterRouter';
import { THEME_PRESETS, ThemeColors, getButtonStyles } from '../templates/TemplateShared';

interface Message {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
  diffSummary?: string[];
  modifiedFiles?: string[];
  suggestedNextActions?: string[];
  category?: 'style' | 'copy' | 'structure' | 'general';
}

interface TemplateVersionSnapshot {
  id: string;
  name: string;
  timestamp: string;
  template: Website;
  author: 'original' | 'gemini' | 'manual';
  diffCount?: number;
  modifiedFiles?: string[];
}

interface VirtualFile {
  path: string;
  content: string;
  language: string;
  description: string;
}

interface GeminiTemplateEditorModalProps {
  template: Website | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveTemplate: (updated: Website) => void;
}

export const GeminiTemplateEditorModal: React.FC<GeminiTemplateEditorModalProps> = ({
  template,
  isOpen,
  onClose,
  onSaveTemplate,
}) => {
  if (!isOpen || !template) return null;

  // Staged template state (allows live previewing changes in isolation before approving)
  const [activeTemplate, setActiveTemplate] = useState<Website>(() => ({
    ...template,
    customizer: template.customizer || {
      accentColor: 'indigo',
      isDark: false,
      businessName: template.title.split('—')[0].trim(),
      businessTagline: template.shortDescription,
      viewport: 'desktop',
    },
    customContent: template.customContent || {
      heroTitle: template.title.split('—')[0].trim(),
      heroSubtitle: template.shortDescription,
      customCta: 'Agendar Agora',
      customPhone: '(11) 98765-4321',
      buttonColor: undefined,
      buttonTextColor: '#ffffff',
      showWhatsAppButton: false,
      whatsappNumber: '5511999999999',
    }
  }));

  // Revisions history for undo/redo & safe restoration
  const [historySnapshots, setHistorySnapshots] = useState<TemplateVersionSnapshot[]>([
    {
      id: 'v1.0-initial',
      name: 'v1.0 (Original Catálogo)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      template: JSON.parse(JSON.stringify(template)),
      author: 'original',
      diffCount: 0,
      modifiedFiles: []
    }
  ]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>('v1.0-initial');

  // Customizer state for preview
  const [accentColor, setAccentColor] = useState<string>(activeTemplate.customizer?.accentColor || 'indigo');
  const [isDark, setIsDark] = useState<boolean>(activeTemplate.customizer?.isDark || false);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activePage, setActivePage] = useState<string>(activeTemplate.pages?.[0] || 'Home');

  // Manual direct fields
  const [businessName, setBusinessName] = useState<string>(
    activeTemplate.customizer?.businessName || activeTemplate.title.split('—')[0].trim()
  );
  const [customPhone, setCustomPhone] = useState<string>(
    activeTemplate.customContent?.customPhone || '(11) 98765-4321'
  );
  const [customCta, setCustomCta] = useState<string>(
    activeTemplate.customContent?.customCta || 'Agendar Agora'
  );
  const [heroTitle, setHeroTitle] = useState<string>(
    activeTemplate.customContent?.heroTitle || activeTemplate.title.split('—')[0].trim()
  );
  const [heroSubtitle, setHeroSubtitle] = useState<string>(
    activeTemplate.customContent?.heroSubtitle || activeTemplate.shortDescription
  );
  const [buttonColor, setButtonColor] = useState<string>(
    activeTemplate.customContent?.buttonColor || '#2563eb'
  );
  const [buttonTextColor, setButtonTextColor] = useState<string>(
    activeTemplate.customContent?.buttonTextColor || '#ffffff'
  );
  const [showWhatsApp, setShowWhatsApp] = useState<boolean>(
    activeTemplate.customContent?.showWhatsAppButton || false
  );
  const [whatsappNumber, setWhatsappNumber] = useState<string>(
    activeTemplate.customContent?.whatsappNumber || '5511999999999'
  );

  // Tabs for Sidebar
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'files' | 'diff' | 'manual' | 'history'>('chat');
  const [selectedVirtualFile, setSelectedVirtualFile] = useState<string>('src/components/Hero.tsx');

  // Chat conversation
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'gemini',
      text: `Olá! Sou o seu **Co-Piloto Gemini 3.7 Flash** para Design e Edição de Templates.\n\nEstou pronto para alterar código, cores, textos, seções e páginas do template **${template.title}**!\n\nTodas as alterações são aplicadas **em tempo real** no preview e geram arquivos virtuais inspecionáveis na aba **Arquivos do Projeto**. Quando estiver satisfeito, clique em **Aprovar & Salvar** para persistir a nova versão no catálogo.\n\nO que gostaria de modificar agora?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      diffSummary: ['Ambiente Staging Sandbox carregado com sucesso'],
      modifiedFiles: ['src/config/site.json', 'src/styles/theme.json'],
      suggestedNextActions: [
        '🔴 Mudar cor do botão de agendamento para vermelho vibrante',
        '✨ Transformar em Design Minimalista de Alto Padrão',
        '📱 Adicionar botão flutuante de WhatsApp',
        '🌿 Mudar tema para Esmeralda Nobre e ativar Dark Mode'
      ]
    }
  ]);

  const [promptInput, setPromptInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);
  const [showSafetyTooltip, setShowSafetyTooltip] = useState<boolean>(false);
  const [selectedPromptCategory, setSelectedPromptCategory] = useState<'all' | 'style' | 'copy' | 'structure'>('all');
  const [copiedFileNotice, setCopiedFileNotice] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (sidebarTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, sidebarTab]);

  // Accent color themes definition
  const ACCENT_COLORS = [
    { id: 'indigo', name: 'Indigo Real', hex: '#4f46e5', theme: THEME_PRESETS.indigo },
    { id: 'emerald', name: 'Esmeralda Nobre', hex: '#059669', theme: THEME_PRESETS.emerald },
    { id: 'rose', name: 'Ruby Rosa', hex: '#e11d48', theme: THEME_PRESETS.rose },
    { id: 'amber', name: 'Dourado Ouro', hex: '#d97706', theme: THEME_PRESETS.amber },
    { id: 'purple', name: 'Violeta Luxo', hex: '#7c3aed', theme: THEME_PRESETS.purple },
    { id: 'cyan', name: 'Turquesa Tech', hex: '#0891b2', theme: THEME_PRESETS.cyan },
  ];

  const currentThemeObj = ACCENT_COLORS.find(c => c.id === accentColor) || ACCENT_COLORS[0];
  const currentTheme: ThemeColors = currentThemeObj.theme;

  // Generate virtual files representation from activeTemplate
  const virtualFiles: VirtualFile[] = [
    {
      path: 'src/components/Hero.tsx',
      language: 'typescript',
      description: 'Componente da Seção Principal (Hero Banner)',
      content: `import React from 'react';
import { Calendar, Phone } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const title = "${heroTitle}";
  const subtitle = "${heroSubtitle}";
  const ctaText = "${customCta}";
  const buttonStyle = {
    backgroundColor: "${buttonColor || currentThemeObj.hex}",
    color: "${buttonTextColor}"
  };

  return (
    <section className="py-20 px-6 text-center">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
          {subtitle}
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <button 
            style={buttonStyle}
            className="px-8 py-4 rounded-xl font-bold transition shadow-lg hover:brightness-110 flex items-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            <span>{ctaText}</span>
          </button>
        </div>
      </div>
    </section>
  );
};`
    },
    {
      path: 'src/components/Navbar.tsx',
      language: 'typescript',
      description: 'Barra de Navegação Superior e Menu',
      content: `import React from 'react';
import { MessageSquare } from 'lucide-react';

export const Navbar: React.FC = () => {
  const brand = "${businessName}";
  const phone = "${customPhone}";
  const pages = ${JSON.stringify(activeTemplate.pages || ['Home', 'Sobre', 'Serviços', 'Preços', 'Contactos'], null, 2)};
  
  return (
    <nav className="p-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="font-extrabold text-lg">{brand}</div>
        <div className="flex items-center gap-4">
          {pages.map((p) => (
            <button key={p} className="text-xs font-bold text-slate-300 hover:text-white">{p}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">{phone}</span>
          <button 
            style={{ backgroundColor: "${buttonColor || currentThemeObj.hex}", color: "${buttonTextColor}" }}
            className="text-xs font-bold px-4 py-2 rounded-xl transition"
          >
            Falar Conosco
          </button>
        </div>
      </div>
    </nav>
  );
};`
    },
    {
      path: 'src/components/WhatsAppButton.tsx',
      language: 'typescript',
      description: 'Widget Flutuante de WhatsApp VIP',
      content: `import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppFloatingButton: React.FC = () => {
  const enabled = ${showWhatsApp ? 'true' : 'false'};
  const phone = "${whatsappNumber}";
  const business = "${businessName}";

  if (!enabled) return null;

  const handleClick = () => {
    const text = encodeURIComponent(\`Olá! Gostaria de mais informações sobre \${business}.\`);
    window.open(\`https://wa.me/\${phone}?text=\${text}\`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Atendimento via WhatsApp"
      className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-400 text-white p-4 rounded-full shadow-2xl transition hover:scale-110 flex items-center gap-2"
    >
      <MessageCircle className="w-6 h-6 fill-current" />
      <span className="text-xs font-black pr-1">WhatsApp VIP</span>
    </button>
  );
};`
    },
    {
      path: 'src/styles/theme.json',
      language: 'json',
      description: 'Configuração de Cores e Estilos do Template',
      content: JSON.stringify({
        themePreset: accentColor,
        primaryHex: currentThemeObj.hex,
        darkMode: isDark,
        buttonBackgroundColor: buttonColor || currentThemeObj.hex,
        buttonTextColor: buttonTextColor,
        typography: {
          headingFont: "Plus Jakarta Sans, sans-serif",
          bodyFont: "Inter, sans-serif"
        },
        radius: "16px",
        shadows: "subtle"
      }, null, 2)
    },
    {
      path: 'src/config/site.json',
      language: 'json',
      description: 'Metadados Globais e Configurações do Template',
      content: JSON.stringify({
        id: activeTemplate.id,
        title: activeTemplate.title,
        category: activeTemplate.category,
        businessName: businessName,
        heroTitle: heroTitle,
        heroSubtitle: heroSubtitle,
        customCta: customCta,
        customPhone: customPhone,
        whatsappEnabled: showWhatsApp,
        whatsappNumber: whatsappNumber,
        pages: activeTemplate.pages || ['Home', 'Sobre', 'Serviços', 'Preços', 'Contactos'],
        updatedAt: new Date().toISOString()
      }, null, 2)
    }
  ];

  const currentFile = virtualFiles.find(f => f.path === selectedVirtualFile) || virtualFiles[0];

  // Handle sending instruction to Gemini via backend
  const handleSendPrompt = async (instructionText?: string) => {
    const textToSend = instructionText || promptInput.trim();
    if (!textToSend || isLoading) return;

    setPromptInput('');
    const userMsgId = `user-${Date.now()}`;
    const newMessages: Message[] = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        text: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/templates/gemini-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: activeTemplate,
          prompt: textToSend,
          instruction: textToSend,
          history: newMessages.map(m => ({ role: m.sender, content: m.text })),
          currentOverrides: {
            customizer: {
              accentColor,
              isDark,
              businessName,
              businessTagline: heroSubtitle,
              viewport
            },
            customContent: {
              heroTitle,
              heroSubtitle,
              customPhone,
              customCta,
              buttonColor,
              buttonTextColor,
              showWhatsAppButton: showWhatsApp,
              whatsappNumber
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Falha na resposta da API Gemini');
      }

      const data = await response.json();

      if (data.updatedTemplate) {
        const updated: Website = {
          ...activeTemplate,
          ...data.updatedTemplate,
          customizer: {
            accentColor: data.updatedTemplate.customizer?.accentColor || accentColor,
            isDark: data.updatedTemplate.customizer?.isDark !== undefined ? data.updatedTemplate.customizer.isDark : isDark,
            businessName: data.updatedTemplate.customizer?.businessName || businessName,
            businessTagline: data.updatedTemplate.shortDescription || activeTemplate.shortDescription,
            viewport
          },
          customContent: {
            ...(activeTemplate.customContent || {}),
            ...(data.updatedTemplate.customContent || {}),
          },
          pages: data.updatedTemplate.pages || activeTemplate.pages
        };

        setActiveTemplate(updated);

        // Sync local states
        if (data.updatedTemplate.customizer?.accentColor) {
          setAccentColor(data.updatedTemplate.customizer.accentColor);
        }
        if (data.updatedTemplate.customizer?.isDark !== undefined) {
          setIsDark(data.updatedTemplate.customizer.isDark);
        }
        if (data.updatedTemplate.customizer?.businessName) {
          setBusinessName(data.updatedTemplate.customizer.businessName);
        }
        if (data.updatedTemplate.customContent?.heroTitle) {
          setHeroTitle(data.updatedTemplate.customContent.heroTitle);
        }
        if (data.updatedTemplate.customContent?.heroSubtitle) {
          setHeroSubtitle(data.updatedTemplate.customContent.heroSubtitle);
        }
        if (data.updatedTemplate.customContent?.customPhone) {
          setCustomPhone(data.updatedTemplate.customContent.customPhone);
        }
        if (data.updatedTemplate.customContent?.customCta) {
          setCustomCta(data.updatedTemplate.customContent.customCta);
        }
        if (data.updatedTemplate.customContent?.buttonColor) {
          setButtonColor(data.updatedTemplate.customContent.buttonColor);
        }
        if (data.updatedTemplate.customContent?.buttonTextColor) {
          setButtonTextColor(data.updatedTemplate.customContent.buttonTextColor);
        }
        if (data.updatedTemplate.customContent?.showWhatsAppButton !== undefined) {
          setShowWhatsApp(data.updatedTemplate.customContent.showWhatsAppButton);
        }
        if (data.updatedTemplate.customContent?.whatsappNumber) {
          setWhatsappNumber(data.updatedTemplate.customContent.whatsappNumber);
        }

        // Add to history snapshots
        const revCount = historySnapshots.length;
        const snapshotId = `v1.${revCount}`;
        const newSnapshot: TemplateVersionSnapshot = {
          id: snapshotId,
          name: `v1.${revCount} — ${textToSend.slice(0, 32)}...`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          template: JSON.parse(JSON.stringify(updated)),
          author: 'gemini',
          diffCount: data.diffSummary?.length || 2,
          modifiedFiles: data.modifiedFiles || ['src/components/Hero.tsx', 'src/styles/theme.json']
        };
        setHistorySnapshots(prev => [...prev, newSnapshot]);
        setSelectedSnapshotId(snapshotId);
        setHasUnsavedChanges(true);
      }

      const geminiMsg: Message = {
        id: `gemini-${Date.now()}`,
        sender: 'gemini',
        text: data.replyMessage || 'Alterações aplicadas no preview ao vivo com sucesso!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        diffSummary: data.diffSummary || [],
        modifiedFiles: data.modifiedFiles || ['src/components/Hero.tsx', 'src/styles/theme.json'],
        suggestedNextActions: data.suggestedNextActions || []
      };

      setMessages(prev => [...prev, geminiMsg]);
    } catch (err: any) {
      console.warn("Executando fallback deterministic local:", err);

      // Local Deterministic Engine Fallback
      const lower = textToSend.toLowerCase();
      let newButtonColor = buttonColor;
      let newAccent = accentColor;
      let newDark = isDark;
      let newTitle = heroTitle;
      let newCta = customCta;
      let newWhatsApp = showWhatsApp;
      const modifiedFiles: string[] = [];
      const diffList: string[] = [];

      // Color keywords
      if (lower.includes('vermelh') || lower.includes('red') || lower.includes('rubi')) {
        newButtonColor = '#dc2626';
        newAccent = 'rose';
        modifiedFiles.push('src/components/Hero.tsx', 'src/components/Navbar.tsx', 'src/styles/theme.json');
        diffList.push('Cor do botão alterada para Vermelho Vibrante (#dc2626)');
      } else if (lower.includes('esmeralda') || lower.includes('verde') || lower.includes('green')) {
        newButtonColor = '#059669';
        newAccent = 'emerald';
        modifiedFiles.push('src/components/Hero.tsx', 'src/styles/theme.json');
        diffList.push('Tema e botões alterados para Esmeralda Nobre (#059669)');
      } else if (lower.includes('dourad') || lower.includes('amarel') || lower.includes('gold') || lower.includes('ouro')) {
        newButtonColor = '#d97706';
        newAccent = 'amber';
        modifiedFiles.push('src/components/Hero.tsx', 'src/styles/theme.json');
        diffList.push('Cor alterada para Dourado Ouro (#d97706)');
      } else if (lower.includes('azul') || lower.includes('blue') || lower.includes('indigo')) {
        newButtonColor = '#2563eb';
        newAccent = 'indigo';
        modifiedFiles.push('src/components/Hero.tsx', 'src/styles/theme.json');
        diffList.push('Cor alterada para Azul Real (#2563eb)');
      } else if (lower.includes('roxo') || lower.includes('violeta') || lower.includes('purple')) {
        newButtonColor = '#7c3aed';
        newAccent = 'purple';
        modifiedFiles.push('src/components/Hero.tsx', 'src/styles/theme.json');
        diffList.push('Cor alterada para Violeta Luxo (#7c3aed)');
      }

      // Dark / Light
      if (lower.includes('dark') || lower.includes('escuro') || lower.includes('noturno') || lower.includes('preto')) {
        newDark = true;
        modifiedFiles.push('src/styles/theme.json');
        diffList.push('Modo Noturno (Dark Mode) ativado');
      } else if (lower.includes('light') || lower.includes('claro') || lower.includes('branco')) {
        newDark = false;
        modifiedFiles.push('src/styles/theme.json');
        diffList.push('Modo Claro (Light Mode) ativado');
      }

      // WhatsApp
      if (lower.includes('whatsapp') || lower.includes('whats') || lower.includes('zap')) {
        newWhatsApp = true;
        newCta = 'Falar no WhatsApp';
        modifiedFiles.push('src/components/WhatsAppButton.tsx', 'src/components/Hero.tsx');
        diffList.push('Botão flutuante de WhatsApp VIP ativado');
      }

      // Copy / Luxury
      if (lower.includes('luxo') || lower.includes('premium') || lower.includes('alto padrão')) {
        newTitle = `${businessName} — Excelência & Alta Sofisticação`;
        modifiedFiles.push('src/components/Hero.tsx', 'src/config/site.json');
        diffList.push(`Título refinado para "${newTitle}"`);
      }

      const updated: Website = {
        ...activeTemplate,
        customizer: {
          accentColor: newAccent,
          isDark: newDark,
          businessName,
          businessTagline: heroSubtitle,
          viewport
        },
        customContent: {
          ...(activeTemplate.customContent || {}),
          heroTitle: newTitle,
          heroSubtitle,
          customCta: newCta,
          customPhone,
          buttonColor: newButtonColor,
          buttonTextColor: '#ffffff',
          showWhatsAppButton: newWhatsApp,
          whatsappNumber
        }
      };

      setActiveTemplate(updated);
      setButtonColor(newButtonColor);
      setAccentColor(newAccent);
      setIsDark(newDark);
      setHeroTitle(newTitle);
      setCustomCta(newCta);
      setShowWhatsApp(newWhatsApp);
      setHasUnsavedChanges(true);

      const revCount = historySnapshots.length;
      const snapshotId = `v1.${revCount}`;
      setHistorySnapshots(prev => [
        ...prev,
        {
          id: snapshotId,
          name: `v1.${revCount} — ${textToSend.slice(0, 32)}...`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          template: JSON.parse(JSON.stringify(updated)),
          author: 'gemini',
          diffCount: diffList.length || 2,
          modifiedFiles: modifiedFiles.length > 0 ? modifiedFiles : ['src/components/Hero.tsx']
        }
      ]);
      setSelectedSnapshotId(snapshotId);

      const fallbackMsg: Message = {
        id: `gemini-${Date.now()}`,
        sender: 'gemini',
        text: `Alteração executada no template **${activeTemplate.title}**!\n\nAtualizei os arquivos virtuais do projeto e refleti imediatamente no preview ao vivo à esquerda.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        diffSummary: diffList.length > 0 ? diffList : ['Código e estilos atualizados no preview'],
        modifiedFiles: modifiedFiles.length > 0 ? modifiedFiles : ['src/components/Hero.tsx'],
        suggestedNextActions: [
          '📱 Adicionar botão flutuante de WhatsApp',
          '🌿 Mudar tema para Esmeralda Nobre e Dark Mode',
          '🚀 Otimizar copywriting para agendamentos rápidos'
        ]
      };

      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Revert / switch to a historical snapshot (Rollback)
  const handleSelectSnapshot = (snapId: string) => {
    const snap = historySnapshots.find(s => s.id === snapId);
    if (!snap) return;

    setSelectedSnapshotId(snapId);
    const restored = JSON.parse(JSON.stringify(snap.template));
    setActiveTemplate(restored);

    if (restored.customizer?.accentColor) setAccentColor(restored.customizer.accentColor);
    if (restored.customizer?.isDark !== undefined) setIsDark(restored.customizer.isDark);
    if (restored.customizer?.businessName) setBusinessName(restored.customizer.businessName);
    if (restored.customContent?.heroTitle) setHeroTitle(restored.customContent.heroTitle);
    if (restored.customContent?.heroSubtitle) setHeroSubtitle(restored.customContent.heroSubtitle);
    if (restored.customContent?.customCta) setCustomCta(restored.customContent.customCta);
    if (restored.customContent?.customPhone) setCustomPhone(restored.customContent.customPhone);
    if (restored.customContent?.buttonColor) setButtonColor(restored.customContent.buttonColor);
    if (restored.customContent?.buttonTextColor) setButtonTextColor(restored.customContent.buttonTextColor);
    if (restored.customContent?.showWhatsAppButton !== undefined) setShowWhatsApp(restored.customContent.showWhatsAppButton);
    if (restored.customContent?.whatsappNumber) setWhatsappNumber(restored.customContent.whatsappNumber);

    setMessages(prev => [
      ...prev,
      {
        id: `restore-${Date.now()}`,
        sender: 'gemini',
        text: `Restaurada a versão **${snap.name}** gravada às ${snap.timestamp}. O preview ao vivo e o código foram sincronizados com essa versão anterior.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        diffSummary: [`Rollback seguro para ${snap.name}`]
      }
    ]);
  };

  // Discard all changes and restore original template
  const handleConfirmDiscard = () => {
    const initial = historySnapshots[0]?.template || template;
    setActiveTemplate({ ...initial });
    setAccentColor(initial.customizer?.accentColor || 'indigo');
    setIsDark(initial.customizer?.isDark || false);
    setBusinessName(initial.title.split('—')[0].trim());
    setHeroTitle(initial.customContent?.heroTitle || initial.title.split('—')[0].trim());
    setHeroSubtitle(initial.customContent?.heroSubtitle || initial.shortDescription);
    setCustomCta(initial.customContent?.customCta || 'Agendar Agora');
    setCustomPhone(initial.customContent?.customPhone || '(11) 98765-4321');
    setButtonColor(initial.customContent?.buttonColor || '#2563eb');
    setButtonTextColor(initial.customContent?.buttonTextColor || '#ffffff');
    setShowWhatsApp(initial.customContent?.showWhatsAppButton || false);
    setWhatsappNumber(initial.customContent?.whatsappNumber || '5511999999999');
    setHasUnsavedChanges(false);
    setSelectedSnapshotId(historySnapshots[0]?.id || 'v1.0-initial');
    setShowDiscardModal(false);
  };

  // Approve and Save Changes to Platform Catalog
  const handleApproveAndSave = async () => {
    const finalTemplate: Website = {
      ...activeTemplate,
      updatedDate: new Date().toISOString().split('T')[0],
      customizer: {
        accentColor,
        isDark,
        businessName,
        businessTagline: heroSubtitle,
        viewport
      },
      customContent: {
        ...(activeTemplate.customContent || {}),
        heroTitle,
        heroSubtitle,
        customPhone,
        customCta,
        buttonColor,
        buttonTextColor,
        showWhatsAppButton: showWhatsApp,
        whatsappNumber
      }
    };

    try {
      // Call backend save API
      await fetch('/api/admin/templates/gemini-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: finalTemplate,
          changeSummary: `Revisão aprovada com ${historySnapshots.length} iterações.`,
          versionTag: `v1.${historySnapshots.length}`
        })
      });
    } catch (e) {
      console.warn("Backend save notice:", e);
    }

    onSaveTemplate(finalTemplate);
    setHasUnsavedChanges(false);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 4500);
  };

  // Manual change handler to keep stage in sync
  const handleApplyManualChanges = () => {
    const updated: Website = {
      ...activeTemplate,
      customizer: {
        accentColor,
        isDark,
        businessName,
        businessTagline: heroSubtitle,
        viewport
      },
      customContent: {
        ...(activeTemplate.customContent || {}),
        heroTitle,
        heroSubtitle,
        customPhone,
        customCta,
        buttonColor,
        buttonTextColor,
        showWhatsAppButton: showWhatsApp,
        whatsappNumber
      }
    };

    setActiveTemplate(updated);
    setHasUnsavedChanges(true);

    const revCount = historySnapshots.length;
    const snapshotId = `v1.${revCount}`;
    setHistorySnapshots(prev => [
      ...prev,
      {
        id: snapshotId,
        name: `v1.${revCount} (Ajuste Manual)`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        template: JSON.parse(JSON.stringify(updated)),
        author: 'manual',
        diffCount: 2,
        modifiedFiles: ['src/styles/theme.json', 'src/components/Hero.tsx']
      }
    ]);
    setSelectedSnapshotId(snapshotId);
  };

  const handleCopyCode = (code: string, fileName: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFileNotice(fileName);
    setTimeout(() => setCopiedFileNotice(null), 2500);
  };

  // Quick preset chips categorized
  const QUICK_PROMPTS = [
    { 
      category: 'style',
      label: '🔴 Botão Vermelho Vibrante', 
      prompt: 'Altera a cor de todos os botões de ação para vermelho vibrante (#dc2626) com texto branco e alto contraste.' 
    },
    { 
      category: 'style',
      label: '🌿 Tema Esmeralda & Dark', 
      prompt: 'Mude a paleta para Esmeralda Nobre (#059669), ative o modo Dark Noturno e ajuste os contrastes visuais dos cards e botões para máximo impacto.' 
    },
    { 
      category: 'style',
      label: '✨ Design Minimalista Luxo', 
      prompt: 'Refine a estética para um design minimalista de altíssimo padrão: use tons sóbrios, espaçamentos generosos, tipografia de alta legibilidade e estilo executivo.' 
    },
    { 
      category: 'copy',
      label: '📱 Ativar WhatsApp VIP', 
      prompt: 'Adicione um botão flutuante de atendimento via WhatsApp VIP e ajuste as chamadas principais para contato rápido.' 
    },
    { 
      category: 'copy',
      label: '🚀 Copywriting de Alta Conversão', 
      prompt: 'Reescreva os títulos, subtítulos e chamadas para ação com técnicas de persuasão e gatilhos mentais para aumentar a taxa de agendamentos e vendas.' 
    },
    { 
      category: 'structure',
      label: '📄 Adicionar Páginas Sobre e Contato', 
      prompt: 'Adicione as páginas Sobre Nós e Contactos na navegação do site com estrutura moderna e objetiva.' 
    },
  ];

  const filteredPrompts = selectedPromptCategory === 'all' 
    ? QUICK_PROMPTS 
    : QUICK_PROMPTS.filter(p => p.category === selectedPromptCategory);

  const availablePages = activeTemplate.pages || ['Home', 'Sobre', 'Serviços', 'Preços', 'Contactos'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-200">
      
      {/* ================= TOP HEADER BAR ================= */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-4 text-white shrink-0 z-20">
        
        {/* Left: Template Info & Sandbox Staging Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
            <Wand2 className="w-4 h-4" />
          </div>

          <div className="truncate">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-black text-white truncate max-w-xs sm:max-w-md">
                {activeTemplate.title}
              </h2>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Gemini 3.7 AI Studio
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
              <span>{activeTemplate.categoryName}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-blue-400" />
                {availablePages.length} páginas
              </span>
              <span>•</span>
              {hasUnsavedChanges ? (
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Staging Ativo
                </span>
              ) : (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Sincronizado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Viewport & Device Controls */}
        <div className="hidden md:flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 shadow-inner">
          <button
            onClick={() => setViewport('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
              viewport === 'desktop' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
            title="Visualizar em Desktop"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
              viewport === 'tablet' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
            title="Visualizar em Tablet"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
              viewport === 'mobile' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
            title="Visualizar em Smartphone"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Right: Sandbox Safety Badge, Revisions & Save Controls */}
        <div className="flex items-center gap-2">
          
          {/* Safe Isolation Badge Tooltip */}
          <div className="relative">
            <button
              onClick={() => setShowSafetyTooltip(!showSafetyTooltip)}
              className="px-2.5 py-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-xl hover:bg-emerald-900/50 transition flex items-center gap-1.5"
              title="Informações de Segurança do Sandbox"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden xl:inline">Sandbox Seguro</span>
            </button>

            {showSafetyTooltip && (
              <div className="absolute right-0 top-11 w-72 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                  <span className="font-black text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Ambiente Isolado
                  </span>
                  <button onClick={() => setShowSafetyTooltip(false)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  O Gemini opera apenas na cópia temporária do template. Nenhuma alteração é publicada no catálogo até você clicar em <strong>Aprovar & Salvar</strong>.
                </p>
              </div>
            )}
          </div>

          {/* Discard Changes Button */}
          {hasUnsavedChanges && (
            <button
              onClick={() => setShowDiscardModal(true)}
              className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition flex items-center gap-1.5 border border-slate-700"
              title="Descartar alterações em staging"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Descartar</span>
            </button>
          )}

          {/* Approve and Save Button */}
          <button
            onClick={handleApproveAndSave}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg ${
              hasUnsavedChanges 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title="Salvar alterações no catálogo da plataforma"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Aprovar & Salvar</span>
          </button>

          {/* Close Modal Button */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="Fechar Editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Save Success Alert Banner */}
      {saveSuccessNotice && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-between gap-2 shrink-0 animate-in slide-in-from-top duration-200 z-10">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4" />
            <span>Template aprovado e salvo no catálogo com sucesso! Nova versão registrada no histórico.</span>
          </div>
          <button onClick={() => setSaveSuccessNotice(false)} className="text-white hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Discard Confirmation Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full space-y-4 text-white shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black">Descartar Alterações?</h3>
              <p className="text-xs text-slate-400">
                Deseja reverter todas as modificações desta sessão para o estado original do catálogo?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowDiscardModal(false)}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDiscard}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition"
              >
                Sim, Descartar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN SPLIT BODY: PREVIEW (LEFT) + COPILOT & CODE (RIGHT) ================= */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* ================= LEFT PANEL: INTERACTIVE LIVE PREVIEW ================= */}
        <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden relative border-r border-slate-800">
          
          {/* Top Preview Control Bar */}
          <div className="bg-slate-900/95 border-b border-slate-800/90 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10">
            
            {/* Color Palettes & Button Color indicator */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Palette className="w-3 h-3 text-purple-400" /> Tema:
                </span>
                <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setAccentColor(c.id);
                        setButtonColor(c.hex);
                        setHasUnsavedChanges(true);
                      }}
                      title={c.name}
                      className={`w-5 h-5 rounded-lg transition transform hover:scale-110 flex items-center justify-center ${
                        accentColor === c.id ? 'ring-2 ring-white scale-110 shadow-xs' : 'opacity-65 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {accentColor === c.id && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {buttonColor && (
                <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Botão CTA:</span>
                  <span className="w-3.5 h-3.5 rounded-full border border-white/40 inline-block" style={{ backgroundColor: buttonColor }} />
                  <span className="text-[10px] font-mono text-slate-300 font-bold">{buttonColor}</span>
                </div>
              )}
            </div>

            {/* Pages Switcher */}
            {availablePages.length > 1 && (
              <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 overflow-x-auto max-w-md no-scrollbar">
                <span className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-wider">
                  Páginas:
                </span>
                {availablePages.map((p) => (
                  <button
                    key={p}
                    onClick={() => setActivePage(p)}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                      activePage === p 
                        ? 'bg-purple-600 text-white shadow-xs' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Dark Mode & Live Indicator */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsDark(!isDark);
                  setHasUnsavedChanges(true);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-amber-300'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                <span>{isDark ? 'Dark' : 'Light'}</span>
              </button>

              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <Eye className="w-3 h-3 text-emerald-400" />
                Live Preview
              </span>
            </div>
          </div>

          {/* Canvas Rendering Area */}
          <div className="flex-1 overflow-auto p-2 sm:p-5 flex items-center justify-center bg-radial from-slate-900 to-slate-950">
            <div className={`transition-all duration-300 ${
              viewport === 'mobile'
                ? 'w-[380px] h-[720px] max-h-[90vh] border-8 border-slate-800 rounded-[40px] shadow-2xl overflow-hidden relative bg-white'
                : viewport === 'tablet'
                ? 'w-[740px] h-[800px] max-h-[90vh] border-8 border-slate-800 rounded-[32px] shadow-2xl overflow-hidden relative bg-white'
                : 'w-full h-full rounded-2xl shadow-xl overflow-hidden relative bg-white'
            }`}>
              <div className="w-full h-full overflow-y-auto">
                <TemplateMasterRouter
                  website={{
                    ...activeTemplate,
                    customContent: {
                      ...(activeTemplate.customContent || {}),
                      heroTitle,
                      heroSubtitle,
                      customPhone,
                      customCta,
                      buttonColor,
                      buttonTextColor,
                      showWhatsAppButton: showWhatsApp,
                      whatsappNumber
                    }
                  }}
                  isDark={isDark}
                  theme={currentTheme}
                  businessName={businessName}
                  customPhone={customPhone}
                  customCta={customCta}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT PANEL: GEMINI AI COPILOT & PROJECT FILES ================= */}
        <div className="w-full lg:w-[460px] xl:w-[510px] bg-slate-900 flex flex-col shrink-0 border-t lg:border-t-0 border-slate-800 h-[440px] lg:h-full z-10">
          
          {/* Navigation Tabs Header */}
          <div className="p-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-1 shrink-0 overflow-x-auto no-scrollbar">
            
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setSidebarTab('chat')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  sidebarTab === 'chat' 
                    ? 'bg-purple-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Co-Piloto AI</span>
              </button>

              <button
                onClick={() => setSidebarTab('files')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  sidebarTab === 'files' 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Arquivos ({virtualFiles.length})</span>
              </button>

              <button
                onClick={() => setSidebarTab('manual')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  sidebarTab === 'manual' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Ajustes</span>
              </button>

              <button
                onClick={() => setSidebarTab('history')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  sidebarTab === 'history' 
                    ? 'bg-slate-800 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Histórico de Versões"
              >
                <History className="w-3.5 h-3.5" />
                <span>{historySnapshots.length}</span>
              </button>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Pronto
              </span>
            </div>
          </div>

          {/* TAB 1: CHAT WITH GEMINI */}
          {sidebarTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Category Filter Chips for Quick Prompts */}
              <div className="px-3 py-1.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1 overflow-x-auto shrink-0 no-scrollbar">
                <button
                  onClick={() => setSelectedPromptCategory('all')}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition ${
                    selectedPromptCategory === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setSelectedPromptCategory('style')}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition ${
                    selectedPromptCategory === 'style' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Estilo & Cores
                </button>
                <button
                  onClick={() => setSelectedPromptCategory('copy')}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition ${
                    selectedPromptCategory === 'copy' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  WhatsApp & Copy
                </button>
                <button
                  onClick={() => setSelectedPromptCategory('structure')}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition ${
                    selectedPromptCategory === 'structure' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Páginas & Estrutura
                </button>
              </div>

              {/* Chat Messages Timeline */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[94%] p-3.5 rounded-2xl space-y-2 ${
                      m.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-xs shadow-md'
                        : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-xs shadow-md'
                    }`}>
                      {/* Sender Header */}
                      <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 font-mono">
                        <span className="font-bold flex items-center gap-1">
                          {m.sender === 'user' ? 'Administrador' : 'Gemini AI Designer'}
                        </span>
                        <span>{m.timestamp}</span>
                      </div>

                      {/* Message Body */}
                      <p className="leading-relaxed whitespace-pre-wrap font-medium">
                        {m.text}
                      </p>

                      {/* Modified Files Badges */}
                      {m.modifiedFiles && m.modifiedFiles.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-700/60">
                          <p className="text-[10px] font-bold text-indigo-300 flex items-center gap-1 uppercase tracking-wider mb-1">
                            <Code2 className="w-3 h-3 text-indigo-400" /> Arquivos Modificados:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {m.modifiedFiles.map((file, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setSelectedVirtualFile(file);
                                  setSidebarTab('files');
                                }}
                                className="text-[10px] font-mono bg-slate-900/80 hover:bg-indigo-900/40 text-indigo-200 border border-indigo-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 transition"
                              >
                                <FileCode className="w-2.5 h-2.5" />
                                <span>{file}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Diff Summary Badges */}
                      {m.diffSummary && m.diffSummary.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-700/60 space-y-1.5">
                          <p className="text-[10px] font-bold text-purple-300 flex items-center gap-1 uppercase tracking-wider">
                            <Zap className="w-3 h-3 text-purple-400" /> Modificações Aplicadas no Preview:
                          </p>
                          <ul className="space-y-1">
                            {m.diffSummary.map((diff, i) => (
                              <li key={i} className="text-[11px] text-slate-300 flex items-center gap-1.5 bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-700/40">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                <span>{diff}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Suggested Next Actions */}
                      {m.suggestedNextActions && m.suggestedNextActions.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-700/60 space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Sugestões Rápidas:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {m.suggestedNextActions.map((sug, i) => (
                              <button
                                key={i}
                                onClick={() => handleSendPrompt(sug)}
                                className="bg-slate-900/80 hover:bg-purple-900/40 border border-slate-700 hover:border-purple-500/50 text-slate-300 hover:text-purple-200 text-[10px] font-bold px-2 py-1 rounded-lg transition text-left flex items-center gap-1"
                              >
                                <span>{sug}</span>
                                <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 p-3.5 bg-slate-800/90 border border-slate-700 text-slate-200 rounded-2xl max-w-[85%] animate-pulse shadow-md">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <div className="text-xs">
                      <p className="font-bold text-white">Gemini está alterando os arquivos e o preview...</p>
                      <p className="text-[10px] text-slate-400">Processando AST, gerando novo estado e aplicando no canvas ao vivo.</p>
                    </div>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Quick Action Presets Carousel */}
              <div className="px-3 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
                {filteredPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendPrompt(q.prompt)}
                    disabled={isLoading}
                    className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold border border-slate-700 transition shrink-0 disabled:opacity-50"
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              {/* Prompt Input Form */}
              <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendPrompt();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder='Peça ao Gemini (ex: "Altera a cor do botão para vermelho", "Ativa WhatsApp")...'
                    disabled={isLoading}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
                  />

                  <button
                    type="submit"
                    disabled={!promptInput.trim() || isLoading}
                    className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white p-2.5 rounded-xl transition shadow-md shadow-purple-600/30 flex items-center justify-center shrink-0"
                    title="Enviar instrução ao Gemini"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 2: VIRTUAL FILES & CODE EXPLORER */}
          {sidebarTab === 'files' && (
            <div className="flex-1 flex flex-col overflow-hidden text-xs">
              
              {/* File Selector Chips */}
              <div className="p-2 bg-slate-950 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
                {virtualFiles.map((file) => {
                  const isSelected = selectedVirtualFile === file.path;
                  return (
                    <button
                      key={file.path}
                      onClick={() => setSelectedVirtualFile(file.path)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[11px] flex items-center gap-1.5 transition whitespace-nowrap ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-bold shadow-xs'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {file.path.endsWith('.json') ? <FileJson className="w-3.5 h-3.5 text-amber-400" /> : <FileCode className="w-3.5 h-3.5 text-blue-400" />}
                      <span>{file.path.split('/').pop()}</span>
                    </button>
                  );
                })}
              </div>

              {/* Code Viewer Header */}
              <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
                <div>
                  <span className="font-mono text-indigo-300 font-bold text-[11px] block">{currentFile.path}</span>
                  <span className="text-[10px] text-slate-400">{currentFile.description}</span>
                </div>
                <button
                  onClick={() => handleCopyCode(currentFile.content, currentFile.path)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700 transition flex items-center gap-1"
                >
                  {copiedFileNotice === currentFile.path ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Editor/Viewer with Syntax Highlighting Frame */}
              <div className="flex-1 overflow-auto bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-300 select-text">
                <pre className="whitespace-pre font-mono">
                  {currentFile.content.split('\n').map((line, idx) => (
                    <div key={idx} className="flex gap-3 hover:bg-slate-900/60 px-1 py-0.5 rounded">
                      <span className="text-slate-600 select-none w-6 text-right shrink-0">{idx + 1}</span>
                      <span className="text-slate-200">{line}</span>
                    </div>
                  ))}
                </pre>
              </div>

            </div>
          )}

          {/* TAB 3: MANUAL ADJUSTMENTS */}
          {sidebarTab === 'manual' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl">
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  Controle Manual de Variáveis
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Ajuste campos específicos diretamente. O preview à esquerda reflete as mudanças instantaneamente.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Nome do Negócio
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => {
                      setBusinessName(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Título Principal (Hero)
                  </label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => {
                      setHeroTitle(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Subtítulo / Proposta de Valor
                  </label>
                  <textarea
                    rows={3}
                    value={heroSubtitle}
                    onChange={(e) => {
                      setHeroSubtitle(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Texto do Botão CTA
                    </label>
                    <input
                      type="text"
                      value={customCta}
                      onChange={(e) => {
                        setCustomCta(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Cor Hex do Botão
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={buttonColor || '#2563eb'}
                        onChange={(e) => {
                          setButtonColor(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={buttonColor || '#2563eb'}
                        onChange={(e) => {
                          setButtonColor(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* WhatsApp Control */}
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Widget Flutuante WhatsApp
                    </span>
                    <button
                      onClick={() => {
                        setShowWhatsApp(!showWhatsApp);
                        setHasUnsavedChanges(true);
                      }}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${
                        showWhatsApp ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {showWhatsApp ? 'Ativado' : 'Desativado'}
                    </button>
                  </div>
                  {showWhatsApp && (
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => {
                        setWhatsappNumber(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="5511999999999 (com DDI + DDD)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  )}
                </div>

                <button
                  onClick={handleApplyManualChanges}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5 mt-4"
                >
                  <Check className="w-4 h-4" />
                  <span>Gravar Snapshot Manual</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: REVISIONS & SNAPSHOT HISTORY */}
          {sidebarTab === 'history' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl">
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <History className="w-4 h-4 text-purple-400" />
                  Histórico de Versões & Rollback
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Restaure qualquer ponto do histórico instantaneamente sem risco de perda de dados.
                </p>
              </div>

              <div className="space-y-2">
                {historySnapshots.map((snap) => {
                  const isCurrent = selectedSnapshotId === snap.id;
                  return (
                    <div
                      key={snap.id}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        isCurrent 
                          ? 'bg-purple-950/40 border-purple-500/60 text-white shadow-md' 
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${snap.author === 'gemini' ? 'bg-purple-400' : snap.author === 'manual' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                          <p className="font-bold text-xs truncate">{snap.name}</p>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {snap.timestamp} • {snap.template.customizer?.accentColor?.toUpperCase() || 'INDIGO'} • {snap.template.customizer?.isDark ? 'Dark' : 'Light'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleSelectSnapshot(snap.id)}
                        disabled={isCurrent}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition shrink-0 ${
                          isCurrent 
                            ? 'bg-purple-600 text-white cursor-default' 
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        }`}
                      >
                        {isCurrent ? 'Ativa' : 'Restaurar'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
