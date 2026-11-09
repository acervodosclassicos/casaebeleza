import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatBRL } from '../utils/shop-logic';

interface CartDrawerProps {
  onNavigateToCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onNavigateToCheckout,
  onContinueShopping,
}) => {
  const {
    cart,
    cartTotals,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;
    const res = applyCouponCode(couponInput.trim());
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#E6007A]" />
              <h2 className="font-extrabold text-base text-zinc-900">Sua Sacola de Compras</h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-pink-100 text-[#E6007A] rounded-full">
                {cartTotals.itemCount} {cartTotals.itemCount === 1 ? 'item' : 'itens'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors"
              aria-label="Fechar sacola"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-5 py-3.5 bg-pink-50/70 border-b border-pink-100">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="flex items-center gap-1.5 text-zinc-900">
                <Sparkles className="w-3.5 h-3.5 text-[#E6007A]" />
                {cartTotals.freeShippingProgress >= 100
                  ? 'Parabéns! Você ganhou Frete Grátis!'
                  : `Faltam ${formatBRL(cartTotals.amountNeededForFreeShipping)} para Frete Grátis (mínimo R$ 49,99)!`}
              </span>
              <span className="text-[#E6007A] font-extrabold">
                {cartTotals.freeShippingProgress}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-pink-200/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF4D9E] via-[#FF2E93] to-[#E6007A] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${cartTotals.freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-zinc-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-pink-50 text-[#E6007A] flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-zinc-900 mb-1">Sua sacola está vazia</h3>
                <p className="text-xs text-zinc-500 max-w-xs mb-6">
                  Descubra os melhores cosméticos, maquiagens e organizadores para você ou para presentear.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onContinueShopping();
                  }}
                  className="px-6 py-2.5 bg-[#E6007A] text-white rounded-xl text-xs font-bold hover:bg-[#D0006E] transition-all shadow-md"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={`${item.productId}-${item.variation || 'default'}`} className="py-4 flex gap-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 rounded-xl object-cover border border-zinc-100 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-xs text-zinc-900 line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.productId, item.variation)}
                          className="text-zinc-400 hover:text-red-500 p-1 transition-colors"
                          aria-label="Remover item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {item.variation && (
                        <span className="inline-block text-[11px] text-zinc-500 mt-0.5">
                          Opção: {item.variation}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1, item.variation)
                          }
                          className="p-1.5 hover:bg-zinc-100 text-zinc-600 transition-colors"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-zinc-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1, item.variation)
                          }
                          className="p-1.5 hover:bg-zinc-100 text-zinc-600 transition-colors"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-sm font-extrabold text-[#E6007A]">
                        {formatBRL(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Coupon & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-zinc-100 bg-zinc-50/70 space-y-3">
              {/* Coupon Form */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Cupom: <strong>{appliedCoupon.code}</strong> (-{formatBRL(cartTotals.discount)})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-red-600 hover:underline font-bold"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Possui cupom? Ex: BEMVINDA10"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs uppercase text-zinc-800 placeholder-zinc-400 focus:outline-hidden focus:border-[#E6007A]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-zinc-900 hover:bg-[#E6007A] text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Aplicar
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-red-600 font-medium">{couponError}</p>}

              {/* Totals Breakdown */}
              <div className="space-y-1.5 text-xs text-zinc-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900">{formatBRL(cartTotals.subtotal)}</span>
                </div>
                {cartTotals.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Desconto do Cupom</span>
                    <span>-{formatBRL(cartTotals.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span className="font-semibold text-zinc-900">
                    {cartTotals.shipping === 0 ? (
                      <span className="text-emerald-600 font-bold">Grátis</span>
                    ) : (
                      formatBRL(cartTotals.shipping)
                    )}
                  </span>
                </div>
                <div className="border-t border-zinc-200 my-2 pt-2 flex justify-between text-sm font-extrabold text-zinc-900">
                  <span>Total do Pedido</span>
                  <span className="text-[#E6007A] text-base font-black">
                    {formatBRL(cartTotals.total)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onNavigateToCheckout();
                }}
                className="w-full py-3.5 bg-[#E6007A] hover:bg-[#D0006E] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-200 transition-all active:scale-98"
              >
                <span>Finalizar Compra Segura</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Compra protegida com criptografia SSL</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
