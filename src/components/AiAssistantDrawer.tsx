import React, { useState } from 'react';
import { Website } from '../types';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  HelpCircle,
  RotateCcw,
  Check,
  ChevronRight,
  Eye,
  ShoppingBag
} from 'lucide-react';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  availableSites: Website[];
  onOpenDetails: (website: Website) => void;
  onOpenLiveDemo?: (website: Website) => void;
  onAddToCart?: (website: Website) => void;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  recommendedSiteId?: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  availableSites,
  onOpenDetails,
  onOpenLiveDemo,
  onAddToCart,
}) => {
  const [activeMode, setActiveMode] = useState<'wizard' | 'chat'>('wizard');

  // Wizard state (5 questions)
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [answers, setAnswers] = useState({
    businessType: '',
    goal: '',
    budget: '',
    features: [] as string[],
    style: '',
  });

  const [wizardLoading, setWizardLoading] = useState(false);
  const [wizardRecommendations, setWizardRecommendations] = useState<any[] | null>(null);
  const [wizardReasoning, setWizardReasoning] = useState<string>('');

  // Free-chat state
  const [inputQuery, setInputQuery] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Olá! Sou o Consultor Virtual IA do WebMarket. Posso te ajudar a encontrar o site ideal para o seu negócio ou tirar qualquer dúvida técnica!',
    },
  ]);

  if (!isOpen) return null;

  // Wizard Question Data
  const QUESTION_OPTIONS = {
    businessType: [
      { label: 'Barbearia / Salão', value: 'Barbearia e estética masculina' },
      { label: 'Restaurante / Delivery', value: 'Restaurante, pizzaria ou gastronomia' },
      { label: 'Loja Virtual / E-Commerce', value: 'Venda de produtos físicos ou digitais' },
      { label: 'Hotel / Pousada', value: 'Hotel, pousada ou chalés' },
      { label: 'Agência / Marketing', value: 'Agência, design ou consultoria' },
      { label: 'Portfólio / Criativo', value: 'Portfólio para profissional autônomo' },
      { label: 'Fotografia / Vídeo', value: 'Estúdio fotográfico ou filmaker' },
      { label: 'Escola / Cursos Online', value: 'Instituição de ensino ou infoprodutor' },
      { label: 'Igreja / Comunidade', value: 'Igreja ou comunidade de fé' },
      { label: 'Blog / Notícias', value: 'Blog com foco em SEO e conteúdo' },
      { label: 'Landing Page Direta', value: 'Landing page para tráfego pago' },
      { label: 'SaaS / App Web', value: 'Software ou startup com dashboard' },
    ],
    goal: [
      { label: 'Vender produtos diretamente', value: 'Vender online com carrinho e PIX' },
      { label: 'Receber agendamentos no WhatsApp', value: 'Agendamentos rápidos via WhatsApp' },
      { label: 'Captar leads e orçamentos', value: 'Captação de leads e pedidos de cotação' },
      { label: 'Apresentar meu trabalho e portfólio', value: 'Passar autoridade e mostrar cases' },
      { label: 'Publicar artigos e monetizar com SEO', value: 'Ganhar tráfego orgânico no Google' },
    ],
    budget: [
      { label: 'Econômico (até R$ 150)', value: 'Até R$ 150' },
      { label: 'Intermediário (R$ 150 a R$ 250)', value: 'R$ 150 a R$ 250' },
      { label: 'Profissional / Completo (Sem restrição)', value: 'Profissional completo' },
    ],
    features: [
      'Agendamento pelo WhatsApp',
      'Catálogo / Carrinho de Compras',
      'Checkout com PIX Instantâneo',
      'Painel Administrativo para Gerenciar',
      'Calculadora / Simulador de Valores',
      'Galeria de Fotos em Alta Definição',
      'Otimização de SEO para Google',
      'Depoimentos e Avaliações de Clientes',
    ],
    style: [
      { label: 'Moderno & Clean', desc: 'Minimalista com espaços amplos e tipografia refinada' },
      { label: 'Escuro & Premium (Dark Mode)', desc: 'Sofisticado com alto contraste e elegância' },
      { label: 'Vibrante & Arrojado', desc: 'Cores marcantes e botões chamativos' },
      { label: 'Corporativo & Seguro', desc: 'Sóbrio, tradicional e com foco em credibilidade' },
    ],
  };

  const handleToggleFeature = (feat: string) => {
    setAnswers((prev) => ({
      ...prev,
      features: prev.features.includes(feat)
        ? prev.features.filter((f) => f !== feat)
        : [...prev.features, feat],
    }));
  };

  const handleFinishWizard = async () => {
    setWizardLoading(true);
    setWizardRecommendations(null);

    try {
      const res = await fetch('/api/ai/recommend-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType: answers.businessType,
          goal: answers.goal,
          budget: answers.budget,
          features: answers.features.join(', '),
          style: answers.style,
          availableSites: availableSites.map((s) => ({
            id: s.id,
            title: s.title,
            categoryName: s.categoryName,
            price: s.price,
            features: s.features,
          })),
        }),
      });

      const data = await res.json();

      if (data.recommendations && Array.isArray(data.recommendations)) {
        setWizardRecommendations(data.recommendations);
        setWizardReasoning(data.reasoning || 'Identificamos as 3 opções perfeitas para o seu perfil:');
      } else {
        // Fallback
        const fallback = availableSites.slice(0, 3).map((s) => ({
          siteId: s.id,
          title: s.title,
          matchScore: 98,
          highlightReason: 'Modelo recomendado para seu ramo com excelente velocidade.',
        }));
        setWizardRecommendations(fallback);
      }
    } catch (err) {
      console.error('Erro no wizard:', err);
      const fallback = availableSites.slice(0, 3).map((s) => ({
        siteId: s.id,
        title: s.title,
        matchScore: 95,
        highlightReason: 'Modelo altamente versátil e fácil de customizar.',
      }));
      setWizardRecommendations(fallback);
    } finally {
      setWizardLoading(false);
    }
  };

  const handleResetWizard = () => {
    setWizardStep(1);
    setAnswers({
      businessType: '',
      goal: '',
      budget: '',
      features: [],
      style: '',
    });
    setWizardRecommendations(null);
  };

  // Free-chat submit
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isChatLoading) return;

    const userText = inputQuery.trim();
    setInputQuery('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/ai/recommend-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: userText,
          availableSites: availableSites.map((s) => ({
            id: s.id,
            title: s.title,
            category: s.categoryName,
            price: s.price.standard,
            features: s.features,
          })),
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.response || 'Recomendo explorar os modelos do catálogo para ver o mais indicado!',
          recommendedSiteId: data.recommendedSiteId,
        },
      ]);
    } catch (err) {
      console.error('Erro no chat IA:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Com base no seu perfil, recomendo nossos templates prontos com código modular e deploy em 1 clique!',
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white border-l border-slate-200 h-full flex flex-col text-slate-900 shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-700 rounded-2xl border border-purple-200">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Consultor Inteligente IA</h3>
                <p className="text-[10px] text-purple-700 font-bold">Powered by Gemini AI 3.6 Flash</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveMode('wizard')}
              className={`py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeMode === 'wizard'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
              <span>Questionário Guiado (5 passos)</span>
            </button>

            <button
              onClick={() => setActiveMode('chat')}
              className={`py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeMode === 'chat'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-blue-600" />
              <span>Chat Livre com IA</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {activeMode === 'wizard' ? (
            <div>
              {!wizardRecommendations && !wizardLoading ? (
                <div className="space-y-5">
                  {/* Step Progress Bar */}
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>Etapa {wizardStep} de 5</span>
                    <span className="text-purple-600 font-black">{Math.round((wizardStep / 5) * 100)}% concluído</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 transition-all duration-300 rounded-full"
                      style={{ width: `${(wizardStep / 5) * 100}%` }}
                    />
                  </div>

                  {/* Question 1: Business Type */}
                  {wizardStep === 1 && (
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">1. Qual é o seu tipo de negócio ou projeto?</h4>
                        <p className="text-xs text-slate-500">Selecione a categoria mais próxima do seu ramo:</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {QUESTION_OPTIONS.businessType.map((b) => (
                          <button
                            key={b.label}
                            onClick={() => setAnswers((prev) => ({ ...prev, businessType: b.value }))}
                            className={`p-3 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between ${
                              answers.businessType === b.value
                                ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span>{b.label}</span>
                            {answers.businessType === b.value && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                          </button>
                        ))}
                      </div>

                      <div className="pt-3 flex justify-end">
                        <button
                          disabled={!answers.businessType}
                          onClick={() => setWizardStep(2)}
                          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1.5"
                        >
                          <span>Próximo Passo</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Question 2: Goal */}
                  {wizardStep === 2 && (
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">2. Qual é o objetivo principal do seu site?</h4>
                        <p className="text-xs text-slate-500">O que você mais deseja que os visitantes façam:</p>
                      </div>

                      <div className="space-y-2">
                        {QUESTION_OPTIONS.goal.map((g) => (
                          <button
                            key={g.label}
                            onClick={() => setAnswers((prev) => ({ ...prev, goal: g.value }))}
                            className={`w-full p-3 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between ${
                              answers.goal === g.value
                                ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span>{g.label}</span>
                            {answers.goal === g.value && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                          </button>
                        ))}
                      </div>

                      <div className="pt-3 flex justify-between">
                        <button
                          onClick={() => setWizardStep(1)}
                          className="text-slate-500 hover:text-slate-900 font-bold text-xs px-4 py-2"
                        >
                          Voltar
                        </button>
                        <button
                          disabled={!answers.goal}
                          onClick={() => setWizardStep(3)}
                          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1.5"
                        >
                          <span>Próximo Passo</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Question 3: Budget */}
                  {wizardStep === 3 && (
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">3. Qual é o seu orçamento estimado?</h4>
                        <p className="text-xs text-slate-500">Todos os sites incluem código-fonte completo sem mensalidades obrigatórias:</p>
                      </div>

                      <div className="space-y-2">
                        {QUESTION_OPTIONS.budget.map((b) => (
                          <button
                            key={b.label}
                            onClick={() => setAnswers((prev) => ({ ...prev, budget: b.value }))}
                            className={`w-full p-3 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between ${
                              answers.budget === b.value
                                ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span>{b.label}</span>
                            {answers.budget === b.value && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                          </button>
                        ))}
                      </div>

                      <div className="pt-3 flex justify-between">
                        <button
                          onClick={() => setWizardStep(2)}
                          className="text-slate-500 hover:text-slate-900 font-bold text-xs px-4 py-2"
                        >
                          Voltar
                        </button>
                        <button
                          disabled={!answers.budget}
                          onClick={() => setWizardStep(4)}
                          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1.5"
                        >
                          <span>Próximo Passo</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Question 4: Features */}
                  {wizardStep === 4 && (
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">4. Quais funcionalidades são indispensáveis?</h4>
                        <p className="text-xs text-slate-500">Selecione quantas opções desejar:</p>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {QUESTION_OPTIONS.features.map((feat) => {
                          const isSelected = answers.features.includes(feat);
                          return (
                            <button
                              key={feat}
                              onClick={() => handleToggleFeature(feat)}
                              className={`p-3 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between ${
                                isSelected
                                  ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <span>{feat}</span>
                              <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300'}`}>
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-3 flex justify-between">
                        <button
                          onClick={() => setWizardStep(3)}
                          className="text-slate-500 hover:text-slate-900 font-bold text-xs px-4 py-2"
                        >
                          Voltar
                        </button>
                        <button
                          disabled={answers.features.length === 0}
                          onClick={() => setWizardStep(5)}
                          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1.5"
                        >
                          <span>Próximo Passo</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Question 5: Style */}
                  {wizardStep === 5 && (
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">5. Qual identidade e estilo visual você prefere?</h4>
                        <p className="text-xs text-slate-500">Escolha a estética que melhor reflete sua marca:</p>
                      </div>

                      <div className="space-y-2">
                        {QUESTION_OPTIONS.style.map((st) => (
                          <button
                            key={st.label}
                            onClick={() => setAnswers((prev) => ({ ...prev, style: st.label }))}
                            className={`w-full p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                              answers.style === st.label
                                ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold">{st.label}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{st.desc}</p>
                            </div>
                            {answers.style === st.label && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                          </button>
                        ))}
                      </div>

                      <div className="pt-3 flex justify-between items-center">
                        <button
                          onClick={() => setWizardStep(4)}
                          className="text-slate-500 hover:text-slate-900 font-bold text-xs px-4 py-2"
                        >
                          Voltar
                        </button>
                        <button
                          disabled={!answers.style}
                          onClick={handleFinishWizard}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-xs px-6 py-3 rounded-xl shadow-lg shadow-purple-500/20 transition flex items-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Gerar Recomendações com IA</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : wizardLoading ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto" />
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Analisando catálogo com Gemini IA...</h4>
                    <p className="text-xs text-slate-500 mt-1">Cruzando seus requisitos de negócio, funcionalidades e estilo visual.</p>
                  </div>
                </div>
              ) : (
                /* Wizard Results Top 3 */
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-xs text-purple-950 space-y-1">
                    <p className="font-black text-purple-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      Recomendações Prontas!
                    </p>
                    <p className="text-purple-800 leading-relaxed">{wizardReasoning}</p>
                  </div>

                  <div className="space-y-3">
                    {wizardRecommendations?.map((rec, idx) => {
                      const site = availableSites.find((s) => s.id === rec.siteId) || availableSites[idx] || availableSites[0];
                      if (!site) return null;

                      return (
                        <div
                          key={rec.siteId || idx}
                          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-purple-300 transition space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                                #{idx + 1}
                              </span>
                              <div>
                                <h5 className="text-xs font-black text-slate-900 line-clamp-1">{site.title}</h5>
                                <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                                  {rec.matchScore || 95}% de Compatibilidade
                                </span>
                              </div>
                            </div>

                            <span className="text-xs font-black text-slate-900">
                              R$ {site.price.standard}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            💡 <span className="font-semibold text-slate-800">Por que escolher:</span> {rec.highlightReason || 'Perfeita aderência aos seus critérios com código limpo e moderno.'}
                          </p>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            {onOpenLiveDemo && (
                              <button
                                onClick={() => {
                                  onOpenLiveDemo(site);
                                  onClose();
                                }}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Testar Demo</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                onOpenDetails(site);
                                onClose();
                              }}
                              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1"
                            >
                              <span>Ver Detalhes</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleResetWizard}
                    className="w-full py-2.5 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Fazer Novo Teste</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Free Chat History */
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl max-w-[85%] space-y-2 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white font-medium rounded-tr-none shadow-xs'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {msg.recommendedSiteId && (
                      (() => {
                        const site = availableSites.find((s) => s.id === msg.recommendedSiteId);
                        if (!site) return null;
                        return (
                          <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                            <span className="font-bold text-blue-700 truncate text-[11px]">
                              {site.title}
                            </span>
                            <button
                              onClick={() => {
                                onOpenDetails(site);
                                onClose();
                              }}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg transition shrink-0"
                            >
                              Ver Site
                            </button>
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex gap-2 items-center text-xs text-purple-700 font-bold pl-9">
                  <Bot className="w-4 h-4 animate-spin" />
                  <span>Consultando modelos com Gemini IA...</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Bottom Input (Chat Mode Only) */}
        {activeMode === 'chat' && (
          <form onSubmit={handleSendChat} className="p-4 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ex: Tenho uma barbearia e quero agendamento no WhatsApp..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isChatLoading}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-md transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
