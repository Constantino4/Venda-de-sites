import { Website } from '../types';

export const MOCK_SITES: Website[] = [
  {
    id: 'nexus-commerce',
    title: 'NexusCommerce - E-Commerce Next.js & Stripe',
    slug: 'nexus-commerce',
    category: 'ecommerce',
    categoryName: 'Loja Virtual & E-Commerce',
    shortDescription: 'Plataforma de e-commerce ultrarrápida com catálogo de produtos, carrinho reativo, cálculo de frete, pagamento via PIX e Stripe.',
    fullDescription: 'O NexusCommerce é uma solução completa e de alto desempenho para lojas virtuais modernas. Desenvolvido com as tecnologias mais recentes do mercado, ele oferece navegação fluida em dispositivos móveis, checkout otimizado para conversão, integração nativa com pagamento por QR Code PIX e Cartão de Crédito, além de um painel admin intuitivo para gerenciar estoques e pedidos.',
    price: {
      standard: 189,
      extended: 499,
      installation: 699,
    },
    originalPrice: 299,
    rating: 4.9,
    reviewsCount: 38,
    salesCount: 142,
    thumbnail: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556742049-0a67d1656820?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-nexus',
    techStack: ['React 19', 'Next.js', 'Tailwind CSS', 'Stripe API', 'TypeScript', 'Lucide Icons'],
    features: [
      'Checkout otimizado de uma única página (One-Step Checkout)',
      'Integração nativa com PIX Instantâneo e Cartão de Crédito',
      'Filtro de produtos reativo por categoria, preço e tamanhos',
      'Painel de Administração completo para controle de vendas',
      'Design 100% responsivo e otimizado para mobile (PWA Ready)',
      'Suporte a cupom de desconto e cálculo automático de frete'
    ],
    includedFiles: [
      'Código fonte completo em TypeScript (.ts / .tsx)',
      'Arquivo .env.example pré-configurado',
      'Guia de Instalação e Deploy no Vercel/Cloud Run (PDF)',
      'Manual de integração com Mercado Pago e Stripe',
      'Arquivo Figma editável dos layouts'
    ],
    seller: {
      id: 'dev-master-br',
      name: 'Lucas Silva (CodeCraft)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      badge: 'Vendedor Top 1%',
      verified: true,
      salesCount: 480,
      rating: 4.95,
      responseTime: '< 30 min'
    },
    createdDate: '2026-02-10',
    updatedDate: '2026-07-28',
    reviews: [
      {
        id: 'r1',
        userName: 'Carlos Eduardo M.',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
        rating: 5,
        date: '12 de Julho de 2026',
        comment: 'A qualidade do código é absurda! Consegui colocar a loja do meu cliente no ar em menos de 3 horas. Recomendo muito!',
        verifiedPurchase: true
      },
      {
        id: 'r2',
        userName: 'Fernanda Lima',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        rating: 5,
        date: '02 de Agosto de 2026',
        comment: 'O suporte do Lucas foi sensacional. Tirei dúvidas sobre o envio de e-mails e ele respondeu super rápido.',
        verifiedPurchase: true
      }
    ],
    sampleFiles: {
      'package.json': `{
  "name": "nexus-commerce",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.500.0",
    "tailwindcss": "^4.0.0"
  }
}`,
      'README.md': `# NexusCommerce - Guia do Comprador

Obrigado por adquirir o **NexusCommerce**!

## Passos para Rodar o Projeto:
1. Extraia este arquivo ZIP na sua máquina.
2. Abra o terminal e rode \`npm install\`
3. Copie o arquivo \`.env.example\` para \`.env\` e adicione suas chaves do Stripe/Mercado Pago.
4. Execute \`npm run dev\` para iniciar a aplicação localmente na porta 3000.

## Suporte:
Caso precise de ajuda com customização ou deploy, entre em contato via painel WebMarket.`,
      'src/App.tsx': `import React, { useState } from 'react';
import { ShoppingBag, Star, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  const [cart, setCart] = useState(0);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-6">
      <header className="flex justify-between items-center max-w-6xl mx-auto py-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
          <Zap className="w-6 h-6" /> NexusStore
        </h1>
        <button className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition">
          <ShoppingBag className="w-5 h-5" /> Carrinho ({cart})
        </button>
      </header>

      <main className="max-w-6xl mx-auto my-12 text-center">
        <h2 className="text-4xl font-extrabold mb-4">Sua Nova Loja Virtual Pronta para Converter</h2>
        <p className="text-slate-400 max-w-xl mx-auto mb-8">
          Design moderno, pagamentos instantâneos por PIX e checkout acelerado.
        </p>
        <button 
          onClick={() => setCart(c => c + 1)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl transition transform hover:scale-105"
        >
          Adicionar Produto Teste +
        </button>
      </main>
    </div>
  );
}`
    }
  },

  {
    id: 'mindflow-ai',
    title: 'MindFlow AI - SaaS com Gemini API & Assinaturas',
    slug: 'mindflow-ai',
    category: 'saas',
    categoryName: 'SaaS & IA',
    shortDescription: 'Plataforma SaaS completa de geração de conteúdo e análise de dados com IA Gemini, planos de assinatura e dashboard do usuário.',
    fullDescription: 'Crie sua própria startup de Inteligência Artificial em poucos minutos! O MindFlow AI vem equipado com rotas de API prontas no servidor para chamar o Gemini 3.6 Flash, sistema de créditos por usuário, gráficos de consumo de token, integração com gateway de pagamento por recorrência e modo escuro impecável.',
    price: {
      standard: 249,
      extended: 699,
      installation: 899,
    },
    originalPrice: 399,
    rating: 5.0,
    reviewsCount: 29,
    salesCount: 88,
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-mindflow',
    techStack: ['React 19', 'Express', 'Gemini AI API', 'Tailwind CSS', 'Recharts', 'TypeScript'],
    features: [
      'Integração nativa no servidor com SDK @google/genai (Gemini API)',
      'Gerador de artigos, e-mails de vendas e posts para redes sociais',
      'Sistema de Créditos / Tokens por plano de usuário (Gratuito, Pro, B2B)',
      'Dashboard com gráficos interativos de uso de IA',
      'Design ultra moderno em Dark Mode estilo Vercel / Linear',
      'Rotas de API Express seguras protegendo a chave GEMINI_API_KEY'
    ],
    includedFiles: [
      'Código fonte completo do Frontend e Backend Express',
      'Arquivo .env.example com variáveis de IA e servidor',
      'Documentação passo a passo de deployment no Cloud Run e Supabase',
      'Prompts otimizados para nichos de marketing e programação'
    ],
    seller: {
      id: 'ai-labs',
      name: 'Studio AI Labs (Mariana)',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      badge: 'Especialista em IA',
      verified: true,
      salesCount: 210,
      rating: 4.98,
      responseTime: '< 15 min'
    },
    createdDate: '2026-03-15',
    updatedDate: '2026-08-01',
    reviews: [
      {
        id: 'r3',
        userName: 'Thiago Mendes',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
        rating: 5,
        date: '28 de Julho de 2026',
        comment: 'Comprei e já lancei meu Micro-SaaS na semana passada! A integração com a API da Gemini rodou liso sem vazamento de chave.',
        verifiedPurchase: true
      }
    ],
    sampleFiles: {
      'package.json': `{
  "name": "mindflow-ai-saas",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "express": "^4.21.0",
    "react": "^19.0.0"
  }
}`,
      'README.md': `# MindFlow AI - SaaS Ready Template

Suba sua startup de IA em tempo recorde!

## Configuração Rápida
1. Coloque sua chave \`GEMINI_API_KEY\` no arquivo \`.env\`
2. Execute \`npm run dev\`
3. Acesse \`http://localhost:3000\` para ver o painel de IA.`
    }
  },

  {
    id: 'clinica-sorriso',
    title: 'Clínica Odonto & Médica - Site com Agendamento WhatsApp',
    slug: 'clinica-sorriso',
    category: 'medical',
    categoryName: 'Saúde & Medicina',
    shortDescription: 'Site institucional de alta conversão para clínicas dentárias, estéticas e médicas com agendamento direto via WhatsApp.',
    fullDescription: 'Desenvolvido especificamente para área de saúde, o Clínica Sorriso combina elegância, credibilidade e funcionalidades práticas. Conta com seções de apresentação dos médicos/dentistas, corpo clínico, lista de procedimentos, depoimentos de pacientes em vídeo e formulário de agendamento automático integrado ao WhatsApp da recepção.',
    price: {
      standard: 129,
      extended: 349,
      installation: 499,
    },
    originalPrice: 199,
    rating: 4.8,
    reviewsCount: 22,
    salesCount: 95,
    thumbnail: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-clinica',
    techStack: ['React 19', 'Tailwind CSS', 'Framer Motion', 'Lucide Icons'],
    features: [
      'Seletor interativo de especialidades e médicos com fotos',
      'Gerador de mensagem personalizada para envio direto ao WhatsApp',
      'Calculadora estimativa de orçamento para tratamentos estéticos',
      'Seção de Antes & Depois com slider comparativo de fotos',
      'SEO local otimizado para encontrar no Google Maps',
      'Layout clean e acolhedor nas cores Azul Médico e Esmeralda'
    ],
    includedFiles: [
      'Código fonte React com componentes limpos e modulares',
      'Manual para alterar telefones, fotos e textos sem programar',
      'Conjunto de ícones médicos em SVG'
    ],
    seller: {
      id: 'web-health',
      name: 'Gabriel Costa (WebHealth)',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
      badge: 'Desenvolvedor Recomendado',
      verified: true,
      salesCount: 165,
      rating: 4.88,
      responseTime: '< 1 hora'
    },
    createdDate: '2026-01-20',
    updatedDate: '2026-06-12',
    reviews: [
      {
        id: 'r4',
        userName: 'Dra. Beatriz Santos',
        userAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&q=80',
        rating: 5,
        date: '10 de Junho de 2026',
        comment: 'Comprei para a minha clínica ortodôntica e o número de agendamentos por WhatsApp dobrou na primeira semana!',
        verifiedPurchase: true
      }
    ],
    sampleFiles: {
      'package.json': `{
  "name": "clinica-odonto-web",
  "version": "1.0.0",
  "dependencies": {
    "react": "^19.0.0",
    "lucide-react": "^0.500.0"
  }
}`
    }
  },

  {
    id: 'imovel-prime',
    title: 'ImóvelPrime - Portal Imobiliário Interativo com Mapa',
    slug: 'imovel-prime',
    category: 'realestate',
    categoryName: 'Imobiliária & Corretores',
    shortDescription: 'Plataforma completa para imobiliárias e corretores autônomos com busca avançada de imóveis, filtros de bairro e simulação de financiamento.',
    fullDescription: 'Aumente o engajamento de compradores e locatários com um site imobiliário de padrão internacional. O ImóvelPrime traz filtros dinâmicos por faixa de preço, número de quartos e vagas, galeria de fotos com lightbox, mapa interativo das redondezas e calculadora de parcelas de financiamento habitacional.',
    price: {
      standard: 179,
      extended: 449,
      installation: 649,
    },
    originalPrice: 280,
    rating: 4.9,
    reviewsCount: 19,
    salesCount: 76,
    thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-imovel',
    techStack: ['React 19', 'Tailwind CSS', 'Leaflet Maps', 'Lucide Icons'],
    features: [
      'Filtro de busca em tempo real (Venda / Aluguel / Cidade / Bairro)',
      'Calculadora de Simulação de Financiamento Caixa/Bancos',
      'Galeria de imagens em alta definição com suporte a Tour Virtual',
      'Formulário de proposta direta para o e-mail do corretor responsável',
      'Etiqueta de Destaque, Lançamento e Oportunidade'
    ],
    includedFiles: [
      'Código completo em React com suporte a JSON ou API externa',
      'Guia de integração com sistemas CRM imobiliários',
      'Ícones e gráficos inclusos'
    ],
    seller: {
      id: 'dev-master-br',
      name: 'Lucas Silva (CodeCraft)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      badge: 'Vendedor Top 1%',
      verified: true,
      salesCount: 480,
      rating: 4.95,
      responseTime: '< 30 min'
    },
    createdDate: '2026-04-05',
    updatedDate: '2026-07-20',
    reviews: []
  },

  {
    id: 'sabor-express',
    title: 'SaborExpress - Cardápio Digital & Pedidos Delivery',
    slug: 'sabor-express',
    category: 'restaurant',
    categoryName: 'Restaurantes & Gastronomia',
    shortDescription: 'Sistema de cardápio digital para restaurantes, lanchonetes e pizzarias com pedido instantâneo pelo WhatsApp sem taxas de comissão.',
    fullDescription: 'Livre-se das comissões abusivas dos aplicativos de entrega! O SaborExpress permite criar um cardápio online lindo, com fotos apetitosas, seleção de adicionais (ex: borda recheada, molho extra), cálculo automático da taxa de entrega por bairro e fechamento de pedido direto no WhatsApp da cozinha.',
    price: {
      standard: 139,
      extended: 379,
      installation: 529,
    },
    originalPrice: 220,
    rating: 4.9,
    reviewsCount: 44,
    salesCount: 198,
    thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-sabor',
    techStack: ['React 19', 'Tailwind CSS', 'WhatsApp API', 'LocalState'],
    features: [
      'Cardápio fluido categorizado (Entradas, Lanches, Bebidas, Sobremesas)',
      'Acompanhamento de complementos e observações do pedido',
      'Notificação sonora e formatação perfeita do pedido no WhatsApp',
      'Painel para alternar status do restaurante (Aberto / Fechado)',
      'Suporte a QR Code nas mesas para pedido no local'
    ],
    includedFiles: [
      'Código fonte completo e leve (menos de 5MB)',
      'Tutorial em vídeo ensinando a cadastrar produtos e preços',
      'Modelos de imagens prontas de alimentos'
    ],
    seller: {
      id: 'food-tech',
      name: 'Rafael Nogueira (FoodTech Solutions)',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
      badge: 'Especialista em Delivery',
      verified: true,
      salesCount: 310,
      rating: 4.92,
      responseTime: '< 20 min'
    },
    createdDate: '2026-02-01',
    updatedDate: '2026-08-03',
    reviews: [
      {
        id: 'r5',
        userName: 'Marcos Pizzaria',
        userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
        rating: 5,
        date: '01 de Agosto de 2026',
        comment: 'Economizei mais de R$ 3.000 em taxas este mês depois que passei a usar este cardápio próprio!',
        verifiedPurchase: true
      }
    ]
  },

  {
    id: 'dev-studio-portfolio',
    title: 'DevStudio - Portfólio Pro para Programadores & Criativos',
    slug: 'dev-studio-portfolio',
    category: 'portfolio',
    categoryName: 'Portfólio & Agência',
    shortDescription: 'Template de portfólio ultra elegante com animações fluidas, exibição de projetos, experiência profissional e blog em Markdown.',
    fullDescription: 'Destaque-se no mercado de tecnologia e conquiste os melhores clientes internacionais com o DevStudio. Um portfólio construído com estética minimalista premium, efeitos de transição de tela suaves, seção interativa de projetos em destaque com links para GitHub e live demo, além de formulário de contato com validação.',
    price: {
      standard: 99,
      extended: 249,
      installation: 399,
    },
    originalPrice: 150,
    rating: 5.0,
    reviewsCount: 31,
    salesCount: 160,
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-portfolio',
    techStack: ['React 19', 'Motion', 'Tailwind CSS', 'TypeScript'],
    features: [
      'Animações suaves com Motion / Framer Motion',
      'Timeline interativa de carreira e formação acadêmica',
      'Módulo de Projetos com tags de tecnologia e contadores de estrelas',
      'Tema Claro/Escuro automático sincronizado com o sistema operacional',
      'Otimização Lighthouse 100/100 em performance e SEO'
    ],
    includedFiles: [
      'Código fonte limpo e documentado',
      'Suporte a publicação gratuita no GitHub Pages ou Vercel'
    ],
    seller: {
      id: 'ai-labs',
      name: 'Studio AI Labs (Mariana)',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      badge: 'Especialista em IA',
      verified: true,
      salesCount: 210,
      rating: 4.98,
      responseTime: '< 15 min'
    },
    createdDate: '2026-05-10',
    updatedDate: '2026-07-15',
    reviews: []
  },

  {
    id: 'fit-pulse',
    title: 'FitPulse - Landing Page para Academias e Personal Trainers',
    slug: 'fit-pulse',
    category: 'fitness',
    categoryName: 'Fitness & Esportes',
    shortDescription: 'Landing page moderna com tabela de planos de aula, horários da grade, avaliação de alunos e passe livre de teste grátis.',
    fullDescription: 'Converta visitantes em alunos matriculados com a FitPulse. Projetada para academias de musculação, crossfit, estúdios de pilates e personal trainers, esta landing page foca no apelo visual com fotos motivacionais, tabela clara de mensalidades e botão flutuante para resgatar uma aula experimental gratuita.',
    price: {
      standard: 119,
      extended: 299,
      installation: 449,
    },
    originalPrice: 180,
    rating: 4.7,
    reviewsCount: 15,
    salesCount: 62,
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-fitpulse',
    techStack: ['React 19', 'Tailwind CSS', 'Lucide Icons'],
    features: [
      'Tabela comparativa de planos (Mensal, Trimestral, Anual)',
      'Grade de horários interativa para modalidades (Spinning, Muay Thai, Yoga)',
      'Calculadora de IMC integrada como gerador de leads',
      'Formulário para resgate de 1 dia de treino grátis'
    ],
    includedFiles: ['Código React + Tailwind CSS', 'Manual de alteração de cores da marca'],
    seller: {
      id: 'web-health',
      name: 'Gabriel Costa (WebHealth)',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
      badge: 'Desenvolvedor Recomendado',
      verified: true,
      salesCount: 165,
      rating: 4.88,
      responseTime: '< 1 hora'
    },
    createdDate: '2026-04-18',
    updatedDate: '2026-06-30',
    reviews: []
  },

  {
    id: 'legal-care',
    title: 'LegalCare - Site Sobriedade para Advocacia & Jurídico',
    slug: 'legal-care',
    category: 'legal',
    categoryName: 'Direito & Consultoria',
    shortDescription: 'Website institucional para escritórios de advocacia, juristas e consultores com formulário de consulta prévia sigilosa.',
    fullDescription: 'O LegalCare transmite solidez, seriedade e confiabilidade. Adequado às diretrizes do OAB, ele apresenta as áreas de atuação (Direito Trabalhista, Família, Empresarial, Tributário), histórico de causas e formulário seguro para o cliente agendar atendimento presencial ou online.',
    price: {
      standard: 159,
      extended: 399,
      installation: 549,
    },
    originalPrice: 250,
    rating: 4.9,
    reviewsCount: 18,
    salesCount: 54,
    thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-legal',
    techStack: ['React 19', 'Tailwind CSS', 'TypeScript'],
    features: [
      'Apresentação clara das áreas de prática advocatícia',
      'Formulário para triagem de dúvidas jurídicas via e-mail',
      'Perfil completo dos advogados sócios com currículo e OAB',
      'Artigos e notícias sobre decisões do STF / STJ'
    ],
    includedFiles: ['Código fonte React em TypeScript', 'Layout sobriedade nas cores Azul Marinho e Dourado'],
    seller: {
      id: 'dev-master-br',
      name: 'Lucas Silva (CodeCraft)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      badge: 'Vendedor Top 1%',
      verified: true,
      salesCount: 480,
      rating: 4.95,
      responseTime: '< 30 min'
    },
    createdDate: '2026-03-01',
    updatedDate: '2026-07-10',
    reviews: []
  }
];

export const CATEGORIES = [
  { id: 'all', name: 'Todos os Sites', icon: 'Globe', count: MOCK_SITES.length },
  { id: 'ecommerce', name: 'Loja Virtual & E-Commerce', icon: 'ShoppingBag', count: 1 },
  { id: 'saas', name: 'SaaS & Inteligência Artificial', icon: 'Cpu', count: 1 },
  { id: 'medical', name: 'Saúde & Medicina', icon: 'HeartPulse', count: 1 },
  { id: 'realestate', name: 'Imobiliária & Corretores', icon: 'Home', count: 1 },
  { id: 'restaurant', name: 'Restaurantes & Delivery', icon: 'Utensils', count: 1 },
  { id: 'portfolio', name: 'Portfólio & Criativos', icon: 'Briefcase', count: 1 },
  { id: 'fitness', name: 'Fitness & Esportes', icon: 'Dumbbell', count: 1 },
  { id: 'legal', name: 'Direito & Consultoria', icon: 'Scale', count: 1 },
];
