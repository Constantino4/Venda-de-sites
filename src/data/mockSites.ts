import { Website } from '../types';

export const CATEGORIES = [
  { id: 'all', name: 'Todos os Sites', count: 20 },
  { id: 'barbearia', name: 'Barbearia', count: 1 },
  { id: 'restaurante', name: 'Restaurante', count: 1 },
  { id: 'hotel', name: 'Hotel & Pousada', count: 1 },
  { id: 'agencia', name: 'Agência Digital', count: 1 },
  { id: 'portfolio', name: 'Portfólio', count: 1 },
  { id: 'fotografia', name: 'Fotografia', count: 1 },
  { id: 'escola', name: 'Escola & Cursos', count: 1 },
  { id: 'igreja', name: 'Igreja', count: 1 },
  { id: 'ecommerce', name: 'Loja de Roupas', count: 1 },
  { id: 'imobiliaria', name: 'Imobiliária', count: 1 },
  { id: 'clinica', name: 'Clínica & Saúde', count: 1 },
  { id: 'ginasio', name: 'Ginásio & Fitness', count: 1 },
  { id: 'salao', name: 'Salão de Beleza', count: 1 },
  { id: 'oficina', name: 'Oficina Automóvel', count: 1 },
  { id: 'cafe', name: 'Café & Bistrô', count: 1 },
  { id: 'blog', name: 'Blog & Revista', count: 1 },
  { id: 'startup', name: 'Startup & Tech', count: 1 },
  { id: 'construcao', name: 'Construção Civil', count: 1 },
  { id: 'eventos', name: 'Eventos & Casamentos', count: 1 },
  { id: 'freelancer', name: 'Freelancer', count: 1 },
];

export const MOCK_SITES: Website[] = [
  // 1. Barbearia (8 páginas)
  {
    id: 'barber-elite-pro',
    title: 'Barber Elite — Barbearia Tradicional & Agendamento WhatsApp',
    slug: 'barber-elite-pro',
    category: 'barbearia',
    categoryName: 'Barbearia',
    pageCount: 8,
    pages: ['Home', 'Sobre', 'Serviços', 'Preços', 'Equipa', 'Galeria', 'Agendamento', 'Contactos'],
    shortDescription: 'Website sofisticado para barbearias premium com agendamento direto pelo WhatsApp, tabela de preços, galeria de cortes e localização.',
    fullDescription: 'O Barber Elite é a solução digital definitiva para barbearias de alto padrão. Conta com 8 páginas completas estruturadas para conversão: página inicial com diferenciais, história da barbearia, catálogo detalhado de serviços com preços e tempos estimados, equipe de mestres barbeiros com especialidades, galeria de cortes em alta resolução, formulário inteligente de agendamento online e informações de contato com mapa e horários de funcionamento.',
    price: { standard: 149, extended: 399, installation: 599 },
    originalPrice: 280,
    rating: 4.98,
    reviewsCount: 46,
    salesCount: 112,
    thumbnail: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-barber',
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS', 'Lucide Icons'],
    features: [
      '8 Páginas Completas e Estruturadas',
      'Formulário de agendamento com integração WhatsApp',
      'Tabela de preços com tempo de duração por serviço',
      'Galeria de cortes com visualizador de fotos',
      'Apresentação da equipe com perfis individuais',
      'Horário de funcionamento e mapa de localização',
      '100% Responsivo (Mobile 320px até Desktop 4K)'
    ],
    includedFiles: ['Código fonte completo (.tsx / .ts)', 'Componentes reutilizáveis', 'Manual de customização'],
    seller: {
      id: 'barber-studio',
      name: 'BarberTech Design',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      badge: 'Criador Verificado',
      verified: true,
      salesCount: 280,
      rating: 4.98,
      responseTime: '< 10 min'
    },
    createdDate: '2026-03-01',
    updatedDate: '2026-08-18',
    reviews: []
  },

  // 2. Restaurante (6 páginas)
  {
    id: 'bistro-gourmet-restaurant',
    title: 'Bistrô Gourmet — Restaurante com Cardápio Digital & Reservas',
    slug: 'bistro-gourmet-restaurant',
    category: 'restaurante',
    categoryName: 'Restaurante',
    pageCount: 6,
    pages: ['Home', 'Menu', 'Sobre', 'Galeria', 'Reservas', 'Contactos'],
    shortDescription: 'Website requintado para restaurantes e bistrôs com cardápio categorizado, fotos de pratos, sistema de reservas online e horários.',
    fullDescription: 'O Bistrô Gourmet oferece uma experiência gastronômica digital completa. Possui 6 páginas profissionais: Home envolvente com pratos em destaque, Cardápio Digital interativo com categorias (entradas, principais, sobremesas e vinhos), Sobre nós contando a história do Chef e da casa, Galeria de fotos do ambiente e pratos, Módulo de Reservas de mesas e Contactos com localização e WhatsApp.',
    price: { standard: 169, extended: 429, installation: 649 },
    originalPrice: 299,
    rating: 4.95,
    reviewsCount: 38,
    salesCount: 94,
    thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-restaurant',
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS'],
    features: [
      '6 Páginas Gastronômicas Completas',
      'Cardápio Digital por categorias com preços',
      'Sistema de Reserva de Mesas com data e horários',
      'Botão direto de WhatsApp para pedidos e dúvidas',
      'Galeria fotográfica de alta resolução',
      'Design refinado com tipografia serifada elegante'
    ],
    includedFiles: ['Código fonte TypeScript', 'Banco de pratos JSON', 'Guia de alteração de preços'],
    seller: {
      id: 'gastro-lab',
      name: 'GastroTheme Lab',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      badge: 'Criador Verificado',
      verified: true,
      salesCount: 195,
      rating: 4.95,
      responseTime: '< 15 min'
    },
    createdDate: '2026-02-15',
    updatedDate: '2026-08-16',
    reviews: []
  },

  // 3. Hotel (8 páginas)
  {
    id: 'grand-resort-hotel',
    title: 'Grand Horizon — Hotel Boutique, Pousada & Motor de Reservas',
    slug: 'grand-resort-hotel',
    category: 'hotel',
    categoryName: 'Hotel & Pousada',
    pageCount: 8,
    pages: ['Home', 'Quartos', 'Quarto individual', 'Serviços', 'Galeria', 'Sobre', 'Reservas', 'Contactos'],
    shortDescription: 'Plataforma para hotéis e pousadas com catálogo de acomodações, ficha individual de quartos, motor de reservas e comodidades.',
    fullDescription: 'O Grand Horizon foi desenvolvido para aumentar reservas diretas. Com 8 páginas completas, exibe acomodações com metragens, fotos de alta definição e comodidades (piscina, spa, café da manhã incluso), página de quarto individual detalhado, tour pela propriedade, motor de reservas de diárias e informações de contato completas.',
    price: { standard: 189, extended: 489, installation: 749 },
    originalPrice: 340,
    rating: 4.97,
    reviewsCount: 31,
    salesCount: 78,
    thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-hotel',
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS'],
    features: [
      '8 Páginas Completas de Hotelaria',
      'Catálogo de quartos com preços e ocupação',
      'Página individual de acomodação com comodidades',
      'Simulador e formulário de reservas de diárias',
      'Galeria da pousada e áreas de lazer',
      'Guia de comodidades e serviços exclusivos'
    ],
    includedFiles: ['Código React + TypeScript', 'Layout responsivo multi-device', 'README explicativo'],
    seller: {
      id: 'travel-studio',
      name: 'TravelUX Co.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
      badge: 'Criador Verificado',
      verified: true,
      salesCount: 160,
      rating: 4.97,
      responseTime: '< 20 min'
    },
    createdDate: '2026-03-10',
    updatedDate: '2026-08-15',
    reviews: []
  },

  // 4. Agência Digital (8 páginas)
  {
    id: 'nexus-agency-pro',
    title: 'Nexus Agency — Agência Digital, Marketing & Cases de Sucesso',
    slug: 'nexus-agency-pro',
    category: 'agencia',
    categoryName: 'Agência Digital',
    pageCount: 8,
    pages: ['Home', 'Serviços', 'Projetos', 'Projeto individual', 'Sobre', 'Equipa', 'Blog', 'Contactos'],
    shortDescription: 'Website arrojado para agências de marketing, design e software com vitrine de projetos, estudos de caso, equipe e briefing de projetos.',
    fullDescription: 'O Nexus Agency posiciona sua agência como autoridade no mercado. Com 8 páginas estruturadas, inclui apresentação de serviços de ponta, showcase de cases com métricas de impacto, página de estudo de caso individual, história e valores da empresa, apresentação da equipe de liderança, blog corporativo com insights e formulário de captação de clientes.',
    price: { standard: 159, extended: 419, installation: 629 },
    originalPrice: 290,
    rating: 4.96,
    reviewsCount: 54,
    salesCount: 128,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-agency',
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS'],
    features: [
      '8 Páginas Profissionais para Agências',
      'Showcase de projetos com página individual de case',
      'Seção de serviços com diferenciais estratégicos',
      'Blog integrado para posicionamento SEO',
      'Apresentação de liderança e equipe técnica',
      'Formulário inteligente de briefing comercial'
    ],
    includedFiles: ['Código TypeScript modular', 'Componentes UI desacoplados', 'Manual de implantação'],
    seller: {
      id: 'nexus-studios',
      name: 'Nexus Tech Lab',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      badge: 'Criador Top 1%',
      verified: true,
      salesCount: 450,
      rating: 4.96,
      responseTime: '< 5 min'
    },
    createdDate: '2026-01-20',
    updatedDate: '2026-08-17',
    reviews: []
  },

  // 5. Portfólio Profissional (7 páginas)
  {
    id: 'aura-portfolio-pro',
    title: 'Aura Portfolio — Portfólio para Designers, Devs & Criativos',
    slug: 'aura-portfolio-pro',
    category: 'portfolio',
    categoryName: 'Portfólio',
    pageCount: 7,
    pages: ['Home', 'Sobre', 'Projetos', 'Projeto individual', 'Experiência', 'Serviços', 'Contactos'],
    shortDescription: 'Portfólio minimalista e elegante para profissionais que buscam destacar seus melhores projetos, experiência de carreira e serviços.',
    fullDescription: 'O Aura Portfolio destaca o melhor do seu talento. Com 7 páginas dedicadas: Home com bio de impacto, Sobre mim detalhado, Grid de projetos com filtros, Página de projeto individual para estudos de caso, Linha do tempo de carreira e experiência profissional, Catálogo de serviços com formatos de contratação e Contactos diretos.',
    price: { standard: 119, extended: 299, installation: 499 },
    originalPrice: 199,
    rating: 4.99,
    reviewsCount: 62,
    salesCount: 145,
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-portfolio',
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS'],
    features: [
      '7 Páginas de Portfólio Pessoal',
      'Página detalhada de Estudo de Caso de Projeto',
      'Timeline de Experiência e Empresas anteriores',
      'Apresentação de Habilidades e Tech Stack',
      'Design minimalista com alto contraste e legibilidade'
    ],
    includedFiles: ['Código fonte limpo em TypeScript', 'JSON de dados customizável', 'Documentação'],
    seller: {
      id: 'aura-design',
      name: 'Aura Minimal',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      badge: 'Criador Verificado',
      verified: true,
      salesCount: 310,
      rating: 4.99,
      responseTime: '< 15 min'
    },
    createdDate: '2026-02-01',
    updatedDate: '2026-08-14',
    reviews: []
  },

  // 6. Fotógrafo (7 páginas)
  {
    id: 'lumiere-photo-pro',
    title: 'Lumière Photo — Fotografia Autoral, Ensaios & Casamentos',
    slug: 'lumiere-photo-pro',
    category: 'fotografia',
    categoryName: 'Fotografia',
    pageCount: 7,
    pages: ['Home', 'Portfólio', 'Galeria', 'Serviços', 'Pacotes', 'Sobre', 'Contactos'],
    shortDescription: 'Website cinematográfico para fotógrafos e estúdios com galerias em alta resolução, pacotes de ensaios e agendamento.',
    fullDescription: 'O Lumière Photo transforma ensaios fotográficos em contratos fechados. Possui 7 páginas: Home visual cinematográfica, Portfólio categorizado por nichos (casamento, moda, retratos corporativos), Galeria em tela cheia, Descrição de serviços, Tabela comparativa de pacotes e preços, Sobre o fotógrafo e Contactos para reservas.',
    price: { standard: 139, extended: 369, installation: 549 },
    originalPrice: 240,
    rating: 4.94,
    reviewsCount: 29,
    salesCount: 68,
    thumbnail: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-photo',
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS'],
    features: [
      '7 Páginas de Fotografia Profissional',
      'Galerias em alta definição com lazy loading',
      'Tabela de pacotes fotográficos com preços',
      'Apresentação de ensaios de casamento e moda',
      'Botão de contratação direta via WhatsApp'
    ],
    includedFiles: ['Código fonte TypeScript', 'Imagens de exemplo', 'Manual de edição'],
    seller: {
      id: 'lens-art',
      name: 'LensArt Studio',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      badge: 'Criador Verificado',
      verified: true,
      salesCount: 140,
      rating: 4.94,
      responseTime: '< 20 min'
    },
    createdDate: '2026-03-12',
    updatedDate: '2026-08-12',
    reviews: []
  },

  // 7. Escola (8 páginas)
  {
    id: 'edulearn-school-pro',
    title: 'EduLearn Academy — Escola, Cursos Online & Instituições',
    slug: 'edulearn-school-pro',
    category: 'escola',
    categoryName: 'Escola & Cursos',
    pageCount: 8,
    pages: ['Home', 'Sobre', 'Cursos', 'Curso individual', 'Professores', 'Notícias', 'Inscrição', 'Contactos'],
    shortDescription: 'Portal educacional completo com catálogo de cursos, ementa de aulas, corpo docente, notícias e formulário de inscrição.',
    fullDescription: 'O EduLearn Academy é a estrutura ideal para colégios, faculdades e plataformas de cursos. Com 8 páginas completas: Página inicial informativa, História e proposta pedagógica, Catálogo de cursos, Página de curso individual com grade curricular, Perfil dos professores e mestres, Mural de notícias e comunicados, Matrícula online e Central de atendimento.',
    price: { standard: 179, extended: 459, installation: 699 },
    originalPrice: 310,
    rating: 4.96,
    reviewsCount: 35,
    salesCount: 82,
    thumbnail: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-school',
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS'],
    features: [
      '8 Páginas Educacionais Completas',
      'Catálogo de cursos com página individual detalhada',
      'Formulário de inscrição e pré-matrícula',
      'Apresentação do corpo docente com especialidades',
      'Área de notícias e comunicados aos alunos'
    ],
    includedFiles: ['Código React + TypeScript', 'Estrutura de cursos JSON', 'Documentação'],
    seller: {
      id: 'edutech',
      name: 'EduTech Labs',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      badge: 'Criador Verificado',
      verified: true,
      salesCount: 175,
      rating: 4.96,
      responseTime: '< 15 min'
    },
    createdDate: '2026-02-25',
    updatedDate: '2026-08-10',
    reviews: []
  },

  // 8. Igreja (8 páginas)
  {
    id: 'grace-church-community',
    title: 'Graça & Vida — Igreja, Ministérios & Cultos Online',
    slug: 'grace-church-community',
    category: 'igreja',
    categoryName: 'Igreja',
    pageCount: 8,
    pages: ['Home', 'Sobre', 'Ministérios', 'Eventos', 'Sermões', 'Galeria', 'Doações', 'Contactos'],
    shortDescription: 'Website acolhedor para igrejas e comunidades com agenda de cultos, transmissão de sermões, ministérios e doações PIX.',
    fullDescription: 'O Graça & Vida conecta a comunidade e expande a mensagem de fé. Possui 8 páginas: Home inspiradora com horários dos cultos, Sobre a visão e história da igreja, Apresentação dos ministérios (música, jovens, infantil), Agenda de eventos, Arquivo de sermões e mensagens gravadas, Galeria de fotos, Módulo de doações e dízimos com PIX e Informações de contato.',
    price: { standard: 129, extended: 329, installation: 499 },
    originalPrice: 220,
    rating: 4.98,
    reviewsCount: 28,
    salesCount: 71,
    thumbnail: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-church',
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS'],
    features: [
      '8 Páginas Completas para Igrejas',
      'Player de sermões e mensagens ao vivo',
      'Agenda de eventos e conferências',
      'Módulo de dízimos e ofertas com chave PIX',
      'Apresentação de ministérios e grupos de estudo'
    ],
    includedFiles: ['Código fonte TypeScript', 'Banners e ilustrações inclusas', 'Guia rápido'],
    seller: {
      id: 'church-tech',
      name: 'FaithTech',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      badge: 'Criador Verificado',
      verified: true,
      salesCount: 110,
      rating: 4.98,
      responseTime: '< 10 min'
    },
    createdDate: '2026-03-05',
    updatedDate: '2026-08-08',
    reviews: []
  },

  // 9. Loja de Roupas (6 páginas + E-Commerce UX)
  {
    id: 'novastore-fashion-ecommerce',
    title: 'NovaStore Fashion — Loja de Roupas, Moda & E-Commerce',
    slug: 'novastore-fashion-ecommerce',
    category: 'ecommerce',
    categoryName: 'Loja de Roupas',
    pageCount: 6,
    pages: ['Home', 'Loja', 'Categorias', 'Produto individual', 'Sobre', 'Contactos'],
    shortDescription: 'E-commerce moderno de roupas e moda com vitrine de produtos, filtros por categoria, carrinho funcional, busca e checkout PIX.',
    fullDescription: 'O NovaStore Fashion é a loja virtual completa para marcas de roupas e acessórios. Possui 6 páginas: Home com banners de coleções sazonais, Catálogo completo com busca e filtros rápidos, Categorias estruturadas, Página de produto individual com tamanhos e fotos, Sobre a marca e Contactos. Inclui carrinho lateral interativo, contadores de itens e checkout facilitado.',
    price: { standard: 199, extended: 499, installation: 799 },
    originalPrice: 349,
    rating: 4.98,
    reviewsCount: 48,
    salesCount: 118,
    thumbnail: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-fashion',
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS'],
    features: [
      '6 Páginas de E-Commerce de Moda',
      'Estrutura com Carrinho, Busca e Filtros de Produtos',
      'Página de Produto Individual com grade de tamanhos',
      'Checkout com PIX Instantâneo e Cartão',
      'Visual moderno e minimalista de alta conversão'
    ],
    includedFiles: ['Código TypeScript completo', 'Base de produtos inicial', 'Manual do lojista'],
    seller: {
      id: 'webmarket-studio',
      name: 'WebMarket Studio',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      badge: 'Criador Verificado',
      verified: true,
      salesCount: 380,
      rating: 4.98,
      responseTime: '< 15 min'
    },
    createdDate: '2026-01-15',
    updatedDate: '2026-08-18',
    reviews: []
  },

  // 10. Imobiliária (8 páginas)
  {
    id: 'prime-realestate-pro',
    title: 'Prime Imóveis — Imobiliária de Alto Padrão & Corretores',
    slug: 'prime-realestate-pro',
    category: 'imobiliaria',
    categoryName: 'Imobiliária',
    pageCount: 8,
    pages: ['Home', 'Imóveis', 'Imóvel individual', 'Comprar', 'Arrendar', 'Sobre', 'Agentes', 'Contactos'],
    shortDescription: 'Plataforma para imobiliárias e corretores com busca avançada de imóveis, filtros de quartos/área/preço e perfil de agentes.',
    fullDescription: 'O Prime Imóveis é a solução robusta para comercialização de imóveis residenciais e comerciais. Com 8 páginas completas: Home com buscador de imóveis, Catálogo geral com filtros (valor, localização, dormitórios, vagas), Ficha técnica detalhada do imóvel com galeria de fotos, Páginas exclusivas para Comprar e Arrendar/Alugar, História da imobiliária, Equipe de agentes credenciados e Formulário de contato.',
    price: { standard: 189, extended: 469, installation: 699 },
    originalPrice: 320,
    rating: 4.96,
    reviewsCount: 39,
    salesCount: 88,
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-realestate',
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS'],
    features: [
      '8 Páginas Imobiliárias Completas',
      'Buscador e Filtros por Preço, Quartos, Área e Vagas',
      'Página individual de imóvel com ficha técnica completa',
      'Apresentação de agentes e corretores CRECI',
      'Seções dedicadas para Venda e Locação'
    ],
    includedFiles: ['Código fonte modular', 'Base de dados de imóveis JSON', 'README'],
    seller: {
      id: 'realtor-lab',
      name: 'PropTech Design',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      badge: 'Criador Verificado',
      verified: true,
      salesCount: 210,
      rating: 4.96,
      responseTime: '< 10 min'
    },
    createdDate: '2026-02-10',
    updatedDate: '2026-08-16',
    reviews: []
  },

  // 11. Clínica (7 páginas)
  {
    id: 'vita-clinica-medica',
    title: 'Vita Saúde — Clínica Médica, Consultórios & Agendamento',
    slug: 'vita-clinica-medica',
    category: 'clinica',
    categoryName: 'Clínica & Saúde',
    pageCount: 7,
    pages: ['Home', 'Serviços', 'Serviço individual', 'Médicos', 'Sobre', 'Agendamento', 'Contactos'],
    shortDescription: 'Website profissional para clínicas médicas, consultórios e policlínicas com agendamento online, especialidades e corpo clínico.',
    fullDescription: 'O Vita Saúde transmite confiança e acolhimento aos pacientes. Com 7 páginas dedicadas: Home com especialidades em evidência, Catálogo completo de serviços e exames, Página de especialidade individual com detalhes do tratamento, Apresentação do corpo clínico com CRM, História e infraestrutura da clínica, Formulário de agendamento de consultas e Informações de contato e convênios atendidos.',
    price: { standard: 169, extended: 419, installation: 629 },
    originalPrice: 290,
    rating: 4.97,
    reviewsCount: 33,
    salesCount: 76,
    thumbnail: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-clinica',
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS'],
    features: [
      '7 Páginas da Área da Saúde',
      'Agendamento de consultas online e WhatsApp',
      'Apresentação de médicos com CRM e especialidades',
      'Página detalhada de cada serviço médico',
      'Design clean em tons suaves e de alta credibilidade'
    ],
    includedFiles: ['Código React TypeScript', 'Manual de customização médica', 'Documentação'],
    seller: {
      id: 'health-tech',
      name: 'MediUX Lab',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      badge: 'Criador Verificado',
      verified: true,
      salesCount: 155,
      rating: 4.97,
      responseTime: '< 15 min'
    },
    createdDate: '2026-03-08',
    updatedDate: '2026-08-14',
    reviews: []
  },

  // 12. Ginásio (7 páginas)
  {
    id: 'titan-gym-fitness',
    title: 'Titan Gym — Academia, Ginásio & Centro de Treinamento',
    slug: 'titan-gym-fitness',
    category: 'ginasio',
    categoryName: 'Ginásio & Fitness',
    pageCount: 7,
    pages: ['Home', 'Planos', 'Aulas', 'Treinadores', 'Galeria', 'Sobre', 'Contactos'],
    shortDescription: 'Website enérgico para academias, estúdios de CrossFit e centros de treinamento com tabela de planos, grade de aulas e matrícula.',
    fullDescription: 'O Titan Gym foi construído para converter visitantes em matrículas ativas. Possui 7 páginas: Home com chamada para treino experimental, Comparativo detalhado de planos e mensalidades, Grade de aulas coletivas (CrossFit, Spinning, Pilates, Lutas), Apresentação dos personal trainers com CREF, Galeria da academia e equipamentos, Sobre a metodologia de treino e Contactos com WhatsApp.',
    price: { standard: 139, extended: 359, installation: 529 },
    originalPrice: 240,
    rating: 4.95,
    reviewsCount: 26,
    salesCount: 65,
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-ginasio',
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS'],
    features: [
      '7 Páginas de Alta Performance Fitness',
      'Tabela comparativa de planos Silver, Black e VIP',
      'Grade de horários e modalidades de aulas coletivas',
      'Perfil de treinadores com especialidades',
      'Botão de matrícula e agendamento de aula grátis'
    ],
    includedFiles: ['Código TypeScript', 'Estrutura de planos editável', 'Manual de instalação'],
    seller: {
      id: 'fit-themes',
      name: 'FitCode Studio',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      badge: 'Criador Verificado',
      verified: true,
      salesCount: 130,
      rating: 4.95,
      responseTime: '< 20 min'
    },
    createdDate: '2026-02-18',
    updatedDate: '2026-08-11',
    reviews: []
  },

  // 13. Salão de Beleza (7 páginas)
  {
    id: 'bella-salao-estetica',
    title: 'Bella Donna — Salão de Beleza, Mechas & Spa Estético',
    slug: 'bella-salao-estetica',
    category: 'salao',
    categoryName: 'Salão de Beleza',
    pageCount: 7,
    pages: ['Home', 'Serviços', 'Preços', 'Galeria', 'Equipa', 'Agendamento', 'Contactos'],
    shortDescription: 'Website sofisticado para salões femininos, clínicas de estética e nail bars com catálogo de tratamentos e agendamento.',
    fullDescription: 'O Bella Donna realça o glamour e os cuidados femininos. Com 7 páginas: Home charmosa, Serviços detalhados (cabelo, mechas, manicure, sobrancelhas e estética corporal), Tabela de preços clara e transparente, Galeria de transformações antes e depois, Equipe de especialistas, Formulário de agendamento online e Informações de contato.',
    price: { standard: 139, extended: 359, installation: 529 },
    originalPrice: 230,
    rating: 4.96,
    reviewsCount: 31,
    salesCount: 74,
    thumbnail: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-salao',
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS'],
    features: [
      '7 Páginas de Beleza & Estética',
      'Agendamento rápido integrado com WhatsApp',
      'Tabela de preços e catálogo de procedimentos',
      'Galeria de transformações e unhas em gel',
      'Paleta de cores sofisticada e feminina'
    ],
    includedFiles: ['Código React + TypeScript', 'Imagens inclusas', 'README'],
    seller: {
      id: 'beauty-themes',
      name: 'GlamourWeb',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      badge: 'Criador Verificado',
      verified: true,
      salesCount: 165,
      rating: 4.96,
      responseTime: '< 15 min'
    },
    createdDate: '2026-03-02',
    updatedDate: '2026-08-13',
    reviews: []
  },

  // 14. Oficina Automóvel (7 páginas)
  {
    id: 'auto-mecanica-pro',
    title: 'AutoMaster — Centro Automotivo & Oficina Mecânica',
    slug: 'auto-mecanica-pro',
    category: 'oficina',
    categoryName: 'Oficina Automóvel',
    pageCount: 7,
    pages: ['Home', 'Serviços', 'Sobre', 'Equipa', 'Galeria', 'Orçamento', 'Contactos'],
    shortDescription: 'Website robusto para oficinas mecânicas e centros automotivos com formulário de pedido de orçamento, serviços e galeria.',
    fullDescription: 'O AutoMaster passa credibilidade e precisão técnica. Com 7 páginas completas: Home destacando revisões preventivas e diagnóstico computadorizado, Catálogo de serviços mecânicos (injeção eletrônica, freios, suspensão, motor e câmbio), História da oficina e equipamentos, Equipe de mecânicos certificados, Galeria das instalações, Formulário de solicitação de orçamento sem compromisso e Contactos com WhatsApp.',
    price: { standard: 149, extended: 379, installation: 559 },
    originalPrice: 250,
    rating: 4.93,
    reviewsCount: 22,
    salesCount: 56,
    thumbnail: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-oficina',
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS'],
    features: [
      '7 Páginas Automotivas Completas',
      'Formulário para pedido de orçamento por modelo de carro',
      'Lista detalhada de serviços mecânicos e diagnóstico',
      'Equipe de técnicos certificados ASE/SENAI',
      'Localização e suporte de guincho com contato rápido'
    ],
    includedFiles: ['Código TypeScript', 'Componentes UI', 'Manual do proprietário'],
    seller: {
      id: 'auto-themes',
      name: 'AutoTech Web',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      badge: 'Criador Verificado',
      verified: true,
      salesCount: 95,
      rating: 4.93,
      responseTime: '< 20 min'
    },
    createdDate: '2026-03-20',
    updatedDate: '2026-08-09',
    reviews: []
  },

  // 15. Café (6 páginas)
  {
    id: 'grao-nobre-cafe',
    title: 'Grão Nobre — Cafeteria Especial, Bistrô & Eventos',
    slug: 'grao-nobre-cafe',
    category: 'cafe',
    categoryName: 'Café & Bistrô',
    pageCount: 6,
    pages: ['Home', 'Menu', 'Sobre', 'Galeria', 'Eventos', 'Contactos'],
    shortDescription: 'Website acolhedor para cafeterias artesanais, confeitarias e brunch houses com cardápio de cafés especiais e agenda cultural.',
    fullDescription: 'O Grão Nobre valoriza a cultura do café especial e boa conversa. Possui 6 páginas: Home convidativa, Cardápio com métodos de extração e delícias de confeitaria, Sobre a origem dos grãos e torrefação artesanal, Galeria de fotos do ambiente e preparos, Agenda de eventos (jazz acústico e workshops) e Contactos com horário de atendimento.',
    price: { standard: 129, extended: 329, installation: 499 },
    originalPrice: 210,
    rating: 4.97,
    reviewsCount: 27,
    salesCount: 69,
    thumbnail: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-cafe',
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS'],
    features: [
      '6 Páginas de Cafeteria & Bistrô',
      'Cardápio de cafés especiais e brunch artesanal',
      'Agenda de eventos musicais e workshops de barista',
      'Galeria fotográfica de alta definição',
      'Integração direta com WhatsApp e localização'
    ],
    includedFiles: ['Código React + TypeScript', 'Cardápio JSON', 'Documentação'],
    seller: {
      id: 'gastro-lab',
      name: 'GastroTheme Lab',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      badge: 'Criador Verificado',
      verified: true,
      salesCount: 195,
      rating: 4.97,
      responseTime: '< 15 min'
    },
    createdDate: '2026-04-05',
    updatedDate: '2026-08-07',
    reviews: []
  },

  // 16. Blog / Revista (6 páginas)
  {
    id: 'the-chronicle-magazine',
    title: 'The Chronicle — Blog, Revista Digital & Portal de Notícias',
    slug: 'the-chronicle-magazine',
    category: 'blog',
    categoryName: 'Blog & Revista',
    pageCount: 6,
    pages: ['Home', 'Categorias', 'Artigo', 'Sobre', 'Autores', 'Contactos'],
    shortDescription: 'Portal de notícias e artigos com leitura otimizada, busca, categorias, artigos relacionados, página de autor e newsletter.',
    fullDescription: 'O The Chronicle foi planejado para publicações de alta frequência e excelente legibilidade. Possui 6 páginas: Home com manchete e destaques, Navegação por categorias, Leitor de artigo individual com tempo de leitura e autor, Sobre o portal, Perfil dos autores e jornalistas e Contactos com a redação. Inclui sistema de busca em tempo real e captura de emails.',
    price: { standard: 129, extended: 349, installation: 519 },
    originalPrice: 220,
    rating: 4.94,
    reviewsCount: 36,
    salesCount: 84,
    thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-blog',
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS'],
    features: [
      '6 Páginas Editoriais de Alta Performance',
      'Sistema de busca de artigos em tempo real',
      'Página de leitura de artigo com artigos relacionados',
      'Perfil de autores e colunistas com artigos publicados',
      'Estrutura otimizada para SEO e Rich Snippets'
    ],
    includedFiles: ['Código TypeScript', 'Artigos de amostra pré-formatados', 'Guia de uso'],
    seller: {
      id: 'blog-lab',
      name: 'ContentForge',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      badge: 'Criador Verificado',
      verified: true,
      salesCount: 170,
      rating: 4.94,
      responseTime: '< 20 min'
    },
    createdDate: '2026-03-01',
    updatedDate: '2026-08-15',
    reviews: []
  },

  // 17. Startup / Tecnologia (8 páginas)
  {
    id: 'saasflow-startup-pro',
    title: 'SaaSFlow — Startup, Software em Nuvem & Preços',
    slug: 'saasflow-startup-pro',
    category: 'startup',
    categoryName: 'Startup & Tech',
    pageCount: 8,
    pages: ['Home', 'Produto', 'Funcionalidades', 'Preços', 'Sobre', 'Equipa', 'Blog', 'Contactos'],
    shortDescription: 'Website corporativo para startups de tecnologia e SaaS B2B com tour do produto, tabela de planos, equipe e blog.',
    fullDescription: 'O SaaSFlow acelera a conversão de startups de tecnologia. Com 8 páginas completas: Home de alta conversão com proposta de valor, Visão geral do produto em nuvem, Detalhamento de funcionalidades e integrações, Tabela comparativa de planos Starter/Pro/Enterprise, Sobre a missão da empresa, Equipe de fundadores e engenharia, Blog tech e Formulário de contato comercial.',
    price: { standard: 179, extended: 449, installation: 679 },
    originalPrice: 310,
    rating: 4.98,
    reviewsCount: 44,
    salesCount: 105,
    thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-startup',
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS'],
    features: [
      '8 Páginas para Startups & Empresas Tech',
      'Tabela interativa de planos e cobrança mensal/anual',
      'Demonstração de produto e funcionalidades em cards',
      'Seção de equipe com fotos e cargos de liderança',
      'Blog integrado para estratégias de inbound marketing'
    ],
    includedFiles: ['Código TypeScript modular', 'Componentes UI', 'Manual de implantação'],
    seller: {
      id: 'saas-builder',
      name: 'SaaS Architecture Co.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      badge: 'Criador Oficial',
      verified: true,
      salesCount: 520,
      rating: 4.98,
      responseTime: '< 10 min'
    },
    createdDate: '2026-02-12',
    updatedDate: '2026-08-16',
    reviews: []
  },

  // 18. Empresa de Construção (7 páginas)
  {
    id: 'apex-construcao-civil',
    title: 'Apex Construtora — Engenharia Civil, Obras & Projetos',
    slug: 'apex-construcao-civil',
    category: 'construcao',
    categoryName: 'Construção Civil',
    pageCount: 7,
    pages: ['Home', 'Serviços', 'Projetos', 'Projeto individual', 'Sobre', 'Equipa', 'Contactos'],
    shortDescription: 'Website institucional para construtoras, empreiteiras e escritórios de engenharia civil com portfólio de obras e orçamentos.',
    fullDescription: 'O Apex Construtora transmite a solidez de grandes obras. Com 7 páginas dedicadas: Home com números e obras entregues, Serviços de construção residencial/comercial e laudos estruturais, Catálogo de projetos realizados, Ficha individual de obra com detalhes técnicos, História e certificações CREA, Equipe de engenheiros e mestres de obra e Contactos para visita técnica.',
    price: { standard: 159, extended: 399, installation: 599 },
    originalPrice: 280,
    rating: 4.95,
    reviewsCount: 25,
    salesCount: 62,
    thumbnail: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-construcao',
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS'],
    features: [
      '7 Páginas de Engenharia & Construção',
      'Portfólio de obras com ficha técnica individual',
      'Apresentação de serviços de alvenaria, estrutura e reformas',
      'Apresentação do corpo de engenheiros registrados',
      'Formulário para visita técnica e orçamento de obra'
    ],
    includedFiles: ['Código React TypeScript', 'Layout de cases de obras', 'README'],
    seller: {
      id: 'eng-themes',
      name: 'ConstructUX',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      badge: 'Criador Verificado',
      verified: true,
      salesCount: 115,
      rating: 4.95,
      responseTime: '< 20 min'
    },
    createdDate: '2026-03-15',
    updatedDate: '2026-08-11',
    reviews: []
  },

  // 19. Eventos / Casamentos (7 páginas)
  {
    id: 'celebrate-eventos-casamentos',
    title: 'Celebrate Eventos — Cerimonial, Casamentos & Produção',
    slug: 'celebrate-eventos-casamentos',
    category: 'eventos',
    categoryName: 'Eventos & Casamentos',
    pageCount: 7,
    pages: ['Home', 'Evento', 'Serviços', 'Galeria', 'Pacotes', 'Depoimentos', 'Contactos'],
    shortDescription: 'Website sofisticado para assessoria de casamentos, debutantes e eventos corporativos com pacotes, galeria e pedido de orçamento.',
    fullDescription: 'O Celebrate Eventos encanta noivos e anfitriões desde o primeiro clique. Com 7 páginas dedicadas: Home emocionante, Tipos de eventos organizados, Serviços de cerimonial e decoração floral, Galeria com fotos reais de casamentos, Tabela de pacotes e valores, Depoimentos de clientes satisfeitos e Formulário de orçamento personalizado com data e convidados.',
    price: { standard: 149, extended: 389, installation: 579 },
    originalPrice: 260,
    rating: 4.97,
    reviewsCount: 34,
    salesCount: 80,
    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-eventos',
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS'],
    features: [
      '7 Páginas de Eventos & Cerimonial',
      'Formulário exclusivo para pedido de orçamento de casamento',
      'Galeria de fotos de alta resolução de festas reais',
      'Pacotes de assessoria completa e do dia',
      'Seção de depoimentos com fotos de casais'
    ],
    includedFiles: ['Código TypeScript', 'Banners e tipografia elegante', 'Manual de uso'],
    seller: {
      id: 'wedding-lab',
      name: 'EventCraft Design',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      badge: 'Criador Verificado',
      verified: true,
      salesCount: 180,
      rating: 4.97,
      responseTime: '< 15 min'
    },
    createdDate: '2026-02-28',
    updatedDate: '2026-08-13',
    reviews: []
  },

  // 20. Freelancer (7 páginas)
  {
    id: 'pro-freelancer-copywriter',
    title: 'Venture Freelancer — Serviços, Copywriting & Portfólio',
    slug: 'pro-freelancer-copywriter',
    category: 'freelancer',
    categoryName: 'Freelancer',
    pageCount: 7,
    pages: ['Home', 'Sobre', 'Serviços', 'Portfólio', 'Projeto individual', 'Preços', 'Contactos'],
    shortDescription: 'Website profissional para freelancers, copywriters, consultores e prestadores de serviços independentes fecharem clientes de alto valor.',
    fullDescription: 'O Venture Freelancer valoriza o trabalho independente e atrai clientes qualificados. Com 7 páginas dedicadas: Home com posicionamento e proposta única de valor, Sobre a trajetória profissional, Catálogo de serviços prestados, Portfólio de cases entregues, Ficha individual de estudo de caso, Tabela de preços e pacotes de contratação e Formulário de contato direto.',
    price: { standard: 119, extended: 299, installation: 479 },
    originalPrice: 199,
    rating: 4.98,
    reviewsCount: 42,
    salesCount: 99,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'
    ],
    demoUrl: '#demo-freelancer',
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS'],
    features: [
      '7 Páginas de Posicionamento Freelancer',
      'Showcase de cases com estudo de caso detalhado',
      'Tabela transparente de preços e formatos de contratação',
      'Página de serviços com entregáveis claros',
      'Formulário rápido para briefing de novos projetos'
    ],
    includedFiles: ['Código React + TypeScript', 'JSON customizável', 'Documentação'],
    seller: {
      id: 'growth-studio',
      name: 'ConversionCraft',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      badge: 'Criador Top Vendas',
      verified: true,
      salesCount: 490,
      rating: 4.98,
      responseTime: '< 5 min'
    },
    createdDate: '2026-01-25',
    updatedDate: '2026-08-16',
    reviews: []
  }
];
