import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  Copy,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  Save,
  Database,
  Star,
  Tag,
  MessageSquare,
  Settings,
  Image,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { formatBRL, getOrderStatusInfo } from '../utils/shop-logic';
import { Product, Order, Banner, StoreSettings, Review, Coupon } from '../types';

export const AdminView: React.FC = () => {
  const { user, isAdmin, loginGoogle } = useAuth();
  const {
    products,
    categories,
    banners,
    settings,
    getAllOrders,
    deleteOrder,
    updateOrderStatus,
    updateTrackingCode,
    saveProduct,
    deleteProduct,
    saveBanner,
    deleteBanner,
    updateSettings,
    getAllReviews,
    createAdminReview,
    updateReviewStatus,
    seedCatalog,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'produtos' | 'pedidos' | 'banners' | 'avaliacoes' | 'configuracoes'
  >('dashboard');

  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Product Editing / Creation modal
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newTrackingInput, setNewTrackingInput] = useState('');

  // Fetch orders and reviews on load
  const loadAdminData = async () => {
    setLoadingOrders(true);
    try {
      const ords = await getAllOrders();
      setOrders(ords);
      const revs = await getAllReviews();
      setReviews(revs);
    } catch (e) {
      console.warn('Error loading admin lists:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  // Auth gate
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Acesso Restrito ao Painel Administrativo</h2>
        <p className="text-xs text-zinc-500">
          Esta área é restrita aos administradores autorizados da Casa &amp; Beleza Express.
        </p>
        {!user ? (
          <button
            onClick={loginGoogle}
            className="w-full py-3 bg-[#E6007A] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#D0006E]"
          >
            Entrar como Administrador
          </button>
        ) : (
          <p className="text-xs text-zinc-600">
            Você está conectado como <strong>{user.email}</strong>, mas não possui privilégios de administrador.
          </p>
        )}
      </div>
    );
  }

  // Real Dashboard KPI calculations
  const totalRevenue = orders
    .filter((o) => o.status === 'pagamento_aprovado' || o.status === 'enviado' || o.status === 'entregue')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === 'aguardando_pagamento');
  const approvedOrders = orders.filter((o) => o.status === 'pagamento_aprovado');
  const outOfStockProducts = products.filter((p) => p.stock <= 0);

  // Export orders to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      showToast('Nenhum pedido para exportar.', 'info');
      return;
    }
    const headers = 'Numero,Cliente,Email,Telefone,Total,Status,Data,Rastreio\n';
    const rows = orders
      .map(
        (o) =>
          `"${o.orderNumber}","${o.customerName}","${o.customerEmail}","${o.customerPhone || ''}","${o.total}","${o.status}","${o.createdAt}","${o.trackingCode || ''}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedidos-casabeleza-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('Relatório CSV exportado com sucesso!', 'success');
  };

  // Product CRUD
  const handleOpenNewProduct = () => {
    setFeedbackName('');
    setFeedbackComment('');
    setFeedbackRating(5);
    setEditingProduct({
      id: `prod_${Date.now()}`,
      title: '',
      slug: '',
      brand: 'Casa & Beleza Express',
      category: categories[0]?.slug || 'beleza-cosmeticos',
      description: '',
      shortDescription: '',
      price: 0,
      compareAtPrice: 0,
      costPrice: 0,
      stock: 10,
      sku: `CBE-${Math.floor(100 + Math.random() * 900)}`,
      thumbnail: '',
      images: [],
      active: true,
      featured: false,
      flashDeal: false,
      isNew: true,
      externalPaymentLink: '',
      variations: [],
      rating: 5,
      reviewCount: 0,
      salesCount: 0,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.title || !editingProduct?.price) {
      showToast('Título e Preço são obrigatórios.', 'error');
      return;
    }
    const slug =
      editingProduct.slug ||
      editingProduct.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const finalProduct: Product = {
      id: editingProduct.id || `prod_${Date.now()}`,
      title: editingProduct.title,
      slug,
      brand: editingProduct.brand || 'Casa & Beleza Express',
      category: editingProduct.category || 'beleza-cosmeticos',
      subcategory: editingProduct.subcategory,
      description: editingProduct.description || '',
      shortDescription: editingProduct.shortDescription || '',
      price: Number(editingProduct.price) || 0,
      compareAtPrice: Number(editingProduct.compareAtPrice) || undefined,
      costPrice: Number(editingProduct.costPrice) || undefined,
      stock: Number(editingProduct.stock) || 0,
      sku: editingProduct.sku || 'SKU-001',
      barcode: editingProduct.barcode,
      weight: Number(editingProduct.weight) || 0.2,
      thumbnail: editingProduct.thumbnail || (editingProduct.images || []).find(Boolean) || '',
      images: (editingProduct.images || []).filter(Boolean).length > 0 ? (editingProduct.images || []).filter(Boolean) : (editingProduct.thumbnail ? [editingProduct.thumbnail] : []),
      featured: Boolean(editingProduct.featured),
      flashDeal: Boolean(editingProduct.flashDeal),
      isNew: Boolean(editingProduct.isNew),
      active: Boolean(editingProduct.active ?? true),
      freeShipping: Boolean(editingProduct.freeShipping),
      displayOrder: editingProduct.displayOrder,
      externalPaymentLink: editingProduct.externalPaymentLink || '',
      promotionMessage: editingProduct.promotionMessage || '',
      rating: Math.min(5, Math.max(0, Number(editingProduct.rating ?? 5) || 0)),
      reviewCount: Math.max(0, Number(editingProduct.reviewCount) || 0),
      salesCount: Math.max(0, Number(editingProduct.salesCount) || 0),
      variations: (editingProduct.variations || []).filter((v) => v.name.trim() && v.options.length > 0),
      createdAt: editingProduct.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveProduct(finalProduct);
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      console.error('Erro ao salvar anúncio:', error);
      showToast(error?.message || 'Não foi possível salvar o anúncio. Verifique as permissões do Firebase.', 'error');
    }
  };

  const handleDuplicateProduct = async (p: Product) => {
    const duplicated: Product = {
      ...p,
      id: `prod_${Date.now()}`,
      title: `${p.title} (Cópia)`,
      slug: `${p.slug}-copia`,
      sku: `${p.sku}-CP`,
      createdAt: new Date().toISOString(),
    };
    await saveProduct(duplicated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-pink-100 text-[#E6007A] text-xs font-bold rounded-md">
              Painel Oficial
            </span>
            <span className="text-xs text-zinc-400 font-medium">{user?.email}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1">
            Gestão Casa &amp; Beleza Express
          </h1>
        </div>

        {/* Global Admin Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={seedCatalog}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Sincroniza os produtos e banners oficiais iniciais com o Firestore"
          >
            <Database className="w-3.5 h-3.5 text-[#E6007A]" />
            <span>Semear Banco</span>
          </button>
          <button
            onClick={loadAdminData}
            className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-colors"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-zinc-200 gap-2 overflow-x-auto pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'dashboard'
              ? 'bg-[#E6007A] text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Visão Geral &amp; KPIs
        </button>
        <button
          onClick={() => setActiveTab('produtos')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'produtos'
              ? 'bg-[#E6007A] text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Produtos ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('pedidos')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'pedidos'
              ? 'bg-[#E6007A] text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Pedidos &amp; Pagamentos ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('banners')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'banners'
              ? 'bg-[#E6007A] text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Banners da Home
        </button>
        <button
          onClick={() => setActiveTab('avaliacoes')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'avaliacoes'
              ? 'bg-[#E6007A] text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Moderação de Avaliações ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab('configuracoes')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'configuracoes'
              ? 'bg-[#E6007A] text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Configurações da Loja
        </button>
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Faturamento Confirmado
                </span>
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900">{formatBRL(totalRevenue)}</h3>
              <p className="text-[11px] text-zinc-500">Pedidos com pagamento aprovado</p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Pedidos Recebidos
                </span>
                <ShoppingBag className="w-5 h-5 text-indigo-500" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900">{orders.length}</h3>
              <p className="text-[11px] text-zinc-500">
                {approvedOrders.length} aprovados • {pendingOrders.length} aguardando
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Produtos no Catálogo
                </span>
                <Package className="w-5 h-5 text-[#E6007A]" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900">{products.length}</h3>
              <p className="text-[11px] text-zinc-500">
                {products.filter((p) => p.active).length} ativos na vitrine
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Alerta de Estoque
                </span>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900">{outOfStockProducts.length}</h3>
              <p className="text-[11px] text-zinc-500">Produtos sem estoque ou zerados</p>
            </div>
          </div>

          {/* Recent Orders Preview */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-extrabold text-sm text-zinc-900">Últimos Pedidos Registrados</h3>
              <button
                onClick={() => setActiveTab('pedidos')}
                className="text-xs text-[#E6007A] font-bold hover:underline"
              >
                Ver todos os pedidos
              </button>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-4">Nenhum pedido recebido ainda.</p>
            ) : (
              <div className="divide-y divide-zinc-100 text-xs">
                {orders.slice(0, 5).map((o) => {
                  const st = getOrderStatusInfo(o.status);
                  return (
                    <div key={o.id} className="py-3 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-zinc-900">{o.orderNumber}</span>
                        <p className="text-zinc-500 text-[11px]">
                          {o.customerName} ({o.customerEmail})
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${st.colorClass}`}>
                          {st.label}
                        </span>
                        <strong className="text-zinc-900 font-bold">{formatBRL(o.total)}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUTOS */}
      {activeTab === 'produtos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-zinc-900">Gerenciador de Produtos</h2>
              <p className="text-xs text-zinc-500">
                Cadastre, edite fotos, configure links de pagamento externos e ajuste estoques.
              </p>
            </div>
            <button
              onClick={handleOpenNewProduct}
              className="px-5 py-2.5 bg-[#E6007A] hover:bg-[#D0006E] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Produto</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Produto</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Preço Venda</th>
                    <th className="py-3 px-4">Estoque</th>
                    <th className="py-3 px-4">Link Gateway</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50/70">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={p.thumbnail}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-zinc-200"
                        />
                        <div className="min-w-0 max-w-[200px]">
                          <p className="font-bold text-zinc-900 truncate">{p.title}</p>
                          <span className="text-[10px] text-zinc-400">SKU: {p.sku}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-600 capitalize">
                        {p.category.replace(/-/g, ' ')}
                      </td>
                      <td className="py-3 px-4 font-bold text-zinc-900">
                        {formatBRL(p.price)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold ${
                            p.stock <= 0
                              ? 'text-red-600'
                              : p.stock <= 10
                              ? 'text-amber-600'
                              : 'text-zinc-700'
                          }`}
                        >
                          {p.stock} un
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-[160px] truncate text-[11px] text-zinc-500">
                        {p.externalPaymentLink ? (
                          <a
                            href={p.externalPaymentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#E6007A] hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Link Configurado
                          </a>
                        ) : (
                          <span className="text-zinc-300">Padrão da loja</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.active ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                          }`}
                        >
                          {p.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setFeedbackName('');
                            setFeedbackComment('');
                            setFeedbackRating(5);
                            setEditingProduct(p);
                            setIsProductModalOpen(true);
                          }}
                          className="p-1.5 text-zinc-600 hover:text-[#E6007A]"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateProduct(p)}
                          className="p-1.5 text-zinc-600 hover:text-indigo-600"
                          title="Duplicar"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Deseja realmente excluir o produto "${p.title}"?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 text-zinc-400 hover:text-red-600"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PEDIDOS */}
      {activeTab === 'pedidos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-zinc-900">Gerenciador de Pedidos</h2>
              <p className="text-xs text-zinc-500">
                Acompanhe pagamentos, altere o status dos pedidos e insira códigos de rastreio.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 self-start"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Relatório CSV</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Nº Pedido</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Rastreio</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {orders.map((o) => {
                    const st = getOrderStatusInfo(o.status);
                    return (
                      <tr key={o.id} className="hover:bg-zinc-50/70">
                        <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                          {o.orderNumber}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-zinc-900">{o.customerName}</p>
                          <span className="text-zinc-400 text-[10px]">{o.customerEmail}</span>
                        </td>
                        <td className="py-3 px-4 text-zinc-600">
                          {new Date(o.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 font-extrabold text-zinc-900">
                          {formatBRL(o.total)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${st.colorClass}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {o.trackingCode ? (
                            <span className="font-mono text-blue-600 font-bold">{o.trackingCode}</span>
                          ) : (
                            <button
                              onClick={() => {
                                const code = prompt('Informe o código de rastreio (Ex: BR123456789BR):');
                                if (code) updateTrackingCode(o.id, code);
                              }}
                              className="text-[11px] text-[#E6007A] hover:underline font-semibold"
                            >
                              + Adicionar Rastreio
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value as Order['status'])}
                            className="bg-white border border-zinc-200 rounded-lg px-2 py-1 text-[11px] font-bold text-zinc-800"
                          >
                            <option value="aguardando_pagamento">Aguardando Pagamento</option>
                            <option value="pagamento_aprovado">Pagamento Aprovado</option>
                            <option value="em_preparacao">Em Preparação</option>
                            <option value="enviado">Enviado</option>
                            <option value="entregue">Entregue</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                          <button
                            type="button"
                            title="Excluir pedido"
                            aria-label={`Excluir pedido ${o.orderNumber}`}
                            onClick={async () => {
                              if (!window.confirm(`Tem certeza que deseja excluir o pedido ${o.orderNumber}? Esta ação não pode ser desfeita.`)) return;
                              try {
                                await deleteOrder(o.id);
                                setOrders((current) => current.filter((item) => item.id !== o.id));
                                if (selectedOrder?.id === o.id) setSelectedOrder(null);
                              } catch (error) {
                                console.error('Could not delete order:', error);
                              }
                            }}
                            className="ml-2 inline-flex items-center justify-center p-2 rounded-lg text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BANNERS */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-zinc-900">Banners Promocionais da Home</h2>
            <button
              onClick={() => {
                const title = prompt('Título do Banner:');
                const subtitle = prompt('Subtítulo do Banner:');
                const imageUrl = prompt('URL da Imagem do Banner:');
                if (title && imageUrl) {
                  saveBanner({
                    id: `banner_${Date.now()}`,
                    title,
                    subtitle: subtitle || '',
                    imageUrl,
                    link: '/catalogo',
                    ctaText: 'Ver Coleção',
                    active: true,
                    order: banners.length + 1,
                  });
                }
              }}
              className="px-4 py-2 bg-[#E6007A] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Novo Banner
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((b) => (
              <div key={b.id} className="p-4 bg-white rounded-2xl border border-zinc-200 space-y-3">
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  className="w-full h-40 object-cover rounded-xl"
                />
                <div>
                  <h4 className="font-bold text-sm text-zinc-900">{b.title}</h4>
                  <p className="text-xs text-zinc-500 line-clamp-2">{b.subtitle}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
                  <span className="font-semibold text-zinc-400">Ordem: {b.order}</span>
                  <button
                    onClick={() => deleteBanner(b.id)}
                    className="text-red-500 hover:underline font-bold"
                  >
                    Excluir Banner
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AVALIAÇÕES */}
      {activeTab === 'avaliacoes' && (
        <div className="space-y-6">
          <h2 className="text-lg font-black text-zinc-900">Moderação de Avaliações</h2>

          {reviews.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">Nenhuma avaliação submetida para moderação.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-900">{rev.authorName}</span>
                      <span className="text-zinc-400 text-[11px] ml-2">
                        Produto: {rev.productName}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        rev.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rev.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rev.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-zinc-700 italic">"{rev.comment}"</p>

                  <div className="flex items-center gap-2 pt-3 border-t border-zinc-100">
                    {rev.status !== 'approved' && (
                      <button
                        onClick={() => updateReviewStatus(rev.id, 'approved')}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                      >
                        Aprovar
                      </button>
                    )}
                    {rev.status !== 'rejected' && (
                      <button
                        onClick={() => updateReviewStatus(rev.id, 'rejected')}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold"
                      >
                        Rejeitar
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const reply = prompt('Escreva a resposta oficial da loja:');
                        if (reply) updateReviewStatus(rev.id, 'approved', reply);
                      }}
                      className="px-3 py-1 bg-zinc-100 text-zinc-800 rounded-lg text-xs font-bold hover:bg-zinc-200"
                    >
                      Responder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: CONFIGURAÇÕES */}
      {activeTab === 'configuracoes' && (
        <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-xs space-y-6 text-xs">
          <h2 className="text-lg font-black text-zinc-900 border-b border-zinc-100 pb-3">
            Configurações Gerais da Loja
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Nome da Loja</label>
              <input
                type="text"
                defaultValue={settings.storeName}
                onBlur={(e) => updateSettings({ storeName: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">WhatsApp Comercial</label>
                <input
                  type="text"
                  defaultValue={settings.whatsappNumber}
                  onBlur={(e) => updateSettings({ whatsappNumber: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">E-mail de Atendimento</label>
                <input
                  type="email"
                  defaultValue={settings.contactEmail}
                  onBlur={(e) => updateSettings({ contactEmail: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">CNPJ</label>
                <input type="text" defaultValue={settings.cnpj || ''} onBlur={(e) => updateSettings({ cnpj: e.target.value })} placeholder="00.000.000/0000-00" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900" />
              </div>
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Endereço comercial</label>
                <input type="text" defaultValue={settings.businessAddress || ''} onBlur={(e) => updateSettings({ businessAddress: e.target.value })} placeholder="Rua, número, bairro, cidade/UF, CEP" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">
                Texto do Banner Superior de Avisos
              </label>
              <input
                type="text"
                defaultValue={settings.announcementText}
                onBlur={(e) => updateSettings({ announcementText: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Valor Mínimo para Frete Grátis (R$)
                </label>
                <input
                  type="number"
                  defaultValue={settings.freeShippingThreshold}
                  onBlur={(e) => updateSettings({ freeShippingThreshold: Number(e.target.value) })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Frete Padrão (R$)
                </label>
                <input
                  type="number"
                  defaultValue={settings.defaultShippingCost}
                  onBlur={(e) => updateSettings({ defaultShippingCost: Number(e.target.value) })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT CREATE/EDIT MODAL */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain bg-white rounded-3xl shadow-2xl p-4 sm:p-8 border border-zinc-100 my-auto">
            <h3 className="sticky top-0 z-10 -mx-4 sm:-mx-8 px-4 sm:px-8 py-3 bg-white/95 backdrop-blur border-b border-zinc-100 mb-4 text-lg font-black text-zinc-900">
              {editingProduct.title ? 'Editar Anúncio' : 'Novo Produto'}
            </h3>

            <form onSubmit={handleSaveProductForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Título do Produto *</label>
                <input
                  type="text"
                  value={editingProduct.title || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Preço de Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.price || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Preço Anterior (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.compareAtPrice || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, compareAtPrice: Number(e.target.value) })
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Estoque Disponível *</label>
                  <input
                    type="number"
                    value={editingProduct.stock || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
                <h4 className="font-bold text-zinc-900">Exibição de avaliações e vendas</h4>
                <p className="text-[10px] text-zinc-600">Defina a nota exibida e o contador inicial de vendas. Vendas confirmadas continuarão sendo somadas automaticamente.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">Nota em estrelas (0 a 5)</label>
                    <select value={editingProduct.rating ?? 5} onChange={(e) => setEditingProduct({ ...editingProduct, rating: Number(e.target.value) })} className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-zinc-900">
                      {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n === 0 ? 'Sem nota' : `${n} ${n === 1 ? 'estrela' : 'estrelas'}`}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">Quantidade de vendas</label>
                    <input type="number" min="0" step="1" value={editingProduct.salesCount ?? 0} onChange={(e) => setEditingProduct({ ...editingProduct, salesCount: Math.max(0, Number(e.target.value)) })} className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-zinc-900" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-pink-200 bg-pink-50/50 p-4 space-y-3">
                <div><h4 className="font-bold text-zinc-900">Cadastrar feedback de cliente</h4><p className="text-[10px] text-zinc-600">Cadastre depoimentos reais. Eles serão publicados diretamente na página deste produto. Salve o anúncio antes de adicionar feedbacks. Se alterar o título, salve primeiro para manter o vínculo correto.</p></div>
                <input value={feedbackName} onChange={e => setFeedbackName(e.target.value)} placeholder="Nome do cliente" className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-zinc-900" />
                <div className="flex items-center gap-3"><label className="font-semibold text-zinc-700">Estrelas</label><select value={feedbackRating} onChange={e => setFeedbackRating(Number(e.target.value))} className="bg-white border border-zinc-200 rounded-lg p-2">{[5,4,3,2,1].map(n => <option key={n} value={n}>{n} estrelas</option>)}</select></div>
                <textarea rows={3} value={feedbackComment} onChange={e => setFeedbackComment(e.target.value)} placeholder="Comentário real do cliente" className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-zinc-900" />
                <button type="button" disabled={!feedbackName.trim() || !feedbackComment.trim() || !editingProduct.id || !products.some((product) => product.id === editingProduct.id && product.title === editingProduct.title)} onClick={async () => { try { await createAdminReview({ productId: editingProduct.id!, productName: editingProduct.title || 'Produto', authorName: feedbackName.trim(), rating: feedbackRating, comment: feedbackComment.trim(), verifiedPurchase: false, status: 'approved' }); setReviews(await getAllReviews()); setFeedbackName(''); setFeedbackComment(''); setFeedbackRating(5); } catch (error: any) { showToast(error?.message || 'Não foi possível cadastrar o feedback.', 'error'); } }} className="px-4 py-2 rounded-lg bg-[#E6007A] text-white font-bold disabled:opacity-40">+ Adicionar feedback</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Categoria</label>
                  <select
                    value={editingProduct.category || categories[0]?.slug}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Marca</label>
                  <input
                    type="text"
                    value={editingProduct.brand || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-pink-200 bg-pink-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-zinc-900">Variações do produto</h4>
                    <p className="text-[10px] text-zinc-500">Cadastre opções como tamanho, cor, modelo ou fragrância.</p>
                  </div>
                  <button type="button" onClick={() => setEditingProduct({ ...editingProduct, variations: [...(editingProduct.variations || []), { name: '', options: [] }] })} className="shrink-0 px-3 py-2 rounded-lg bg-[#E6007A] text-white text-[11px] font-bold">+ Adicionar variação</button>
                </div>
                {(editingProduct.variations || []).map((variation, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2 items-end bg-white rounded-xl border border-zinc-200 p-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-600 mb-1">Nome (ex.: Tamanho)</label>
                      <input type="text" value={variation.name} onChange={(e) => { const variations = [...(editingProduct.variations || [])]; variations[index] = { ...variations[index], name: e.target.value }; setEditingProduct({ ...editingProduct, variations }); }} placeholder="Tamanho" className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-600 mb-1">Opções (separe por vírgula)</label>
                      <input type="text" value={variation.options.join(', ')} onChange={(e) => { const variations = [...(editingProduct.variations || [])]; variations[index] = { ...variations[index], options: e.target.value.split(',').map((option) => option.trim()).filter(Boolean) }; setEditingProduct({ ...editingProduct, variations }); }} placeholder="P, M, G, GG" className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900" />
                    </div>
                    <button type="button" onClick={() => setEditingProduct({ ...editingProduct, variations: (editingProduct.variations || []).filter((_, i) => i !== index) })} className="px-3 py-2 text-red-600 text-[11px] font-bold">Remover</button>
                  </div>
                ))}
                {(!editingProduct.variations || editingProduct.variations.length === 0) && <p className="text-[10px] text-zinc-500">Este produto não possui variações. Clique em “Adicionar variação” para incluir opções.</p>}
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  LINK EXTERNO DE PAGAMENTO (GATEWAY)
                </label>
                <input
                  type="url"
                  placeholder="https://mpago.la/... ou link Stripe/Asaas"
                  value={editingProduct.externalPaymentLink || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, externalPaymentLink: e.target.value })
                  }
                  className="w-full bg-zinc-50 border border-pink-200 rounded-xl p-2.5 text-zinc-900 font-mono"
                />
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  Insira o link de checkout correspondente a este produto no gateway de pagamento.
                </span>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 space-y-3">
                <div>
                  <label className="block font-bold text-zinc-800 mb-1">Imagens do anúncio (até 6 links)</label>
                  <p className="text-[11px] text-zinc-500">Cole os links públicos das imagens. O primeiro link será a imagem principal. Não é necessário enviar arquivos.</p>
                </div>
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index}>
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Imagem {index + 1}{index === 0 ? ' — principal' : ''}</label>
                    <input type="url" value={(editingProduct.images || [])[index] || ''} onChange={(e) => {
                      const images = [...(editingProduct.images || [])];
                      images[index] = e.target.value.trim();
                      setEditingProduct({ ...editingProduct, images, thumbnail: images[0] || '' });
                    }} placeholder="https://exemplo.com/imagem.jpg" className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-zinc-900" />
                  </div>
                ))}
                {(editingProduct.images || []).filter(Boolean).length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {(editingProduct.images || []).filter(Boolean).map((url, index) => (
                      <div key={`${url}-${index}`} className="aspect-square rounded-lg overflow-hidden border border-zinc-200 bg-white">
                        <img src={url} alt={`Prévia ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Descrição Completa</label>
                <textarea
                  rows={8}
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Mensagem promocional (opcional)</label>
                <input type="text" value={editingProduct.promotionMessage || ''} onChange={(e) => setEditingProduct({ ...editingProduct, promotionMessage: e.target.value })} placeholder="Ex.: Compre 1 e ganhe outro de brinde" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900" />
                <p className="text-[10px] text-zinc-500 mt-1">Use somente quando a promoção estiver válida e a loja puder cumprir a oferta.</p>
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingProduct.flashDeal || false}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, flashDeal: e.target.checked })
                    }
                    className="rounded text-[#E6007A]"
                  />
                  <span>Oferta Relâmpago</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured || false}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, featured: e.target.checked })
                    }
                    className="rounded text-[#E6007A]"
                  />
                  <span>Destaque</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingProduct.active ?? true}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, active: e.target.checked })
                    }
                    className="rounded text-[#E6007A]"
                  />
                  <span>Ativo na Loja</span>
                </label>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 bg-zinc-100 text-zinc-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 disabled:opacity-50 bg-[#E6007A] text-white rounded-xl font-bold shadow-md hover:bg-[#D0006E]"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
