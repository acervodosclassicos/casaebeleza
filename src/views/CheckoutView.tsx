import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Truck,
  CheckCircle2,
  CreditCard,
  ShoppingBag,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { formatBRL, formatCEP, calculateShipping } from '../utils/shop-logic';
import { Order, ShippingAddress } from '../types';

interface CheckoutViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onNavigate }) => {
  const { cart, cartTotals, createOrder, showToast } = useStore();
  const { user } = useAuth();

  // Step 1: Customer identification
  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');

  // Step 2: Shipping Address
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<'link' | 'pix' | 'cartao'>('link');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ViaCEP Auto lookup
  const handleCepChange = async (value: string) => {
    const formatted = formatCEP(value);
    setCep(formatted);
    const clean = formatted.replace(/\D/g, '');
    if (clean.length === 8) {
      setIsLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setStreet(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCity(data.localidade || '');
          setState(data.uf || '');
        }
      } catch (err) {
        console.warn('CEP lookup failed:', err);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-pink-50 text-[#E6007A] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Sua sacola de compras está vazia</h2>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Adicione cosméticos ou organizadores à sua sacola para prosseguir para o checkout.
        </p>
        <button
          onClick={() => onNavigate('catalogo')}
          className="px-6 py-3 bg-[#E6007A] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#D0006E] transition-all"
        >
          Explorar Produtos
        </button>
      </div>
    );
  }

  const handleFinishOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim() || !customerEmail.trim()) {
      setErrorMsg('Por favor, informe seu nome e e-mail para contato.');
      return;
    }

    if (!cep.trim() || !street.trim() || !number.trim() || !city.trim() || !state.trim()) {
      setErrorMsg('Por favor, complete todos os campos obrigatórios do endereço de entrega.');
      return;
    }

    setIsSubmitting(true);

    try {
      const shippingAddress: ShippingAddress = {
        cep,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
      };

      // Retrieve configured payment link from product or default
      const configuredLinks = Array.from(new Set(
        cart.map((item) => item.externalPaymentLink?.trim()).filter((link): link is string => Boolean(link))
      ));
      if (configuredLinks.length !== 1 || cart.some((item) => !item.externalPaymentLink?.trim())) {
        setErrorMsg(
          cart.length > 1
            ? 'Para concluir esta compra, todos os produtos precisam usar o mesmo link de pagamento. Configure um link válido em cada anúncio ou finalize um produto por vez.'
            : 'Este produto ainda não possui um link de pagamento configurado. Entre em contato com a loja.'
        );
        setIsSubmitting(false);
        return;
      }
      const paymentLink = configuredLinks[0];
      if (!/^https:\/\//i.test(paymentLink)) {
        setErrorMsg('O link de pagamento configurado é inválido. Entre em contato com a loja.');
        setIsSubmitting(false);
        return;
      }

      const createdOrder = await createOrder({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        customerCpf: customerCpf.trim(),
        shippingAddress,
        paymentMethod:
          paymentMethod === 'pix'
            ? 'PIX Instantâneo'
            : paymentMethod === 'cartao'
            ? 'Cartão de Crédito'
            : 'Link de Pagamento Externo',
        paymentExternalLink: paymentLink,
      });

      showToast(`Pedido #${createdOrder.orderNumber} registrado com sucesso!`, 'success');

      // If external link configured, we direct customer to payment gateway or completion
      onNavigate('pagamento-concluido', createdOrder.id);
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMsg('Houve um erro ao processar o pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Checkout Header */}
      <div className="mb-8 text-center max-w-lg mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold mb-2">
          <Lock className="w-3.5 h-3.5" />
          <span>Checkout 100% Blindado e Seguro</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900">
          Finalização do Pedido
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Confirme seus dados e endereço para prosseguir com o pagamento seguro.
        </p>
      </div>

      <form onSubmit={handleFinishOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Columns: Identification & Address (8 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Customer Info */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/90 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-[#E6007A] text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Identificação do Cliente</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-zinc-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Ana Maria Silva"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-900 focus:bg-white focus:border-[#E6007A] focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  E-mail para Confirmação *
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-900 focus:bg-white focus:border-[#E6007A] focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  WhatsApp / Telefone Celular *
                </label>
                <input
                  type="tel"
                  placeholder="(11) 98765-4321"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-900 focus:bg-white focus:border-[#E6007A] focus:outline-hidden"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-zinc-700 mb-1">
                  CPF (para emissão do comprovante de envio)
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={customerCpf}
                  onChange={(e) => setCustomerCpf(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-900 focus:bg-white focus:border-[#E6007A] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Shipping Address */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/90 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-[#E6007A] text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>Endereço de Entrega</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  CEP *
                </label>
                <input
                  type="text"
                  placeholder="00000-000"
                  maxLength={9}
                  value={cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-900 focus:bg-white focus:border-[#E6007A] focus:outline-hidden font-mono"
                  required
                />
                {isLoadingCep && (
                  <span className="text-[10px] text-pink-600 animate-pulse mt-1 block">
                    Buscando CEP...
                  </span>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-zinc-700 mb-1">
                  Logradouro / Rua / Avenida *
                </label>
                <input
                  type="text"
                  placeholder="Rua das Flores"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-900 focus:bg-white focus:border-[#E6007A] focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Número *
                </label>
                <input
                  type="text"
                  placeholder="123"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-900 focus:bg-white focus:border-[#E6007A] focus:outline-hidden"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-zinc-700 mb-1">
                  Complemento / Bloco / Apto
                </label>
                <input
                  type="text"
                  placeholder="Apto 42B"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-900 focus:bg-white focus:border-[#E6007A] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Bairro *
                </label>
                <input
                  type="text"
                  placeholder="Centro"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-900 focus:bg-white focus:border-[#E6007A] focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Cidade *
                </label>
                <input
                  type="text"
                  placeholder="São Paulo"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-900 focus:bg-white focus:border-[#E6007A] focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Estado (UF) *
                </label>
                <input
                  type="text"
                  placeholder="SP"
                  maxLength={2}
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-900 focus:bg-white focus:border-[#E6007A] focus:outline-hidden uppercase"
                  required
                />
              </div>
            </div>
          </div>

          {/* Step 3: Payment Method Options */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/90 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-[#E6007A] text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span>Forma de Pagamento</span>
            </h3>

            <div className="space-y-3">
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'link'
                    ? 'border-[#E6007A] bg-pink-50/40 shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'link'}
                  onChange={() => setPaymentMethod('link')}
                  className="mt-1 text-[#E6007A] focus:ring-[#E6007A]"
                />
                <div className="text-xs">
                  <div className="font-bold text-zinc-900 flex items-center gap-2">
                    <span>Link Oficial de Pagamento do Gateway</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded-md font-bold">
                      Recomendado
                    </span>
                  </div>
                  <p className="text-zinc-500 mt-1">
                    Você será encaminhada com segurança para efetuar o pagamento via PIX, Cartão ou Boleto pelo gateway configurado no produto.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'pix'
                    ? 'border-[#E6007A] bg-pink-50/40 shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'pix'}
                  onChange={() => setPaymentMethod('pix')}
                  className="mt-1 text-[#E6007A] focus:ring-[#E6007A]"
                />
                <div className="text-xs">
                  <div className="font-bold text-zinc-900">
                    PIX Instantâneo
                  </div>
                  <p className="text-zinc-500 mt-1">
                    Aprovação imediata e separação prioritária do seu pacote.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Confirmation (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/90 shadow-md sticky top-28 space-y-5">
            <h3 className="font-extrabold text-base text-zinc-900 pb-3 border-b border-zinc-100 flex items-center justify-between">
              <span>Resumo da Compra</span>
              <span className="text-xs text-zinc-400 font-normal">
                {cart.length} {cart.length === 1 ? 'produto' : 'produtos'}
              </span>
            </h3>

            {/* Items Mini List */}
            <div className="divide-y divide-zinc-100 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.variation || ''}`} className="py-2.5 flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-12 h-12 rounded-lg object-cover border border-zinc-100"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-semibold text-zinc-900 truncate">{item.title}</p>
                    <p className="text-zinc-400 text-[11px]">
                      Qtd: {item.quantity} {item.variation && `• ${item.variation}`}
                    </p>
                  </div>
                  <span className="font-bold text-xs text-zinc-900">
                    {formatBRL(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-2 text-xs text-zinc-600 pt-3 border-t border-zinc-100">
              <div className="flex justify-between">
                <span>Subtotal dos Produtos</span>
                <span className="font-semibold text-zinc-900">
                  {formatBRL(cartTotals.subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Frete de Envio</span>
                <span className="font-semibold">
                  {cartTotals.shipping === 0 ? (
                    <span className="text-emerald-600 font-bold">Grátis</span>
                  ) : (
                    formatBRL(cartTotals.shipping)
                  )}
                </span>
              </div>

              <div className="border-t border-zinc-200 my-2 pt-3 flex justify-between items-baseline text-base font-extrabold text-zinc-900">
                <span>Total a Pagar</span>
                <span className="text-xl font-black text-[#E6007A]">
                  {formatBRL(cartTotals.total)}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* CTA Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#E6007A] hover:bg-[#D0006E] text-white rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-pink-200 transition-all active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Gravando Pedido...</span>
              ) : (
                <>
                  <span>Prosseguir para o Pagamento</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>O pedido é registrado no sistema antes do encaminhamento ao gateway.</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
