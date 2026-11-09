import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatBRL,
  calculateDiscountPercentage,
  calculateInstallments,
  validateCoupon,
  calculateCartTotals,
  checkStock,
  generateOrderNumber,
  formatCEP,
  calculateShipping,
  getOrderStatusInfo,
  isEligibleForFreeShipping,
  Coupon,
  CartItem,
} from './shop-logic';

test('formatBRL formats Brazilian Real currency values properly', () => {
  const formatted = formatBRL(149.9);
  assert.match(formatted, /R\$\s?149,90/);
});

test('calculateDiscountPercentage calculates discount integer correctly', () => {
  assert.equal(calculateDiscountPercentage(80, 100), 20);
  assert.equal(calculateDiscountPercentage(100, 100), 0);
  assert.equal(calculateDiscountPercentage(120, 100), 0);
  assert.equal(calculateDiscountPercentage(75, 100), 25);
});

test('calculateInstallments splits total up to max installments', () => {
  const result = calculateInstallments(180, 6);
  assert.equal(result.count, 6);
  assert.equal(result.value, 30);
  assert.match(result.formatted, /6x de/);
});

// MANDATORY FREE SHIPPING TESTS (POLÍTICA COMERCIAL R$ 49,99)

test('Teste 1: Compra de R$ 30,00 calcula frete normal e indica valor faltante', () => {
  const items: CartItem[] = [
    { productId: 'item1', title: 'Batom Matte', price: 30.0, quantity: 1 },
  ];
  const totals = calculateCartTotals(items, null, 49.99, 14.9);
  assert.equal(totals.subtotal, 30.0);
  assert.equal(totals.isFreeShipping, false);
  assert.equal(totals.shipping, 14.9);
  assert.equal(totals.amountNeededForFreeShipping, 19.99);
  assert.equal(totals.total, 44.9);
});

test('Teste 2: Compra de R$ 49,98 (1 centavo abaixo) NÃO recebe frete grátis e exige R$ 0,01', () => {
  const items: CartItem[] = [
    { productId: 'item1', title: 'Item Especial', price: 49.98, quantity: 1 },
  ];
  const totals = calculateCartTotals(items, null, 49.99, 14.9);
  assert.equal(totals.subtotal, 49.98);
  assert.equal(totals.isFreeShipping, false);
  assert.equal(totals.shipping, 14.9);
  assert.equal(totals.amountNeededForFreeShipping, 0.01);
  assert.equal(totals.total, 64.88);
});

test('Teste 3: Compra exata de R$ 49,99 ATINGE Frete Grátis com custo 0', () => {
  const items: CartItem[] = [
    { productId: 'item1', title: 'Item Limite', price: 49.99, quantity: 1 },
  ];
  const totals = calculateCartTotals(items, null, 49.99, 14.9);
  assert.equal(totals.subtotal, 49.99);
  assert.equal(totals.isFreeShipping, true);
  assert.equal(totals.shipping, 0);
  assert.equal(totals.amountNeededForFreeShipping, 0);
  assert.equal(totals.freeShippingProgress, 100);
  assert.equal(totals.total, 49.99);
});

test('Teste 4: Compra de R$ 50,00 garante Frete Grátis com custo 0', () => {
  const items: CartItem[] = [
    { productId: 'item1', title: 'Kit Cuidados', price: 50.0, quantity: 1 },
  ];
  const totals = calculateCartTotals(items, null, 49.99, 14.9);
  assert.equal(totals.subtotal, 50.0);
  assert.equal(totals.isFreeShipping, true);
  assert.equal(totals.shipping, 0);
  assert.equal(totals.total, 50.0);
});

test('Teste 5: Compra acima de R$ 100,00 mantém Frete Grátis pleno', () => {
  const items: CartItem[] = [
    { productId: 'item1', title: 'Organizador Giratório', price: 119.9, quantity: 1 },
  ];
  const totals = calculateCartTotals(items, null, 49.99, 14.9);
  assert.equal(totals.subtotal, 119.9);
  assert.equal(totals.isFreeShipping, true);
  assert.equal(totals.shipping, 0);
  assert.equal(totals.total, 119.9);
});

test('Teste 6: Aplicação de cupom de desconto sobre a elegibilidade do frete grátis', () => {
  const coupon10Percent: Coupon = {
    code: 'BEMVINDA10',
    discountType: 'percentage',
    value: 10,
    active: true,
  };

  // Subtotal R$ 52,00 com 10% OFF -> R$ 46,80 (cai abaixo de 49.99 -> perde frete grátis)
  const itemsBorderline: CartItem[] = [
    { productId: 'p1', title: 'Kit', price: 52.0, quantity: 1 },
  ];
  const totalsAfterDiscount = calculateCartTotals(itemsBorderline, coupon10Percent, 49.99, 14.9);
  assert.equal(totalsAfterDiscount.subtotal, 52.0);
  assert.equal(totalsAfterDiscount.discount, 5.2);
  assert.equal(totalsAfterDiscount.isFreeShipping, false);
  assert.equal(totalsAfterDiscount.shipping, 14.9);
  assert.equal(totalsAfterDiscount.total, 61.7); // 52 - 5.2 + 14.9 = 61.7

  // Subtotal R$ 80,00 com 10% OFF -> R$ 72,00 (continua >= 49.99 -> mantém frete grátis)
  const itemsAbove: CartItem[] = [
    { productId: 'p2', title: 'Sérum Duplo', price: 80.0, quantity: 1 },
  ];
  const totalsStillFree = calculateCartTotals(itemsAbove, coupon10Percent, 49.99, 14.9);
  assert.equal(totalsStillFree.subtotal, 80.0);
  assert.equal(totalsStillFree.discount, 8.0);
  assert.equal(totalsStillFree.isFreeShipping, true);
  assert.equal(totalsStillFree.shipping, 0);
  assert.equal(totalsStillFree.total, 72.0);
});

test('Teste 7: Remoção de produto recalcula frete e atualiza mensagem', () => {
  let cart: CartItem[] = [
    { productId: 'p1', title: 'Item 1', price: 30.0, quantity: 1 },
    { productId: 'p2', title: 'Item 2', price: 25.0, quantity: 1 },
  ]; // Total = 55.00 -> Frete Grátis
  let t = calculateCartTotals(cart, null, 49.99, 14.9);
  assert.equal(t.isFreeShipping, true);

  // Remove Item 2 -> subtotal fica 30.00
  cart = [cart[0]];
  t = calculateCartTotals(cart, null, 49.99, 14.9);
  assert.equal(t.isFreeShipping, false);
  assert.equal(t.shipping, 14.9);
  assert.equal(t.amountNeededForFreeShipping, 19.99);
});

test('Teste 8: Alteração de quantidade de produto atualiza benefício', () => {
  const item: CartItem = { productId: 'p1', title: 'Item', price: 25.0, quantity: 1 };
  // Qtd 1 -> 25.00 (sem frete grátis)
  let t = calculateCartTotals([item], null, 49.99, 14.9);
  assert.equal(t.isFreeShipping, false);

  // Qtd 2 -> 50.00 (frete grátis atingido)
  const itemQtd2: CartItem = { ...item, quantity: 2 };
  t = calculateCartTotals([itemQtd2], null, 49.99, 14.9);
  assert.equal(t.isFreeShipping, true);
  assert.equal(t.shipping, 0);
});

test('Teste 9: Cálculo de frete por CEP regional com limite de R$ 49,99', () => {
  // Abaixo de 49.99
  const spBelow = calculateShipping('01310-100', 40.0, 49.99);
  assert.equal(spBelow.isFree, false);
  assert.equal(spBelow.cost, 12.9);

  // A partir de 49.99
  const spAbove = calculateShipping('01310-100', 49.99, 49.99);
  assert.equal(spAbove.isFree, true);
  assert.equal(spAbove.cost, 0);
  assert.equal(spAbove.service, 'Frete Expresso Grátis');
});

test('checkStock e generateOrderNumber continuam operacionais', () => {
  assert.equal(checkStock(5, 10).allowed, true);
  assert.equal(checkStock(12, 10).allowed, false);
  assert.match(generateOrderNumber(), /^CBE-\d{8}$/);
});
