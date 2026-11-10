import React from 'react';
import { Heart, ShoppingBag, Zap, Sparkles, Truck, Star } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatBRL, calculateDiscountPercentage } from '../utils/shop-logic';

interface ProductCardProps {
  product: Product;
  onSelect: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart, isWishlisted, toggleWishlist } = useStore();

  const discountPercent = calculateDiscountPercentage(product.price, product.compareAtPrice);
  const wishlisted = isWishlisted(product.id);
  const isLowStock = product.stock > 0 && product.stock <= 15;
  const hasFreeShipping = product.freeShipping || product.price >= 49.99;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => onSelect(product.id)}
      className="group relative bg-white rounded-2xl border border-zinc-200/90 hover:border-[#E6007A]/50 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer transform hover:-translate-y-1.5"
    >
      {/* Thumbnail with Badges and Wishlist Button */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
        <img
          src={product.thumbnail || (product.images && product.images[0])}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 bg-[#E6007A] text-white text-[11px] font-black rounded-md tracking-wider shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.flashDeal && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-md shadow-sm">
              <Zap className="w-3 h-3 fill-current" /> Relâmpago
            </span>
          )}
          {product.isNew && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-md shadow-sm">
              <Sparkles className="w-3 h-3" /> Novo
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full shadow-md backdrop-blur-xs transition-transform active:scale-90 z-10 ${
            wishlisted
              ? 'bg-white text-[#E6007A]'
              : 'bg-white/90 text-zinc-500 hover:text-[#E6007A] hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current text-[#E6007A]' : ''}`} />
        </button>

        {/* Low Stock Warning */}
        {isLowStock && (
          <div className="absolute bottom-2 left-2 right-2 bg-zinc-950/85 backdrop-blur-xs text-white text-[10px] font-semibold py-1 px-2 rounded-md text-center z-10">
            Apenas {product.stock} em estoque!
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category & Rating */}
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px] truncate max-w-[120px]">
              {product.brand}
            </span>

          </div>

          {/* Title */}
          <h3 className="font-semibold text-xs sm:text-sm text-zinc-900 group-hover:text-[#E6007A] transition-colors line-clamp-2 leading-snug mb-2 min-h-[2.5rem]">
            {product.title}
          </h3>

          <div className="flex items-center gap-1.5 mb-2 text-[10px] sm:text-[11px]">
            <span className="inline-flex items-center gap-0.5 text-amber-500" aria-label="Produto em destaque na loja">
              {[0, 1, 2, 3, 4].map((star) => (
                <Star key={star} className="w-3 h-3 fill-current" />
              ))}
            </span>
            <span className="font-semibold text-zinc-600">Destaque da loja</span>
            <span className="text-zinc-300">•</span>
            <span className="text-zinc-500">{Math.max(0, product.salesCount || 0)} vendidos</span>
          </div>
        </div>

        {/* Pricing & Free Shipping & CTA */}
        <div className="pt-2 border-t border-zinc-100">
          {/* Free Shipping Badge */}
          {hasFreeShipping && (
            <div className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-md px-1.5 py-0.5 w-fit">
              <Truck className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Frete Grátis</span>
            </div>
          )}

          <div className="flex items-baseline gap-2 mb-0.5">
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-zinc-400 line-through">
                {formatBRL(product.compareAtPrice)}
              </span>
            )}
            <span className="text-lg sm:text-xl font-black text-[#E6007A]">
              {formatBRL(product.price)}
            </span>
          </div>


          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
              product.stock <= 0
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                : 'bg-zinc-900 text-white hover:bg-[#E6007A] active:scale-98 shadow-sm hover:shadow-pink-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{product.stock <= 0 ? 'Esgotado' : 'Adicionar à Sacola'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

