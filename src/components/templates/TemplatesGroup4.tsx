import React, { useState } from 'react';
import { 
  Newspaper, 
  Rocket, 
  Hammer, 
  PartyPopper, 
  Briefcase, 
  Search, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  ShieldCheck, 
  Star, 
  Send,
  Zap,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SharedPageProps, TemplateNav, TemplateFooter } from './TemplateShared';

/* =========================================================================
   TEMPLATE 16 — BLOG / REVISTA (6 Páginas)
   Home | Categorias | Artigo | Sobre | Autores | Contactos
   + Pesquisa, Categorias, Artigos Relacionados, Paginação
   ========================================================================= */
export const Template16BlogRevista: React.FC<SharedPageProps> = ({
  isDark,
  theme,
  businessName,
  businessTagline = 'Jornalismo Independente, Análises Profundas, Tendências e Inovação',
  customPhone,
  currentPage,
  onNavigate,
}) => {
  const pages = ['Home', 'Categorias', 'Artigo', 'Sobre', 'Autores', 'Contactos'];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState({
    title: 'O Impacto dos Novos Modelos de Inteligência Artificial no Mercado de Trabalho',
    category: 'Tecnologia',
    readTime: '6 min de leitura',
    author: 'Lucas Moreira',
    date: '18 de Agosto de 2026',
    img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80'
  });

  const articles = [
    { title: 'O Impacto dos Novos Modelos de Inteligência Artificial no Mercado de Trabalho', category: 'Tecnologia', readTime: '6 min', author: 'Lucas Moreira', img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80' },
    { title: 'Finanças Pessoais: Como Proteger Seus Investimentos em Cenários de Alta Volatilidade', category: 'Economia', readTime: '8 min', author: 'Mariana Prado', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80' },
    { title: 'Arquitetura Sustentável: Cidades Verdes e o Futuro da Mobilidade Urbana', category: 'Design', readTime: '5 min', author: 'Carlos Henrique', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80' },
  ];

  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-full ${bgMain} flex flex-col font-sans`}>
      <TemplateNav
        brandName={businessName}
        icon={<Newspaper className="w-4 h-4" />}
        pages={pages}
        currentPage={currentPage}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
        ctaText="Assinar Newsletter"
        onCtaClick={() => alert('Obrigado por assinar!')}
      />

      <main className="flex-1 py-8 px-6 max-w-5xl mx-auto w-full">
        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar artigos por tema, tecnologia, negócios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white"
          />
        </div>

        {currentPage === 'Home' && (
          <div className="space-y-8">
            <div className={`p-6 rounded-3xl border ${cardBg} cursor-pointer space-y-3 hover:border-blue-500 transition`} onClick={() => { setSelectedArticle(articles[0]); onNavigate('Artigo'); }}>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Destaque da Edição</span>
              <h2 className="text-2xl sm:text-3xl font-black">{articles[0].title}</h2>
              <p className="text-xs text-slate-500">Uma investigação aprofundada sobre a rápida transição tecnológica nas empresas.</p>
              <div className="flex gap-4 text-[11px] text-slate-400 pt-2">
                <span>Por {articles[0].author}</span>
                <span>•</span>
                <span>{articles[0].readTime} de leitura</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.slice(1).map((a, i) => (
                <div key={`t16-art-${i}-${a.title}`} className={`p-5 rounded-2xl border ${cardBg} space-y-2 cursor-pointer`} onClick={() => { setSelectedArticle(a); onNavigate('Artigo'); }}>
                  <span className="text-[10px] font-bold text-blue-600">{a.category}</span>
                  <h3 className="font-bold text-base">{a.title}</h3>
                  <p className="text-xs text-slate-400">{a.readTime} • {a.author}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'Categorias' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {['Tecnologia & IA', 'Negócios & Mercado', 'Design & UX', 'Cultura & Sociedade'].map((c, i) => (
              <div key={`t16-cat-${i}-${c}`} className={`p-6 rounded-2xl border ${cardBg} font-bold text-xs cursor-pointer`}>{c}</div>
            ))}
          </div>
        )}

        {currentPage === 'Artigo' && (
          <div className={`p-8 rounded-3xl border ${cardBg} space-y-6 max-w-3xl mx-auto`}>
            <span className="text-xs font-bold text-blue-600 uppercase">{selectedArticle.category}</span>
            <h1 className="text-2xl sm:text-3xl font-black">{selectedArticle.title}</h1>
            <p className="text-xs text-slate-400">Publicado por {selectedArticle.author}</p>
            <div className="text-xs leading-relaxed text-slate-600 space-y-4 font-normal">
              <p>O avanço contínuo das ferramentas digitais e o processamento de linguagem natural transformaram profundamente as rotinas produtivas em todo o mundo corporativo.</p>
              <p>Especialistas apontam que a adaptação ágil e o domínio de novas tecnologias são os principais diferenciais dos profissionais de alto rendimento.</p>
            </div>
          </div>
        )}

        {currentPage === 'Sobre' && (
          <div className="max-w-2xl mx-auto text-center space-y-4 text-xs text-slate-500">
            <h2 className="text-2xl font-black text-slate-900">Sobre o {businessName}</h2>
            <p>Portal de notícias independente dedicado a levar informação verificada e análises de mercado aos leitores.</p>
          </div>
        )}

        {currentPage === 'Autores' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {['Lucas Moreira (Editor de Tecnologia)', 'Mariana Prado (Colunista de Finanças)', 'Carlos Henrique (Crítico de Design)'].map((a, i) => (
              <div key={`t16-auth-${i}-${a}`} className={`p-6 rounded-2xl border ${cardBg} space-y-1`}>
                <h3 className="font-bold text-sm">{a}</h3>
                <p className="text-xs text-slate-400">Jornalista Sênior</p>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Contactos' && (
          <div className={`p-6 rounded-2xl border ${cardBg} max-w-md mx-auto text-center text-xs text-slate-500 space-y-2`}>
            <h3 className="font-bold text-sm text-slate-900">Redação & Parcerias</h3>
            <p>Email: redacao@{businessName.toLowerCase().replace(/\s+/g, '')}.com</p>
          </div>
        )}
      </main>

      <TemplateFooter
        brandName={businessName}
        tagline={businessTagline}
        pages={pages}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
      />
    </div>
  );
};

/* =========================================================================
   TEMPLATE 17 — STARTUP / TECNOLOGIA (8 Páginas)
   Home | Produto | Funcionalidades | Preços | Sobre | Equipa | Blog | Contactos
   ========================================================================= */
export const Template17StartupTech: React.FC<SharedPageProps> = ({
  isDark,
  theme,
  businessName,
  businessTagline = 'Plataforma em Nuvem para Automação Inteligente e Análise em Tempo Real',
  customPhone,
  currentPage,
  onNavigate,
}) => {
  const pages = ['Home', 'Produto', 'Funcionalidades', 'Preços', 'Sobre', 'Equipa', 'Blog', 'Contactos'];

  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-full ${bgMain} flex flex-col font-sans`}>
      <TemplateNav
        brandName={businessName}
        icon={<Rocket className="w-4 h-4" />}
        pages={pages}
        currentPage={currentPage}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
        ctaText="Teste Grátis 14 Dias"
        onCtaClick={() => alert('Cadastro iniciado!')}
      />

      <main className="flex-1 py-10 px-6 max-w-6xl mx-auto w-full">
        {currentPage === 'Home' && (
          <div className="space-y-8 text-center max-w-3xl mx-auto">
            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${theme.border} ${theme.text}`}>
              SaaS B2B Inteligente
            </span>
            <h1 className="text-4xl sm:text-6xl font-black">Acelere Seus Resultados com Automação Total</h1>
            <p className="text-xs sm:text-sm text-slate-500">{businessTagline}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => onNavigate('Preços')} className={`px-6 py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
                Ver Planos & Preços
              </button>
            </div>
          </div>
        )}

        {currentPage === 'Produto' && (
          <div className="space-y-6 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-black">Visão Geral do Produto</h2>
            <p className="text-xs text-slate-500">Dashboard intuitivo com métricas preditivas, relatórios automatizados e integrações com mais de 500 APIs.</p>
          </div>
        )}

        {currentPage === 'Funcionalidades' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-2`}>
              <h3 className="font-bold text-sm">Automação de Workflows</h3>
              <p className="text-xs text-slate-500">Crie regras de automação sem código em poucos minutos.</p>
            </div>
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-2`}>
              <h3 className="font-bold text-sm">IA Preditiva & Insights</h3>
              <p className="text-xs text-slate-500">Antecipe tendências de faturamento e comportamento de clientes.</p>
            </div>
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-2`}>
              <h3 className="font-bold text-sm">Segurança Enterprise</h3>
              <p className="text-xs text-slate-500">Criptografia de ponta a ponta e conformidade com a LGPD e GDPR.</p>
            </div>
          </div>
        )}

        {currentPage === 'Preços' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Starter (R$ 49/mês)', 'Pro (R$ 149/mês)', 'Enterprise (Custom)'].map((plan, i) => (
              <div key={`t17-plan-${i}-${plan}`} className={`p-6 rounded-2xl border ${cardBg} space-y-3 text-center`}>
                <h3 className="font-bold text-base">{plan}</h3>
                <button className={`w-full py-2 rounded-xl text-white font-bold text-xs ${theme.btn}`}>Assinar Plano</button>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Sobre' && (
          <div className="max-w-2xl mx-auto text-center space-y-4 text-xs text-slate-500">
            <h2 className="text-2xl font-black text-slate-900">Nossa Missão</h2>
            <p>Simplificar a tecnologia para que equipes cresçam com velocidade e eficiência.</p>
          </div>
        )}

        {currentPage === 'Equipa' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {['CEO & Fundador', 'CTO & Engenharia', 'Head de Produto'].map((r, i) => (
              <div key={`t17-team-${i}-${r}`} className={`p-6 rounded-2xl border ${cardBg} space-y-1`}>
                <h3 className="font-bold text-sm">Líder {i+1}</h3>
                <p className="text-xs text-slate-400">{r}</p>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Blog' && (
          <div className="space-y-4 max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-black">Blog de Tecnologia</h2>
            <p className="text-xs text-slate-500">Novidades sobre desenvolvimento de software, escalabilidade e arquitetura em nuvem.</p>
          </div>
        )}

        {currentPage === 'Contactos' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-md mx-auto text-center space-y-3`}>
            <h2 className="text-xl font-black">Fale com Nosso Time Comercial</h2>
            <p className="text-xs text-slate-500">Email: vendas@{businessName.toLowerCase().replace(/\s+/g, '')}.io</p>
          </div>
        )}
      </main>

      <TemplateFooter
        brandName={businessName}
        tagline={businessTagline}
        pages={pages}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
      />
    </div>
  );
};

/* =========================================================================
   TEMPLATE 18 — EMPRESA DE CONSTRUÇÃO (7 Páginas)
   Home | Serviços | Projetos | Projeto individual | Sobre | Equipa | Contactos
   ========================================================================= */
export const Template18Construcao: React.FC<SharedPageProps> = ({
  isDark,
  theme,
  businessName,
  businessTagline = 'Engenharia Civil, Construção de Alto Padrão e Reformas Corporativas',
  customPhone,
  currentPage,
  onNavigate,
}) => {
  const pages = ['Home', 'Serviços', 'Projetos', 'Projeto individual', 'Sobre', 'Equipa', 'Contactos'];

  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-full ${bgMain} flex flex-col font-sans`}>
      <TemplateNav
        brandName={businessName}
        icon={<Hammer className="w-4 h-4" />}
        pages={pages}
        currentPage={currentPage}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
        ctaText="Solicitar Orçamento"
        onCtaClick={() => onNavigate('Contactos')}
      />

      <main className="flex-1 py-10 px-6 max-w-6xl mx-auto w-full">
        {currentPage === 'Home' && (
          <div className="space-y-8 text-center max-w-3xl mx-auto">
            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${theme.border} ${theme.text}`}>
              Engenharia & Solidez
            </span>
            <h1 className="text-4xl sm:text-5xl font-black">Construindo Sonhos com Rigor Técnico</h1>
            <p className="text-xs sm:text-sm text-slate-500">{businessTagline}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => onNavigate('Projetos')} className={`px-6 py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
                Ver Obras Entregues
              </button>
            </div>
          </div>
        )}

        {currentPage === 'Serviços' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-2`}>
              <h3 className="font-bold text-base">Casas Residenciais de Luxo</h3>
              <p className="text-xs text-slate-500">Do projeto arquitetônico à entrega das chaves no prazo.</p>
            </div>
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-2`}>
              <h3 className="font-bold text-base">Edifícios Comerciais & Galpões</h3>
              <p className="text-xs text-slate-500">Estruturas pré-moldadas e acabamento de alto rendimento.</p>
            </div>
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-2`}>
              <h3 className="font-bold text-base">Reformas & Laudos Estruturais</h3>
              <p className="text-xs text-slate-500">Perícia técnica, reforço estrutural e retrofit corporativo.</p>
            </div>
          </div>
        )}

        {currentPage === 'Projetos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['Residência Alphaville 650m²', 'Edifício Horizon Corporate'].map((proj, i) => (
              <div key={`t18-proj-${i}-${proj}`} className={`p-6 rounded-2xl border ${cardBg} space-y-2 cursor-pointer`} onClick={() => onNavigate('Projeto individual')}>
                <h3 className="font-bold text-base">{proj}</h3>
                <p className="text-xs text-slate-400">Prazo de entrega: 14 meses • 100% no cronograma</p>
                <span className="text-xs font-bold text-blue-600">Ver Ficha da Obra →</span>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Projeto individual' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-2xl mx-auto space-y-4`}>
            <h2 className="text-2xl font-black">Residência Alphaville</h2>
            <p className="text-xs text-slate-500">Projeto completo com cálculo estrutural, automação residencial e sustentabilidade energética.</p>
          </div>
        )}

        {currentPage === 'Sobre' && (
          <div className="max-w-2xl mx-auto text-center space-y-4 text-xs text-slate-500">
            <h2 className="text-2xl font-black text-slate-900">Sobre a Construtora {businessName}</h2>
            <p>Mais de 50 obras entregues com excelência técnica, ART registrada no CREA e seguro de obra integral.</p>
          </div>
        )}

        {currentPage === 'Equipa' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {['Eng. Chefe Marcelo', 'Arquiteta Lívia', 'Mestre de Obras Antônio'].map((e, i) => (
              <div key={`t18-team-${i}-${e}`} className={`p-6 rounded-2xl border ${cardBg} space-y-1`}>
                <h3 className="font-bold text-sm">{e}</h3>
                <p className="text-xs text-slate-400">Equipe Técnica Registrada</p>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Contactos' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-md mx-auto text-center space-y-3`}>
            <h2 className="text-xl font-black">Solicite a Visita de um Engenheiro</h2>
            <p className="text-xs text-slate-500">WhatsApp: {customPhone}</p>
          </div>
        )}
      </main>

      <TemplateFooter
        brandName={businessName}
        tagline={businessTagline}
        pages={pages}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
      />
    </div>
  );
};

/* =========================================================================
   TEMPLATE 19 — EVENTOS / CASAMENTOS (7 Páginas)
   Home | Evento | Serviços | Galeria | Pacotes | Depoimentos | Contactos
   + Formulário de pedido de orçamento
   ========================================================================= */
export const Template19EventosCasamentos: React.FC<SharedPageProps> = ({
  isDark,
  theme,
  businessName,
  businessTagline = 'Assessoria, Produção e Decoração de Casamentos e Grandes Eventos',
  customPhone,
  currentPage,
  onNavigate,
}) => {
  const pages = ['Home', 'Evento', 'Serviços', 'Galeria', 'Pacotes', 'Depoimentos', 'Contactos'];

  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-rose-50/30 text-slate-900';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-rose-100';

  return (
    <div className={`min-h-full ${bgMain} flex flex-col font-serif`}>
      <TemplateNav
        brandName={businessName}
        icon={<PartyPopper className="w-4 h-4" />}
        pages={pages}
        currentPage={currentPage}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
        ctaText="Pedir Orçamento"
        onCtaClick={() => onNavigate('Contactos')}
      />

      <main className="flex-1 py-10 px-6 max-w-6xl mx-auto w-full font-sans">
        {currentPage === 'Home' && (
          <div className="space-y-8 text-center max-w-3xl mx-auto">
            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${theme.border} ${theme.text}`}>
              Momentos Mágicos & Inesquecíveis
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif font-black">O Casamento dos Seus Sonhos Torna-se Realidade</h1>
            <p className="text-xs sm:text-sm text-slate-500">{businessTagline}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => onNavigate('Pacotes')} className={`px-6 py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
                Conhecer Nossos Pacotes
              </button>
            </div>
          </div>
        )}

        {currentPage === 'Evento' && (
          <div className="space-y-4 max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-serif font-black">Casamentos, Bodas & 15 Anos</h2>
            <p className="text-xs text-slate-500">Planejamento minucioso do cronograma, fornecedores, iluminação cênica e gastronomia.</p>
          </div>
        )}

        {currentPage === 'Serviços' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-2`}>
              <h3 className="font-bold text-base">Assessoria Completa</h3>
              <p className="text-xs text-slate-500">Acompanhamento do início até o brinde final com cerimonialistas experientes.</p>
            </div>
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-2`}>
              <h3 className="font-bold text-base">Design Floral & Cenografia</h3>
              <p className="text-xs text-slate-500">Arranjos suntuosos, mobiliário requintado e velas aromáticas.</p>
            </div>
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-2`}>
              <h3 className="font-bold text-base">Som, Luz & DJ</h3>
              <p className="text-xs text-slate-500">Pista de dança animada com estrutura acústica de primeira linha.</p>
            </div>
          </div>
        )}

        {currentPage === 'Galeria' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80" alt="Casamento" className="rounded-2xl aspect-video object-cover" />
          </div>
        )}

        {currentPage === 'Pacotes' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Essencial Silver', 'Master Gold', 'Diamond Luxury'].map((pkg, i) => (
              <div key={`t19-pkg-${i}-${pkg}`} className={`p-6 rounded-2xl border ${cardBg} space-y-3 text-center`}>
                <h3 className="font-bold text-base">{pkg}</h3>
                <button onClick={() => onNavigate('Contactos')} className={`w-full py-2 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
                  Solicitar Proposta
                </button>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Depoimentos' && (
          <div className="max-w-2xl mx-auto space-y-4 text-center">
            <h2 className="text-2xl font-serif font-black">O Que Dizem os Noivos</h2>
            <p className="text-xs text-slate-500">"Foi o dia mais feliz das nossas vidas. Tudo saiu exatamente como havíamos planejado!" — Sofia & Rafael</p>
          </div>
        )}

        {currentPage === 'Contactos' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-md mx-auto space-y-3 text-center`}>
            <h2 className="text-xl font-black">Orçamento do Seu Evento</h2>
            <input type="text" placeholder="Nome dos Noivos / Anfitrião" className="w-full text-xs p-3 rounded-xl border border-slate-200" />
            <input type="date" className="w-full text-xs p-3 rounded-xl border border-slate-200" />
            <button className={`w-full py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>Enviar Pedido de Orçamento</button>
          </div>
        )}
      </main>

      <TemplateFooter
        brandName={businessName}
        tagline={businessTagline}
        pages={pages}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
      />
    </div>
  );
};

/* =========================================================================
   TEMPLATE 20 — FREELANCER (7 Páginas)
   Home | Sobre | Serviços | Portfólio | Projeto individual | Preços | Contactos
   ========================================================================= */
export const Template20Freelancer: React.FC<SharedPageProps> = ({
  isDark,
  theme,
  businessName,
  businessTagline = 'Copywriting Estratégico, Redação Publicitária e Estratégia de Conteúdo',
  customPhone,
  currentPage,
  onNavigate,
}) => {
  const pages = ['Home', 'Sobre', 'Serviços', 'Portfólio', 'Projeto individual', 'Preços', 'Contactos'];

  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-full ${bgMain} flex flex-col font-sans`}>
      <TemplateNav
        brandName={businessName}
        icon={<Briefcase className="w-4 h-4" />}
        pages={pages}
        currentPage={currentPage}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
        ctaText="Solicitar Orçamento"
        onCtaClick={() => onNavigate('Contactos')}
      />

      <main className="flex-1 py-10 px-6 max-w-5xl mx-auto w-full">
        {currentPage === 'Home' && (
          <div className="space-y-8 text-center max-w-3xl mx-auto">
            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${theme.border} ${theme.text}`}>
              Freelancer Especialista
            </span>
            <h1 className="text-4xl sm:text-5xl font-black">Textos Que Convertem Visitantes em Clientes</h1>
            <p className="text-xs sm:text-sm text-slate-500">{businessTagline}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => onNavigate('Portfólio')} className={`px-6 py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
                Ver Meus Trabalhos
              </button>
            </div>
          </div>
        )}

        {currentPage === 'Sobre' && (
          <div className="max-w-2xl mx-auto text-center space-y-4 text-xs text-slate-500">
            <h2 className="text-2xl font-black text-slate-900">Sobre Mim</h2>
            <p>Mais de 5 anos escrevendo páginas de vendas, emails e artigos de alta conversão para marcas de destaque.</p>
          </div>
        )}

        {currentPage === 'Serviços' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className={`p-6 rounded-2xl border ${cardBg}`}><h3 className="font-bold text-sm">Páginas de Vendas</h3></div>
            <div className={`p-6 rounded-2xl border ${cardBg}`}><h3 className="font-bold text-sm">Sequências de E-mail</h3></div>
            <div className={`p-6 rounded-2xl border ${cardBg}`}><h3 className="font-bold text-sm">Anúncios & Tráfego</h3></div>
          </div>
        )}

        {currentPage === 'Portfólio' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['Lançamento de Infoproduto (7 Dígitos)', 'Campanha de Reengajamento B2B'].map((p, i) => (
              <div key={`t20-port-${i}-${p}`} className={`p-6 rounded-2xl border ${cardBg} space-y-2 cursor-pointer`} onClick={() => onNavigate('Projeto individual')}>
                <h3 className="font-bold text-base">{p}</h3>
                <span className="text-xs font-bold text-blue-600">Ver Estudo de Caso →</span>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Projeto individual' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-2xl mx-auto space-y-4`}>
            <h2 className="text-2xl font-black">Lançamento de Infoproduto</h2>
            <p className="text-xs text-slate-500">Estratégia de copy e narrativas que geraram mais de R$ 1,2 milhão em faturamento.</p>
          </div>
        )}

        {currentPage === 'Preços' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {['Landing Page (R$ 800)', 'Pacote 10 E-mails (R$ 1.200)', 'Copy Completa (R$ 2.500)'].map((pr, i) => (
              <div key={`t20-price-${i}-${pr}`} className={`p-6 rounded-2xl border ${cardBg} space-y-3`}>
                <h3 className="font-bold text-sm">{pr}</h3>
                <button onClick={() => onNavigate('Contactos')} className={`w-full py-2 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
                  Contratar
                </button>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Contactos' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-md mx-auto text-center space-y-3`}>
            <h2 className="text-xl font-black">Vamos Conversar Sobre Seu Projeto?</h2>
            <p className="text-xs text-slate-500">WhatsApp: {customPhone}</p>
          </div>
        )}
      </main>

      <TemplateFooter
        brandName={businessName}
        tagline={businessTagline}
        pages={pages}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
      />
    </div>
  );
};
