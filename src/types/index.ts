export interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  subcategory?: string;
  brand: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  sku: string;
  barcode?: string;
  weight?: number;
  images: string[];
  thumbnail: string;
  featured?: boolean;
  flashDeal?: boolean;
  isNew?: boolean;
  freeShipping?: boolean;
  active: boolean;
  externalPaymentLink?: string;
  variations?: { name: string; options: string[] }[];
  displayOrder?: number;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  itemCount?: number;
}

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
  variation?: string;
  stock: number;
  externalPaymentLink?: string;
}

export interface ShippingAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  customerCpf?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  shippingAddress: ShippingAddress;
  status:
    | 'aguardando_pagamento'
    | 'pagamento_aprovado'
    | 'em_preparacao'
    | 'enviado'
    | 'entregue'
    | 'cancelado';
  paymentMethod: string;
  paymentExternalLink?: string;
  externalReference?: string;
  trackingCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  authorName: string;
  authorEmail?: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  adminReply?: string;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
  linkUrl?: string;
  ctaText: string;
  badgeText?: string;
  active: boolean;
  order: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxUses?: number;
  usedCount?: number;
  active: boolean;
  startDate?: string;
  expiryDate?: string;
}

export interface StoreSettings {
  id: string;
  storeName: string;
  logoUrl?: string;
  contactPhone: string;
  contactEmail: string;
  whatsappNumber: string;
  instagramUrl: string;
  facebookUrl: string;
  announcementText: string;
  freeShippingThreshold: number;
  defaultShippingCost: number;
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'customer';
  phone?: string;
  photoURL?: string;
  address?: ShippingAddress;
  createdAt: string;
  updatedAt?: string;
}
