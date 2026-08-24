import React, { useState } from 'react';
import { 
  Scissors, 
  UtensilsCrossed, 
  Building2, 
  Laptop, 
  User, 
  Star, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  MessageSquare, 
  Send, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Coffee, 
  Wifi, 
  Tv, 
  Car, 
  Waves, 
  Bed, 
  Check, 
  ExternalLink,
  ChevronRight,
  Filter,
  Eye,
  Award
} from 'lucide-react';
import { SharedPageProps, TemplateNav, TemplateFooter } from './TemplateShared';

/* =========================================================================
   TEMPLATE 1 — BARBEARIA (8 Páginas)
   Home | Sobre | Serviços | Preços | Equipa | Galeria | Agendamento | Contactos
   ========================================================================= */
export const Template1Barbearia: React.FC<SharedPageProps> = ({
  isDark,
  theme,
  businessName,
  businessTagline = 'Tradição, Estilo e Atendimento de Primeira Classe',
  customPhone,
  customCta,
  currentPage,
  onNavigate,
}) => {
  const pages = ['Home', 'Sobre', 'Serviços', 'Preços', 'Equipa', 'Galeria', 'Agendamento', 'Contactos'];
  const [selectedService, setSelectedService] = useState('Corte Clássico & Degradê');
  const [bookingName, setBookingName] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('14:00');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const services = [
    { title: 'Corte Clássico & Degradê', price: 'R$ 55,00', duration: '40 min', desc: 'Lavagem com massagem capilar, corte na tesoura ou máquina e finalização com pomada premium.' },
    { title: 'Barba Terapia com Toalha Quente', price: 'R$ 45,00', duration: '35 min', desc: 'Esfoliação facial, hidratação com óleos essenciais, navalha afiada e toalha vaporizada.' },
    { title: 'Combo VIP: Cabelo + Barba', price: 'R$ 89,00', duration: '1h 10min', desc: 'O pacote completo para renovar seu visual com direito a bebida cortesia.' },
    { title: 'Pigmentação & Camuflagem', price: 'R$ 60,00', duration: '30 min', desc: 'Disfarce de fios brancos e alinhamento do contorno da barba e costeletas.' },
    { title: 'Tratamento Anti-Queda & Botox', price: 'R$ 95,00', duration: '50 min', desc: 'Revitalização profunda do couro cabeludo com ativos fortalecedores.' },
    { title: 'Corte Infantil Estilizado', price: 'R$ 45,00', duration: '30 min', desc: 'Paciência, carinho e estilo moderno para os pequenos cavalheiros.' },
  ];

  const team = [
    { name: 'Ricardo “Navalha” Silva', role: 'Mestre Barbeiro & Fundador', exp: '14 anos de experiência', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
    { name: 'Gabriel Santos', role: 'Especialista em Degradê & Fade', exp: '8 anos de experiência', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
    { name: 'Lucas Andrade', role: 'Especialista em Barboterapia', exp: '6 anos de experiência', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  ];

  const gallery = [
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1534778356534-d3d45b6df1da?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80',
  ];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      const msg = `Olá! Gostaria de confirmar meu agendamento na ${businessName}:\nServiço: ${selectedService}\nNome: ${bookingName || 'Cliente'}\nData: ${bookingDate || 'Hoje'}\nHora: ${bookingTime}`;
      window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(msg)}`, '_blank');
    }, 600);
  };

  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-full ${bgMain} flex flex-col font-sans`}>
      <TemplateNav
        brandName={businessName}
        icon={<Scissors className="w-4 h-4" />}
        pages={pages}
        currentPage={currentPage}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
        ctaText="Agendar Horário"
        onCtaClick={() => onNavigate('Agendamento')}
      />

      <main className="flex-1">
        {/* PAGE 1: HOME */}
        {currentPage === 'Home' && (
          <div>
            {/* Hero */}
            <section className="relative py-20 px-6 text-center overflow-hidden border-b border-slate-200/10">
              <div className="max-w-4xl mx-auto space-y-6">
                <span className={`text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border ${theme.border} ${theme.text} bg-white/5 inline-block`}>
                  Estilo • Tradição • Precisão
                </span>
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
                  Eleve Seu Estilo na <span className={theme.text}>{businessName}</span>
                </h1>
                <p className={`text-sm sm:text-base max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {businessTagline}. Ambiente climatizado com café expresso, cerveja artesanal, toalha quente e os melhores profissionais da cidade.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => onNavigate('Agendamento')}
                    className={`px-6 py-3.5 rounded-xl font-extrabold text-sm text-white ${theme.btn} shadow-lg shadow-blue-500/20 transition flex items-center gap-2`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Agendar Agora</span>
                  </button>
                  <button
                    onClick={() => onNavigate('Serviços')}
                    className={`px-6 py-3.5 rounded-xl font-extrabold text-sm border ${cardBg} hover:bg-slate-100 transition`}
                  >
                    Ver Serviços & Preços
                  </button>
                </div>
              </div>
            </section>

            {/* Quick Highlights */}
            <section className="py-12 px-6 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className={`p-6 rounded-2xl border ${cardBg} text-center space-y-2`}>
                  <Award className={`w-8 h-8 mx-auto ${theme.text}`} />
                  <h3 className="font-bold text-sm">Profissionais Certificados</h3>
                  <p className="text-xs text-slate-500">Mestres barbeiros premiados com anos de especialização.</p>
                </div>
                <div className={`p-6 rounded-2xl border ${cardBg} text-center space-y-2`}>
                  <Sparkles className={`w-8 h-8 mx-auto ${theme.text}`} />
                  <h3 className="font-bold text-sm">Produtos Importados</h3>
                  <p className="text-xs text-slate-500">Pomadas, óleos e tônicos de marcas de primeira linha.</p>
                </div>
                <div className={`p-6 rounded-2xl border ${cardBg} text-center space-y-2`}>
                  <Clock className={`w-8 h-8 mx-auto ${theme.text}`} />
                  <h3 className="font-bold text-sm">Pontualidade Britânica</h3>
                  <p className="text-xs text-slate-500">Horário marcado com atendimento sem filas de espera.</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* PAGE 2: SOBRE */}
        {currentPage === 'Sobre' && (
          <div className="py-12 px-6 max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <span className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>Nossa História</span>
              <h2 className="text-3xl font-black">A Tradição Encontra a Modernidade</h2>
              <p className="text-xs text-slate-500 max-w-2xl mx-auto leading-relaxed">
                Fundada com a missão de resgatar a elegância do barbear clássico combinada com as tendências contemporâneas.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
              <img 
                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80" 
                alt="Barbearia Interior" 
                className="rounded-2xl border border-slate-200/20 shadow-md aspect-video object-cover" 
              />
              <div className="space-y-4 text-xs leading-relaxed text-slate-500">
                <p>
                  Na <strong>{businessName}</strong>, acreditamos que cortar o cabelo ou fazer a barba não é apenas uma obrigação de rotina, mas um momento de descompressão e autocuidado para o homem moderno.
                </p>
                <p>
                  Nosso espaço foi minuciosamente decorado em estilo vintage industrial, com poltronas reclináveis hidráulicas, cerveja gelada, sinuca e uma trilha sonora selecionada para tornar cada visita inesquecível.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className={`p-3 rounded-xl ${theme.bg} text-white font-black text-center min-w-[80px]`}>
                    <span className="text-xl block">12+</span>
                    <span className="text-[9px] uppercase tracking-wider">Anos</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Mais de 15.000 clientes atendidos</h4>
                    <p className="text-[11px] text-slate-400">Nota 4.9 no Google Reviews com mais de 800 avaliações.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 3: SERVIÇOS & PAGE 4: PREÇOS */}
        {(currentPage === 'Serviços' || currentPage === 'Preços') && (
          <div className="py-12 px-6 max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <span className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>Menu Completo</span>
              <h2 className="text-3xl font-black">Nossos Serviços & Tabela de Preços</h2>
              <p className="text-xs text-slate-500 max-w-xl mx-auto">
                Preços transparentes, atendimento premium e garantia de satisfação em cada detalhe.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((item, idx) => (
                <div key={`t1-svc-${idx}-${item.title}`} className={`p-5 rounded-2xl border ${cardBg} flex flex-col justify-between space-y-3 hover:border-blue-500/50 transition`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-black text-sm">{item.title}</h3>
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {item.duration}
                      </span>
                    </div>
                    <span className={`text-base font-black ${theme.text} whitespace-nowrap`}>{item.price}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">{item.desc}</p>
                  <button
                    onClick={() => {
                      setSelectedService(item.title);
                      onNavigate('Agendamento');
                    }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${theme.border} ${theme.text} hover:${theme.bg} hover:text-white transition self-start`}
                  >
                    Agendar este serviço →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAGE 5: EQUIPA */}
        {currentPage === 'Equipa' && (
          <div className="py-12 px-6 max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <span className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>Mestres da Navalha</span>
              <h2 className="text-3xl font-black">Conheça Nossos Barbeiros</h2>
              <p className="text-xs text-slate-500 max-w-xl mx-auto">
                Profissionais qualificados prontos para recomendar o melhor corte para o seu formato de rosto.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {team.map((b, i) => (
                <div key={`t1-team-${i}-${b.name}`} className={`rounded-2xl border ${cardBg} overflow-hidden text-center space-y-3 pb-5`}>
                  <img src={b.image} alt={b.name} className="w-full aspect-square object-cover" />
                  <div className="px-4 space-y-1">
                    <h3 className="font-bold text-sm">{b.name}</h3>
                    <p className={`text-xs font-semibold ${theme.text}`}>{b.role}</p>
                    <p className="text-[11px] text-slate-400">{b.exp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAGE 6: GALERIA */}
        {currentPage === 'Galeria' && (
          <div className="py-12 px-6 max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <span className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>Portfólio de Cortes</span>
              <h2 className="text-3xl font-black">Galeria de Resultados</h2>
              <p className="text-xs text-slate-500">Inspire-se nos cortes e barbas mais solicitados em nossa barbearia.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((img, idx) => (
                <div key={`t1-gal-${idx}`} className="group relative rounded-2xl overflow-hidden aspect-square border border-slate-200/20 shadow-xs">
                  <img src={img} alt="Corte Barbearia" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-xs">
                      Ver Detalhes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAGE 7: AGENDAMENTO */}
        {currentPage === 'Agendamento' && (
          <div className="py-12 px-6 max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>Agendamento Online</span>
              <h2 className="text-3xl font-black">Reserve seu Horário</h2>
              <p className="text-xs text-slate-500">Confirmação instantânea direta pelo WhatsApp.</p>
            </div>

            {bookingSuccess ? (
              <div className="p-8 rounded-2xl border border-emerald-200 bg-emerald-50 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-black text-emerald-900 text-lg">Agendamento Encaminhado!</h3>
                <p className="text-xs text-emerald-700">
                  Estamos abrindo o seu WhatsApp para confirmar o horário com nosso barbeiro.
                </p>
                <button
                  onClick={() => setBookingSuccess(false)}
                  className="mt-3 text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 text-white"
                >
                  Novo Agendamento
                </button>
              </div>
            ) : (
              <form onSubmit={handleBooking} className={`p-6 sm:p-8 rounded-3xl border ${cardBg} space-y-4 shadow-sm`}>
                <div>
                  <label className="text-xs font-bold block mb-1">Seu Nome Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva"
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Serviço Desejado</label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {services.map((s, i) => (
                      <option key={`t1-opt-${i}-${s.title}`} value={s.title}>{s.title} — {s.price}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold block mb-1">Data</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1">Horário</label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-transparent outline-none"
                    >
                      <option value="09:00">09:00</option>
                      <option value="10:30">10:30</option>
                      <option value="14:00">14:00</option>
                      <option value="16:00">16:00</option>
                      <option value="18:30">18:30</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3.5 rounded-xl text-white font-extrabold text-xs ${theme.btn} shadow-md transition flex items-center justify-center gap-2`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Confirmar pelo WhatsApp</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* PAGE 8: CONTACTOS */}
        {currentPage === 'Contactos' && (
          <div className="py-12 px-6 max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>Onde Estamos</span>
              <h2 className="text-3xl font-black">Fale Conosco & Localização</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
                <h3 className="font-bold text-sm">Informações da Unidade</h3>
                <div className="space-y-3 text-xs text-slate-500">
                  <p className="flex items-center gap-2.5">
                    <MapPin className={`w-4 h-4 ${theme.text}`} />
                    <span>Rua dos Barbeiros, 450 — Centro, São Paulo - SP</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Phone className={`w-4 h-4 ${theme.text}`} />
                    <span>{customPhone}</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Clock className={`w-4 h-4 ${theme.text}`} />
                    <span>Segunda a Sábado: 09:00 às 20:00</span>
                  </p>
                </div>
              </div>
              <div className={`p-6 rounded-2xl border ${cardBg} flex flex-col justify-center text-center space-y-3`}>
                <h3 className="font-bold text-sm">Atendimento Imediato</h3>
                <p className="text-xs text-slate-500">Precisa tirar dúvidas sobre horários ou encaixes de emergência?</p>
                <a
                  href={`https://wa.me/5511999999999`}
                  target="_blank"
                  rel="noreferrer"
                  className={`py-3 px-4 rounded-xl text-white font-bold text-xs ${theme.btn} inline-flex items-center justify-center gap-2`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Conversar no WhatsApp</span>
                </a>
              </div>
            </div>
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
   TEMPLATE 2 — RESTAURANTE (6 Páginas)
   Home | Menu | Sobre | Galeria | Reservas | Contactos
   ========================================================================= */
export const Template2Restaurante: React.FC<SharedPageProps> = ({
  isDark,
  theme,
  businessName,
  businessTagline = 'Experiência Gastronômica Inesquecível & Alta Culinária',
  customPhone,
  currentPage,
  onNavigate,
}) => {
  const pages = ['Home', 'Menu', 'Sobre', 'Galeria', 'Reservas', 'Contactos'];
  const [activeMenuCat, setActiveMenuCat] = useState<'entradas' | 'principais' | 'sobremesas' | 'vinhos'>('principais');
  const [partySize, setPartySize] = useState('2');
  const [reserveDate, setReserveDate] = useState('');
  const [reservedSuccess, setReservedSuccess] = useState(false);

  const menuItems = {
    entradas: [
      { name: 'Bruschetta Pomodoro & Burrata', price: 'R$ 42,00', desc: 'Pão sourdough rústico grelhado, tomates frescos confitados, pesto de manjericão e burrata cremosa.' },
      { name: 'Carpaccio Trufado de Filé', price: 'R$ 58,00', desc: 'Finas lâminas de filé mignon, azeite trufado, alcaparras crocantes e lascas de parmesão 24 meses.' },
    ],
    principais: [
      { name: 'Risotto de Cogumelos & Gorgonzola', price: 'R$ 78,00', desc: 'Arroz arbóreo italiano com mix de cogumelos frescos, finalizado com gorgonzola dolce e nozes.' },
      { name: 'Tornedor de Filé Mignon ao Poivre', price: 'R$ 94,00', desc: 'Corte alto grelhado ao molho de pimentas verdes, acompanhado de aligot de batatas e alho-poró.' },
      { name: 'Salmão Grelhado com Crosta de Pistache', price: 'R$ 88,00', desc: 'Filé de salmão fresco com crosta crocante de pistache e purê de mandioquinha ao perfume de maracujá.' },
    ],
    sobremesas: [
      { name: 'Tiramisù Clássico Veneziano', price: 'R$ 36,00', desc: 'Biscoitos savoiardi embebidos em café espresso, creme de mascarpone e cacau em pó 100%.' },
      { name: 'Petit Gâteau de Doce de Leite', price: 'R$ 38,00', desc: 'Bolo quente com recheio cremoso fluído, servido com sorvete artesanal de tapioca.' },
    ],
    vinhos: [
      { name: 'Chianti Classico Reserva DOCG', price: 'R$ 180,00', desc: 'Tinto italiano encorpado com notas de cereja madura e especiarias refinadas.' },
      { name: 'Sauvignon Blanc Vale de Casablanca', price: 'R$ 145,00', desc: 'Branco chileno fresco e mineral, perfeito para acompanhar frutos do mar e queijos.' },
    ],
  };

  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-stone-50 text-stone-900';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-200';

  return (
    <div className={`min-h-full ${bgMain} flex flex-col font-serif`}>
      <TemplateNav
        brandName={businessName}
        icon={<UtensilsCrossed className="w-4 h-4" />}
        pages={pages}
        currentPage={currentPage}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
        ctaText="Reservar Mesa"
        onCtaClick={() => onNavigate('Reservas')}
      />

      <main className="flex-1 font-sans">
        {/* HOME */}
        {currentPage === 'Home' && (
          <div>
            <section className="relative py-24 px-6 text-center overflow-hidden border-b border-stone-200/20 bg-gradient-to-b from-stone-900/10 to-transparent">
              <div className="max-w-4xl mx-auto space-y-6">
                <span className={`text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${theme.border} ${theme.text} bg-white/10 inline-block font-sans`}>
                  Gastronomia Autoral & Carta de Vinhos
                </span>
                <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight leading-tight">
                  Sabores Que Marcam Memórias
                </h1>
                <p className="text-sm sm:text-base text-stone-500 max-w-2xl mx-auto leading-relaxed font-sans">
                  {businessTagline}. Ingredientes orgânicos rigorosamente selecionados, preparados com técnica e paixão para transformar sua refeição em um evento.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-sans">
                  <button
                    onClick={() => onNavigate('Menu')}
                    className={`px-7 py-3.5 rounded-xl font-bold text-sm text-white ${theme.btn} shadow-md transition`}
                  >
                    Ver Cardápio Digital
                  </button>
                  <button
                    onClick={() => onNavigate('Reservas')}
                    className={`px-7 py-3.5 rounded-xl font-bold text-sm border ${cardBg} transition`}
                  >
                    Reservar uma Mesa
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* MENU */}
        {currentPage === 'Menu' && (
          <div className="py-12 px-6 max-w-4xl mx-auto space-y-8 font-sans">
            <div className="text-center space-y-2">
              <span className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>Cardápio Especial</span>
              <h2 className="text-3xl font-serif font-black">Nossas Criações</h2>
            </div>

            <div className="flex justify-center gap-2 flex-wrap">
              {(['principais', 'entradas', 'sobremesas', 'vinhos'] as const).map((cat, catIdx) => (
                <button
                  key={`t2-cat-${cat}-${catIdx}`}
                  onClick={() => setActiveMenuCat(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
                    activeMenuCat === cat
                      ? `${theme.bg} text-white shadow-xs`
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {menuItems[activeMenuCat].map((item, i) => (
                <div key={`t2-menu-${activeMenuCat}-${i}-${item.name}`} className={`p-5 rounded-2xl border ${cardBg} flex justify-between gap-4 items-start`}>
                  <div>
                    <h3 className="font-serif font-bold text-base">{item.name}</h3>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                  <span className={`text-base font-black ${theme.text} shrink-0`}>{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SOBRE */}
        {currentPage === 'Sobre' && (
          <div className="py-12 px-6 max-w-4xl mx-auto space-y-6 font-sans">
            <div className="text-center space-y-2">
              <span className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>Nossa Essência</span>
              <h2 className="text-3xl font-serif font-black">História & Filosofia</h2>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed text-center max-w-2xl mx-auto">
              No <strong>{businessName}</strong>, cada prato conta uma história. Valorizamos os produtores locais e a sazonalidade dos ingredientes para levar o mais puro frescor à sua mesa.
            </p>
          </div>
        )}

        {/* GALERIA */}
        {currentPage === 'Galeria' && (
          <div className="py-12 px-6 max-w-4xl mx-auto space-y-6 font-sans">
            <div className="text-center space-y-2">
              <span className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>Ambiente & Pratos</span>
              <h2 className="text-3xl font-serif font-black">Galeria Fotográfica</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=600&q=80'].map((img, i) => (
                <img key={`t2-gal-${i}`} src={img} alt="Restaurante" className="rounded-2xl aspect-square object-cover shadow-sm" />
              ))}
            </div>
          </div>
        )}

        {/* RESERVAS */}
        {currentPage === 'Reservas' && (
          <div className="py-12 px-6 max-w-xl mx-auto space-y-6 font-sans">
            <div className="text-center space-y-2">
              <span className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>Atendimento Exclusivo</span>
              <h2 className="text-3xl font-serif font-black">Reserve Sua Mesa</h2>
            </div>
            {reservedSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-sm text-emerald-900">Solicitação Enviada!</h3>
                <p className="text-xs text-emerald-700">Entraremos em contacto para confirmar os detalhes.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setReservedSuccess(true); }} className={`p-6 rounded-2xl border ${cardBg} space-y-3`}>
                <div>
                  <label className="text-xs font-bold block mb-1">Número de Pessoas</label>
                  <select value={partySize} onChange={(e) => setPartySize(e.target.value)} className="w-full text-xs p-3 rounded-xl border border-stone-200">
                    <option value="2">2 Pessoas (Casal)</option>
                    <option value="4">4 Pessoas</option>
                    <option value="6">6 Pessoas</option>
                    <option value="8+">8+ Pessoas (Mesa Grande)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Data Desejada</label>
                  <input type="date" required value={reserveDate} onChange={(e) => setReserveDate(e.target.value)} className="w-full text-xs p-3 rounded-xl border border-stone-200" />
                </div>
                <button type="submit" className={`w-full py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
                  Confirmar Reserva
                </button>
              </form>
            )}
          </div>
        )}

        {/* CONTACTOS */}
        {currentPage === 'Contactos' && (
          <div className="py-12 px-6 max-w-3xl mx-auto space-y-6 font-sans">
            <div className="text-center space-y-2">
              <span className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>Horários & Endereço</span>
              <h2 className="text-3xl font-serif font-black">Contactos</h2>
            </div>
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-3 text-xs text-stone-500`}>
              <p>📍 Alameda Gourmet, 890 — Jardins, São Paulo</p>
              <p>📞 {customPhone}</p>
              <p>⏰ Terça a Domingo: Almoço 12h às 15h30 | Jantar 19h às 23h30</p>
            </div>
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
   TEMPLATE 3 — HOTEL (8 Páginas)
   Home | Quartos | Quarto individual | Serviços | Galeria | Sobre | Reservas | Contactos
   ========================================================================= */
export const Template3Hotel: React.FC<SharedPageProps> = ({
  isDark,
  theme,
  businessName,
  businessTagline = 'Refúgio de Paz, Conforto e Sofisticação à Beira-Mar',
  customPhone,
  currentPage,
  onNavigate,
}) => {
  const pages = ['Home', 'Quartos', 'Quarto individual', 'Serviços', 'Galeria', 'Sobre', 'Reservas', 'Contactos'];
  const [selectedRoom, setSelectedRoom] = useState('Suíte Master com Vista Panorâmica');

  const rooms = [
    { title: 'Suíte Master com Vista Panorâmica', price: 'R$ 480/noite', size: '55m²', guests: 'Até 2 hóspedes', desc: 'Cama King Size, hidromassagem privativa na varanda e vista total para o oceano.', img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80' },
    { title: 'Chalé Família Premium', price: 'R$ 650/noite', size: '85m²', guests: 'Até 5 hóspedes', desc: '2 quartos amplos, cozinha americana equipada e varanda privativa com rede.', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80' },
    { title: 'Apartamento Deluxe Luxo', price: 'R$ 340/noite', size: '38m²', guests: 'Até 2 hóspedes', desc: 'Ar-condicionado split silencioso, Smart TV 55" 4K e enxoval em algodão egípcio.', img: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=600&q=80' },
  ];

  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-full ${bgMain} flex flex-col font-sans`}>
      <TemplateNav
        brandName={businessName}
        icon={<Building2 className="w-4 h-4" />}
        pages={pages}
        currentPage={currentPage}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
        ctaText="Ver Tarifas & Datas"
        onCtaClick={() => onNavigate('Reservas')}
      />

      <main className="flex-1 py-10 px-6 max-w-6xl mx-auto w-full">
        {currentPage === 'Home' && (
          <div className="space-y-12">
            <section className="text-center space-y-4 max-w-3xl mx-auto">
              <span className={`text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full border ${theme.border} ${theme.text}`}>
                Resort & Hotel Boutique
              </span>
              <h1 className="text-4xl sm:text-5xl font-black">{businessName}</h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{businessTagline}</p>
              <div className="flex justify-center gap-3 pt-2">
                <button onClick={() => onNavigate('Quartos')} className={`px-6 py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
                  Conhecer Acomodações
                </button>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rooms.map((r, i) => (
                <div key={`t3-room-main-${i}-${r.title}`} className={`rounded-2xl border ${cardBg} overflow-hidden flex flex-col justify-between`}>
                  <img src={r.img} alt={r.title} className="w-full aspect-video object-cover" />
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm">{r.title}</h3>
                    <p className="text-xs text-slate-500">{r.desc}</p>
                    <div className="flex justify-between items-center pt-2">
                      <span className={`font-black text-sm ${theme.text}`}>{r.price}</span>
                      <button onClick={() => { setSelectedRoom(r.title); onNavigate('Quarto individual'); }} className="text-xs font-bold text-blue-600 hover:underline">
                        Ver Detalhes →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'Quartos' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-center">Nossas Acomodações</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rooms.map((r, i) => (
                <div key={`t3-room-all-${i}-${r.title}`} className={`p-4 rounded-2xl border ${cardBg} space-y-2`}>
                  <img src={r.img} alt={r.title} className="w-full aspect-video object-cover rounded-xl" />
                  <h3 className="font-bold text-sm">{r.title}</h3>
                  <p className="text-xs text-slate-500">{r.desc}</p>
                  <p className={`text-sm font-black ${theme.text}`}>{r.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'Quarto individual' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-3xl mx-auto space-y-6`}>
            <span className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>Detalhes da Acomodação</span>
            <h2 className="text-2xl font-black">{selectedRoom}</h2>
            <img src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80" alt="Room" className="w-full aspect-video object-cover rounded-2xl" />
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-100 rounded-xl font-bold">55m² de Área</div>
              <div className="p-3 bg-slate-100 rounded-xl font-bold">Café da Manhã Incluso</div>
              <div className="p-3 bg-slate-100 rounded-xl font-bold">Wi-Fi Ultrarrápido</div>
            </div>
            <button onClick={() => onNavigate('Reservas')} className={`w-full py-3.5 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
              Reservar Este Quarto
            </button>
          </div>
        )}

        {currentPage === 'Serviços' && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-black">Serviços & Comodidades</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-xs">
              <div className={`p-4 rounded-xl border ${cardBg} font-bold`}>🏊 Piscina com Borda Infinita</div>
              <div className={`p-4 rounded-xl border ${cardBg} font-bold`}>🥐 Café Gourmet Artesanal</div>
              <div className={`p-4 rounded-xl border ${cardBg} font-bold`}>💆 Spa & Massagens</div>
              <div className={`p-4 rounded-xl border ${cardBg} font-bold`}>🚗 Estacionamento Gratuito</div>
            </div>
          </div>
        )}

        {currentPage === 'Galeria' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=600&q=80'].map((img, idx) => (
              <img key={`t3-gal-${idx}`} src={img} alt="Hotel" className="w-full aspect-video object-cover rounded-2xl" />
            ))}
          </div>
        )}

        {currentPage === 'Sobre' && (
          <div className="max-w-2xl mx-auto space-y-4 text-xs text-slate-500 leading-relaxed text-center">
            <h2 className="text-2xl font-black text-slate-900">Sobre o {businessName}</h2>
            <p>Localizado em um ponto privilegiado com vista cinematográfica, proporcionamos descanso e privacidade absolutos.</p>
          </div>
        )}

        {currentPage === 'Reservas' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-lg mx-auto space-y-4`}>
            <h2 className="text-xl font-black text-center">Motor de Reservas Diretas</h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Data de Check-in / Check-out</label>
                <input type="date" className="w-full p-3 rounded-xl border border-slate-200" />
              </div>
              <button onClick={() => alert('Reserva solicitada com sucesso!')} className={`w-full py-3 rounded-xl text-white font-bold ${theme.btn}`}>
                Verificar Disponibilidade
              </button>
            </div>
          </div>
        )}

        {currentPage === 'Contactos' && (
          <div className={`p-6 rounded-2xl border ${cardBg} max-w-xl mx-auto text-xs text-slate-500 space-y-2 text-center`}>
            <h3 className="font-bold text-sm text-slate-900">Central de Reservas</h3>
            <p>Telefone: {customPhone}</p>
            <p>Email: reservas@{businessName.toLowerCase().replace(/\s+/g, '')}.com</p>
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
   TEMPLATE 4 — AGÊNCIA DIGITAL (8 Páginas)
   Home | Serviços | Projetos | Projeto individual | Sobre | Equipa | Blog | Contactos
   ========================================================================= */
export const Template4Agencia: React.FC<SharedPageProps> = ({
  isDark,
  theme,
  businessName,
  businessTagline = 'Transformação Digital, Branding e Estratégia de Alto Impacto',
  customPhone,
  currentPage,
  onNavigate,
}) => {
  const pages = ['Home', 'Serviços', 'Projetos', 'Projeto individual', 'Sobre', 'Equipa', 'Blog', 'Contactos'];
  const [activeProject, setActiveProject] = useState('App Fintech NovaPay');

  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-full ${bgMain} flex flex-col font-sans`}>
      <TemplateNav
        brandName={businessName}
        icon={<Laptop className="w-4 h-4" />}
        pages={pages}
        currentPage={currentPage}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
        ctaText="Iniciar Projeto"
        onCtaClick={() => onNavigate('Contactos')}
      />

      <main className="flex-1 py-10 px-6 max-w-6xl mx-auto w-full">
        {currentPage === 'Home' && (
          <div className="space-y-12 text-center">
            <div className="max-w-3xl mx-auto space-y-4">
              <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${theme.border} ${theme.text}`}>
                Agência Digital Full-Service
              </span>
              <h1 className="text-4xl sm:text-6xl font-black leading-tight">
                Criamos Produtos Digitais Que Escalão Empresas
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">{businessTagline}</p>
              <button onClick={() => onNavigate('Projetos')} className={`px-6 py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
                Ver Nossos Cases de Sucesso
              </button>
            </div>
          </div>
        )}

        {currentPage === 'Serviços' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-2`}>
              <h3 className="font-bold text-sm">Design de Produto & UX/UI</h3>
              <p className="text-xs text-slate-500">Interfaces intuitivas e validadas por testes com usuários.</p>
            </div>
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-2`}>
              <h3 className="font-bold text-sm">Desenvolvimento Web & Mobile</h3>
              <p className="text-xs text-slate-500">Aplicações escaláveis com React, Next.js e TypeScript.</p>
            </div>
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-2`}>
              <h3 className="font-bold text-sm">Growth & Tráfego Pago</h3>
              <p className="text-xs text-slate-500">Aquisição de leads qualificados via Meta Ads e Google Ads.</p>
            </div>
          </div>
        )}

        {currentPage === 'Projetos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['App Fintech NovaPay', 'E-commerce Luxury Brand', 'Plataforma SaaS B2B'].map((p, i) => (
              <div key={`t4-proj-${i}-${p}`} className={`p-6 rounded-2xl border ${cardBg} space-y-2 cursor-pointer hover:border-blue-500`} onClick={() => { setActiveProject(p); onNavigate('Projeto individual'); }}>
                <h3 className="font-bold text-base">{p}</h3>
                <p className="text-xs text-slate-500">Aumento de 240% nas conversões pós-redesign.</p>
                <span className="text-xs font-bold text-blue-600">Ver Estudo de Caso →</span>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Projeto individual' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-3xl mx-auto space-y-4`}>
            <h2 className="text-2xl font-black">{activeProject}</h2>
            <p className="text-xs text-slate-500">Estudo completo de caso com briefing, prototipação, métricas e resultados atingidos.</p>
          </div>
        )}

        {currentPage === 'Sobre' && (
          <div className="max-w-2xl mx-auto text-center space-y-4 text-xs text-slate-500">
            <h2 className="text-2xl font-black text-slate-900">Sobre a {businessName}</h2>
            <p>Mais de 8 anos acelerando marcas através de tecnologia moderna e design focado em resultados comerciais.</p>
          </div>
        )}

        {currentPage === 'Equipa' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {['Diretor de Tecnologia', 'Head de Design', 'Estrategista de Growth'].map((role, i) => (
              <div key={`t4-team-${i}-${role}`} className={`p-6 rounded-2xl border ${cardBg} text-center space-y-2`}>
                <h3 className="font-bold text-sm">Membro {i+1}</h3>
                <p className="text-xs text-slate-500">{role}</p>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Blog' && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-2xl font-black text-center">Artigos & Insights</h2>
            <div className={`p-4 rounded-xl border ${cardBg} text-xs text-slate-500`}>
              Como otimizar a velocidade do seu site e aumentar as vendas em 35%.
            </div>
          </div>
        )}

        {currentPage === 'Contactos' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-xl mx-auto space-y-4`}>
            <h2 className="text-xl font-black text-center">Fale com um Especialista</h2>
            <p className="text-xs text-slate-500 text-center">Receba um diagnóstico gratuito do seu negócio em até 24 horas.</p>
            <input type="email" placeholder="Seu email corporativo" className="w-full text-xs p-3 rounded-xl border border-slate-200" />
            <button className={`w-full py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>Enviar Briefing</button>
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
   TEMPLATE 5 — PORTFÓLIO PROFISSIONAL (7 Páginas)
   Home | Sobre | Projetos | Projeto individual | Experiência | Serviços | Contactos
   ========================================================================= */
export const Template5Portfolio: React.FC<SharedPageProps> = ({
  isDark,
  theme,
  businessName,
  businessTagline = 'Product Designer & Frontend Developer Especialista em React',
  customPhone,
  currentPage,
  onNavigate,
}) => {
  const pages = ['Home', 'Sobre', 'Projetos', 'Projeto individual', 'Experiência', 'Serviços', 'Contactos'];
  const [selectedCase, setSelectedCase] = useState('Design System Financeiro');

  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-full ${bgMain} flex flex-col font-sans`}>
      <TemplateNav
        brandName={businessName}
        icon={<User className="w-4 h-4" />}
        pages={pages}
        currentPage={currentPage}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
        ctaText="Contratar"
        onCtaClick={() => onNavigate('Contactos')}
      />

      <main className="flex-1 py-10 px-6 max-w-5xl mx-auto w-full">
        {currentPage === 'Home' && (
          <div className="space-y-8 text-center max-w-3xl mx-auto">
            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${theme.border} ${theme.text}`}>
              Disponível para novos projetos
            </span>
            <h1 className="text-4xl sm:text-5xl font-black">Olá, eu sou {businessName}</h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{businessTagline}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => onNavigate('Projetos')} className={`px-6 py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
                Ver Meus Trabalhos
              </button>
            </div>
          </div>
        )}

        {currentPage === 'Sobre' && (
          <div className="max-w-2xl mx-auto space-y-4 text-xs text-slate-500 leading-relaxed text-center">
            <h2 className="text-2xl font-black text-slate-900">Sobre Mim</h2>
            <p>Mais de 7 anos construindo experiências digitais memoráveis, unindo estética e código robusto.</p>
          </div>
        )}

        {currentPage === 'Projetos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['Design System Financeiro', 'Aplicativo de Mobilidade Urbana', 'Dashboard de Análise de Dados'].map((proj, i) => (
              <div key={`t5-proj-${i}-${proj}`} className={`p-6 rounded-2xl border ${cardBg} space-y-2 cursor-pointer`} onClick={() => { setSelectedCase(proj); onNavigate('Projeto individual'); }}>
                <h3 className="font-bold text-sm">{proj}</h3>
                <p className="text-xs text-slate-500">React • TypeScript • Tailwind</p>
                <span className="text-xs font-bold text-blue-600">Ver Projeto Completo →</span>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Projeto individual' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-2xl mx-auto space-y-4`}>
            <h2 className="text-2xl font-black">{selectedCase}</h2>
            <p className="text-xs text-slate-500">Visão detalhada do processo de criação, wireframes e código.</p>
          </div>
        )}

        {currentPage === 'Experiência' && (
          <div className="space-y-4 max-w-2xl mx-auto text-xs">
            <div className={`p-4 rounded-xl border ${cardBg}`}>
              <h3 className="font-bold text-sm">Senior Product Designer — TechCorp (2023 - Presente)</h3>
            </div>
            <div className={`p-4 rounded-xl border ${cardBg}`}>
              <h3 className="font-bold text-sm">Frontend Engineer — Studio X (2020 - 2023)</h3>
            </div>
          </div>
        )}

        {currentPage === 'Serviços' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-1`}>
              <h3 className="font-bold text-sm">UI/UX Design</h3>
              <p className="text-xs text-slate-500">Figma • Prototipagem</p>
            </div>
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-1`}>
              <h3 className="font-bold text-sm">Frontend Dev</h3>
              <p className="text-xs text-slate-500">React • Next.js</p>
            </div>
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-1`}>
              <h3 className="font-bold text-sm">Consultoria</h3>
              <p className="text-xs text-slate-500">Design Systems & Performance</p>
            </div>
          </div>
        )}

        {currentPage === 'Contactos' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-md mx-auto text-center space-y-3`}>
            <h2 className="text-xl font-black">Vamos Trabalhar Juntos?</h2>
            <p className="text-xs text-slate-500">Email: contato@{businessName.toLowerCase().replace(/\s+/g, '')}.dev</p>
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
