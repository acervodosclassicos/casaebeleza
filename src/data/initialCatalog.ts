import { Product, Category, Banner, StoreSettings } from '../types';

export interface EnrichedCategory extends Category {
  imageUrl?: string;
  tag?: string;
}

export const INITIAL_CATEGORIES: EnrichedCategory[] = [
  {
    id: 'beleza-cosmeticos',
    name: 'Skincare & Tratamentos',
    slug: 'beleza-cosmeticos',
    icon: 'Sparkles',
    description: 'Tratamentos faciais, séruns antioxidantes, protetores e hidratação profunda.',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'maquiagem-acessorios',
    name: 'Maquiagem & Acessórios',
    slug: 'maquiagem-acessorios',
    icon: 'Palette',
    description: 'Pincéis profissionais, paletas, batons matte e iluminadores.',
    imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'produtos-cabelo',
    name: 'Cabelos & Cronograma',
    slug: 'produtos-cabelo',
    icon: 'Scissors',
    description: 'Máscaras reconstrutoras, óleos nutritivos e finalizadores térmicos.',
    imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cuidados-pessoais',
    name: 'Cuidados Pessoais',
    slug: 'cuidados-pessoais',
    icon: 'Heart',
    description: 'Mousses de limpeza, loções corporais, sabonetes e autocuidado diário.',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'organizacao-domestica',
    name: 'Organização Doméstica',
    slug: 'organizacao-domestica',
    icon: 'Box',
    description: 'Organizadores de maquiagem em acrílico 360°, colmeias e cestos modernos.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'casa-decoracao',
    name: 'Casa & Decoração',
    slug: 'casa-decoracao',
    icon: 'Home',
    description: 'Difusores ultrassônicos, aromatizadores de ambiente e iluminação aconchegante.',
    imageUrl: 'https://images.unsplash.com/photo-1608248597359-5f284c4f34f8?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'utilidades-lar',
    name: 'Utilidades para o Lar',
    slug: 'utilidades-lar',
    icon: 'Coffee',
    description: 'Dispensers inteligentes, mops práticos e facilidades para a rotina.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'presentes-novidades',
    name: 'Presentes & Espelhos LED',
    slug: 'presentes-novidades',
    icon: 'Gift',
    description: 'Espelhos com iluminação touch, kits de presentes e mimos exclusivos.',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
  },
];

export const INITIAL_BANNERS: Banner[] = [];

export const INITIAL_SETTINGS: StoreSettings = {
  id: 'store_config',
  storeName: 'Casa & Beleza Express',
  contactPhone: '',
  contactEmail: '',
  whatsappNumber: '',
  instagramUrl: '',
  facebookUrl: '',
  announcementText: '🚚 FRETE GRÁTIS EM COMPRAS A PARTIR DE R$ 49,99',
  freeShippingThreshold: 49.99,
  defaultShippingCost: 14.9,
  seoTitle: 'Casa & Beleza Express | Cosméticos, Cuidados e Decoração',
  seoDescription: 'Produtos de beleza, cuidados pessoais, casa e decoração. Frete grátis em compras a partir de R$ 49,99.',
  ogImageUrl: '',
};

export const INITIAL_PRODUCTS: Product[] = [];
