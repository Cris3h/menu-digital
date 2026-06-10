'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { ScrollToTop } from '@/components/menu/ScrollToTop';
import { buildCartItem, productDisplayPrice, productKind } from '@/lib/product';

const ITEMS_PER_PAGE = 8;

export function MenuContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
  // Filtro por NOMBRE de categoría (tiles del inicio: /menu?cat=Cortes).
  const catNameParam = searchParams.get('cat');
  const [catNotFound, setCatNotFound] = useState(false);

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

  const { data: categoriesData } = useSWR<PaginatedResponse<Category>>(
    'categories',
    () => api.getCategories({ page: 1, limit: 20 })
  );
  const categories = categoriesData?.data ?? [];

  // Resolver ?cat=<nombre> a una categoría real (tiles del inicio).
  // Si la categoría no existe, marcamos catNotFound → mostramos vacío
  // (sin mandar un id inválido al backend, que daría un CastError 500).
  useEffect(() => {
    if (!catNameParam || !categoriesData) return;
    const match = categories.find(
      (c) => c.name.toLowerCase() === catNameParam.toLowerCase()
    );
    if (match) {
      setSelectedCategoryId(match._id);
      setCatNotFound(false);
    } else {
      setCatNotFound(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catNameParam, categoriesData]);

  // Mientras esperamos resolver el nombre de categoría no pedimos productos
  // (evita un flash con todo el catálogo antes de aplicar el filtro).
  const productsKey =
    catNameParam && !categoriesData
      ? null
      : ['products', selectedCategoryId, currentPage, catNotFound];

  const { data: productsData, error: productsError } = useSWR<
    PaginatedResponse<Product>
  >(productsKey, () =>
    catNotFound
      ? { data: [], page: 1, limit: ITEMS_PER_PAGE, total: 0, totalPages: 0 }
      : api.getProducts({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          categoryId: selectedCategoryId ?? undefined,
        })
  );

  const products = productsData?.data ?? [];

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
      addItem(buildCartItem(product, quantity));
    },
    [addItem]
  );

  const handleShowToast = useCallback(
    (message: string) => toast.success(message),
    [toast]
  );

  const handleCardClick = useCallback(
    (product: Product) => router.push(`/producto/${product._id}`),
    [router]
  );

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
              className={cn('ftab', !selectedCategoryId && !catNotFound && 'active')}
              onClick={() => {
                setSelectedCategoryId(null);
                setCatNotFound(false);
              }}
              style={pillStyle(!selectedCategoryId && !catNotFound)}
            >
              Todos
            </button>
            {categories.map((c) => {
              const active = !catNotFound && selectedCategoryId === c._id;
              return (
                <button
                  key={c._id}
                  className={cn('ftab', active && 'active')}
                  onClick={() => {
                    setSelectedCategoryId(c._id);
                    setCatNotFound(false);
                  }}
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
            {(searchQuery || selectedCategoryId || catNotFound) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategoryId(null);
                  setCatNotFound(false);
                }}
                className="btn btn-gold mt-5 h-[44px] px-6 text-[14px]"
              >
                Limpiar filtros
              </button>
            )}
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
                        <Price
                          value={productDisplayPrice(product)}
                          unit={productKind(product) === 'loose'}
                          style={{ fontSize: 15 }}
                        />
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

      <ScrollToTop />
    </>
  );
}

function pillStyle(active: boolean): React.CSSProperties {
  return {
    flexShrink: 0, // no se comprimen: con muchas categorías la fila scrollea de costado
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
