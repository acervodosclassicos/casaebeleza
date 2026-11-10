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
      <div className="min-h-[65vh] flex items-center justify-center px-4 py-14">
        <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-pink-100 bg-white text-center shadow-xl">
          <div className="bg-gradient-to-r from-[#E6007A] to-[#FF4D9E] px-6 py-12 text-white">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
              <Package className="h-11 w-11" />
            </div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-black tracking-widest">PAGAMENTO</span>
            <h1 className="mt-4 text-3xl font-black sm:text-4xl">Estamos preparando seu pacote</h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-pink-50">Obrigado pela sua compra! Estamos organizando as próximas etapas do seu pedido. Você poderá acompanhar a entrega assim que as informações de rastreio estiverem disponíveis.</p>
          </div>
          <div className="space-y-4 p-7">
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-5 w-5" /> Retorno do pagamento recebido</div>
            <p className="text-xs leading-relaxed text-zinc-500">Se o pagamento acabou de ser realizado, a atualização do pedido pode levar alguns instantes. Guarde o comprovante enviado pelo seu gateway.</p>
            <button onClick={() => onNavigate('home')} className="rounded-xl bg-[#E6007A] px-7 py-3 font-bold text-white hover:bg-[#C90069]">Voltar à loja</button>
          </div>
        </div>
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
            PAGAMENTO RECEBIDO
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Estamos preparando seu pacote
          </h1>
          <p className="text-xs sm:text-sm text-pink-100 max-w-xl mx-auto leading-relaxed">
            Obrigado pela sua compra! Estamos organizando seu pedido para preparar o pacote. Você poderá acompanhar as atualizações de envio nesta página ou pela área de pedidos.
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
