import React, { useState, useEffect } from 'react';
import {
  User,
  Package,
  Heart,
  LogOut,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShoppingBag,
  Mail,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { formatBRL, getOrderStatusInfo } from '../utils/shop-logic';
import { Order } from '../types';

interface CustomerAccountViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const CustomerAccountView: React.FC<CustomerAccountViewProps> = ({ onNavigate }) => {
  const { user, userProfile, isAdmin, logout, loginGoogle, loginEmail, registerEmail, resetPassword, loading: authLoading } = useAuth();
  const { getUserOrders, wishlist, products, addToCart, toggleWishlist, showToast } = useStore();

  const [activeTab, setActiveTab] = useState<'pedidos' | 'favoritos' | 'perfil'>('pedidos');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  const handleEmailAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError('');
    if (authPassword.length < 6) {
      setAuthError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    setAuthBusy(true);
    try {
      if (authMode === 'register') {
        if (!authName.trim()) { setAuthError('Informe seu nome.'); return; }
        await registerEmail(authName, authEmail, authPassword);
        showToast('Conta criada. Enviamos um link de verificação para seu e-mail.', 'success');
      } else {
        await loginEmail(authEmail, authPassword);
      }
    } catch (error: any) {
      const code = error?.code || '';
      const messages: Record<string, string> = {
        'auth/email-already-in-use': 'Este e-mail já possui cadastro. Faça login.',
        'auth/invalid-email': 'Informe um e-mail válido.',
        'auth/invalid-credential': 'E-mail ou senha incorretos.',
        'auth/user-not-found': 'Não encontramos uma conta com esse e-mail.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
        'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente novamente.',
        'auth/operation-not-allowed': 'O login por e-mail ainda não está habilitado no Firebase.',
      };
      setAuthError(messages[code] || error?.message || 'Não foi possível autenticar. Tente novamente.');
    } finally { setAuthBusy(false); }
  };

  const handlePasswordReset = async () => {
    setAuthError('');
    if (!authEmail.trim()) { setAuthError('Digite seu e-mail para receber o link de redefinição.'); return; }
    try {
      await resetPassword(authEmail);
      setAuthError('Enviamos um link de redefinição para seu e-mail.');
    } catch (error: any) { setAuthError(error?.message || 'Não foi possível enviar o e-mail de redefinição.'); }
  };

  useEffect(() => {
    if (user) {
      setLoadingOrders(true);
      getUserOrders().then((data) => {
        setOrders(data);
        setLoadingOrders(false);
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white border border-pink-100 rounded-3xl shadow-xl p-6 sm:p-8 space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-pink-50 text-[#E6007A] flex items-center justify-center mx-auto"><User className="w-8 h-8" /></div>
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-zinc-900">Acesse sua conta</h2>
            <p className="text-sm text-zinc-500">Entre para acompanhar seus pedidos e salvar seus favoritos.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-xl">
            <button type="button" onClick={() => { setAuthMode('login'); setAuthError(''); }} className={`py-2.5 rounded-lg text-sm font-bold ${authMode === 'login' ? 'bg-white text-[#E6007A] shadow-sm' : 'text-zinc-500'}`}>Entrar</button>
            <button type="button" onClick={() => { setAuthMode('register'); setAuthError(''); }} className={`py-2.5 rounded-lg text-sm font-bold ${authMode === 'register' ? 'bg-white text-[#E6007A] shadow-sm' : 'text-zinc-500'}`}>Criar conta</button>
          </div>
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {authMode === 'register' && <label className="block text-sm font-semibold text-zinc-700">Nome completo<input value={authName} onChange={(e) => setAuthName(e.target.value)} autoComplete="name" required className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-[#E6007A] focus:ring-2 focus:ring-pink-100" placeholder="Seu nome" /></label>}
            <label className="block text-sm font-semibold text-zinc-700">E-mail
              <span className="relative block mt-1"><Mail className="absolute left-3 top-3.5 w-4 h-4 text-zinc-400" /><input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} autoComplete="email" required className="w-full rounded-xl border border-zinc-200 pl-10 pr-4 py-3 outline-none focus:border-[#E6007A] focus:ring-2 focus:ring-pink-100" placeholder="voce@email.com" /></span>
            </label>
            <label className="block text-sm font-semibold text-zinc-700">Senha
              <span className="relative block mt-1"><Lock className="absolute left-3 top-3.5 w-4 h-4 text-zinc-400" /><input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} required minLength={6} className="w-full rounded-xl border border-zinc-200 pl-10 pr-4 py-3 outline-none focus:border-[#E6007A] focus:ring-2 focus:ring-pink-100" placeholder="Mínimo de 6 caracteres" /></span>
            </label>
            {authMode === 'login' && <button type="button" onClick={handlePasswordReset} className="text-xs font-bold text-[#E6007A] hover:underline">Esqueci minha senha</button>}
            {authError && <p role="alert" className="rounded-xl bg-pink-50 border border-pink-100 p-3 text-xs text-pink-800">{authError}</p>}
            <button type="submit" disabled={authBusy || authLoading} className="w-full py-3.5 bg-[#E6007A] hover:bg-[#D0006E] disabled:opacity-60 text-white rounded-xl text-sm font-extrabold shadow-md">{authBusy || authLoading ? 'Aguarde...' : authMode === 'login' ? 'Entrar com e-mail' : 'Criar minha conta'}</button>
          </form>
          <div className="flex items-center gap-3 text-xs text-zinc-400"><span className="h-px bg-zinc-200 flex-1" />ou continue com<span className="h-px bg-zinc-200 flex-1" /></div>
          <button onClick={async () => { setAuthError(''); try { await loginGoogle(); } catch (error: any) { setAuthError(error?.message || 'Não foi possível entrar com Google.'); } }} className="w-full py-3 border border-zinc-200 hover:bg-zinc-50 text-zinc-800 rounded-xl text-sm font-bold transition-colors">Continuar com Google</button>
          <p className="text-[11px] text-center text-zinc-400">O acesso por e-mail depende de o provedor E-mail/senha estar ativado no Firebase Authentication.</p>
        </div>
      </div>
    );
  }

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* User Sidebar */}
        <aside className="bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="w-12 h-12 rounded-full border border-pink-200 object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-pink-100 text-[#E6007A] font-black text-base flex items-center justify-center">
                {user.displayName?.[0] || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-sm text-zinc-900 truncate">
                {user.displayName || 'Cliente VIP'}
              </h3>
              <p className="text-xs text-zinc-400 truncate">{user.email}</p>
              {isAdmin && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-pink-100 text-[#E6007A] text-[10px] font-bold rounded-md">
                  Administrador
                </span>
              )}
            </div>
          </div>

          <nav className="space-y-1 text-xs">
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl font-semibold flex items-center justify-between transition-colors ${
                activeTab === 'pedidos'
                  ? 'bg-[#E6007A] text-white shadow-xs'
                  : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>Meus Pedidos</span>
              </div>
              <span className="text-[11px] font-bold">{orders.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('favoritos')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl font-semibold flex items-center justify-between transition-colors ${
                activeTab === 'favoritos'
                  ? 'bg-[#E6007A] text-white shadow-xs'
                  : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>Meus Favoritos</span>
              </div>
              <span className="text-[11px] font-bold">{wishlist.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('perfil')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors ${
                activeTab === 'perfil'
                  ? 'bg-[#E6007A] text-white shadow-xs'
                  : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Dados Cadastrais</span>
            </button>

            <div className="border-t border-zinc-100 pt-2 mt-2">
              <button
                onClick={logout}
                className="w-full text-left px-3.5 py-2.5 rounded-xl font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da Conta</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-3 bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-xs">
          {activeTab === 'pedidos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <h2 className="text-xl font-black text-zinc-900">Histórico de Pedidos</h2>
                <span className="text-xs text-zinc-500 font-medium">
                  {orders.length} pedidos registrados
                </span>
              </div>

              {loadingOrders ? (
                <div className="py-12 text-center text-xs text-zinc-500">
                  Carregando pedidos...
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Package className="w-12 h-12 text-zinc-300 mx-auto" />
                  <h4 className="font-bold text-sm text-zinc-900">Nenhum pedido realizado ainda</h4>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                    Seus pedidos e compras aparecerão aqui com status atualizado em tempo real.
                  </p>
                  <button
                    onClick={() => onNavigate('catalogo')}
                    className="px-6 py-2.5 bg-[#E6007A] text-white rounded-xl text-xs font-bold hover:bg-[#D0006E]"
                  >
                    Ir às Compras
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const statusInfo = getOrderStatusInfo(order.status);
                    return (
                      <div
                        key={order.id}
                        className="p-5 border border-zinc-200 rounded-2xl hover:border-pink-200 transition-colors space-y-4 text-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                          <div>
                            <span className="text-zinc-400 font-medium">Pedido</span>
                            <h4 className="font-mono font-bold text-sm text-zinc-900">
                              {order.orderNumber}
                            </h4>
                            <span className="text-[11px] text-zinc-400">
                              {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full font-bold text-[11px] ${statusInfo.colorClass}`}
                            >
                              {statusInfo.label}
                            </span>
                            <span className="font-extrabold text-sm text-[#E6007A]">
                              {formatBRL(order.total)}
                            </span>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-10 h-10 rounded-lg object-cover border border-zinc-100 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-zinc-900 truncate">
                                  {item.title}
                                </p>
                                <span className="text-zinc-400 text-[10px]">
                                  Qtd: {item.quantity} • {formatBRL(item.price)} cada
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-50">
                          <button
                            onClick={() => onNavigate('acompanhar-pedido', order.orderNumber)}
                            className="font-bold text-[#E6007A] hover:underline flex items-center gap-1"
                          >
                            <span>Acompanhar Entrega</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          {order.trackingCode && (
                            <span className="text-[11px] text-blue-600 font-mono font-semibold">
                              Rastreio: {order.trackingCode}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'favoritos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <h2 className="text-xl font-black text-zinc-900">Produtos Favoritos</h2>
                <span className="text-xs text-zinc-500 font-medium">
                  {wishlistedProducts.length} itens salvos
                </span>
              </div>

              {wishlistedProducts.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Heart className="w-12 h-12 text-zinc-300 mx-auto" />
                  <h4 className="font-bold text-sm text-zinc-900">Sua lista de favoritos está vazia</h4>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                    Salve os produtos que você mais gostou para encontrá-los facilmente depois.
                  </p>
                  <button
                    onClick={() => onNavigate('catalogo')}
                    className="px-6 py-2.5 bg-[#E6007A] text-white rounded-xl text-xs font-bold hover:bg-[#D0006E]"
                  >
                    Ver Catálogo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistedProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="p-4 border border-zinc-200 rounded-2xl flex gap-3 text-xs"
                    >
                      <img
                        src={prod.thumbnail}
                        alt={prod.title}
                        className="w-16 h-16 rounded-xl object-cover border border-zinc-100"
                      />
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <h4 className="font-semibold text-zinc-900 truncate">{prod.title}</h4>
                          <span className="font-extrabold text-[#E6007A]">
                            {formatBRL(prod.price)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => addToCart(prod, 1)}
                            className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg font-bold text-[11px] hover:bg-[#E6007A]"
                          >
                            Comprar
                          </button>
                          <button
                            onClick={() => toggleWishlist(prod.id)}
                            className="text-zinc-400 hover:text-red-500 text-[11px]"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'perfil' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-zinc-100">
                <h2 className="text-xl font-black text-zinc-900">Dados do Cliente</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <span className="text-zinc-400 block font-medium">Nome</span>
                  <strong className="text-sm text-zinc-900">
                    {user.displayName || 'Não informado'}
                  </strong>
                </div>

                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <span className="text-zinc-400 block font-medium">E-mail</span>
                  <strong className="text-sm text-zinc-900">{user.email}</strong>
                </div>

                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <span className="text-zinc-400 block font-medium">Perfil de Acesso</span>
                  <span className="inline-block mt-1 px-2.5 py-0.5 bg-pink-100 text-[#E6007A] font-bold rounded-md">
                    {userProfile?.role === 'admin' ? 'Administrador Oficial' : 'Cliente VIP'}
                  </span>
                </div>

                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <span className="text-zinc-400 block font-medium">Status de Verificação</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> E-mail Autenticado via Google
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
