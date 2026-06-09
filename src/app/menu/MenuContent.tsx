'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { Product, Category, PaginatedResponse } from '@/lib/types';
import { useCartStore } from '@/store/cart';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/Icons';
import { Price } from '@/components/ui/Price';
import { ProductCard } from '@/components/menu/ProductCard';
import { ProductCardSkeleton } from '@/components/menu/ProductCardSkeleton';
import { ProductModal } from '@/components/menu/ProductModal';
import { ScrollToTop } from '@/components/menu/ScrollToTop';

const ITEMS_PER_PAGE = 8;

export function MenuContent() {
  const searchParams = useSearchParams();
  const toast = useToast();
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get('search') ?? ''
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    () => searchParams.get('category') ?? null
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (selectedCategoryId) params.set('category', selectedCategoryId);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `/menu?${qs}` : '/menu');
  }, [debouncedSearch, selectedCategoryId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId]);

  const { data: productsData, error: productsError } = useSWR<
    PaginatedResponse<Product>
  >(['products', selectedCategoryId, currentPage], () =>
    api.getProducts({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      categoryId: selectedCategoryId ?? undefined,
    })
  );

  const { data: categoriesData } = useSWR<PaginatedResponse<Category>>(
    'categories',
    () => api.getCategories({ page: 1, limit: 20 })
  );

  const products = productsData?.data ?? [];
  const categories = categoriesData?.data ?? [];

  const filteredBySearch = debouncedSearch
    ? products.filter((p) =>
        p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : products;

  const isLoading = !productsData && !productsError;
  const hasProducts = filteredBySearch.length > 0;
  const totalPages = productsData?.totalPages ?? 1;

  const getCartQuantity = useCallback(
    (productId: string) =>
      items.find((i) => i.productId === productId)?.quantity ?? 0,
    [items]
  );

  const handleAddToCart = useCallback(
    (product: Product, quantity: number) => {
      if (product.stock <= 0) return;
      addItem({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
        imageUrl: product.imageUrl || '',
      });
    },
    [addItem]
  );

  const handleShowToast = useCallback(
    (message: string) => toast.success(message),
    [toast]
  );

  const handleCardClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleAddFromCard = useCallback(
    (e: React.MouseEvent, product: Product) => {
      e.stopPropagation();
      if (product.stock <= 0) return;
      handleAddToCart(product, 1);
      handleShowToast('Producto agregado al carrito');
    },
    [handleAddToCart, handleShowToast]
  );

  return (
    <>
      <section className="mx-auto max-w-[1440px] px-[18px] pb-8 pt-5 lg:px-8 lg:pt-[30px]">
        {/* Encabezado */}
        <div className="eyebrow" style={{ color: 'var(--gold)' }}>
          Nuestro catálogo
        </div>
        <h1 className="font-display my-[10px] text-[32px] text-cream lg:text-[44px]">
          Elegí tu corte
        </h1>

        {/* Búsqueda + filtros */}
        <div className="mb-5 flex flex-col gap-[14px] lg:mb-[26px] lg:flex-row lg:items-center">
          <div className="cat-search lg:max-w-[420px]">
            <Icon.search />
            <input
              placeholder="Buscar productos…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-tabs lg:ml-auto lg:gap-2.5">
            <button
              className={cn('ftab', !selectedCategoryId && 'active')}
              onClick={() => setSelectedCategoryId(null)}
              style={pillStyle(!selectedCategoryId)}
            >
              Todos
            </button>
            {categories.map((c) => {
              const active = selectedCategoryId === c._id;
              return (
                <button
                  key={c._id}
                  className={cn('ftab', active && 'active')}
                  onClick={() => setSelectedCategoryId(c._id)}
                  style={pillStyle(active)}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        {productsError && (
          <div className="rounded-xl px-6 py-4 text-center" style={cardStyle}>
            <p className="font-bold text-cream">No pudimos cargar los productos</p>
            <p className="mt-1 text-sm text-tan-dim">
              {productsError instanceof Error
                ? productsError.message
                : 'Error desconocido'}
            </p>
          </div>
        )}

        {!isLoading && !productsError && !hasProducts && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="mb-4 text-gold">
              <Icon.search style={{ width: 44, height: 44 }} />
            </span>
            <h3 className="text-xl font-bold text-cream">
              No encontramos productos
            </h3>
            <p className="mt-2 text-tan-dim">
              Probá con otros filtros o limpiá la búsqueda.
            </p>
          </div>
        )}

        {!productsError && (
          <>
            {/* Desktop: grid de pcards */}
            <div className="hidden grid-cols-2 gap-[18px] sm:grid lg:grid-cols-4">
              {isLoading
                ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))
                : filteredBySearch.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onClick={() => handleCardClick(product)}
                      onAddToCart={(e) => handleAddFromCard(e, product)}
                      cartQuantity={getCartQuantity(product._id)}
                    />
                  ))}
            </div>

            {/* Mobile: list-rows */}
            <div className="flex flex-col gap-3 sm:hidden">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))
                : filteredBySearch.map((product) => (
                    <div
                      key={product._id}
                      className="list-row"
                      onClick={() => handleCardClick(product)}
                    >
                      <div className="thumb">
                        {product.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.imageUrl} alt={product.name} />
                        )}
                      </div>
                      <div className="info">
                        <div className="rname">{product.name}</div>
                        <Price value={product.price} style={{ fontSize: 15 }} />
                      </div>
                      <button
                        className="add-btn"
                        onClick={(e) => handleAddFromCard(e, product)}
                        disabled={product.stock <= 0}
                        aria-label="Agregar al carrito"
                      >
                        <Icon.plus />
                      </button>
                    </div>
                  ))}
            </div>

            {/* Paginación */}
            {hasProducts && totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="icon-btn"
                  style={{ boxShadow: 'inset 0 0 0 1px var(--line)' }}
                  aria-label="Anterior"
                >
                  <Icon.chevLeft />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="ftab flex h-10 w-10 items-center justify-center rounded-[11px]"
                    style={pillStyle(currentPage === page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="icon-btn"
                  style={{ boxShadow: 'inset 0 0 0 1px var(--line)' }}
                  aria-label="Siguiente"
                >
                  <Icon.arrowRight />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
        onShowToast={handleShowToast}
        cartQuantity={selectedProduct ? getCartQuantity(selectedProduct._id) : 0}
      />

      <ScrollToTop />
    </>
  );
}

function pillStyle(active: boolean): React.CSSProperties {
  return {
    padding: '10px 18px',
    borderRadius: 11,
    background: active ? 'var(--gold)' : 'var(--panel)',
    color: active ? '#2a1c08' : 'var(--tan)',
    boxShadow: active ? 'none' : 'inset 0 0 0 1px var(--line)',
  };
}

const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg,var(--card-a),var(--card-b))',
  boxShadow: 'inset 0 0 0 1px var(--line)',
};
