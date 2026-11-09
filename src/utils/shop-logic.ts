/**
 * Pure e-commerce calculations and business logic for Casa & Beleza Express
 * Standard: Marketplace Brasileiro com política oficial de Frete Grátis a partir de R$ 49,99
 */

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
  variation?: string;
  stock?: number;
  externalPaymentLink?: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxUses?: number;
  usedCount?: number;
  active: boolean;
  expiryDate?: string;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  itemCount: number;
  freeShippingProgress: number; // 0 to 100
  amountNeededForFreeShipping: number;
  isFreeShipping: boolean;
}

export type OrderStatus =
  | 'aguardando_pagamento'
  | 'pagamento_aprovado'
  | 'em_preparacao'
  | 'enviado'
  | 'entregue'
  | 'cancelado';

export const DEFAULT_FREE_SHIPPING_THRESHOLD = 49.99;
export const DEFAULT_STANDARD_SHIPPING = 14.9;

/**
 * Formats a currency value to Brazilian Real standard (pt-BR)
 */
export function formatBRL(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

/**
 * Calculates discount percentage
 */
export function calculateDiscountPercentage(price: number, compareAtPrice?: number): number {
  if (!compareAtPrice || compareAtPrice <= price || compareAtPrice <= 0) {
    return 0;
  }
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

/**
 * Calculates installments (up to 6x interest-free)
 */
export function calculateInstallments(amount: number, maxInstallments = 6): { count: number; value: number; formatted: string } {
  const safeAmount = Math.max(0, amount);
  const count = Math.max(1, Math.min(maxInstallments, Math.floor(safeAmount / 15) || 1));
  const value = safeAmount / count;
  return {
    count,
    value: Math.round(value * 100) / 100,
    formatted: `${count}x de ${formatBRL(value)} sem juros`,
  };
}

/**
 * Validates discount coupon against subtotal
 */
export function validateCoupon(
  coupon: Coupon | null | undefined,
  subtotal: number
): { valid: boolean; discount: number; message: string } {
  if (!coupon) {
    return { valid: false, discount: 0, message: 'Nenhum cupom informado' };
  }

  if (!coupon.active) {
    return { valid: false, discount: 0, message: 'Cupom inativo ou desativado' };
  }

  if (coupon.expiryDate) {
    const expiry = new Date(coupon.expiryDate).getTime();
    if (Date.now() > expiry) {
      return { valid: false, discount: 0, message: 'Este cupom já expirou' };
    }
  }

  if (coupon.maxUses && (coupon.usedCount || 0) >= coupon.maxUses) {
    return { valid: false, discount: 0, message: 'Limite de uso deste cupom atingido' };
  }

  const minPurchase = coupon.minPurchase || 0;
  if (subtotal < minPurchase) {
    return {
      valid: false,
      discount: 0,
      message: `Valor mínimo para este cupom é ${formatBRL(minPurchase)}`,
    };
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.value) / 100;
  } else {
    discount = Math.min(coupon.value, subtotal);
  }

  discount = Math.round(discount * 100) / 100;

  return {
    valid: true,
    discount,
    message: `Cupom ${coupon.code} aplicado! Desconto de ${formatBRL(discount)}`,
  };
}

/**
 * Evaluates whether a cart qualifies for free shipping based on subtotal after coupon discounts.
 * Mandatory business rule: Frete Grátis em compras a partir de R$ 49,99.
 */
export function isEligibleForFreeShipping(
  subtotalAfterDiscount: number,
  freeShippingThreshold = DEFAULT_FREE_SHIPPING_THRESHOLD
): boolean {
  // Round to avoid float precision issues (e.g. 49.9899999999)
  const rounded = Math.round(subtotalAfterDiscount * 100) / 100;
  return rounded >= freeShippingThreshold && rounded > 0;
}

/**
 * Calculates full cart totals including free shipping threshold (R$ 49,99)
 */
export function calculateCartTotals(
  items: CartItem[],
  coupon: Coupon | null | undefined = null,
  freeShippingThreshold = DEFAULT_FREE_SHIPPING_THRESHOLD,
  standardShippingCost = DEFAULT_STANDARD_SHIPPING
): CartTotals {
  const subtotal = items.reduce(
    (sum, item) => sum + Math.max(0, item.price) * Math.max(0, item.quantity),
    0
  );
  const itemCount = items.reduce((sum, item) => sum + Math.max(0, item.quantity), 0);

  const couponResult = validateCoupon(coupon, subtotal);
  const discount = couponResult.valid ? couponResult.discount : 0;
  const subtotalAfterDiscount = Math.max(0, subtotal - discount);

  // Free shipping rule: subtotal after discount >= threshold (49.99)
  const isFree = isEligibleForFreeShipping(subtotalAfterDiscount, freeShippingThreshold) || items.length === 0;
  const shipping = items.length === 0 ? 0 : isFree ? 0 : standardShippingCost;

  const total = Math.max(0, subtotalAfterDiscount + shipping);

  const freeShippingProgress =
    freeShippingThreshold > 0
      ? Math.min(100, Math.round((subtotalAfterDiscount / freeShippingThreshold) * 100))
      : 100;

  const amountNeeded = Math.max(0, freeShippingThreshold - subtotalAfterDiscount);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    total: Math.round(total * 100) / 100,
    itemCount,
    freeShippingProgress,
    amountNeededForFreeShipping: Math.round(amountNeeded * 100) / 100,
    isFreeShipping: isFree && items.length > 0,
  };
}

/**
 * Checks stock availability
 */
export function checkStock(requested: number, stock: number): { allowed: boolean; maxPossible: number } {
  const availableStock = Math.max(0, stock);
  const allowed = requested <= availableStock && requested > 0;
  const maxPossible = Math.min(Math.max(0, requested), availableStock);
  return { allowed, maxPossible };
}

/**
 * Generates human-friendly unique order number (e.g. CBE-849201)
 */
export function generateOrderNumber(): string {
  const prefix = 'CBE';
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}${random}`;
}

/**
 * Formats Brazilian CEP (00000-000)
 */
export function formatCEP(raw: string): string {
  const clean = raw.replace(/\D/g, '').slice(0, 8);
  if (clean.length > 5) {
    return `${clean.slice(0, 5)}-${clean.slice(5)}`;
  }
  return clean;
}

/**
 * Shipping calculator with realistic Brazilian logistics
 * Threshold: R$ 49,99
 */
export function calculateShipping(
  cep: string,
  subtotal: number,
  freeThreshold = DEFAULT_FREE_SHIPPING_THRESHOLD
): { cost: number; days: number; isFree: boolean; service: string } {
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) {
    return { cost: 0, days: 0, isFree: false, service: 'Informe seu CEP' };
  }

  const isFree = subtotal >= freeThreshold;

  // Regional delivery estimation based on CEP first digit
  const firstDigit = clean[0];
  let days = 3;
  let baseCost = DEFAULT_STANDARD_SHIPPING;

  if (firstDigit === '0' || firstDigit === '1') {
    days = 2;
    baseCost = 12.9;
  } else if (firstDigit === '2') {
    days = 3;
    baseCost = 14.9;
  } else if (firstDigit === '3') {
    days = 4;
    baseCost = 15.9;
  } else if (firstDigit === '4' || firstDigit === '5') {
    days = 6;
    baseCost = 19.9;
  } else if (firstDigit === '8' || firstDigit === '9') {
    days = 4;
    baseCost = 16.9;
  } else {
    days = 7;
    baseCost = 22.9;
  }

  return {
    cost: isFree ? 0 : baseCost,
    days,
    isFree,
    service: isFree ? 'Frete Expresso Grátis' : 'Entrega Expressa',
  };
}

/**
 * Status labels, timeline step and colors
 */
export function getOrderStatusInfo(status: OrderStatus): {
  label: string;
  step: number;
  colorClass: string;
  badgeBg: string;
  description: string;
} {
  switch (status) {
    case 'aguardando_pagamento':
      return {
        label: 'Aguardando Pagamento',
        step: 1,
        colorClass: 'text-amber-700 border-amber-200 bg-amber-50',
        badgeBg: 'bg-amber-500',
        description: 'Pedido registrado. Aguardando confirmação do pagamento pelo gateway.',
      };
    case 'pagamento_aprovado':
      return {
        label: 'Pagamento Aprovado',
        step: 2,
        colorClass: 'text-emerald-700 border-emerald-200 bg-emerald-50',
        badgeBg: 'bg-emerald-500',
        description: 'Pagamento confirmado! O pedido foi transferido para a equipe de separação.',
      };
    case 'em_preparacao':
      return {
        label: 'Em Preparação',
        step: 3,
        colorClass: 'text-indigo-700 border-indigo-200 bg-indigo-50',
        badgeBg: 'bg-indigo-500',
        description: 'Seus produtos estão sendo conferidos e embalados com todo carinho.',
      };
    case 'enviado':
      return {
        label: 'Enviado',
        step: 4,
        colorClass: 'text-blue-700 border-blue-200 bg-blue-50',
        badgeBg: 'bg-blue-500',
        description: 'Pedido a caminho do seu endereço. Código de rastreamento disponível.',
      };
    case 'entregue':
      return {
        label: 'Entregue',
        step: 5,
        colorClass: 'text-pink-700 border-pink-200 bg-pink-50',
        badgeBg: 'bg-pink-600',
        description: 'Entrega finalizada com sucesso. Esperamos que você ame seus produtos!',
      };
    case 'cancelado':
      return {
        label: 'Cancelado',
        step: 0,
        colorClass: 'text-red-700 border-red-200 bg-red-50',
        badgeBg: 'bg-red-500',
        description: 'Pedido cancelado.',
      };
    default:
      return {
        label: 'Status Desconhecido',
        step: 0,
        colorClass: 'text-gray-700 border-gray-200 bg-gray-50',
        badgeBg: 'bg-gray-400',
        description: '',
      };
  }
}
