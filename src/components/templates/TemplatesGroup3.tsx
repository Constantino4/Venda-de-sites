import React, { useState } from 'react';
import { 
  HeartPulse, 
  Dumbbell, 
  Sparkles, 
  Wrench, 
  Coffee, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle, 
  MessageSquare, 
  UserCheck, 
  ShieldCheck, 
  Star,
  Award,
  Zap
} from 'lucide-react';
import { SharedPageProps, TemplateNav, TemplateFooter } from './TemplateShared';

/* =========================================================================
   TEMPLATE 11 — CLÍNICA (7 Páginas)
   Home | Serviços | Serviço individual | Médicos | Sobre | Agendamento | Contactos
   ========================================================================= */
export const Template11Clinica: React.FC<SharedPageProps> = ({
  isDark,
  theme,
  businessName,
  businessTagline = 'Medicina Integrada, Saúde Preventiva e Cuidado Humanizado',
  customPhone,
  currentPage,
  onNavigate,
}) => {
  const pages = ['Home', 'Serviços', 'Serviço individual', 'Médicos', 'Sobre', 'Agendamento', 'Contactos'];
  const [selectedService, setSelectedService] = useState('Cardiologia & Check-up Executivo');

  const services = [
    { title: 'Cardiologia & Check-up Executivo', desc: 'Eletrocardiograma, ecocardiograma e acompanhamento com cardiologistas renomados.' },
    { title: 'Dermatologia Clínica & Estética', desc: 'Tratamento de pele, queda de cabelo, rejuvenescimento e procedimentos dermatológicos seguros.' },
    { title: 'Ortopedia & Fisioterapia Avançada', desc: 'Tratamento de dores articulares, lesões esportivas e reabilitação postural.' },
  ];

  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-full ${bgMain} flex flex-col font-sans`}>
      <TemplateNav
        brandName={businessName}
        icon={<HeartPulse className="w-4 h-4" />}
        pages={pages}
        currentPage={currentPage}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
        ctaText="Agendar Consulta"
        onCtaClick={() => onNavigate('Agendamento')}
      />

      <main className="flex-1 py-10 px-6 max-w-6xl mx-auto w-full">
        {currentPage === 'Home' && (
          <div className="space-y-10 text-center max-w-3xl mx-auto">
            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${theme.border} ${theme.text}`}>
              Corpo Clínico Especializado
            </span>
            <h1 className="text-4xl sm:text-5xl font-black">Sua Saúde e Bem-Estar em Boas Mãos</h1>
            <p className="text-xs sm:text-sm text-slate-500">{businessTagline}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => onNavigate('Agendamento')} className={`px-6 py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
                Marcar Consulta Online
              </button>
            </div>
          </div>
        )}

        {currentPage === 'Serviços' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <div key={`t11-svc-${i}-${s.title}`} className={`p-6 rounded-2xl border ${cardBg} space-y-2`}>
                <h3 className="font-bold text-base">{s.title}</h3>
                <p className="text-xs text-slate-500">{s.desc}</p>
                <button onClick={() => { setSelectedService(s.title); onNavigate('Serviço individual'); }} className="text-xs font-bold text-blue-600">
                  Saiba Mais →
                </button>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Serviço individual' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-2xl mx-auto space-y-4`}>
            <h2 className="text-2xl font-black">{selectedService}</h2>
            <p className="text-xs text-slate-500">Exames diagnósticos modernos realizados no próprio local para agilidade e conforto do paciente.</p>
            <button onClick={() => onNavigate('Agendamento')} className={`w-full py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
              Agendar Esta Especialidade
            </button>
          </div>
        )}

        {currentPage === 'Médicos' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {['Dr. Alexandre Silveira (CRM 123456)', 'Dra. Camila Ramos (CRM 654321)', 'Dr. Marcos Prado (CRM 789123)'].map((m, i) => (
              <div key={`t11-med-${i}-${m}`} className={`p-6 rounded-2xl border ${cardBg} space-y-1`}>
                <h3 className="font-bold text-sm">{m}</h3>
                <p className="text-xs text-slate-400">Especialista Titular</p>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Sobre' && (
          <div className="max-w-2xl mx-auto text-center space-y-4 text-xs text-slate-500">
            <h2 className="text-2xl font-black text-slate-900">Sobre a {businessName}</h2>
            <p>Infraestrutura hospitalar moderna e acolhedora com os mais rígidos protocolos de biossegurança.</p>
          </div>
        )}

        {currentPage === 'Agendamento' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-md mx-auto space-y-3`}>
            <h2 className="text-xl font-black text-center">Agendamento de Consulta</h2>
            <input type="text" placeholder="Nome Completo do Paciente" className="w-full text-xs p-3 rounded-xl border border-slate-200" />
            <input type="tel" placeholder="Telefone / WhatsApp" className="w-full text-xs p-3 rounded-xl border border-slate-200" />
            <button className={`w-full py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>Solicitar Horário</button>
          </div>
        )}

        {currentPage === 'Contactos' && (
          <div className={`p-6 rounded-2xl border ${cardBg} max-w-md mx-auto text-center text-xs text-slate-500 space-y-2`}>
            <h3 className="font-bold text-sm text-slate-900">Recepção & Triagem</h3>
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
   TEMPLATE 12 — GINÁSIO (7 Páginas)
   Home | Planos | Aulas | Treinadores | Galeria | Sobre | Contactos
   ========================================================================= */
export const Template12Ginasio: React.FC<SharedPageProps> = ({
  isDark,
  theme,
  businessName,
  businessTagline = 'Alta Performance, Musculação, Cross & Aulas Coletivas',
  customPhone,
  currentPage,
  onNavigate,
}) => {
  const pages = ['Home', 'Planos', 'Aulas', 'Treinadores', 'Galeria', 'Sobre', 'Contactos'];

  const plans = [
    { name: 'Plano Silver', price: 'R$ 99,90/mês', desc: 'Acesso à musculação e cardio livre em horário comercial.' },
    { name: 'Plano Black VIP', price: 'R$ 149,90/mês', desc: 'Acesso ilimitado 24h, todas as aulas coletivas e direito a 5 convidados/mês.' },
    { name: 'Plano Personal Prime', price: 'R$ 299,90/mês', desc: 'Acompanhamento semanal com personal trainer e bioimpedância mensal.' },
  ];

  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-full ${bgMain} flex flex-col font-sans`}>
      <TemplateNav
        brandName={businessName}
        icon={<Dumbbell className="w-4 h-4" />}
        pages={pages}
        currentPage={currentPage}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
        ctaText="Matricule-se"
        onCtaClick={() => onNavigate('Planos')}
      />

      <main className="flex-1 py-10 px-6 max-w-6xl mx-auto w-full">
        {currentPage === 'Home' && (
          <div className="space-y-8 text-center max-w-3xl mx-auto">
            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${theme.border} ${theme.text}`}>
              Treine no Melhor Espaço Fitness
            </span>
            <h1 className="text-4xl sm:text-6xl font-black">Transforme Seu Corpo e Mente</h1>
            <p className="text-xs sm:text-sm text-slate-500">{businessTagline}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => onNavigate('Planos')} className={`px-6 py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
                Conhecer Nossos Planos
              </button>
            </div>
          </div>
        )}

        {currentPage === 'Planos' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p, i) => (
              <div key={`t12-plan-${i}-${p.name}`} className={`p-6 rounded-2xl border ${cardBg} space-y-3`}>
                <h3 className="font-bold text-lg">{p.name}</h3>
                <span className={`text-2xl font-black ${theme.text} block`}>{p.price}</span>
                <p className="text-xs text-slate-500">{p.desc}</p>
                <button onClick={() => onNavigate('Contactos')} className={`w-full py-2.5 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
                  Garantir Este Plano
                </button>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Aulas' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {['Spinning / Bike', 'CrossFit & HIIT', 'Yoga & Pilates', 'Muay Thai & Boxe'].map((a, i) => (
              <div key={`t12-aula-${i}-${a}`} className={`p-6 rounded-2xl border ${cardBg} font-bold text-xs`}>
                {a}
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Treinadores' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {['Coach Marcos (CrossFit)', 'Treinadora Carla (Spinning)', 'Prof. Thiago (Musculação)'].map((t, i) => (
              <div key={`t12-trainer-${i}-${t}`} className={`p-6 rounded-2xl border ${cardBg} space-y-1`}>
                <h3 className="font-bold text-sm">{t}</h3>
                <p className="text-xs text-slate-400">CREF Ativo & Especialista</p>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Galeria' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80" alt="Academia" className="rounded-2xl aspect-video object-cover" />
          </div>
        )}

        {currentPage === 'Sobre' && (
          <div className="max-w-2xl mx-auto text-center space-y-4 text-xs text-slate-500">
            <h2 className="text-2xl font-black text-slate-900">Sobre o {businessName}</h2>
            <p>Mais de 1.200m² climatizados com equipamentos de última geração importados.</p>
          </div>
        )}

        {currentPage === 'Contactos' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-md mx-auto text-center space-y-3`}>
            <h2 className="text-xl font-black">Venha Fazer Uma Aula Experimental Gratuita</h2>
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
   TEMPLATE 13 — SALÃO DE BELEZA (7 Páginas)
   Home | Serviços | Preços | Galeria | Equipa | Agendamento | Contactos
   ========================================================================= */
export const Template13SalaoBeleza: React.FC<SharedPageProps> = ({
  isDark,
  theme,
  businessName,
  businessTagline = 'Cabelo, Mechas, Manicure e Cuidados de Beleza Exclusivos',
  customPhone,
  currentPage,
  onNavigate,
}) => {
  const pages = ['Home', 'Serviços', 'Preços', 'Galeria', 'Equipa', 'Agendamento', 'Contactos'];

  const services = [
    { title: 'Mechas & Morena Iluminada', price: 'R$ 380,00', desc: 'Clareamento saudável com reconstrução capilar Olaplex.' },
    { title: 'Escova Modelada & Botox Capilar', price: 'R$ 150,00', desc: 'Alinhamento dos fios, redução do frizz e brilho espelhado.' },
    { title: 'Unhas em Gel & Spa dos Pés', price: 'R$ 120,00', desc: 'Alongamento natural com esmaltação em gel de alta durabilidade.' },
  ];

  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-rose-50/40 text-slate-900';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-rose-100';

  return (
    <div className={`min-h-full ${bgMain} flex flex-col font-sans`}>
      <TemplateNav
        brandName={businessName}
        icon={<Sparkles className="w-4 h-4" />}
        pages={pages}
        currentPage={currentPage}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
        ctaText="Agendar Horário"
        onCtaClick={() => onNavigate('Agendamento')}
      />

      <main className="flex-1 py-10 px-6 max-w-6xl mx-auto w-full">
        {currentPage === 'Home' && (
          <div className="space-y-8 text-center max-w-3xl mx-auto">
            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${theme.border} ${theme.text}`}>
              Realce Sua Beleza Natural
            </span>
            <h1 className="text-4xl sm:text-5xl font-black">Seu Momento de Cuidado e Autoestima</h1>
            <p className="text-xs sm:text-sm text-slate-500">{businessTagline}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => onNavigate('Agendamento')} className={`px-6 py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
                Agendar Atendimento VIP
              </button>
            </div>
          </div>
        )}

        {(currentPage === 'Serviços' || currentPage === 'Preços') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <div key={`t13-svc-${i}-${s.title}`} className={`p-6 rounded-2xl border ${cardBg} space-y-2`}>
                <h3 className="font-bold text-base">{s.title}</h3>
                <span className={`text-lg font-black ${theme.text}`}>{s.price}</span>
                <p className="text-xs text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Galeria' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80" alt="Salão" className="rounded-2xl aspect-video object-cover" />
          </div>
        )}

        {currentPage === 'Equipa' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {['Vanessa Dias (Colorista)', 'Juliana Melo (Lash Designer)', 'Letícia Rocha (Nail Designer)'].map((e, i) => (
              <div key={`t13-team-${i}-${e}`} className={`p-6 rounded-2xl border ${cardBg} space-y-1`}>
                <h3 className="font-bold text-sm">{e}</h3>
                <p className="text-xs text-slate-400">Especialista Certificada</p>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Agendamento' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-md mx-auto space-y-3`}>
            <h2 className="text-xl font-black text-center">Agendamento Rápido</h2>
            <input type="text" placeholder="Seu Nome" className="w-full text-xs p-3 rounded-xl border border-slate-200" />
            <button className={`w-full py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>Confirmar pelo WhatsApp</button>
          </div>
        )}

        {currentPage === 'Contactos' && (
          <div className={`p-6 rounded-2xl border ${cardBg} max-w-md mx-auto text-center text-xs text-slate-500 space-y-2`}>
            <h3 className="font-bold text-sm text-slate-900">Salão & Estética</h3>
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
   TEMPLATE 14 — OFICINA AUTOMÓVEL (7 Páginas)
   Home | Serviços | Sobre | Equipa | Galeria | Orçamento | Contactos
   ========================================================================= */
export const Template14Oficina: React.FC<SharedPageProps> = ({
  isDark,
  theme,
  businessName,
  businessTagline = 'Mecânica Geral, Diagnóstico Computadorizado e Revisão Preventiva',
  customPhone,
  currentPage,
  onNavigate,
}) => {
  const pages = ['Home', 'Serviços', 'Sobre', 'Equipa', 'Galeria', 'Orçamento', 'Contactos'];

  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-full ${bgMain} flex flex-col font-sans`}>
      <TemplateNav
        brandName={businessName}
        icon={<Wrench className="w-4 h-4" />}
        pages={pages}
        currentPage={currentPage}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
        ctaText="Pedir Orçamento"
        onCtaClick={() => onNavigate('Orçamento')}
      />

      <main className="flex-1 py-10 px-6 max-w-6xl mx-auto w-full">
        {currentPage === 'Home' && (
          <div className="space-y-8 text-center max-w-3xl mx-auto">
            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${theme.border} ${theme.text}`}>
              Centro Automotivo Especializado
            </span>
            <h1 className="text-4xl sm:text-5xl font-black">Cuidado Profissional com Seu Veículo</h1>
            <p className="text-xs sm:text-sm text-slate-500">{businessTagline}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => onNavigate('Orçamento')} className={`px-6 py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
                Solicitar Diagnóstico Rápido
              </button>
            </div>
          </div>
        )}

        {currentPage === 'Serviços' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-2`}>
              <h3 className="font-bold text-base">Injeção Eletrônica & Scanner</h3>
              <p className="text-xs text-slate-500">Diagnóstico preciso de falhas em tempo real com scanner automotivo avançado.</p>
            </div>
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-2`}>
              <h3 className="font-bold text-base">Freios, Suspensão & Pneus</h3>
              <p className="text-xs text-slate-500">Alinhamento 3D, balanceamento computadorizado e troca de pastilhas.</p>
            </div>
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-2`}>
              <h3 className="font-bold text-base">Câmbio Automático & Motor</h3>
              <p className="text-xs text-slate-500">Troca total de fluído por máquina de diálise e retífica completa.</p>
            </div>
          </div>
        )}

        {currentPage === 'Sobre' && (
          <div className="max-w-2xl mx-auto text-center space-y-4 text-xs text-slate-500">
            <h2 className="text-2xl font-black text-slate-900">Sobre a {businessName}</h2>
            <p>Mais de 20 anos garantindo a segurança de motoristas com peças originais e garantia em todos os serviços.</p>
          </div>
        )}

        {currentPage === 'Equipa' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {['Mecânico Chefe Roberto', 'Especialista em Injeção Fábio', 'Técnico em Suspensão André'].map((e, i) => (
              <div key={`t14-team-${i}-${e}`} className={`p-6 rounded-2xl border ${cardBg} space-y-1`}>
                <h3 className="font-bold text-sm">{e}</h3>
                <p className="text-xs text-slate-400">Certificação ASE / SENAI</p>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'Galeria' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <img src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80" alt="Oficina" className="rounded-2xl aspect-video object-cover" />
          </div>
        )}

        {currentPage === 'Orçamento' && (
          <div className={`p-8 rounded-3xl border ${cardBg} max-w-md mx-auto space-y-3`}>
            <h2 className="text-xl font-black text-center">Orçamento Sem Compromisso</h2>
            <input type="text" placeholder="Modelo e Ano do Carro" className="w-full text-xs p-3 rounded-xl border border-slate-200" />
            <textarea placeholder="Descreva o problema ou serviço desejado" className="w-full text-xs p-3 rounded-xl border border-slate-200 h-24" />
            <button className={`w-full py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>Enviar para a Oficina</button>
          </div>
        )}

        {currentPage === 'Contactos' && (
          <div className={`p-6 rounded-2xl border ${cardBg} max-w-md mx-auto text-center text-xs text-slate-500 space-y-2`}>
            <h3 className="font-bold text-sm text-slate-900">Oficina & Guincho 24h</h3>
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
   TEMPLATE 15 — CAFÉ (6 Páginas)
   Home | Menu | Sobre | Galeria | Eventos | Contactos
   ========================================================================= */
export const Template15Cafe: React.FC<SharedPageProps> = ({
  isDark,
  theme,
  businessName,
  businessTagline = 'Cafés Especiais, Pães Artesanais e Brunch Aconchegante',
  customPhone,
  currentPage,
  onNavigate,
}) => {
  const pages = ['Home', 'Menu', 'Sobre', 'Galeria', 'Eventos', 'Contactos'];

  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-amber-50/40 text-amber-950';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-200/60';

  return (
    <div className={`min-h-full ${bgMain} flex flex-col font-serif`}>
      <TemplateNav
        brandName={businessName}
        icon={<Coffee className="w-4 h-4" />}
        pages={pages}
        currentPage={currentPage}
        onNavigate={onNavigate}
        theme={theme}
        isDark={isDark}
        phone={customPhone}
        ctaText="Ver Cardápio"
        onCtaClick={() => onNavigate('Menu')}
      />

      <main className="flex-1 py-10 px-6 max-w-6xl mx-auto w-full font-sans">
        {currentPage === 'Home' && (
          <div className="space-y-8 text-center max-w-3xl mx-auto">
            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${theme.border} ${theme.text}`}>
              Grãos Selecionados 85+ Pontos
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif font-black">O Aroma de Café Fresco Espera por Você</h1>
            <p className="text-xs sm:text-sm text-slate-500">{businessTagline}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => onNavigate('Menu')} className={`px-6 py-3 rounded-xl text-white font-bold text-xs ${theme.btn}`}>
                Explorar Cardápio do Café
              </button>
            </div>
          </div>
        )}

        {currentPage === 'Menu' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className={`p-4 rounded-xl border ${cardBg} flex justify-between`}>
              <div><h4 className="font-bold text-sm">Espresso Duplo Fazenda Santa Clara</h4><p className="text-xs text-slate-500">Notas florais e caramelo</p></div>
              <span className={`font-bold ${theme.text}`}>R$ 12,00</span>
            </div>
            <div className={`p-4 rounded-xl border ${cardBg} flex justify-between`}>
              <div><h4 className="font-bold text-sm">Cappuccino Italiano com Canela</h4><p className="text-xs text-slate-500">Leite vaporizado sedoso</p></div>
              <span className={`font-bold ${theme.text}`}>R$ 16,00</span>
            </div>
            <div className={`p-4 rounded-xl border ${cardBg} flex justify-between`}>
              <div><h4 className="font-bold text-sm">Croissant Francês com Manteiga Trufada</h4><p className="text-xs text-slate-500">Folhado artesanal</p></div>
              <span className={`font-bold ${theme.text}`}>R$ 18,00</span>
            </div>
            <div className={`p-4 rounded-xl border ${cardBg} flex justify-between`}>
              <div><h4 className="font-bold text-sm">Toast de Abacate com Ovo Pochê</h4><p className="text-xs text-slate-500">Pão levain rústico</p></div>
              <span className={`font-bold ${theme.text}`}>R$ 28,00</span>
            </div>
          </div>
        )}

        {currentPage === 'Sobre' && (
          <div className="max-w-2xl mx-auto text-center space-y-4 text-xs text-slate-500">
            <h2 className="text-2xl font-serif font-black text-slate-900">Nossa Paixão por Café</h2>
            <p>Torrefação própria e métodos de extração manuais como V60, Chemex e Aeropress.</p>
          </div>
        )}

        {currentPage === 'Galeria' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <img src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80" alt="Café" className="rounded-2xl aspect-video object-cover" />
          </div>
        )}

        {currentPage === 'Eventos' && (
          <div className="space-y-4 max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-serif font-black">Workshops & Música ao Vivo</h2>
            <p className="text-xs text-slate-500">Sextas acústicas com jazz ao vivo a partir das 19h.</p>
          </div>
        )}

        {currentPage === 'Contactos' && (
          <div className={`p-6 rounded-2xl border ${cardBg} max-w-md mx-auto text-center text-xs text-slate-500 space-y-2`}>
            <h3 className="font-bold text-sm text-slate-900">Cafeteria & Bistrô</h3>
            <p>Telefone / WhatsApp: {customPhone}</p>
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
