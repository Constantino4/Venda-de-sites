import React, { useState } from 'react';
import { 
  Camera, 
  GraduationCap, 
  Church, 
  ShoppingBag, 
  Home as HomeIcon, 
  Search, 
  Filter, 
  Heart, 
  ShoppingCart, 
  Star, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  ArrowRight, 
  BookOpen, 
  Video, 
  Sparkles,
  Bed,
  Layers,
  Maximize2
} from 'lucide-react';
import { SharedPageProps, TemplateNav, TemplateFooter } from './TemplateShared';

/* =========================================================================
   TEMPLATE 6 — FOTÓGRAFO (7 Páginas)
   Home | Portfólio | Galeria | Serviços | Pacotes | Sobre | Contactos
   ========================================================================= */
export const Template6Fotografo: React.FC<SharedPageProps> = ({
  isDark,
  theme,
  businessName,
  businessTagline = 'Fotografia Autoral, Casamentos e Ensaios Cinematográficos',
  customPhone,
  currentPage,
  onNavigate,
}) => {
  const pages = ['Home', 'Portfólio', 'Galeria', 'Serviços', 'Pacotes', 'Sobre', 'Contactos'];

  const photos = [
    'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
  ];

  const packages = [
    { title: 'Ensaio Individual / Moda', price: 'R$ 650,00', duration: '2 horas', photos: '30 fotos tratadas em alta resolução' },
    { title: 'Cobertura de Casamento Ouro', price: 'R$ 3.800,00', duration: 'Dia Completo', photos: 'Álbum impresso + 400 fotos digitais' },
    { title: 'Gestante & Família', price: 'R$ 850,00', duration: '2h 30min', photos: '40 fotos tratadas + mini book' },
  ];

  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-full ${bgMain} flex flex-col font-sans`}>
      <TemplateNav
        brandName={businessName}
        icon={<Camera className="w-4 h-4" />}
        pages={pages}
        currentPage={currentPage}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
        ctaText="Agendar Ensaio"
        onCtaClick={() => onNavigate('Contactos')}
      />

      <main className="flex-1 py-10 px-6 max-w-6xl mx-auto w-full">
        {currentPage === 'Home' && (
          <div className="space-y-10 text-center max-w-3xl mx-auto">
            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${theme.border} ${theme.text}`}>
              Lente • Luz • Emoção
            </span>
            <h1 className="text-4xl sm:text-6xl font-black">Eternizando Seus Momentos Mais Especiais</h1>
            <p className="text-xs sm:text-sm text-slate-500">{businessTagline}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
              {photos.map((src, i) => (
                <img key={`t6-photo-home-${i}`} src={src} alt="Foto" className="rounded-2xl aspect-square object-cover shadow-sm hover:scale-105 transition" />
              ))}
            </div>
          </div>
        )}

        {currentPage === 'Portfólio' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((src, i) => (
              <img key={`t6-port-${i}`} src={src} alt="Portfólio" className="rounded-2xl aspect-video object-cover shadow-xs" />
            ))}
          </div>
        )}

        {currentPage === 'Galeria' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-center">Galeria de Ensaios Recentes</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {photos.map((src, i) => (
                <img key={`t6-gal-${i}`} src={src} alt="Galeria" className="rounded-xl aspect-square object-cover" />
              ))}
            </div>
          </div>
        )}

        {currentPage === 'Serviços' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-2`}>
              <h3 className="font-bold text-sm">Casamentos & Pré-Wedding</h3>
              <p className="text-xs text-slate-500">Do making-of até a última dança da festa com olhar documental.</p>
            </div>
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-2`}>
              <h3 className="font-bold text-sm">Retratos Profissionais & LinkedIn</h3>
              <p className="text-xs text-slate-500">Posicionamento de autoridade e imagem executiva impecável.</p>
            </div>
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-2`}>
              <h3 className="font-bold text-sm">Fotografia Gastronômica</h3>
              <p className="text-xs text-slate-500">Imagens comerciais de dar água na boca para cardápios e publicidade.</p>
            </div>
          </div>
        )}

        {currentPage === 'Pacotes' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, i) => (
              <div key={`t6-pkg-${i}-${pkg.title}`} className={`p-6 rounded-2xl border ${cardBg} space-y-3 flex flex-col justify-between`}>
                <div>
                  <h3 className="font-black text-base">{pkg.title}</h3>
                  <span className={`text-xl font-black ${theme.text} block mt-1`}>{pkg.price}</span>
                  <p className="text-xs text-slate-400 mt-2">{pkg.duration}</p>
                  <p className="text-xs text-slate-500 mt-1">{pkg.photos}</p>
                </div>
                <button onClick={() => onNavigate('Contactos')} className={`w-full py-2.5 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
                  Solicitar Reserva
                </button>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Sobre' && (
          <div className="max-w-2xl mx-auto space-y-4 text-xs text-slate-500 leading-relaxed text-center">
            <h2 className="text-2xl font-black text-slate-900">Sobre o Estúdio</h2>
            <p>Mais de 10 anos de experiência capturando a essência e espontaneidade de momentos únicos.</p>
          </div>
        )}

        {currentPage === 'Contactos' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-md mx-auto space-y-3 text-center`}>
            <h2 className="text-xl font-black">Reserve Sua Data</h2>
            <p className="text-xs text-slate-500">Telefone / WhatsApp: {customPhone}</p>
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
   TEMPLATE 7 — ESCOLA (8 Páginas)
   Home | Sobre | Cursos | Curso individual | Professores | Notícias | Inscrição | Contactos
   ========================================================================= */
export const Template7Escola: React.FC<SharedPageProps> = ({
  isDark,
  theme,
  businessName,
  businessTagline = 'Educação Transformadora, Excelência Acadêmica e Inovação',
  customPhone,
  currentPage,
  onNavigate,
}) => {
  const pages = ['Home', 'Sobre', 'Cursos', 'Curso individual', 'Professores', 'Notícias', 'Inscrição', 'Contactos'];
  const [selectedCourse, setSelectedCourse] = useState('Ensino Fundamental & Médio Bilíngue');

  const courses = [
    { title: 'Ensino Fundamental & Médio Bilíngue', grade: '1º ao 3º Ano', desc: 'Metodologia ativa, robótica, esportes e preparação sólida para os vestibulares mais concorridos.' },
    { title: 'Programação & Inteligência Artificial para Jovens', grade: 'Extracurricular', desc: 'Lógica, Python, desenvolvimento de games e criação de projetos práticos.' },
    { title: 'Artes, Música & Oratória', grade: 'Desenvolvimento Humano', desc: 'Expressão criativa, teatro e liderança para formação integral do estudante.' },
  ];

  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-full ${bgMain} flex flex-col font-sans`}>
      <TemplateNav
        brandName={businessName}
        icon={<GraduationCap className="w-4 h-4" />}
        pages={pages}
        currentPage={currentPage}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
        ctaText="Matrículas Abertas"
        onCtaClick={() => onNavigate('Inscrição')}
      />

      <main className="flex-1 py-10 px-6 max-w-6xl mx-auto w-full">
        {currentPage === 'Home' && (
          <div className="space-y-10 text-center max-w-3xl mx-auto">
            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${theme.border} ${theme.text}`}>
              Ano Letivo 2026 / 2027
            </span>
            <h1 className="text-4xl sm:text-5xl font-black">Construindo o Futuro do Seu Filho com Excelência</h1>
            <p className="text-xs sm:text-sm text-slate-500">{businessTagline}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => onNavigate('Inscrição')} className={`px-6 py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
                Agendar Visita ao Colégio
              </button>
            </div>
          </div>
        )}

        {currentPage === 'Sobre' && (
          <div className="max-w-2xl mx-auto text-center space-y-4 text-xs text-slate-500 leading-relaxed">
            <h2 className="text-2xl font-black text-slate-900">Sobre o {businessName}</h2>
            <p>Tradição pedagógica aliada às mais avançadas tecnologias educacionais para formar cidadãos globais conscientes.</p>
          </div>
        )}

        {currentPage === 'Cursos' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((c, i) => (
              <div key={`t7-course-${i}-${c.title}`} className={`p-6 rounded-2xl border ${cardBg} space-y-2`}>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{c.grade}</span>
                <h3 className="font-bold text-base">{c.title}</h3>
                <p className="text-xs text-slate-500">{c.desc}</p>
                <button onClick={() => { setSelectedCourse(c.title); onNavigate('Curso individual'); }} className="text-xs font-bold text-blue-600">
                  Ver Grade Curricular →
                </button>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Curso individual' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-2xl mx-auto space-y-4`}>
            <h2 className="text-2xl font-black">{selectedCourse}</h2>
            <p className="text-xs text-slate-500">Módulos, corpo docente, diferenciais pedagógicos e material didático incluso.</p>
          </div>
        )}

        {currentPage === 'Professores' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {['Dra. Mariana Costa (Matemática)', 'Prof. Carlos Eduardo (História)', 'Profa. Sofia Lima (Inglês)'].map((p, i) => (
              <div key={`t7-prof-${i}-${p}`} className={`p-6 rounded-2xl border ${cardBg} space-y-1`}>
                <h3 className="font-bold text-sm">{p}</h3>
                <p className="text-xs text-slate-400">Mestres e Doutores dedicados ao aprendizado.</p>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Notícias' && (
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-center">Comunicados & Notícias</h2>
            <div className={`p-4 rounded-xl border ${cardBg} text-xs text-slate-500`}>
              Início do torneio esportivo interclasse e feira de ciências.
            </div>
          </div>
        )}

        {currentPage === 'Inscrição' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-md mx-auto space-y-3`}>
            <h2 className="text-xl font-black text-center">Formulário de Inscrição</h2>
            <input type="text" placeholder="Nome do Aluno" className="w-full text-xs p-3 rounded-xl border border-slate-200" />
            <input type="email" placeholder="Email dos Pais / Responsáveis" className="w-full text-xs p-3 rounded-xl border border-slate-200" />
            <button className={`w-full py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>Enviar Pré-Matrícula</button>
          </div>
        )}

        {currentPage === 'Contactos' && (
          <div className={`p-6 rounded-2xl border ${cardBg} max-w-md mx-auto text-center text-xs text-slate-500 space-y-2`}>
            <h3 className="font-bold text-sm text-slate-900">Secretaria Escolar</h3>
            <p>Telefone: {customPhone}</p>
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
   TEMPLATE 8 — IGREJA (8 Páginas)
   Home | Sobre | Ministérios | Eventos | Sermões | Galeria | Doações | Contactos
   ========================================================================= */
export const Template8Igreja: React.FC<SharedPageProps> = ({
  isDark,
  theme,
  businessName,
  businessTagline = 'Uma Família de Fé, Esperança, Amor e Comunhão',
  customPhone,
  currentPage,
  onNavigate,
}) => {
  const pages = ['Home', 'Sobre', 'Ministérios', 'Eventos', 'Sermões', 'Galeria', 'Doações', 'Contactos'];

  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-full ${bgMain} flex flex-col font-sans`}>
      <TemplateNav
        brandName={businessName}
        icon={<Church className="w-4 h-4" />}
        pages={pages}
        currentPage={currentPage}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
        ctaText="Assistir Online"
        onCtaClick={() => onNavigate('Sermões')}
      />

      <main className="flex-1 py-10 px-6 max-w-6xl mx-auto w-full">
        {currentPage === 'Home' && (
          <div className="space-y-8 text-center max-w-3xl mx-auto">
            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${theme.border} ${theme.text}`}>
              Cultos Dominicais: 10h e 18h
            </span>
            <h1 className="text-4xl sm:text-5xl font-black">Você é Bem-Vindo à Nossa Casa</h1>
            <p className="text-xs sm:text-sm text-slate-500">{businessTagline}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => onNavigate('Eventos')} className={`px-6 py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
                Agenda Semanal de Cultos
              </button>
            </div>
          </div>
        )}

        {currentPage === 'Sobre' && (
          <div className="max-w-2xl mx-auto text-center space-y-4 text-xs text-slate-500">
            <h2 className="text-2xl font-black text-slate-900">Nossa Visão & Valores</h2>
            <p>Edificando vidas e impactando a nossa comunidade com compaixão e solidariedade.</p>
          </div>
        )}

        {currentPage === 'Ministérios' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className={`p-6 rounded-2xl border ${cardBg}`}><h3 className="font-bold text-sm">Ministério de Louvor</h3></div>
            <div className={`p-6 rounded-2xl border ${cardBg}`}><h3 className="font-bold text-sm">Igreja Kids</h3></div>
            <div className={`p-6 rounded-2xl border ${cardBg}`}><h3 className="font-bold text-sm">Juventude & Universitários</h3></div>
          </div>
        )}

        {currentPage === 'Eventos' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-center">Próximos Eventos</h2>
            <div className={`p-4 rounded-xl border ${cardBg} text-xs text-slate-500`}>
              Conferência Anual de Famílias — Sábado às 19h30.
            </div>
          </div>
        )}

        {currentPage === 'Sermões' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-center">Mensagens & Transmissões</h2>
            <div className={`p-4 rounded-xl border ${cardBg} text-xs text-slate-500`}>
              Sermão: O Poder da Fé nos Momentos de Tempestade (Pr. Titular).
            </div>
          </div>
        )}

        {currentPage === 'Galeria' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <img src="https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=600&q=80" alt="Igreja" className="rounded-2xl aspect-video object-cover" />
          </div>
        )}

        {currentPage === 'Doações' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-md mx-auto text-center space-y-3`}>
            <h2 className="text-xl font-black">Dízimos e Ofertas</h2>
            <p className="text-xs text-slate-500">Chave PIX: contato@{businessName.toLowerCase().replace(/\s+/g, '')}.org</p>
          </div>
        )}

        {currentPage === 'Contactos' && (
          <div className={`p-6 rounded-2xl border ${cardBg} max-w-md mx-auto text-center text-xs text-slate-500 space-y-2`}>
            <h3 className="font-bold text-sm text-slate-900">Gabinete Pastoral</h3>
            <p>Telefone: {customPhone}</p>
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
   TEMPLATE 9 — LOJA DE ROUPAS (6 Páginas)
   Home | Loja | Categorias | Produto individual | Sobre | Contactos
   + Carrinho, Favoritos, Pesquisa, Filtros, Checkout
   ========================================================================= */
export const Template9LojaRoupas: React.FC<SharedPageProps> = ({
  isDark,
  theme,
  businessName,
  businessTagline = 'Moda Contemporânea, Tecidos Nobres e Estilo Atemporal',
  customPhone,
  currentPage,
  onNavigate,
}) => {
  const pages = ['Home', 'Loja', 'Categorias', 'Produto individual', 'Sobre', 'Contactos'];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState({ title: 'Blazer Alfaiataria Slim Fit', price: 'R$ 289,00', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80' });
  const [cartCount, setCartCount] = useState(2);

  const products = [
    { title: 'Blazer Alfaiataria Slim Fit', price: 'R$ 289,00', category: 'Feminino', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80' },
    { title: 'Camisa Linho Puro Riviera', price: 'R$ 179,00', category: 'Masculino', img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80' },
    { title: 'Vestido Midi Seda Floral', price: 'R$ 320,00', category: 'Vestidos', img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80' },
    { title: 'Jaqueta Couro Premium Vintage', price: 'R$ 490,00', category: 'Inverno', img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80' },
  ];

  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-full ${bgMain} flex flex-col font-sans`}>
      <TemplateNav
        brandName={businessName}
        icon={<ShoppingBag className="w-4 h-4" />}
        pages={pages}
        currentPage={currentPage}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
        ctaText={`Carrinho (${cartCount})`}
        onCtaClick={() => alert('Carrinho aberto: 2 itens')}
      />

      <main className="flex-1 py-8 px-6 max-w-6xl mx-auto w-full">
        {/* Search bar & Filter Bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Buscar vestidos, camisas, blazers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white" 
            />
          </div>
          <button className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center gap-1.5 text-xs font-bold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros</span>
          </button>
        </div>

        {currentPage === 'Home' && (
          <div className="space-y-8">
            <div className="p-10 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white text-center space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Nova Coleção Primavera/Verão</span>
              <h1 className="text-3xl sm:text-5xl font-black">Elegância e Conforto para o Seu Dia a Dia</h1>
              <button onClick={() => onNavigate('Loja')} className={`px-6 py-3 rounded-xl font-bold text-xs text-white ${theme.btn}`}>
                Comprar Agora
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((p, i) => (
                <div key={`t9-prod-home-${i}-${p.title}`} className={`p-4 rounded-2xl border ${cardBg} space-y-2`}>
                  <img src={p.img} alt={p.title} className="w-full aspect-square object-cover rounded-xl" />
                  <h3 className="font-bold text-xs truncate">{p.title}</h3>
                  <p className={`font-black text-sm ${theme.text}`}>{p.price}</p>
                  <button onClick={() => { setSelectedProduct(p); onNavigate('Produto individual'); }} className="w-full py-1.5 rounded-lg border text-xs font-bold hover:bg-slate-100">
                    Ver Produto
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'Loja' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p, i) => (
              <div key={`t9-prod-shop-${i}-${p.title}`} className={`p-4 rounded-2xl border ${cardBg} space-y-2`}>
                <img src={p.img} alt={p.title} className="w-full aspect-square object-cover rounded-xl" />
                <h3 className="font-bold text-xs">{p.title}</h3>
                <p className={`font-black text-sm ${theme.text}`}>{p.price}</p>
                <button onClick={() => setCartCount(c => c + 1)} className={`w-full py-1.5 rounded-lg text-white text-xs font-bold ${theme.btn}`}>
                  Adicionar à Sacola
                </button>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Categorias' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {['Feminino', 'Masculino', 'Acessórios & Bolsas', 'Calçados Premium'].map((cat, i) => (
              <div key={`t9-cat-${i}-${cat}`} className={`p-6 rounded-2xl border ${cardBg} font-bold text-sm cursor-pointer hover:border-blue-500`}>
                {cat}
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Produto individual' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-center`}>
            <img src={selectedProduct.img} alt={selectedProduct.title} className="w-full aspect-square object-cover rounded-2xl" />
            <div className="space-y-4">
              <h2 className="text-2xl font-black">{selectedProduct.title}</h2>
              <p className={`text-2xl font-black ${theme.text}`}>{selectedProduct.price}</p>
              <p className="text-xs text-slate-500">Confeccionado com acabamentos premium de alta durabilidade e caimento anatômico.</p>
              <div className="flex gap-2 text-xs font-bold">
                {['P', 'M', 'G', 'GG'].map(s => <span key={`t9-size-${s}`} className="px-3 py-1.5 border rounded-lg cursor-pointer hover:bg-slate-100">{s}</span>)}
              </div>
              <button onClick={() => { setCartCount(c => c + 1); alert('Item adicionado à sacola!'); }} className={`w-full py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
                Comprar com PIX Instantâneo
              </button>
            </div>
          </div>
        )}

        {currentPage === 'Sobre' && (
          <div className="max-w-2xl mx-auto text-center space-y-4 text-xs text-slate-500">
            <h2 className="text-2xl font-black text-slate-900">Sobre a {businessName}</h2>
            <p>Moda ética e responsável focada em peças versáteis e elegantes.</p>
          </div>
        )}

        {currentPage === 'Contactos' && (
          <div className={`p-6 rounded-2xl border ${cardBg} max-w-md mx-auto text-center text-xs text-slate-500 space-y-2`}>
            <h3 className="font-bold text-sm text-slate-900">SAC & Atendimento</h3>
            <p>WhatsApp: {customPhone}</p>
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
   TEMPLATE 10 — IMOBILIÁRIA (8 Páginas)
   Home | Imóveis | Imóvel individual | Comprar | Arrendar | Sobre | Agentes | Contactos
   + Filtros de preço, localização, quartos, área e galeria
   ========================================================================= */
export const Template10Imobiliaria: React.FC<SharedPageProps> = ({
  isDark,
  theme,
  businessName,
  businessTagline = 'Imóveis de Alto Padrão, Coberturas e Empreendimentos Exclusivos',
  customPhone,
  currentPage,
  onNavigate,
}) => {
  const pages = ['Home', 'Imóveis', 'Imóvel individual', 'Comprar', 'Arrendar', 'Sobre', 'Agentes', 'Contactos'];
  const [selectedProperty, setSelectedProperty] = useState({
    title: 'Apartamento Alto Padrão Vila Nova Conceição',
    price: 'R$ 2.450.000',
    rooms: 4,
    area: '185m²',
    garage: 3,
    location: 'São Paulo - SP',
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
  });

  const properties = [
    { title: 'Apartamento Alto Padrão Vila Nova Conceição', price: 'R$ 2.450.000', rooms: 4, area: '185m²', garage: 3, location: 'São Paulo - SP', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80' },
    { title: 'Casa Contemporânea em Condomínio Fechado', price: 'R$ 3.890.000', rooms: 5, area: '420m²', garage: 4, location: 'Barueri - SP', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80' },
    { title: 'Cobertura Duplex com Vista Panorâmica', price: 'R$ 14.500/mês', rooms: 3, area: '210m²', garage: 2, location: 'Rio de Janeiro - RJ', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80' },
  ];

  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-full ${bgMain} flex flex-col font-sans`}>
      <TemplateNav
        brandName={businessName}
        icon={<HomeIcon className="w-4 h-4" />}
        pages={pages}
        currentPage={currentPage}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
        ctaText="Falar com Corretor"
        onCtaClick={() => onNavigate('Contactos')}
      />

      <main className="flex-1 py-10 px-6 max-w-6xl mx-auto w-full">
        {currentPage === 'Home' && (
          <div className="space-y-10">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${theme.border} ${theme.text}`}>
                Imobiliária Premium
              </span>
              <h1 className="text-4xl sm:text-6xl font-black">Encontre o Imóvel dos Seus Sonhos</h1>
              <p className="text-xs sm:text-sm text-slate-500">{businessTagline}</p>
            </div>

            {/* Filter Box */}
            <div className={`p-6 rounded-3xl border ${cardBg} grid grid-cols-1 sm:grid-cols-4 gap-3 shadow-md`}>
              <input type="text" placeholder="Localização (Ex: Jardins)" className="text-xs p-3 rounded-xl border border-slate-200" />
              <select className="text-xs p-3 rounded-xl border border-slate-200">
                <option>Tipo de Imóvel</option>
                <option>Apartamento</option>
                <option>Casa em Condomínio</option>
                <option>Cobertura</option>
              </select>
              <select className="text-xs p-3 rounded-xl border border-slate-200">
                <option>Quartos</option>
                <option>2+ Quartos</option>
                <option>3+ Quartos</option>
                <option>4+ Quartos</option>
              </select>
              <button onClick={() => onNavigate('Imóveis')} className={`py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
                Buscar Imóveis
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {properties.map((p, i) => (
                <div key={`t10-prop-home-${i}-${p.title}`} className={`rounded-2xl border ${cardBg} overflow-hidden space-y-2`}>
                  <img src={p.img} alt={p.title} className="w-full aspect-video object-cover" />
                  <div className="p-4 space-y-2">
                    <span className={`text-lg font-black ${theme.text}`}>{p.price}</span>
                    <h3 className="font-bold text-sm">{p.title}</h3>
                    <p className="text-xs text-slate-400">{p.location}</p>
                    <div className="flex gap-4 text-xs text-slate-500 pt-2 border-t">
                      <span>{p.rooms} Quartos</span>
                      <span>{p.area}</span>
                      <span>{p.garage} Vagas</span>
                    </div>
                    <button onClick={() => { setSelectedProperty(p); onNavigate('Imóvel individual'); }} className="w-full py-2 rounded-xl text-xs font-bold border hover:bg-slate-100 mt-2">
                      Ver Ficha Completa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'Imóveis' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-center">Catálogo de Imóveis Disponíveis</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {properties.map((p, i) => (
                <div key={`t10-prop-all-${i}-${p.title}`} className={`p-4 rounded-2xl border ${cardBg} space-y-2`}>
                  <img src={p.img} alt={p.title} className="w-full aspect-video object-cover rounded-xl" />
                  <h3 className="font-bold text-sm">{p.title}</h3>
                  <p className={`text-sm font-black ${theme.text}`}>{p.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'Imóvel individual' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-3xl mx-auto space-y-4`}>
            <h2 className="text-2xl font-black">{selectedProperty.title}</h2>
            <img src={selectedProperty.img} alt="Imóvel" className="w-full aspect-video object-cover rounded-2xl" />
            <p className={`text-2xl font-black ${theme.text}`}>{selectedProperty.price}</p>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-100 rounded-xl font-bold">{selectedProperty.rooms} Quartos (Suítes)</div>
              <div className="p-3 bg-slate-100 rounded-xl font-bold">{selectedProperty.area} Úteis</div>
              <div className="p-3 bg-slate-100 rounded-xl font-bold">{selectedProperty.garage} Vagas Cobertas</div>
            </div>
            <button onClick={() => onNavigate('Contactos')} className={`w-full py-3.5 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
              Agendar Visita com Corretor
            </button>
          </div>
        )}

        {currentPage === 'Comprar' && (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-black">Imóveis para Venda</h2>
            <p className="text-xs text-slate-500">Casas e apartamentos com documentação 100% regularizada e financiamento facilitado.</p>
          </div>
        )}

        {currentPage === 'Arrendar' && (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-black">Imóveis para Locação / Arrendamento</h2>
            <p className="text-xs text-slate-500">Locação sem fiador com análise cadastral rápida.</p>
          </div>
        )}

        {currentPage === 'Sobre' && (
          <div className="max-w-2xl mx-auto text-center space-y-4 text-xs text-slate-500">
            <h2 className="text-2xl font-black text-slate-900">Sobre a {businessName}</h2>
            <p>Mais de 15 anos no mercado imobiliário garantindo segurança jurídica e os melhores negócios para você.</p>
          </div>
        )}

        {currentPage === 'Agentes' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {['Bruno Carvalho (CRECI 12345)', 'Fernanda Alves (CRECI 67890)', 'Rodrigo Prado (CRECI 54321)'].map((a, i) => (
              <div key={`t10-agent-${i}-${a}`} className={`p-6 rounded-2xl border ${cardBg} space-y-1`}>
                <h3 className="font-bold text-sm">{a}</h3>
                <p className="text-xs text-slate-400">Especialista em Imóveis de Luxo</p>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Contactos' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-md mx-auto text-center space-y-3`}>
            <h2 className="text-xl font-black">Plantão de Vendas</h2>
            <p className="text-xs text-slate-500">Telefone / WhatsApp: {customPhone}</p>
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
