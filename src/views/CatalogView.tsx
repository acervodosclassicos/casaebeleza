import React, { useState, useMemo, useEffect } from 'react';
import {
  Filter,
  SlidersHorizontal,
  X,
  Search,
  Sparkles,
  Zap,
  ArrowUpDown,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { formatBRL } from '../utils/shop-logic';

interface CatalogViewProps {
  initialFilter?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ initialFilter, onNavigate }) => {
  const { products, categories } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('destaque');
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyDeals, setOnlyDeals] = useState<boolean>(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Parse initialFilter if provided (e.g. "cat:beleza-cosmeticos" or "busca:serum" or "ofertas:true")
  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.startsWith('cat:')) {
        setSelectedCategory(initialFilter.replace('cat:', ''));
      } else if (initialFilter.startsWith('busca:')) {
        setSearchQuery(initialFilter.replace('busca:', ''));
      } else if (initialFilter.includes('ofertas:true')) {
        setOnlyDeals(true);
      }
    }
  }, [initialFilter]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.active) return false;
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (onlyInStock && p.stock <= 0) return false;
      if (onlyDeals && !p.flashDeal && (!p.compareAtPrice || p.compareAtPrice <= p.price))
        return false;
      if (p.price > maxPrice) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesBrand && !matchesCategory && !matchesDesc) return false;
      }

      return true;
    });
  }, [products, selectedCategory, onlyInStock, onlyDeals, maxPrice, searchQuery]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'menor_preco':
        return list.sort((a, b) => a.price - b.price);
      case 'maior_preco':
        return list.sort((a, b) => b.price - a.price);
      case 'novidades':
        return list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      case 'popularidade':
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return list.sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
    }
  }, [filteredProducts, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setSortBy('destaque');
    setMaxPrice(300);
    setOnlyInStock(false);
    setOnlyDeals(false);
  };

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Catalog Title Banner */}
      <div className="mb-8 pb-6 border-b border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#E6007A] uppercase tracking-wider">
            Catálogo Oficial
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1">
            {activeCategoryObj ? activeCategoryObj.name : 'Todos os Produtos'}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Exibindo {sortedProducts.length} de {products.length} itens encontrados
          </p>
        </div>

        {/* Top Controls (Search & Sort) */}
        <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-xs font-bold text-zinc-800 transition-colors"
          >
            <Filter className="w-4 h-4 text-[#E6007A]" />
            <span>Filtros</span>
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-zinc-500 font-medium">Ordenar:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-800 focus:outline-hidden focus:border-[#E6007A] appearance-none pr-8 cursor-pointer"
              >
                <option value="destaque">Destaques da Loja</option>
                <option value="menor_preco">Menor Preço</option>
                <option value="maior_preco">Maior Preço</option>
                <option value="novidades">Lançamentos</option>
                <option value="popularidade">Mais Bem Avaliados</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#E6007A]" /> Filtros
              </h3>
              {(selectedCategory || searchQuery || onlyInStock || onlyDeals || maxPrice < 300) && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-[#E6007A] hover:underline font-semibold"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 mb-3">
                Categorias
              </h4>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    !selectedCategory
                      ? 'bg-pink-50 text-[#E6007A] font-bold'
                      : 'text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  <span>Todas</span>
                  <span className="text-[10px] text-zinc-400">{products.length}</span>
                </button>
                {categories.map((cat) => {
                  const count = products.filter((p) => p.category === cat.slug).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        selectedCategory === cat.slug
                          ? 'bg-pink-50 text-[#E6007A] font-bold'
                          : 'text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] text-zinc-400">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Slider */}
            <div className="pt-4 border-t border-zinc-100">
              <div className="flex justify-between text-xs font-semibold text-zinc-800 mb-2">
                <span>Preço Máximo:</span>
                <span className="text-[#E6007A] font-bold">{formatBRL(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="30"
                max="300"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#E6007A] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                <span>R$ 30</span>
                <span>R$ 300+</span>
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="pt-4 border-t border-zinc-100 space-y-3">
              <label className="flex items-center gap-2.5 text-xs text-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyDeals}
                  onChange={(e) => setOnlyDeals(e.target.checked)}
                  className="rounded text-[#E6007A] focus:ring-[#E6007A]"
                />
                <span className="font-medium flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" /> Apenas com Desconto
                </span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded text-[#E6007A] focus:ring-[#E6007A]"
                />
                <span className="font-medium">Apenas em Estoque</span>
              </label>
            </div>
          </div>
        </aside>

        {/* PRODUCTS GRID */}
        <main className="lg:col-span-3">
          {sortedProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200">
              <div className="w-16 h-16 rounded-full bg-pink-50 text-[#E6007A] flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 mb-1">
                Nenhum produto encontrado
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-6">
                Não encontramos itens correspondentes aos filtros aplicados. Tente ajustar os critérios de busca ou redefinir os filtros.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-[#E6007A] text-white rounded-xl text-xs font-bold hover:bg-[#D0006E] transition-all shadow-md"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={(id) => onNavigate('produto', id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MOBILE FILTER MODAL */}
      {isMobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full ml-auto shadow-2xl flex flex-col p-5 z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <h3 className="font-bold text-base text-zinc-900">Filtros do Catálogo</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-6 flex-1">
              <div>
                <h4 className="font-bold text-xs uppercase text-zinc-500 mb-3">Categorias</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                      !selectedCategory ? 'bg-pink-50 text-[#E6007A]' : 'text-zinc-700'
                    }`}
                  >
                    Todas as Categorias
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                        selectedCategory === c.slug ? 'bg-pink-50 text-[#E6007A]' : 'text-zinc-700'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase text-zinc-500 mb-2">Preço Máximo</h4>
                <div className="flex justify-between text-xs font-bold text-[#E6007A] mb-1">
                  <span>Até</span>
                  <span>{formatBRL(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="300"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#E6007A]"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs text-zinc-800">
                  <input
                    type="checkbox"
                    checked={onlyDeals}
                    onChange={(e) => setOnlyDeals(e.target.checked)}
                    className="rounded text-[#E6007A]"
                  />
                  <span>Apenas com Desconto</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-800">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="rounded text-[#E6007A]"
                  />
                  <span>Apenas em Estoque</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex gap-2">
              <button
                onClick={resetFilters}
                className="flex-1 py-2.5 bg-zinc-100 text-zinc-700 rounded-xl text-xs font-bold"
              >
                Limpar
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-[#E6007A] text-white rounded-xl text-xs font-bold shadow-md"
              >
                Ver ({sortedProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
