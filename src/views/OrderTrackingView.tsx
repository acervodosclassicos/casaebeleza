import React, { useState, useEffect } from 'react';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Copy,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatBRL, getOrderStatusInfo } from '../utils/shop-logic';
import { Order } from '../types';

interface OrderTrackingViewProps {
  initialOrderNumber?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialOrderNumber,
  onNavigate,
}) => {
  const { getOrderById, getAllOrders, showToast } = useStore();

  const [searchQuery, setSearchQuery] = useState(initialOrderNumber || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialOrderNumber) {
      handleSearch(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearch = async (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setLoading(true);
    setSearched(true);
    try {
      const found = await getOrderById(clean);
      if (found) {
        setOrder(found);
      } else {
        // Search in all orders
        const all = await getAllOrders();
        const match = all.find(
          (o) =>
            o.orderNumber.toLowerCase() === clean.toLowerCase() ||
            o.id.toLowerCase() === clean.toLowerCase() ||
            o.customerEmail.toLowerCase() === clean.toLowerCase()
        );
        setOrder(match || null);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast('Código de rastreamento copiado!', 'success');
  };

  const statusInfo = order ? getOrderStatusInfo(order.status) : null;

  const timelineSteps = [
    { title: 'Pedido Recebido', desc: 'Seu pedido foi registrado no sistema.', step: 1 },
    { title: 'Aguardando Pagamento', desc: 'Aguardando validação com o gateway.', step: 1 },
    { title: 'Pagamento Aprovado', desc: 'Pagamento confirmado com sucesso.', step: 2 },
    { title: 'Em Preparação', desc: 'Embalagem e conferência dos produtos.', step: 3 },
    { title: 'Enviado', desc: 'A caminho com transportadora / Correios.', step: 4 },
    { title: 'Entregue', desc: 'Produto entregue no endereço de destino.', step: 5 },
  ];

  const currentStep = statusInfo?.step || 1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-[#E6007A] uppercase tracking-wider">
          Transparência Total
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900">
          Acompanhar Meu Pedido
        </h1>
        <p className="text-xs text-zinc-500">
          Consulte o status da sua entrega informando o número do pedido ou o e-mail cadastrado na compra.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery);
          }}
          className="flex gap-2 max-w-md mx-auto pt-4"
        >
          <input
            type="text"
            placeholder="Ex: CBE-849201 ou seu@email.com"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-hidden focus:border-[#E6007A] shadow-xs"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-[#E6007A] hover:bg-[#D0006E] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Consultar</span>
          </button>
        </form>
      </div>

      {loading && (
        <div className="py-12 text-center">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-[#E6007A] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-zinc-500">Localizando informações de envio...</p>
        </div>
      )}

      {!loading && searched && !order && (
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 text-center max-w-md mx-auto space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="font-bold text-sm text-zinc-900">Pedido não encontrado</h3>
          <p className="text-xs text-zinc-500">
            Não encontramos pedidos para "{searchQuery}". Verifique se digitou o número do pedido corretamente (Ex: CBE-12345678) ou entre em contato com nosso atendimento.
          </p>
          <button
            onClick={() => onNavigate('contato')}
            className="text-xs text-[#E6007A] font-bold hover:underline"
          >
            Falar com Atendimento
          </button>
        </div>
      )}

      {order && (
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-md p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-100 gap-4">
            <div>
              <span className="text-xs text-zinc-400 font-medium">Pedido</span>
              <h2 className="text-xl font-black text-zinc-900 font-mono">
                {order.orderNumber}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Realizado em: {new Date(order.createdAt).toLocaleDateString('pt-BR')} às{' '}
                {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo?.colorClass}`}>
                {statusInfo?.label}
              </span>
            </div>
          </div>

          {/* Tracking Code Banner if available */}
          {order.trackingCode && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-blue-900">
                <Truck className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <span className="font-bold block">Código de Rastreamento Oficial:</span>
                  <span className="font-mono font-bold text-sm text-blue-950">
                    {order.trackingCode}
                  </span>
                </div>
              </div>
              <button
                onClick={() => copyTracking(order.trackingCode!)}
                className="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 rounded-xl font-bold border border-blue-200 transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Código</span>
              </button>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-6">
            <h3 className="font-extrabold text-sm text-zinc-900">
              Linha do Tempo de Rastreamento
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
              {timelineSteps.map((s, idx) => {
                const isPassed = currentStep >= s.step;
                const isCurrent = currentStep === s.step;
                return (
                  <div key={idx} className="relative flex items-start gap-3 text-xs">
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isPassed
                          ? 'bg-[#E6007A] border-[#E6007A] text-white'
                          : 'bg-white border-zinc-300 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3 fill-current" />
                    </div>
                    <div>
                      <h4
                        className={`font-bold ${
                          isCurrent ? 'text-[#E6007A] text-sm' : isPassed ? 'text-zinc-900' : 'text-zinc-400'
                        }`}
                      >
                        {s.title}
                      </h4>
                      <p className="text-zinc-500 text-[11px] mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Items & Shipping Address Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-100 text-xs">
            <div className="space-y-2">
              <h4 className="font-bold text-zinc-900">Itens Comprados</h4>
              <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl overflow-hidden">
                {order.items.map((i, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <span className="font-medium text-zinc-800 truncate max-w-[200px]">
                      {i.quantity}x {i.title}
                    </span>
                    <span className="font-bold text-zinc-900">{formatBRL(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-zinc-900">Endereço de Destino</h4>
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-600 space-y-1">
                <p className="font-semibold text-zinc-900">{order.customerName}</p>
                <p>
                  {order.shippingAddress.street}, {order.shippingAddress.number}
                  {order.shippingAddress.complement && ` (${order.shippingAddress.complement})`}
                </p>
                <p>
                  {order.shippingAddress.neighborhood} — {order.shippingAddress.city}/
                  {order.shippingAddress.state}
                </p>
                <p className="font-mono text-[11px]">CEP: {order.shippingAddress.cep}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
