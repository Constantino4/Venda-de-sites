export type CategoryType = 
  | 'ecommerce'
  | 'saas'
  | 'medical'
  | 'realestate'
  | 'restaurant'
  | 'portfolio'
  | 'fitness'
  | 'legal'
  | 'education';

export type LicenseOption = 'standard' | 'extended' | 'installation';

export interface LicensePricing {
  standard: number;     // 1 personal/client site
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

export interface Website {
  id: string;
  title: string;
  slug: string;
  category: CategoryType;
  categoryName: string;
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
  status?: 'active' | 'hidden';
  currentVersion?: string;
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

export interface CustomizerConfig {
  accentColor: 'emerald' | 'indigo' | 'rose' | 'amber' | 'cyan' | 'purple';
  isDark: boolean;
  businessName: string;
  businessTagline: string;
  viewport: 'desktop' | 'tablet' | 'mobile';
}
