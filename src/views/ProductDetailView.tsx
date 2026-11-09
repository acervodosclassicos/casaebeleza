import React, { useState, useEffect } from 'react';
import {
  Star,
  ShoppingBag,
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  Copy,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import {
  formatBRL,
  calculateDiscountPercentage,
  formatCEP,
  calculateShipping,
} from '../utils/shop-logic';
import { Product, Review } from '../types';

interface ProductDetailViewProps {
  productId: string;
  onNavigate: (view: string, param?: string) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  productId,
  onNavigate,
}) => {
  const {
    products,
    addToCart,
    isWishlisted,
    toggleWishlist,
    getProductReviews,
    submitProductReview,
    showToast,
  } = useStore();

  const product = products.find((p) => p.id === productId) || products[0];

  const [selectedImage, setSelectedImage] = useState<string>(
    product?.thumbnail || (product?.images && product?.images[0]) || ''
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<string>(
    product?.variations?.[0]?.options[0] || ''
  );
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  // Shipping simulation
  const [cepInput, setCepInput] = useState('');
  const [shippingResult, setShippingResult] = useState<{
    cost: number;
    days: number;
    isFree: boolean;
    service: string;
  } | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.thumbnail || (product.images && product.images[0]) || '');
      getProductReviews(product.id).then(setReviews);
    }
  }, [product?.id]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-zinc-900">Produto não encontrado</h2>
        <button
          onClick={() => onNavigate('catalogo')}
          className="mt-4 px-6 py-2.5 bg-[#E6007A] text-white rounded-xl text-xs font-bold"
        >
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  const discountPercent = calculateDiscountPercentage(product.price, product.compareAtPrice);
  const averageRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  const wishlisted = isWishlisted(product.id);

  const images = product.images && product.images.length > 0 ? product.images : [product.thumbnail];
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  const handleSimulateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cepInput.replace(/\D/g, '');
    if (clean.length !== 8) {
      showToast('Informe um CEP com 8 dígitos.', 'error');
      return;
    }
    const result = calculateShipping(clean, product.price * quantity);
    setShippingResult(result);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariation);
    onNavigate('checkout');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Olha que incrível esse produto na Casa & Beleza Express: ${product.title} por apenas ${formatBRL(product.price)}! ${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link do produto copiado com sucesso!', 'success');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) {
      showToast('Preencha seu nome e comentário.', 'error');
      return;
    }
    setIsSubmittingReview(true);
    try {
      await submitProductReview({
        productId: product.id,
        productName: product.title,
        authorName: newReviewAuthor.trim(),
        rating: newReviewRating,
        comment: newReviewComment.trim(),
        verifiedPurchase: true,
      });
      setNewReviewAuthor('');
      setNewReviewComment('');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-500 flex items-center gap-2">
        <button onClick={() => onNavigate('home')} className="hover:text-zinc-900">
          Início
        </button>
        <span>/</span>
        <button
          onClick={() => onNavigate('catalogo', `cat:${product.category}`)}
          className="hover:text-zinc-900 capitalize"
        >
          {product.category.replace(/-/g, ' ')}
        </button>
        <span>/</span>
        <span className="text-zinc-800 font-medium truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200/80 shadow-md">
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-[#E6007A] text-white text-xs font-black rounded-lg tracking-wider shadow-md">
                -{discountPercent}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/90 text-zinc-600 hover:text-[#E6007A] shadow-lg backdrop-blur-xs transition-transform active:scale-90"
              aria-label="Favoritar"
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-[#E6007A] text-[#E6007A]' : ''}`} />
            </button>
          </div>

          {/* Thumbnails row */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img ? 'border-[#E6007A] shadow-md' : 'border-zinc-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
              <span className="font-bold text-[#E6007A] uppercase tracking-wider text-xs">
                {product.brand}
              </span>
              <span className="text-zinc-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight leading-snug">
              {product.title}
            </h1>

            {/* Ratings & Stock Badge */}
            <div className="flex items-center gap-4 mt-3">
              {reviews.length > 0 ? (
                <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-current' : 'text-zinc-200'}`} />)}
                  </div>
                  <span>{averageRating.toFixed(1)}</span>
                  <span className="text-zinc-400 text-xs font-normal">({reviews.length} avaliações)</span>
                </div>
              ) : (
                <span className="text-zinc-400 text-xs">Ainda sem avaliações</span>
              )}

              <span className="text-zinc-300">|</span>

              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" /> Em Estoque ({product.stock} disponíveis)
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 bg-pink-50/60 rounded-2xl border border-pink-100 space-y-1.5">
            <div className="flex items-baseline gap-3">
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-sm text-zinc-400 line-through">
                  {formatBRL(product.compareAtPrice)}
                </span>
              )}
              <span className="text-3xl font-black text-[#E6007A]">
                {formatBRL(product.price)}
              </span>
            </div>
            {product.price >= 49.99 && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>FRETE GRÁTIS neste produto (política acima de R$ 49,99)</span>
              </div>
            )}
            <p className="text-[11px] text-emerald-700 font-semibold pt-0.5">
              🔥 5% de desconto extra via PIX no checkout!
            </p>
          </div>

          {/* Variations if available */}
          {product.variations && product.variations.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                Escolha a Opção:
              </h4>
              <div className="flex flex-wrap gap-2">
                {product.variations[0].options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedVariation(opt)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedVariation === opt
                        ? 'border-[#E6007A] bg-[#E6007A] text-white shadow-xs'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector & CTAs */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 text-zinc-600 hover:bg-zinc-100 transition-colors"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-zinc-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-3 text-zinc-600 hover:bg-zinc-100 transition-colors"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => addToCart(product, quantity, selectedVariation)}
                disabled={product.stock <= 0}
                className="flex-1 py-3.5 px-6 bg-zinc-900 hover:bg-black text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                <ShoppingBag className="w-4 h-4 text-[#FF4D9E]" />
                <span>Adicionar à Sacola</span>
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="w-full py-4 px-6 bg-[#E6007A] hover:bg-[#D0006E] text-white rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-pink-200 transition-all active:scale-98"
            >
              <span>Comprar Agora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Shipping Simulator */}
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#E6007A]" />
                <span>Calcular Frete e Prazo de Entrega</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Grátis a partir de R$ 49,99
              </span>
            </div>
            <form onSubmit={handleSimulateShipping} className="flex gap-2">
              <input
                type="text"
                placeholder="00000-000"
                maxLength={9}
                value={cepInput}
                onChange={(e) => setCepInput(formatCEP(e.target.value))}
                className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-hidden focus:border-[#E6007A]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-zinc-900 hover:bg-[#E6007A] text-white rounded-xl text-xs font-bold transition-colors"
              >
                Calcular
              </button>
            </form>

            {shippingResult && (
              <div className="p-3 bg-white rounded-xl border border-zinc-100 text-xs space-y-1">
                <div className="flex justify-between font-bold text-zinc-900">
                  <span>{shippingResult.service}:</span>
                  <span className={shippingResult.isFree ? 'text-emerald-600' : 'text-[#E6007A]'}>
                    {shippingResult.isFree ? 'Grátis' : formatBRL(shippingResult.cost)}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Previsão de entrega: até {shippingResult.days} dias úteis após postagem.
                </p>
              </div>
            )}
          </div>

          {/* Social Share & Trust */}
          <div className="pt-2 flex items-center justify-between border-t border-zinc-100 text-xs text-zinc-500">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-zinc-400">Compartilhar:</span>
              <button
                onClick={handleShareWhatsApp}
                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopyLink}
                className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
                title="Copiar Link"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Garantia de 7 dias</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Information Tabs */}
      <div className="border-t border-zinc-200 pt-10">
        <div className="flex border-b border-zinc-200 gap-8">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'desc'
                ? 'border-[#E6007A] text-[#E6007A]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Descrição Completa
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'specs'
                ? 'border-[#E6007A] text-[#E6007A]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Especificações Técnicas
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-[#E6007A] text-[#E6007A]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <span>Avaliações</span>
            <span className="px-2 py-0.5 bg-pink-100 text-[#E6007A] rounded-full text-xs">
              {reviews.length || 0}
            </span>
          </button>
        </div>

        <div className="py-6">
          {activeTab === 'desc' && (
            <div className="max-w-3xl space-y-4 text-zinc-700 leading-relaxed text-sm">
              <p>{product.description}</p>
              {product.shortDescription && (
                <div className="p-4 bg-pink-50/50 rounded-xl border border-pink-100 text-xs text-zinc-700">
                  <strong>Destaque do Produto:</strong> {product.shortDescription}
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-2xl">
              <table className="w-full text-xs text-left border-collapse">
                <tbody>
                  <tr className="border-b border-zinc-100">
                    <th className="py-2.5 font-bold text-zinc-900 w-1/3">Marca</th>
                    <td className="py-2.5 text-zinc-600">{product.brand}</td>
                  </tr>
                  <tr className="border-b border-zinc-100">
                    <th className="py-2.5 font-bold text-zinc-900">Categoria</th>
                    <td className="py-2.5 text-zinc-600 capitalize">
                      {product.category.replace(/-/g, ' ')}
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-100">
                    <th className="py-2.5 font-bold text-zinc-900">Código SKU</th>
                    <td className="py-2.5 text-zinc-600">{product.sku}</td>
                  </tr>
                  {product.barcode && (
                    <tr className="border-b border-zinc-100">
                      <th className="py-2.5 font-bold text-zinc-900">Código de Barras (EAN)</th>
                      <td className="py-2.5 text-zinc-600">{product.barcode}</td>
                    </tr>
                  )}
                  {product.weight && (
                    <tr className="border-b border-zinc-100">
                      <th className="py-2.5 font-bold text-zinc-900">Peso Aproximado</th>
                      <td className="py-2.5 text-zinc-600">{product.weight} kg</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8 max-w-3xl">
              {/* Form to submit review */}
              <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
                <h4 className="font-bold text-sm text-zinc-900 mb-3">
                  Avaliar este Produto
                </h4>
                <form onSubmit={handleSubmitReview} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Seu nome completo"
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      className="bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800"
                      required
                    />
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-zinc-600 font-medium">Nota:</span>
                      <select
                        value={newReviewRating}
                        onChange={(e) => setNewReviewRating(Number(e.target.value))}
                        className="bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-amber-600"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (5 estrelas)</option>
                        <option value="4">⭐⭐⭐⭐ (4 estrelas)</option>
                        <option value="3">⭐⭐⭐ (3 estrelas)</option>
                        <option value="2">⭐⭐ (2 estrelas)</option>
                        <option value="1">⭐ (1 estrela)</option>
                      </select>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Conte como foi sua experiência com este produto..."
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-5 py-2.5 bg-[#E6007A] text-white rounded-xl text-xs font-bold hover:bg-[#D0006E] transition-all shadow-xs"
                  >
                    {isSubmittingReview ? 'Enviando...' : 'Enviar Avaliação'}
                  </button>
                </form>
              </div>

              {/* Existing Reviews */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">
                    Nenhuma avaliação aprovada ainda. Seja a primeira a avaliar!
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-white border border-zinc-100 rounded-xl shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-zinc-900">{rev.authorName}</span>
                          {rev.verifiedPurchase && (
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Compra Verificada
                            </span>
                          )}
                        </div>
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'fill-current' : 'text-zinc-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed">{rev.comment}</p>
                      {rev.adminReply && (
                        <div className="mt-2 p-2.5 bg-pink-50 border-l-2 border-[#E6007A] rounded text-[11px] text-zinc-700">
                          <strong>Resposta da Loja:</strong> {rev.adminReply}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-zinc-200 pt-12">
          <h3 className="text-xl font-extrabold text-zinc-900 mb-6">
            Produtos Relacionados
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onSelect={(id) => onNavigate('produto', id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
