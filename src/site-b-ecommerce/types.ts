export interface NovaProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  promoPrice?: number;
  category: string;
  categoryName: string;
  images: string[];
  stock: number;
  sku: string;
  rating: number;
  reviewsCount: number;
  status: 'active' | 'draft' | 'featured' | 'deal';
  isNew?: boolean;
  tags?: string[];
  specs?: { label: string; value: string }[];
  variations?: {
    name: string;
    options: string[];
  }[];
}

export interface NovaCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image: string;
  productCount: number;
}

export interface NovaCartItem {
  product: NovaProduct;
  quantity: number;
  selectedVariation?: Record<string, string>;
}

export interface NovaOrder {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: 'pix' | 'credit_card' | 'boleto';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingCode?: string;
}

export interface NovaCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  registeredDate: string;
  city: string;
}

export interface NovaStoreSettings {
  storeName: string;
  storeTagline: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  address: string;
  currency: string;
  freeShippingThreshold: number;
  fixedShippingRate: number;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerCta: string;
  bannerImage: string;
  accentColor: string;
}

export interface NovaReview {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}
