import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Sparkles,
  Truck,
  ChevronDown,
  LogOut,
  SlidersHorizontal,
  Package,
  Zap,
  ShieldCheck,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { formatBRL } from '../utils/shop-logic';
import { Product } from '../types';

interface HeaderProps {
  onNavigate: (view: string, param?: string) => void;
  currentView: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentView }) => {
  const { products, categories, cartTotals, setIsCartOpen, wishlist, settings } = useStore();
  const { user, isAdmin, loginGoogle, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll and listen for Escape key when menu drawer is open
  useEffect(() => {
    if (isMenuDrawerOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsMenuDrawerOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isMenuDrawerOpen]);

  // Filter search suggestions
  const searchResults: Product[] = searchQuery.trim()
    ? products
        .filter((p) => {
          if (!p.active) return false;
          if (searchCategory && p.category !== searchCategory) return false;
          const q = searchQuery.toLowerCase();
          return (
            p.title.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            (p.shortDescription && p.shortDescription.toLowerCase().includes(q))
          );
        })
        .slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      const queryParam = searchCategory
        ? `cat:${searchCategory}&busca:${searchQuery.trim()}`
        : `busca:${searchQuery.trim()}`;
      onNavigate('catalogo', queryParam);
    }
  };

  const handleProductClick = (productId: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    onNavigate('produto', productId);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-pink-200/60 shadow-xs w-full overflow-x-hidden">
      {/* 1. BARRA SUPERIOR PROMOCIONAL FIXA (PADRÃO GRANDES MARKETPLACES) */}
      <div className="bg-gradient-to-r from-[#D0006E] via-[#E6007A] to-[#FF2E93] text-white py-1.5 sm:py-2 px-2.5 sm:px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-center sm:justify-between text-[10px] sm:text-xs font-bold tracking-wide">
          <div className="flex items-center gap-1.5 sm:gap-2 text-center truncate">
            <span className="p-0.5 sm:p-1 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </span>
            <span className="uppercase tracking-wider truncate">
              FRETE GRÁTIS EM COMPRAS A PARTIR DE R$ 49,99
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-[11px] font-semibold text-pink-100">
            <span>✨ Até 6x Sem Juros</span>
            <span>🔒 Compra Segura &amp; Blindada</span>
            <span>⚡ Envio Expresso para todo o Brasil</span>
          </div>
        </div>
      </div>

      {/* 2. CABEÇALHO PRINCIPAL — PRIMEIRA LINHA */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-2 sm:gap-6">
          {/* Left Block: Ícone de 3 paus (Menu) + Logotipo Comercial */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            {/* Ícone de Três Paus (Menu de Departamentos e Navegação Completa) */}
            <button
              onClick={() => setIsMenuDrawerOpen(true)}
              className="p-1.5 sm:px-3 sm:py-2 text-zinc-800 hover:text-[#E6007A] hover:bg-pink-50 rounded-xl transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 border border-zinc-200/80 hover:border-pink-300 focus:outline-hidden group shadow-2xs"
              aria-label="Abrir menu de departamentos e navegação"
              title="Departamentos & Navegação"
            >
              <Menu className="w-5 h-5 sm:w-5 sm:h-5 text-zinc-800 group-hover:text-[#E6007A] transition-colors" />
              <span className="hidden sm:inline text-xs font-extrabold text-zinc-800 group-hover:text-[#E6007A] transition-colors">
                Departamentos
              </span>
            </button>

            {/* Logotipo Comercial */}
            <div
              onClick={() => onNavigate('home')}
              className="cursor-pointer flex items-center gap-1.5 sm:gap-3 select-none group py-1 shrink min-w-0"
            >
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#E6007A] via-[#FF007F] to-[#FF69B4] flex items-center justify-center text-white shadow-md shadow-pink-300/40 group-hover:scale-105 transition-all shrink-0">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-black text-xs sm:text-2xl tracking-tight text-zinc-900 group-hover:text-[#E6007A] transition-colors leading-none truncate">
                  CASA &amp; BELEZA
                </span>
                <span className="text-[7px] sm:text-[11px] font-black tracking-wider text-[#E6007A] uppercase mt-0.5 truncate">
                  EXPRESS MARKETPLACE
                </span>
              </div>
            </div>
          </div>

          {/* Campo de Busca Grande (Marketplace Standard - Desktop) */}
          <div ref={searchRef} className="hidden md:block flex-1 max-w-2xl relative">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center bg-zinc-100/90 rounded-full border-2 border-transparent focus-within:border-[#E6007A] focus-within:bg-white focus-within:ring-4 focus-within:ring-pink-100 transition-all shadow-inner"
            >
              {/* Category Prefix Dropdown */}
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="bg-transparent text-xs font-bold text-zinc-700 pl-4 pr-1 py-3 border-r border-zinc-200 focus:outline-hidden cursor-pointer rounded-l-full hidden xl:block"
              >
                <option value="">Todos os Departamentos</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  placeholder="O que você está procurando hoje? Ex: Vitamina C, organizador acrílico..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  className="w-full bg-transparent py-3 pl-4 pr-10 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-hidden"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-zinc-400 hover:text-zinc-600 mr-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Big Search Submit Button */}
              <button
                type="submit"
                aria-label="Buscar produtos"
                className="m-1 px-5 py-2.5 bg-[#E6007A] hover:bg-[#D0006E] text-white rounded-full font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Buscar</span>
              </button>
            </form>

            {/* Live Autocomplete Suggestions */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-pink-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-3 border-b border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-4 flex justify-between items-center">
                  <span>Produtos Encontrados</span>
                  <span className="text-[#E6007A]">{searchResults.length} itens</span>
                </div>
                <div className="divide-y divide-zinc-50 max-h-80 overflow-y-auto">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="flex items-center gap-3 p-3 hover:bg-pink-50/60 cursor-pointer transition-colors"
                    >
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-12 h-12 rounded-xl object-cover border border-zinc-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-900 truncate">
                          {product.title}
                        </p>
                        <p className="text-[11px] text-zinc-400">{product.brand}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-[#E6007A]">
                          {formatBRL(product.price)}
                        </p>
                        {product.price >= 49.99 && (
                          <span className="text-[9px] font-bold text-emerald-600 block">
                            Frete Grátis
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full text-center py-2.5 bg-pink-50/50 text-xs font-bold text-[#E6007A] hover:bg-pink-100/60 transition-colors"
                >
                  Ver todos os resultados para "{searchQuery}"
                </button>
              </div>
            )}
          </div>

          {/* Right Action Icons: Account, Wishlist, Cart, Admin */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Admin Badge */}
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 text-[#E6007A] rounded-full text-xs font-black hover:bg-pink-200 transition-colors shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Painel Lojista</span>
              </button>
            )}

            {/* Minha Conta (Marketplace Account Box) */}
            <div ref={userMenuRef} className="relative shrink-0">
              {user ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1 sm:gap-2 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl hover:bg-pink-50 transition-colors text-left shrink-0"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt=""
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-pink-300 object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-pink-100 text-[#E6007A] font-black flex items-center justify-center text-xs shrink-0">
                        {user.displayName?.[0] || 'U'}
                      </div>
                    )}
                    <div className="hidden lg:flex flex-col text-left leading-tight">
                      <span className="text-[10px] text-zinc-400 font-semibold">Olá, cliente</span>
                      <span className="text-xs font-bold text-zinc-900 truncate max-w-[110px]">
                        {user.displayName?.split(' ')[0] || 'Minha Conta'}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden lg:block" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-pink-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2.5 border-b border-zinc-100">
                        <p className="text-[11px] text-zinc-400">Logada como</p>
                        <p className="text-xs font-bold text-zinc-900 truncate">
                          {user.displayName || user.email}
                        </p>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-pink-100 text-[#E6007A] text-[10px] font-bold rounded-md">
                            Administrador Oficial
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('conta');
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-pink-50 hover:text-[#E6007A] flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-[#E6007A]" /> Meus Pedidos &amp; Cadastro
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('acompanhar-pedido');
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-pink-50 hover:text-[#E6007A] flex items-center gap-2"
                      >
                        <Package className="w-4 h-4 text-[#E6007A]" /> Rastrear Minha Entrega
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onNavigate('admin');
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-black text-[#E6007A] hover:bg-pink-50 flex items-center gap-2"
                        >
                          <SlidersHorizontal className="w-4 h-4" /> Gestão da Loja (Admin)
                        </button>
                      )}
                      <div className="border-t border-zinc-100 my-1"></div>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Sair
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={loginGoogle}
                  className="flex items-center gap-1.5 p-1 sm:p-2 hover:bg-pink-50 rounded-xl sm:rounded-2xl transition-colors text-left shrink-0"
                  aria-label="Fazer login"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#E6007A]" />
                  </div>
                  <div className="hidden lg:flex flex-col leading-tight">
                    <span className="text-[10px] text-zinc-400 font-semibold">Olá, faça seu login</span>
                    <span className="text-xs font-bold text-zinc-900">Minha Conta</span>
                  </div>
                </button>
              )}
            </div>

            {/* Favoritos */}
            <button
              onClick={() => onNavigate('favoritos')}
              className="relative p-1.5 sm:p-2 text-zinc-700 hover:text-[#E6007A] hover:bg-pink-50 rounded-xl sm:rounded-2xl transition-colors shrink-0"
              aria-label="Ver produtos favoritos"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              {wishlist.length > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#E6007A] text-white text-[9px] sm:text-[10px] font-black rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Carrinho de Compras / Sacola */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-1.5 sm:gap-3 p-1 sm:p-2 text-zinc-700 hover:bg-pink-50 rounded-xl sm:rounded-2xl transition-all group shrink-0"
              aria-label="Abrir sacola de compras"
            >
              <div className="relative shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-zinc-900 group-hover:bg-[#E6007A] text-white flex items-center justify-center transition-colors shadow-xs">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                {cartTotals.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-[#E6007A] text-white text-[9px] sm:text-xs font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {cartTotals.itemCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Minha Sacola</span>
                <span className="text-xs font-black text-zinc-900 group-hover:text-[#E6007A] transition-colors">
                  {formatBRL(cartTotals.total)}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Buscar produtos, maquiagens, organizadores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-100 border border-zinc-200 rounded-full py-2.5 pl-10 pr-4 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-hidden focus:border-[#E6007A] focus:bg-white"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>
        </div>
      </div>

      {/* DRAWER UNIVERSAL DE NAVEGAÇÃO & DEPARTAMENTOS (ACIONADO PELO ÍCONE DE 3 PAUS) */}
      {isMenuDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-in fade-in duration-200">
          {/* Backdrop click to close */}
          <div
            className="fixed inset-0"
            onClick={() => setIsMenuDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-250">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#D0006E] via-[#E6007A] to-[#FF2E93] text-white flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base tracking-tight leading-none">
                    CASA &amp; BELEZA
                  </h3>
                  <p className="text-[10px] text-pink-100 font-bold uppercase tracking-wider mt-0.5">
                    Departamentos &amp; Navegação
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuDrawerOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Aviso de Frete Grátis no topo do menu */}
            <div className="bg-pink-50 border-b border-pink-100 px-4 py-2 flex items-center gap-2 text-[11px] font-bold text-[#E6007A] shrink-0">
              <Truck className="w-3.5 h-3.5 shrink-0" />
              <span>FRETE GRÁTIS EM COMPRAS A PARTIR DE R$ 49,99</span>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
              {/* Bloco 1: Acesso Principal (Início, Ofertas do Dia, Rastrear Pedido) */}
              <div className="p-3 sm:p-4 space-y-1">
                <div className="px-3 py-1 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                  Navegação Principal
                </div>

                {/* Início */}
                <button
                  onClick={() => {
                    setIsMenuDrawerOpen(false);
                    onNavigate('home');
                  }}
                  className={`w-full text-left py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between transition-colors ${
                    currentView === 'home'
                      ? 'bg-pink-100/70 text-[#E6007A]'
                      : 'text-zinc-800 hover:bg-pink-50 hover:text-[#E6007A]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base">🏠</span>
                    <span>Início</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-zinc-300" />
                </button>

                {/* Ofertas do Dia */}
                <button
                  onClick={() => {
                    setIsMenuDrawerOpen(false);
                    onNavigate('catalogo', 'ofertas:true');
                  }}
                  className="w-full text-left py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-[#E6007A] to-[#FF4D9E] hover:from-[#D0006E] hover:to-[#E6007A] flex items-center justify-between shadow-xs transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Flame className="w-4 h-4 fill-current text-amber-200" />
                    <span>Ofertas do Dia (Até 40% OFF)</span>
                  </span>
                  <span className="px-1.5 py-0.5 bg-white/20 rounded-md text-[10px] uppercase font-black">
                    Hot
                  </span>
                </button>

                {/* Rastrear Pedido */}
                <button
                  onClick={() => {
                    setIsMenuDrawerOpen(false);
                    onNavigate('acompanhar-pedido');
                  }}
                  className="w-full text-left py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm text-zinc-800 hover:bg-pink-50 hover:text-[#E6007A] flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-[#E6007A]" />
                    <span>Rastrear Pedido</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-zinc-300" />
                </button>
              </div>

              {/* Bloco 2: Todos os Departamentos */}
              <div className="p-3 sm:p-4 space-y-1">
                <div className="flex items-center justify-between px-3 py-1">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                    Todos os Departamentos
                  </span>
                  <button
                    onClick={() => {
                      setIsMenuDrawerOpen(false);
                      onNavigate('catalogo');
                    }}
                    className="text-[11px] font-bold text-[#E6007A] hover:underline"
                  >
                    Ver Tudo
                  </button>
                </div>

                {/* Botão Ver Todo o Catálogo */}
                <button
                  onClick={() => {
                    setIsMenuDrawerOpen(false);
                    onNavigate('catalogo');
                  }}
                  className="w-full text-left py-2 px-3 rounded-xl font-bold text-xs sm:text-sm text-zinc-900 bg-zinc-50 hover:bg-pink-50 hover:text-[#E6007A] flex items-center justify-between transition-colors mb-1"
                >
                  <span className="flex items-center gap-2">
                    <span>✨</span>
                    <span>Todos os Produtos</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {/* Categorias individuais com navegação direta */}
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setIsMenuDrawerOpen(false);
                      onNavigate('catalogo', `cat:${cat.slug}`);
                    }}
                    className="w-full text-left py-2 px-3 rounded-xl font-semibold text-xs sm:text-sm text-zinc-700 hover:bg-pink-50 hover:text-[#E6007A] flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-400 group-hover:scale-125 transition-transform shrink-0" />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-[#E6007A] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>

              {/* Bloco 3: Minha Conta & Pedidos */}
              <div className="p-3 sm:p-4 space-y-1">
                <div className="px-3 py-1 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                  Minha Conta &amp; Pedidos
                </div>
                {user ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2 bg-pink-50/60 rounded-xl flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-[10px] text-zinc-400 font-semibold">Logada como</p>
                        <p className="text-xs font-bold text-zinc-900 truncate">
                          {user.displayName || user.email}
                        </p>
                      </div>
                      <button
                        onClick={logout}
                        className="text-xs font-bold text-red-600 hover:underline px-2 py-1"
                      >
                        Sair
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setIsMenuDrawerOpen(false);
                        onNavigate('conta');
                      }}
                      className="w-full text-left py-2 px-3 rounded-xl font-semibold text-xs text-zinc-700 hover:bg-pink-50 hover:text-[#E6007A] flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-[#E6007A]" /> Meus Pedidos &amp; Cadastro
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setIsMenuDrawerOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full text-left py-2 px-3 rounded-xl font-black text-xs text-[#E6007A] bg-pink-100/60 hover:bg-pink-200/60 flex items-center gap-2"
                      >
                        <SlidersHorizontal className="w-4 h-4" /> Painel Lojista (Admin)
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMenuDrawerOpen(false);
                      loginGoogle();
                    }}
                    className="w-full py-2.5 px-3 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <User className="w-4 h-4 text-pink-400" />
                    <span>Entrar com Conta Google</span>
                  </button>
                )}
              </div>

              {/* Bloco 4: Ajuda & Segurança */}
              <div className="p-3 sm:p-4 space-y-2 text-xs text-zinc-600">
                <div className="px-3 py-1 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                  Suporte &amp; Segurança
                </div>
                <a
                  href={`https://wa.me/${(settings.whatsappNumber || '5511987654321').replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Gostaria de atendimento sobre a loja Casa & Beleza Express.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold transition-colors"
                >
                  <span>💬</span>
                  <span>WhatsApp: {settings.contactPhone || '(11) 98765-4321'}</span>
                </a>
                <div className="px-3 py-1 text-[11px] text-zinc-500 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Compra 100% Blindada com SSL</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Até 6x Sem Juros ou 5% no PIX</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
