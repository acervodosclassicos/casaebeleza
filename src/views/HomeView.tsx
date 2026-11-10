import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  CreditCard,
  RotateCcw,
  Star,
  CheckCircle2,
  Send,
  Flame,
  Award,
  Clock,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { formatBRL } from '../utils/shop-logic';
import { Review } from '../types';

interface HomeViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const { products, categories, banners, showToast, subscribeNewsletter, getPublishedReviews } = useStore();

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [publishedReviews, setPublishedReviews] = useState<Review[]>([]);


  // Auto advance banner carousel
  const activeBanners = banners.filter((b) => b.active);
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const currentBanner = activeBanners[currentBannerIndex] || activeBanners[0];

  useEffect(() => {
    getPublishedReviews().then(setPublishedReviews);
  }, []);


  // Curated product sections
  const flashDealProducts = products.filter((p) => p.active && p.flashDeal);
  const bestSellers = products.filter((p) => p.active && p.featured);
  const newArrivals = products.filter((p) => p.active && p.isNew);
  const beautyProducts = products.filter(
    (p) =>
      p.active &&
      (p.category === 'beleza-cosmeticos' ||
        p.category === 'maquiagem-acessorios' ||
        p.category === 'cuidados-pessoais' ||
        p.category === 'produtos-cabelo')
  );
  const homeProducts = products.filter(
    (p) =>
      p.active &&
      (p.category === 'organizacao-domestica' ||
        p.category === 'casa-decoracao' ||
        p.category === 'utilidades-lar')
  );
  const recommendedProducts = products.filter((p) => p.active && p.featured);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Por favor, informe um e-mail válido.', 'error');
      return;
    }
    if (!newsletterConsent) {
      showToast('Confirme o consentimento para receber novidades.', 'error');
      return;
    }
    try {
      await subscribeNewsletter(newsletterEmail);
      setNewsletterSubmitted(true);
      showToast('Seu e-mail foi cadastrado para receber novidades.', 'success');
    } catch (error: any) {
      showToast(error?.message || 'Não foi possível cadastrar seu e-mail.', 'error');
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16 bg-zinc-50/30">
      {/* 1. SEÇÃO 1 — HERO BANNER PRINCIPAL COM CARROSSEL COMERCIAL */}
      {currentBanner && (
        <section className="relative overflow-hidden bg-zinc-950 text-white min-h-[480px] md:min-h-[560px] flex items-center shadow-lg">
          {/* Background image with high-definition styling & gradient */}
          <div className="absolute inset-0 z-0">
            <img
              src={currentBanner.imageUrl}
              alt={currentBanner.title}
              className="w-full h-full object-cover object-center opacity-45 scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-black/30" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 w-full">
            <div className="max-w-2xl space-y-5">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6007A]/25 border border-[#FF2E93]/50 text-[#FF4D9E] text-xs font-black tracking-wider uppercase backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#FF2E93]" />
                <span>{currentBanner.badgeText || 'SUPER OFERTA EXCLUSIVA'}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                {currentBanner.title}
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-lg text-zinc-200 leading-relaxed max-w-xl font-medium drop-shadow-sm">
                {currentBanner.subtitle}
              </p>

              {/* Micro-incentive */}
              <div className="flex items-center gap-2 text-xs font-bold text-pink-200 pt-1">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>FRETE GRÁTIS EM COMPRAS A PARTIR DE R$ 49,99</span>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-3">
                <button
                  onClick={() => onNavigate(currentBanner.linkUrl ? 'catalogo' : 'catalogo')}
                  className="px-8 py-4 bg-[#E6007A] hover:bg-[#D0006E] text-white rounded-xl font-black text-sm uppercase tracking-wider flex items-center gap-3 shadow-xl shadow-pink-600/30 transition-all transform hover:-translate-y-0.5 active:scale-95"
                >
                  <span>{currentBanner.ctaText || 'Aproveitar Ofertas'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onNavigate('catalogo', 'ofertas:true')}
                  className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs uppercase tracking-wider backdrop-blur-xs border border-white/20 transition-all"
                >
                  Ver Ofertas do Dia
                </button>
              </div>
            </div>
          </div>

          {/* Banner Controls & Dots */}
          {activeBanners.length > 1 && (
            <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
              <button
                onClick={() =>
                  setCurrentBannerIndex(
                    (prev) => (prev - 1 + activeBanners.length) % activeBanners.length
                  )
                }
                className="p-2.5 rounded-full bg-black/50 hover:bg-[#E6007A] text-white backdrop-blur-xs border border-white/20 transition-all"
                aria-label="Banner anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-1.5 px-2">
                {activeBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentBannerIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      idx === currentBannerIndex
                        ? 'w-7 bg-[#E6007A]'
                        : 'w-2.5 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Ir para banner ${idx + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={() =>
                  setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length)
                }
                className="p-2.5 rounded-full bg-black/50 hover:bg-[#E6007A] text-white backdrop-blur-xs border border-white/20 transition-all"
                aria-label="Próximo banner"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
      )}

      {/* QUICK TRUST BAR (Padrão Grandes Marketplaces) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-zinc-200/80 p-4 sm:p-5 grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E6007A] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-zinc-900 leading-tight">Frete Grátis Express</h4>
              <p className="text-[11px] text-zinc-500">Em compras a partir de R$ 49,99</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 pt-3 sm:pt-0">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E6007A] flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-zinc-900 leading-tight">Pagamento pelo gateway</h4>
              <p className="text-[11px] text-zinc-500">Consulte as opções disponíveis no pagamento</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 pt-3 sm:pt-0">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E6007A] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-zinc-900 leading-tight">Pagamento em ambiente seguro</h4>
              <p className="text-[11px] text-zinc-500">O pagamento é feito no gateway configurado</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 pt-3 sm:pt-0">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E6007A] flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-zinc-900 leading-tight">Garantia &amp; Troca Fácil</h4>
              <p className="text-[11px] text-zinc-500">7 dias sem custos de devolução</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEÇÃO 2 — DESTAQUES DE DEPARTAMENTOS (Cards Ilustrados com Fotografia) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#E6007A]">
              Navegue pelos Departamentos
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1">
              Categorias em Alta
            </h2>
          </div>
          <button
            onClick={() => onNavigate('catalogo')}
            className="text-xs sm:text-sm font-bold text-[#E6007A] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Ver todas</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const enriched = cat as any;
            return (
              <div
                key={cat.id}
                onClick={() => onNavigate('catalogo', `cat:${cat.slug}`)}
                className="group relative bg-white rounded-2xl border border-zinc-200/90 hover:border-[#E6007A] shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col items-center text-center transform hover:-translate-y-1"
              >
                {/* Category Thumbnail */}
                <div className="relative w-full aspect-square overflow-hidden bg-zinc-100">
                  <img
                    src={
                      enriched.imageUrl ||
                      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80'
                    }
                    alt={cat.name}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Micro badge */}
                  {enriched.tag && (
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#E6007A] text-white text-[9px] font-black rounded-md tracking-wider uppercase shadow-xs">
                      {enriched.tag}
                    </span>
                  )}
                </div>

                {/* Category Title */}
                <div className="p-3 w-full bg-white flex items-center justify-center min-h-[46px]">
                  <span className="text-xs font-bold text-zinc-900 group-hover:text-[#E6007A] transition-colors line-clamp-2 leading-tight">
                    {cat.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ofertas com preço promocional configurado */}
      {products.some((p) => p.active && (p.compareAtPrice || 0) > p.price) && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 bg-gradient-to-r from-pink-50 via-white to-pink-50/50 rounded-3xl border border-pink-200/80 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-pink-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E6007A] text-white rounded-full text-xs font-black uppercase tracking-wider mb-2 shadow-xs">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>Super Preços</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900">
                Ofertas da Loja
              </h2>
              <p className="text-xs text-zinc-600 mt-1 font-medium">
                Produtos com preço promocional cadastrado pela loja.
              </p>
            </div>
            <button
              onClick={() => onNavigate('catalogo', 'ofertas:true')}
              className="px-5 py-2.5 bg-[#E6007A] hover:bg-[#D0006E] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md self-start sm:self-auto shrink-0"
            >
              Ver Todas as Ofertas
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products
              .filter((p) => p.active && (p.compareAtPrice || 0) > p.price)
              .slice(0, 4)
              .map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={(id) => onNavigate('produto', id)}
                />
              ))}
          </div>
        </div>
      </section>
      )}

      {/* Destaques escolhidos no painel administrativo */}
      {bestSellers.length > 0 && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-[#E6007A]">
              <Award className="w-3.5 h-3.5 text-[#E6007A]" />
              <span>Escolha da equipe</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1">
              Destaques da Loja
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Produtos selecionados pela equipe da loja.
            </p>
          </div>
          <button
            onClick={() => onNavigate('catalogo')}
            className="text-xs sm:text-sm font-bold text-[#E6007A] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Ver catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} onSelect={(id) => onNavigate('produto', id)} />
          ))}
        </div>
      </section>
      )}

      {/* Ofertas relâmpago cadastradas no painel */}
      {flashDealProducts.length > 0 && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-zinc-800">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-800/80">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
                <span>Ofertas Relâmpago</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Ofertas Relâmpago Exclusivas
              </h2>
              <p className="text-xs text-zinc-400 mt-1 font-medium">
                Produtos marcados como oferta relâmpago pela equipe da loja.
              </p>
            </div>


          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
            {flashDealProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} onSelect={(id) => onNavigate('produto', id)} />
            ))}
          </div>
        </div>
      </section>
      )}

      {beautyProducts.length > 0 && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/90 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Editorial Tall Banner (4 cols) */}
            <div className="lg:col-span-4 relative rounded-2xl overflow-hidden min-h-[360px] lg:min-h-full flex flex-col justify-end p-6 sm:p-8 text-white shadow-md">
              <img
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
                alt="Beleza & Skincare"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

              <div className="relative z-10 space-y-3">
                <span className="px-2.5 py-1 bg-[#E6007A] text-white text-[10px] font-black uppercase tracking-wider rounded-md inline-block">
                  Coleção Glow &amp; Cuidado
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Beleza &amp; Maquiagem Profissional
                </h3>
                <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                  Pigmentação superior, ativos dermatológicos e texturas leves para realçar a sua melhor versão todos os dias.
                </p>
                <button
                  onClick={() => onNavigate('catalogo', 'cat:beleza-cosmeticos')}
                  className="mt-2 w-full py-3 bg-[#E6007A] hover:bg-[#D0006E] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <span>Explorar Linha de Beleza</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Related Products Grid (8 cols) */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
                <div>
                  <h4 className="text-lg font-black text-zinc-900">
                    Destaques de Skincare &amp; Maquiagem
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Produtos cadastrados na categoria beleza e maquiagem.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('catalogo', 'cat:beleza-cosmeticos')}
                  className="text-xs font-bold text-[#E6007A] hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>Ver todos ({beautyProducts.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {beautyProducts.slice(0, 3).map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={(id) => onNavigate('produto', id)}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* 7. SEÇÃO 7 — VITRINE EDITORIAL: CASA, DECORAÇÃO & ORGANIZAÇÃO */}
      {homeProducts.length > 0 && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/90 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Editorial Tall Banner (4 cols) */}
            <div className="lg:col-span-4 relative rounded-2xl overflow-hidden min-h-[360px] lg:min-h-full flex flex-col justify-end p-6 sm:p-8 text-white shadow-md">
              <img
                src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80"
                alt="Casa & Organização"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

              <div className="relative z-10 space-y-3">
                <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider rounded-md inline-block">
                  Espaços Inteligentes
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Organização &amp; Casa Elegante
                </h3>
                <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                  Acrílicos de alta resistência, difusores ultrassônicos aromáticos e espelhos LED touch para o seu espaço.
                </p>
                <button
                  onClick={() => onNavigate('catalogo', 'cat:organizacao-domestica')}
                  className="mt-2 w-full py-3 bg-[#E6007A] hover:bg-[#D0006E] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <span>Ver Linha de Organização</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Related Products Grid (8 cols) */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
                <div>
                  <h4 className="text-lg font-black text-zinc-900">
                    Organizadores &amp; Ambientes Harmoniosos
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Soluções funcionais para bancadas, armários e penteadeiras.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('catalogo', 'cat:organizacao-domestica')}
                  className="text-xs font-bold text-[#E6007A] hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>Ver todos ({homeProducts.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {homeProducts.slice(0, 3).map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={(id) => onNavigate('produto', id)}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* 8. SEÇÃO 8 — NOVIDADES & LANÇAMENTOS */}
      {newArrivals.length > 0 && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#E6007A]">
              Recém-Chegados ao Estoque
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1">
              Lançamentos &amp; Novidades
            </h2>
          </div>
          <button
            onClick={() => onNavigate('catalogo')}
            className="text-xs sm:text-sm font-bold text-[#E6007A] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(id) => onNavigate('produto', id)}
            />
          ))}
        </div>
      </section>
      )}

      {/* 9. SEÇÃO 9 — PRODUTOS RECOMENDADOS PARA VOCÊ */}
      {recommendedProducts.length > 0 && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-pink-50/60 p-6 sm:p-8 rounded-3xl border border-pink-100 shadow-xs">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#E6007A]">
                Seleção Personalizada
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1">
                Recomendados para Você
              </h2>
              <p className="text-xs text-zinc-600 mt-1">
                Produtos destacados pela equipe da loja.
              </p>
            </div>
            <button
              onClick={() => onNavigate('catalogo')}
              className="text-xs sm:text-sm font-bold text-[#E6007A] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Explorar catálogo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.slice(0, 4).map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={(id) => onNavigate('produto', id)}
                />
              )
            )}
          </div>
        </div>
      </section>
      )}

      {/* Avaliações publicadas e aprovadas pela administração */}
      {publishedReviews.length > 0 && (
        <section className="bg-zinc-100/70 py-16 border-y border-zinc-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-black uppercase tracking-widest text-[#E6007A]">Opiniões de clientes</span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1">Feedbacks de clientes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {publishedReviews.slice(0, 3).map((review) => (
                <article key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200/90 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 mb-3">
                      {Array.from({ length: review.rating }).map((_, index) => <Star key={index} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-xs text-zinc-700 leading-relaxed italic mb-4">{review.comment}</p>
                  </div>
                  <div className="pt-4 border-t border-zinc-100">
                    <h4 className="text-xs font-bold text-zinc-900">{review.authorName}</h4>
                    <span className="text-[10px] text-zinc-500">{review.productName}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 11. SEÇÃO 11 — FAIXA DE BENEFÍCIOS (MANDATÓRIO: FRETE GRÁTIS A PARTIR DE R$ 49,99) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-zinc-200/90 text-center flex flex-col items-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#E6007A] flex items-center justify-center mb-3">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-black text-sm text-zinc-900 mb-1">Frete Grátis Express</h3>
            <p className="text-xs text-zinc-600 font-medium">
              Em compras a partir de <strong>R$ 49,99</strong>.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-zinc-200/90 text-center flex flex-col items-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#E6007A] flex items-center justify-center mb-3">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-black text-sm text-zinc-900 mb-1">Opções de pagamento</h3>
            <p className="text-xs text-zinc-600 font-medium">
              Consulte as opções disponíveis no gateway de pagamento.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-zinc-200/90 text-center flex flex-col items-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#E6007A] flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-black text-sm text-zinc-900 mb-1">Pagamento por gateway</h3>
            <p className="text-xs text-zinc-600 font-medium">
              Você confere os dados e finaliza no provedor de pagamento configurado.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-zinc-200/90 text-center flex flex-col items-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#E6007A] flex items-center justify-center mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-black text-sm text-zinc-900 mb-1">Devolução sem Burocracia</h3>
            <p className="text-xs text-zinc-600 font-medium">
              Até 7 dias corridos para troca ou desistência com estorno garantido.
            </p>
          </div>
        </div>
      </section>

      {/* 12. SEÇÃO 12 — NEWSLETTER VIP CLUBE CASA & BELEZA COM CUPOM & LGPD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-[#D0006E] via-[#E6007A] to-[#FF2E93] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Clube VIP Casa &amp; Beleza Express</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Receba novidades e ofertas da loja
            </h2>

            <p className="text-xs sm:text-sm text-pink-100 max-w-lg mx-auto font-medium">
              Cadastre seu e-mail para receber novidades e informações sobre novos produtos.
            </p>



            {newsletterSubmitted ? (
              <div className="p-4 bg-white/20 backdrop-blur-xs rounded-2xl inline-flex items-center gap-2 text-sm font-bold text-white animate-in zoom-in-95">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <span>E-mail cadastrado com sucesso para receber novidades.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Seu melhor e-mail..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 bg-white text-zinc-900 rounded-xl px-4 py-3 text-sm placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-pink-300 shadow-inner"
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-zinc-950 hover:bg-black text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 shrink-0"
                  >
                    <span>Cadastrar e-mail</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-pink-100">
                  <input
                    type="checkbox"
                    id="consentCheck"
                    checked={newsletterConsent}
                    onChange={(e) => setNewsletterConsent(e.target.checked)}
                    className="rounded text-zinc-950 focus:ring-0"
                  />
                  <label htmlFor="consentCheck" className="cursor-pointer">
                    Concordo em receber ofertas e cupons conforme a Política de Privacidade (LGPD).
                  </label>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
