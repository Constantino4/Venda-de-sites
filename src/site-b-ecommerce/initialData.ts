import { NovaProduct, NovaCategory, NovaStoreSettings, NovaOrder, NovaCustomer } from './types';

export const INITIAL_CATEGORIES: NovaCategory[] = [
  {
    id: 'eletronicos',
    name: 'Eletrônicos & Smart',
    slug: 'eletronicos',
    icon: 'Smartphone',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    productCount: 18
  },
  {
    id: 'moda-acessorios',
    name: 'Moda & Acessórios',
    slug: 'moda-acessorios',
    icon: 'Shirt',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80',
    productCount: 24
  },
  {
    id: 'casa-decor',
    name: 'Casa & Decoração',
    slug: 'casa-decor',
    icon: 'Home',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    productCount: 14
  },
  {
    id: 'beleza-saude',
    name: 'Beleza & Cuidados',
    slug: 'beleza-saude',
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    productCount: 12
  },
  {
    id: 'calcados-tenis',
    name: 'Calçados & Tênis',
    slug: 'calcados-tenis',
    icon: 'Footprints',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    productCount: 16
  }
];

export const INITIAL_PRODUCTS: NovaProduct[] = [
  {
    id: 'prod-1',
    name: 'Fone de Ouvido Wireless Noise Cancelling Pro ANC',
    slug: 'fone-wireless-anc-pro',
    description: 'Experimente a pureza do áudio em alta resolução com cancelamento ativo de ruído híbrido de até 45dB, drivers de 40mm de neodímio e bateria de altíssima autonomia com até 50 horas de reprodução contínua. Almofadas ultra macias em couro ecológico respirável para conforto prolongado durante todo o dia.',
    shortDescription: 'Cancelamento ativo de ruído híbrido 45dB, áudio Hi-Res e bateria de 50h.',
    price: 389.90,
    promoPrice: 289.90,
    category: 'eletronicos',
    categoryName: 'Eletrônicos & Smart',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 42,
    sku: 'EL-FON-001',
    rating: 4.9,
    reviewsCount: 68,
    status: 'deal',
    isNew: true,
    tags: ['Promoção Relâmpago', 'Mais Vendido', 'Frete Grátis'],
    specs: [
      { label: 'Conectividade', value: 'Bluetooth 5.3 + Cabo P2' },
      { label: 'Autonomia', value: '50 horas sem ANC / 38 horas com ANC' },
      { label: 'Tempo de Carga', value: '1.5 horas (Fast Charge USB-C)' },
      { label: 'Peso', value: '250g' }
    ],
    variations: [
      { name: 'Cor', options: ['Preto Fosco', 'Prata Lunar', 'Azul Marinho'] }
    ]
  },
  {
    id: 'prod-2',
    name: 'Smartwatch Titanium Sport Ultra GPS & Monitor Cardíaco',
    slug: 'smartwatch-titanium-sport-ultra',
    description: 'O parceiro ideal para suas metas esportivas e controle de saúde em tempo real. Corpo construído em liga de titânio aeroespacial, tela AMOLED de 1.96 polegadas com Always-On Display, sensor óptico de frequência cardíaca, SpO2, monitoramento de sono profundo e resistência à água até 50 metros (5 ATM).',
    shortDescription: 'Corpo em titânio, tela AMOLED 1.96", GPS integrado e bateria para 14 dias.',
    price: 499.00,
    promoPrice: 399.00,
    category: 'eletronicos',
    categoryName: 'Eletrônicos & Smart',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 28,
    sku: 'EL-WAT-002',
    rating: 4.8,
    reviewsCount: 45,
    status: 'featured',
    isNew: true,
    tags: ['Lançamento', 'Destaque'],
    specs: [
      { label: 'Tela', value: 'AMOLED 1.96" 410x502 px' },
      { label: 'Resistência', value: '5 ATM (50 metros)' },
      { label: 'Bateria', value: '450mAh (até 14 dias)' },
      { label: 'Compatibilidade', value: 'iOS e Android' }
    ],
    variations: [
      { name: 'Pulseira', options: ['Silicone Laranja', 'Silicone Preto', 'Aço Prateado'] }
    ]
  },
  {
    id: 'prod-3',
    name: 'Tênis Running Ultralight Carbon Pro',
    slug: 'tenis-running-ultralight-carbon',
    description: 'Desenvolvido para corredores que buscam máxima propulsão e amortecimento responsivo. Possui placa interna de fibra de carbono integral, entressola em espuma de nitrogênio infundido e cabedal em knit respirável sem costuras.',
    shortDescription: 'Placa de carbono, entressola com retorno de energia e peso de apenas 198g.',
    price: 549.90,
    promoPrice: 429.90,
    category: 'calcados-tenis',
    categoryName: 'Calçados & Tênis',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 35,
    sku: 'CAL-TEN-003',
    rating: 5.0,
    reviewsCount: 52,
    status: 'deal',
    isNew: false,
    tags: ['Alta Performance', 'Oferta'],
    specs: [
      { label: 'Drop', value: '8mm' },
      { label: 'Tipo de Pisada', value: 'Neutra' },
      { label: 'Indicação', value: 'Asfalto, esteira e provas longas' }
    ],
    variations: [
      { name: 'Tamanho', options: ['38', '39', '40', '41', '42', '43'] },
      { name: 'Cor', options: ['Vermelho Carmim', 'Preto & Dourado', 'Branco Puro'] }
    ]
  },
  {
    id: 'prod-4',
    name: 'Mochila Executiva Impermeável Tech Urban com Porta USB',
    slug: 'mochila-executiva-tech-urban',
    description: 'Design contemporâneo e funcionalidade impecável para profissionais e viajantes. Confeccionada em tecido Oxford impermeável de alta densidade, compartimento acolchoado para notebook de até 16 polegadas, sistema antifurto com zíper oculto e porta externa USB para recarga.',
    shortDescription: 'Tecido impermeável, compartimento para notebook 16" e bolso antifurto.',
    price: 249.00,
    promoPrice: 189.90,
    category: 'moda-acessorios',
    categoryName: 'Moda & Acessórios',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 50,
    sku: 'MOD-MOC-004',
    rating: 4.85,
    reviewsCount: 39,
    status: 'featured',
    isNew: false,
    tags: ['Prático', 'Resistente'],
    specs: [
      { label: 'Capacidade', value: '28 Litros' },
      { label: 'Dimensões', value: '46cm x 31cm x 15cm' },
      { label: 'Material', value: 'Oxford 900D Hidrorrepelente' }
    ],
    variations: [
      { name: 'Cor', options: ['Cinza Chumbo', 'Preto Carbono'] }
    ]
  },
  {
    id: 'prod-5',
    name: 'Luminária de Mesa Minimalista LED Touch com Carregador por Indução',
    slug: 'luminaria-mesa-led-touch-inducao',
    description: 'Elegância e tecnologia para o seu ambiente de trabalho ou leitura. Ajuste de temperatura de cor (quente, neutra e fria) com controle tátil contínuo de brilho, haste articulada em alumínio anodizado e base com carregador sem fio Qi de 15W integrado.',
    shortDescription: 'LED com 3 tons de luz, dimmer touch contínuo e carregamento sem fio 15W.',
    price: 199.90,
    promoPrice: 149.90,
    category: 'casa-decor',
    categoryName: 'Casa & Decoração',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 22,
    sku: 'CAS-LUM-005',
    rating: 4.75,
    reviewsCount: 31,
    status: 'featured',
    isNew: true,
    tags: ['Casa Inteligente', 'Design Nórdico'],
    specs: [
      { label: 'Potência LED', value: '10W (800 lumens)' },
      { label: 'Carregamento Qi', value: '15W Fast Charge' },
      { label: 'Alimentação', value: 'Bivolt Automático 110V/220V' }
    ],
    variations: [
      { name: 'Cor da Base', options: ['Branco Mate', 'Preto Acetinado'] }
    ]
  },
  {
    id: 'prod-6',
    name: 'Kit Sérum Facial Rejuvenescedor Ácido Hialurônico + Vitamina C',
    slug: 'kit-serum-facial-vitamina-c-acido-hialuronico',
    description: 'Tratamento dermatológico completo para hidratação profunda, uniformização do tom da pele e estímulo natural de colágeno. Fórmula vegana enriquecida com Vitamina C estabilizada a 15%, Ácido Hialurônico de baixo peso molecular e Niacinamida.',
    shortDescription: 'Vitamina C 15%, Ácido Hialurônico puro e Niacinamida. Fórmula 100% vegana.',
    price: 159.90,
    promoPrice: 119.90,
    category: 'beleza-saude',
    categoryName: 'Beleza & Cuidados',
    images: [
      'https://images.unsplash.com/photo-1608248597359-0d2979268800?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 64,
    sku: 'BEL-SER-006',
    rating: 4.95,
    reviewsCount: 82,
    status: 'deal',
    isNew: false,
    tags: ['Best-Seller', 'Cruelty Free'],
    specs: [
      { label: 'Volume', value: '2 frascos de 30ml' },
      { label: 'Uso Indicado', value: 'Diurno e Noturno (todos os tipos de pele)' },
      { label: 'Origem', value: 'Dermatologicamente Testado' }
    ]
  }
];

export const INITIAL_ORDERS: NovaOrder[] = [
  {
    id: 'ord-101',
    orderNumber: '#NV-9482',
    date: '2026-08-15 14:23',
    customerName: 'Mariana Oliveira',
    customerEmail: 'mariana.oliveira@email.com',
    customerPhone: '(11) 98765-4321',
    address: {
      street: 'Av. Paulista',
      number: '1200, Apto 82',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      country: 'Brasil'
    },
    items: [
      {
        productId: 'prod-1',
        productName: 'Fone de Ouvido Wireless Noise Cancelling Pro ANC',
        quantity: 1,
        price: 289.90,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80'
      }
    ],
    subtotal: 289.90,
    discount: 0,
    shipping: 0,
    total: 289.90,
    paymentMethod: 'pix',
    paymentStatus: 'paid',
    orderStatus: 'shipped',
    trackingCode: 'BR-849201948SP'
  },
  {
    id: 'ord-102',
    orderNumber: '#NV-9483',
    date: '2026-08-16 09:15',
    customerName: 'Rodrigo Albuquerque',
    customerEmail: 'rodrigo.alb@email.com',
    customerPhone: '(21) 97654-3210',
    address: {
      street: 'Rua Visconde de Pirajá',
      number: '350',
      neighborhood: 'Ipanema',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '22410-002',
      country: 'Brasil'
    },
    items: [
      {
        productId: 'prod-3',
        productName: 'Tênis Running Ultralight Carbon Pro',
        quantity: 1,
        price: 429.90,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80'
      }
    ],
    subtotal: 429.90,
    discount: 20.00,
    shipping: 15.00,
    total: 424.90,
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    orderStatus: 'processing'
  }
];

export const INITIAL_CUSTOMERS: NovaCustomer[] = [
  {
    id: 'cust-1',
    name: 'Mariana Oliveira',
    email: 'mariana.oliveira@email.com',
    phone: '(11) 98765-4321',
    totalOrders: 3,
    totalSpent: 849.70,
    registeredDate: '2026-05-12',
    city: 'São Paulo - SP'
  },
  {
    id: 'cust-2',
    name: 'Rodrigo Albuquerque',
    email: 'rodrigo.alb@email.com',
    phone: '(21) 97654-3210',
    totalOrders: 2,
    totalSpent: 624.80,
    registeredDate: '2026-06-20',
    city: 'Rio de Janeiro - RJ'
  },
  {
    id: 'cust-3',
    name: 'Carla Beatriz Mendes',
    email: 'carla.mendes@email.com',
    phone: '(31) 99123-4567',
    totalOrders: 1,
    totalSpent: 189.90,
    registeredDate: '2026-07-04',
    city: 'Belo Horizonte - MG'
  }
];

export const INITIAL_STORE_SETTINGS: NovaStoreSettings = {
  storeName: 'NovaStore Premium',
  storeTagline: 'Sua Loja de Produtos Selecionados com Qualidade & Entrega Rápida',
  logoUrl: '',
  contactEmail: 'contato@novastore.com.br',
  contactPhone: '(11) 4002-8922',
  whatsappNumber: '5511999998888',
  address: 'Av. das Nações Unidas, 14261 - Brooklin Paulista, São Paulo - SP',
  currency: 'R$',
  freeShippingThreshold: 199.00,
  fixedShippingRate: 19.90,
  bannerTitle: 'Mega Ofertas de Verão com até 40% OFF',
  bannerSubtitle: 'Descubra os melhores produtos de tecnologia, moda e casa com frete grátis para todo o Brasil.',
  bannerCta: 'Explorar Ofertas',
  bannerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
  accentColor: 'indigo'
};

export const INITIAL_SETTINGS = INITIAL_STORE_SETTINGS;

