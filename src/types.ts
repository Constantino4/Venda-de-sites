export type CategoryType = 
  | 'barbearia'
  | 'restaurante'
  | 'hotel'
  | 'agencia'
  | 'portfolio'
  | 'fotografia'
  | 'escola'
  | 'igreja'
  | 'ecommerce'
  | 'imobiliaria'
  | 'clinica'
  | 'ginasio'
  | 'salao'
  | 'oficina'
  | 'cafe'
  | 'blog'
  | 'startup'
  | 'construcao'
  | 'eventos'
  | 'freelancer'
  | 'landing'
  | 'saas'
  | 'medical'
  | 'realestate'
  | 'fitness'
  | 'legal'
  | 'outros';

export type LicenseOption = 'standard' | 'extended' | 'installation';

export interface LicensePricing {
  standard: number;     // 1 personal/client site
  promoPrice?: number;  // Optional promotional price
  extended: number;     // Unlimited agency/client use
  installation: number; // Includes developer setup service
}

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  badge: string;
  verified: boolean;
  salesCount: number;
  rating: number;
  responseTime: string;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
}

export interface ProductVersion {
  id: string;
  productId: string;
  versionNumber: string;
  releaseDate: string;
  changelog: string;
  zipFilename: string;
  zipSize: string;
  detectedStack: string;
  fileCount: number;
  zipPath?: string;
  firebasePrivateZipPath?: string;
  firebasePrivateDownloadUrl?: string;
}

export interface ProductDemo {
  id: string;
  productId: string;
  versionNumber: string;
  demoUrl: string;
  status: 'building' | 'deployed' | 'failed';
  logs: string[];
  deployedAt: string;
  firebasePublicDemoPath?: string;
  firebasePublicDemoUrl?: string;
}

export interface UpsellItem {
  id: string;
  title: string;
  description: string;
  price: number;
  iconName: string;
  recommended?: boolean;
}

export interface SiteCustomizationData {
  businessName: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  instagram: string;
  facebook: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  openingHours: string;
  servicesList: Array<{ title: string; price: string; description: string }>;
  ctaText: string;
  seoTitle: string;
  seoDescription: string;
}

export interface DomainRecord {
  id: string;
  orderId?: string;
  productId?: string;
  siteId?: string;
  siteTitle?: string;
  domain: string;
  status: 'not_configured' | 'pending' | 'verifying' | 'active' | 'error';
  configuredAt?: string;
  createdAt?: string;
  sslActive: boolean;
  dnsRecords: {
    type: string;
    name: string;
    value: string;
    status: 'configured' | 'missing';
  }[];
}

export interface LicenseRecord {
  id: string;
  licenseKey: string;
  orderId: string;
  productId: string;
  productTitle: string;
  customerEmail: string;
  licenseType: LicenseOption;
  status: 'active' | 'suspended' | 'expired' | 'refunded';
  allowedProjects: number;
  usedProjects: number;
  createdAt: string;
}

export interface SubscriptionRecord {
  id: string;
  orderId: string;
  productTitle: string;
  planName: string;
  priceMonthly: number;
  billingCycle: 'monthly' | 'annual';
  status: 'active' | 'paused' | 'cancelled';
  nextBillingDate: string;
  features: string[];
}

export interface SupportTicket {
  id: string;
  customerEmail: string;
  subject: string;
  category: 'deploy' | 'customization' | 'dns' | 'payment' | 'other';
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'normal' | 'high' | 'urgent';
  createdAt: string;
  messages: {
    sender: 'customer' | 'support';
    text: string;
    timestamp: string;
  }[];
}

export interface InvoiceRecord {
  id: string;
  orderId: string;
  customerEmail: string;
  customerName?: string;
  amount: number;
  paymentMethod: string;
  status: 'paid' | 'pending' | 'refunded';
  issuedAt: string;
  items: { description: string; amount: number }[];
}

export interface CustomizerConfig {
  accentColor: string;
  isDark: boolean;
  businessName: string;
  businessTagline: string;
  viewport: 'desktop' | 'tablet' | 'mobile';
}

export interface Website {
  id: string;
  title: string;
  slug: string;
  category: CategoryType;
  categoryName: string;
  pageCount?: number;
  pages?: string[];
  shortDescription: string;
  fullDescription: string;
  price: LicensePricing;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  salesCount: number;
  thumbnail: string;
  galleryImages: string[];
  demoUrl: string;
  techStack: string[];
  features: string[];
  includedFiles: string[];
  seller: Seller;
  createdDate: string;
  updatedDate: string;
  reviews: Review[];
  sampleFiles?: Record<string, string>; // File path -> Source code content
  status?: 'published' | 'draft' | 'hidden' | 'active';
  customizer?: CustomizerConfig;
  customContent?: {
    heroTitle?: string;
    heroSubtitle?: string;
    customCta?: string;
    customPhone?: string;
    announcementBar?: string;
    customNotes?: string;
    [key: string]: any;
  };
  currentVersion?: string;
  isFeatured?: boolean;
  storageStatus?: {
    hasPrivateZip: boolean;
    hasPublicDemo: boolean;
    currentVersion: string;
    uploadedAt: string;
  };
  seoMeta?: {
    title?: string;
    metaDescription?: string;
    focusKeyword?: string;
    keywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
    score?: number;
    lastAnalysis?: SeoAnalysisResult;
  };
  versions?: ProductVersion[];
  demoDetails?: ProductDemo;
  zipFileUrl?: string;
  detectedStack?: string;
  firebaseStorageBucket?: string;
  firebasePrivateStoragePath?: string;
  firebasePublicStoragePath?: string;
}

export interface Order {
  id: string;
  customerEmail: string;
  items: CartItem[];
  status: 'pending' | 'paid' | 'cancelled';
  totalAmount: number;
  paymentMethod: 'paypal' | 'pix' | 'card';
  paypalOrderId?: string;
  createdDate: string;
  paidDate?: string;
}

export interface DownloadLog {
  id: string;
  orderId: string;
  productId: string;
  versionNumber: string;
  customerEmail: string;
  downloadedAt: string;
  ipAddress?: string;
}

export interface ClientDeployment {
  id: string;
  orderId: string;
  productId: string;
  platform: 'github' | 'vercel' | 'github_vercel';
  repoUrl?: string;
  deployUrl?: string;
  status: 'pending' | 'in_progress' | 'success' | 'failed';
  logs: string[];
  createdAt: string;
}

export interface CartItem {
  website: Website;
  licenseType: LicenseOption;
  selectedPrice: number;
}

export interface PurchasedSite {
  orderId: string;
  purchaseDate: string;
  website: Website;
  licenseType: LicenseOption;
  licenseKey: string;
  pricePaid: number;
  orderStatus: 'pending' | 'paid';
  downloadUrl?: string;
  currentVersion?: string;
  availableVersions?: ProductVersion[];
  deployments?: ClientDeployment[];
}

export interface SellerMetrics {
  totalEarnings: number;
  totalSales: number;
  activeListings: number;
  conversionRate: number;
  monthlyRevenue: { month: string; amount: number }[];
}

export interface FilterState {
  searchQuery: string;
  category: string;
  priceRange: [number, number];
  techStack: string[];
  minRating: number;
  sortBy: 'popular' | 'rating' | 'price-asc' | 'price-desc' | 'newest';
}

export interface SeoKeywordItem {
  keyword: string;
  intent: 'commercial' | 'transactional' | 'informational' | 'navigational';
  volumeRating: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  relevanceScore: number;
}

export interface SeoAnalysisResult {
  score: number; // 0 to 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  focusKeyword: string;
  searchIntent: 'commercial' | 'transactional' | 'informational' | 'navigational';
  titleSuggestions: {
    recommended: string;
    charCount: number;
    benefits: string;
    variations: string[];
  };
  metaDescriptionSuggestions: {
    recommended: string;
    charCount: number;
    ctrImpact: string;
    variations: string[];
  };
  keywordStrategy: {
    primaryKeyword: SeoKeywordItem;
    secondaryKeywords: SeoKeywordItem[];
    longTailKeywords: Array<{ keyword: string; intent: string; trafficOpportunity: string }>;
    negativeOrAvoidKeywords: string[];
  };
  openGraphTags: {
    ogTitle: string;
    ogDescription: string;
    ogType: string;
    twitterCard: string;
    twitterTitle: string;
    twitterDescription: string;
  };
  structuredDataJsonLd?: Record<string, any>;
  scoreBreakdown: {
    titleQuality: { score: number; max: number; status: 'excellent' | 'good' | 'needs_improvement'; note: string };
    metaDescriptionQuality: { score: number; max: number; status: 'excellent' | 'good' | 'needs_improvement'; note: string };
    keywordRelevance: { score: number; max: number; status: 'excellent' | 'good' | 'needs_improvement'; note: string };
    searchIntentAlignment: { score: number; max: number; status: 'excellent' | 'good' | 'needs_improvement'; note: string };
    socialSharingReady: { score: number; max: number; status: 'excellent' | 'good' | 'needs_improvement'; note: string };
  };
  actionableRecommendations: Array<{
    category: 'title' | 'description' | 'keywords' | 'technical' | 'copy';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionLabel?: string;
  }>;
  analyzedAt: string;
}

export interface CatalogSeoSummary {
  averageScore: number;
  totalAnalyzed: number;
  topOpportunities: string[];
  scoreDistribution: {
    excellent: number; // 85-100
    good: number; // 70-84
    needsWork: number; // < 70
  };
  products: Array<{
    productId: string;
    title: string;
    categoryName: string;
    score: number;
    focusKeyword: string;
    status: 'optimized' | 'needs_attention';
  }>;
}


