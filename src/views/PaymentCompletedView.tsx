import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Package,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatBRL, getOrderStatusInfo } from '../utils/shop-logic';
import { Order } from '../types';

interface PaymentCompletedViewProps {
  orderId?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const PaymentCompletedView: React.FC<PaymentCompletedViewProps> = ({
  orderId,
  onNavigate,
}) => {
  const { getOrderById } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchOrder = async () => {
      setLoading(true);
      if (orderId) {
        const found = await getOrderById(orderId);
        if (active) setOrder(found);
      } else if (active) {
        setOrder(null);
      }
      if (active) setLoading(false);
    };
    fetchOrder();
    return () => { active = false; };
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-pink-200 border-t-[#E6007A] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-zinc-500">Localizando detalhes do pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center"><Package className="w-8 h-8" /></div>
        <h1 className="text-2xl font-black text-zinc-900">Não encontramos este pedido</h1>
        <p className="text-sm text-zinc-500">Não foi possível carregar os dados do pedido. Volte à loja e consulte o histórico da sua conta ou fale com o atendimento.</p>
        <button onClick={() => onNavigate('home')} className="px-6 py-3 rounded-xl bg-[#E6007A] text-white font-bold">Voltar à loja</button>
      </div>
    );
  }

  const createdAtValue = order.createdAt as unknown as string | { toDate?: () => Date };
  const orderCreatedAt = typeof createdAtValue === 'string'
    ? new Date(createdAtValue)
    : createdAtValue?.toDate?.() || new Date();
  const orderStatus = order.status || 'aguardando_pagamento';
  const statusInfo = getOrderStatusInfo(orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl border border-pink-100 shadow-xl overflow-hidden">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-[#E6007A] to-[#FF4D9E] p-8 text-white text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-2 text-white shadow-inner">
            <Clock className="w-10 h-10" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
            PEDIDO REGISTRADO
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Falta concluir o pagamento
          </h1>
          <p className="text-xs sm:text-sm text-pink-100 max-w-xl mx-auto leading-relaxed">
            Seu pedido foi registrado. Para confirmar a compra, conclua o pagamento pelo ambiente seguro do gateway. A separação do produto começa após a confirmação.
          </p>
        </div>

        {/* Order Details Body */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* Key Identifiers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 text-xs">
            <div>
              <span className="text-zinc-400 block font-medium">Número do Pedido</span>
              <strong className="text-base text-zinc-900 font-mono">
                {order.orderNumber}
              </strong>
            </div>

            <div>
              <span className="text-zinc-400 block font-medium">Data &amp; Horário</span>
              <span className="font-semibold text-zinc-800">
                {orderCreatedAt.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div>
              <span className="text-zinc-400 block font-medium">Situação Atual</span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${statusInfo.colorClass}`}
              >
                {statusInfo.label}
              </span>
            </div>
          </div>

          {/* Payment action: primary, prominent and easy to tap */}
          {order?.paymentExternalLink && (
            <section className="rounded-3xl border-2 border-[#E6007A]/25 bg-gradient-to-br from-pink-50 via-white to-pink-50 p-5 sm:p-7 text-center space-y-3 shadow-sm">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-[#E6007A] text-white flex items-center justify-center shadow-lg shadow-pink-200">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900">Conclua seu pagamento agora</h2>
                <p className="text-sm text-zinc-600 max-w-lg mx-auto">Você será direcionado ao ambiente oficial de pagamento configurado pela loja. Confira o valor antes de confirmar.</p>
              </div>
              <a
                href={order.paymentExternalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:max-w-md mx-auto min-h-[58px] px-6 py-4 bg-[#E6007A] hover:bg-[#C90069] active:scale-[.99] text-white rounded-2xl text-base sm:text-lg font-black transition-all shadow-lg shadow-pink-200 flex items-center justify-center gap-3"
              >
                <span>IR PARA PAGAMENTO</span>
                <ExternalLink className="w-5 h-5" />
              </a>
              <p className="text-[11px] text-zinc-500">O pedido só será considerado pago após a confirmação do gateway.</p>
            </section>
          )}

          {/* Items Summary */}
          {order?.items && order.items.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-zinc-900">Itens Adquiridos</h3>
              <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-2xl overflow-hidden bg-white">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center gap-4 text-xs">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-14 h-14 rounded-xl object-cover border border-zinc-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-zinc-900">{item.title}</p>
                      <p className="text-zinc-400 text-[11px]">
                        Quantidade: {item.quantity} {item.variation && `• ${item.variation}`}
                      </p>
                    </div>
                    <span className="font-bold text-zinc-900">
                      {formatBRL(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Totals */}
              <div className="p-4 bg-zinc-50 rounded-2xl space-y-1.5 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900">
                    {formatBRL(order.subtotal)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Desconto</span>
                    <span>-{formatBRL(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span className="font-semibold text-zinc-900">
                    {order.shipping === 0 ? 'Grátis' : formatBRL(order.shipping)}
                  </span>
                </div>
                <div className="border-t border-zinc-200 pt-2 flex justify-between font-black text-sm text-zinc-900">
                  <span>Total</span>
                  <span className="text-[#E6007A] text-base">{formatBRL(order.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Address */}
          {order?.shippingAddress && (
            <div className="p-4 bg-white border border-zinc-200 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-zinc-900 block mb-1">
                Endereço de Entrega:
              </span>
              <p className="text-zinc-700">
                {order.shippingAddress.street}, Nº {order.shippingAddress.number}
                {order.shippingAddress.complement && ` (${order.shippingAddress.complement})`}
              </p>
              <p className="text-zinc-500">
                {order.shippingAddress.neighborhood} — {order.shippingAddress.city}/
                {order.shippingAddress.state} — CEP: {order.shippingAddress.cep}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-200">
            <button
              onClick={() => onNavigate('home')}
              className="flex-1 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-bold text-xs transition-colors text-center"
            >
              Voltar à Loja
            </button>
            <button
              onClick={() => onNavigate('acompanhar-pedido', order?.orderNumber)}
              className="flex-1 py-3.5 bg-[#E6007A] hover:bg-[#D0006E] text-white rounded-xl font-bold text-xs transition-colors shadow-md text-center flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span>Acompanhar Meu Pedido</span>
            </button>
          </div>

          <div className="text-center text-[11px] text-zinc-400">
            <p>
              * O acesso a esta página não confirma o pagamento sozinho. A aprovação é realizada através de webhook autenticado ou confirmação do gateway financeiro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
