'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { Product, ProductPiece, PaginatedResponse } from '@/lib/types';
import { useCartStore } from '@/store/cart';
import { useToast } from '@/hooks/useToast';
import { fmtPrice, cn } from '@/lib/utils';
import {
  buildCartItem,
  buildPieceCartItem,
  productKind,
  productMode,
  productDisplayPrice,
  availablePieces,
  piecePrice,
  looseStep,
  looseMin,
} from '@/lib/product';
import { Icon, type IconName } from '@/components/ui/Icons';
import { Price } from '@/components/ui/Price';
import { ProductCard } from '@/components/menu/ProductCard';
import { PageTransition } from '@/components/layout/PageTransition';

const PERKS: [IconName, string, string][] = [
  ['truck', 'Delivery hoy', 'Antes de las 22h'],
  ['cleaver', 'Corte a pedido', 'Como te guste'],
  ['check', 'Calidad garantizada', 'O te devolvemos'],
];

/** Control de cantidad (unidades) o peso (kg) según el tipo de venta. */
function AmountControl({
  loose,
  qty,
  setQty,
  weight,
  setWeight,
  step,
  min,
  max,
  big,
}: {
  loose: boolean;
  qty: number;
  setQty: React.Dispatch<React.SetStateAction<number>>;
  weight: number;
  setWeight: React.Dispatch<React.SetStateAction<number>>;
  step: number;
  min: number;
  /** Stock disponible: tope de unidades (no-loose) o kg (loose). */
  max: number;
  big?: boolean;
}) {
  const bs = big ? '!h-9 !w-9' : '!h-8 !w-8';
  if (loose) {
    return (
      <div
        className={cn('qty-ctl rounded-[12px] px-1.5', big ? 'h-[54px]' : 'h-[52px]')}
        style={{ boxShadow: 'inset 0 0 0 1px var(--line)' }}
      >
        <button
          className={bs}
          onClick={() =>
            setWeight((w) =>
              Math.max(min, +((Number.isFinite(w) ? w : min) - step).toFixed(2))
            )
          }
          aria-label="Menos peso"
        >
          −
        </button>
        <input
          type="number"
          step={step}
          min={min}
          // Permite vaciar el campo mientras editás (NaN = vacío). Al salir se
          // normaliza al mínimo si quedó vacío.
          value={Number.isFinite(weight) ? weight : ''}
          onChange={(e) =>
            setWeight(e.target.value === '' ? NaN : parseFloat(e.target.value))
          }
          onBlur={() =>
            setWeight((w) =>
              Number.isFinite(w) ? Math.max(min, +w.toFixed(2)) : min
            )
          }
          className="tnum w-[52px] bg-transparent text-center text-[15px] text-cream outline-none"
          aria-label="Peso en kg"
        />
        <span className="pr-1 text-[13px] text-tan-dim">kg</span>
        <button
          className={bs}
          onClick={() =>
            setWeight((w) =>
              Math.min(max, +((Number.isFinite(w) ? w : min) + step).toFixed(2))
            )
          }
          disabled={Number.isFinite(weight) && weight >= max}
          aria-label="Más peso"
        >
          +
        </button>
      </div>
    );
  }
  return (
    <div
      className={cn('qty-ctl rounded-[12px] px-2', big ? 'h-[54px]' : 'h-[52px]')}
      style={{ boxShadow: 'inset 0 0 0 1px var(--line)' }}
    >
      <button className={bs} onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Menos">
        −
      </button>
      <span className="tnum min-w-[36px] text-[15px]">{qty}</span>
      <button
        className={bs}
        onClick={() => setQty((q) => Math.min(max, q + 1))}
        disabled={qty >= max}
        aria-label="Más"
      >
        +
      </button>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [weight, setWeight] = useState(0.5);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);

  const { data: product, isLoading } = useSWR<Product>(
    id ? ['product', id] : null,
    () => api.getProduct(id),
    { revalidateOnFocus: false }
  );

  const { data: related } = useSWR<PaginatedResponse<Product>>(
    product ? ['related', product.category?._id] : null,
    () =>
      api.getProducts({ page: 1, limit: 5, categoryId: product?.category?._id })
  );

  // Cuando carga un producto de peso a elección, arranca en su peso mínimo.
  useEffect(() => {
    if (product && productKind(product) === 'loose') {
      setWeight(looseMin(product));
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="h-[460px] animate-pulse rounded-[18px]" style={{ background: 'var(--panel)' }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-tan">No encontramos este producto.</p>
        <Link href="/menu" className="btn btn-gold h-[48px] px-6 text-[14px]">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const relatedProducts = (related?.data ?? [])
    .filter((p) => p._id !== product._id)
    .slice(0, 4);

  const mode = productMode(product);
  const isPieces = mode === 'pieces';
  const kind = productKind(product);
  const isLoose = !isPieces && kind === 'loose';
  const perKg = isPieces || isLoose; // mostrar precio por kilo
  const step = looseStep(product);
  const min = looseMin(product);

  // Piezas individuales: la elegida (fallback a la primera disponible).
  const pieces = isPieces ? availablePieces(product) : [];
  const selectedPiece: ProductPiece | undefined =
    pieces.find((p) => p._id === selectedPieceId) ?? pieces[0];

  const outOfStock = isPieces ? pieces.length === 0 : product.stock <= 0;

  // Si el campo de kg está vacío (NaN mientras editás), usamos el mínimo, así
  // el total y el "agregar al carrito" nunca quedan en NaN.
  const effWeight = Number.isFinite(weight)
    ? Math.max(min, +weight.toFixed(2))
    : min;

  const previewTotal = isPieces
    ? selectedPiece
      ? piecePrice(product, selectedPiece)
      : 0
    : kind === 'unit'
      ? product.price * qty
      : kind === 'fixed'
        ? product.price * (product.unitWeightKg ?? 0) * qty
        : product.price * effWeight;

  const handleAdd = () => {
    if (isPieces) {
      if (!selectedPiece) return;
      addItem(buildPieceCartItem(product, selectedPiece));
      toast.success('Pieza agregada al carrito');
      return;
    }
    if (outOfStock) return;
    addItem(buildCartItem(product, qty, effWeight));
    toast.success('Producto agregado al carrito');
  };

  const addControl = (big: boolean) => (
    <>
      {!isPieces && (
        <AmountControl
          loose={isLoose}
          qty={qty}
          setQty={setQty}
          weight={weight}
          setWeight={setWeight}
          step={step}
          min={min}
          max={product.stock}
          big={big}
        />
      )}
      <button
        onClick={handleAdd}
        disabled={outOfStock}
        className={cn('btn btn-gold flex-1', big ? 'h-[54px] text-[14.5px]' : 'h-[52px] text-[13.5px]')}
        style={outOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
      >
        <Icon.bag style={{ width: 18, height: 18 }} />{' '}
        {outOfStock
          ? 'Sin stock'
          : isPieces
            ? `Agregar pieza · ${fmtPrice(previewTotal)}`
            : `Agregar · ${fmtPrice(previewTotal)}`}
      </button>
    </>
  );

  return (
    <PageTransition>
      <div className="mx-auto max-w-[1280px] px-[18px] pb-28 pt-6 lg:px-14 lg:pb-[52px] lg:pt-[26px]">
        {/* Breadcrumb */}
        <div className="mb-5 hidden items-center gap-2 text-[13px] text-tan-dim lg:flex">
          <Link href="/menu" className="hover:text-cream">Catálogo</Link>
          <Icon.arrowRight style={{ width: 13, height: 13 }} />
          {product.category?.name && (
            <>
              <span>{product.category.name}</span>
              <Icon.arrowRight style={{ width: 13, height: 13 }} />
            </>
          )}
          <span className="text-cream">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Imagen */}
          <div
            className="h-[300px] overflow-hidden rounded-[18px] lg:h-[460px]"
            style={{ boxShadow: 'var(--shadow)' }}
          >
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-tan-dim">Sin imagen</div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.category?.name && (
              <div className="eyebrow" style={{ color: 'var(--gold)' }}>
                {product.category.name}
              </div>
            )}
            <h1 className="font-display my-2.5 text-[30px] text-cream lg:text-[44px]">
              {product.name}
            </h1>
            <div className="mb-[18px] flex items-center gap-2.5">
              <span className="flex gap-0.5 text-gold">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Icon.star key={i} style={{ width: 16, height: 16 }} />
                ))}
              </span>
              <span className="text-[13.5px] text-tan-dim">4.9 · 128 reseñas</span>
            </div>
            <div className="mb-[22px] flex flex-wrap items-baseline gap-2.5">
              <Price
                value={productDisplayPrice(product)}
                unit={perKg}
                className="!text-[38px]"
              />
              {perKg && <span className="text-[15px] text-tan-dim">por kg</span>}
              {kind === 'fixed' && product.unitWeightKg && (
                <span className="text-[14px] text-tan-dim">
                  ≈ {product.unitWeightKg} kg · {fmtPrice(product.price)}/kg
                </span>
              )}
            </div>
            {product.description && (
              <p className="mb-6 text-[15px] leading-[1.65] text-tan">
                {product.description}
              </p>
            )}

            {/* Selector de pieza (modo piezas) — visible en mobile y desktop */}
            {isPieces && (
              <div className="mb-5">
                <div className="mb-2 text-[13px] font-bold text-cream">
                  Elegí tu pieza
                </div>
                {pieces.length === 0 ? (
                  <p className="text-[13px] text-tan-dim">
                    No hay piezas disponibles en este momento.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {pieces.map((p) => {
                      const sel = p._id === selectedPiece?._id;
                      return (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => p._id && setSelectedPieceId(p._id)}
                          className="flex items-center justify-between rounded-[12px] px-4 py-3 text-left transition-colors"
                          style={{
                            boxShadow: sel
                              ? 'inset 0 0 0 2px var(--gold)'
                              : 'inset 0 0 0 1px var(--line)',
                            background: sel ? 'rgba(216,162,62,.08)' : 'transparent',
                          }}
                        >
                          <span className="text-[15px] font-bold text-cream">
                            {p.weightKg} kg
                          </span>
                          <span className="price" style={{ fontSize: 16 }}>
                            {fmtPrice(piecePrice(product, p))}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Cantidad/peso + agregar (desktop) */}
            <div className="mb-2 hidden gap-3.5 lg:flex">{addControl(true)}</div>
            {isLoose && (
              <p className="mb-[18px] hidden text-[12px] text-tan-dim lg:block">
                Elegí los kilos (de a {step} kg). El total se calcula solo.
              </p>
            )}
            {isPieces && (
              <p className="mb-[18px] hidden text-[12px] text-tan-dim lg:block">
                Elegí una pieza. El precio sale según su peso.
              </p>
            )}

            {/* Perks */}
            <div
              className="mt-1.5 flex flex-col gap-3 pt-5 sm:flex-row sm:gap-[22px]"
              style={{ borderTop: '1px solid var(--line)' }}
            >
              {PERKS.map(([ic, t, d]) => {
                const I = Icon[ic];
                return (
                  <div key={t} className="flex items-center gap-[11px]">
                    <span className="inline-flex text-gold">
                      <I style={{ width: 24, height: 24 }} />
                    </span>
                    <div>
                      <div className="text-[13px] font-bold text-cream">{t}</div>
                      <div className="text-[12px] text-tan-dim">{d}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Relacionados */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 lg:mt-[52px]">
            <div className="sec-head">
              <h2 className="sec-title text-[22px] lg:text-[26px]">Te puede gustar</h2>
            </div>
            <div className="grid grid-cols-2 gap-[18px] lg:grid-cols-4">
              {relatedProducts.map((r) => (
                <ProductCard
                  key={r._id}
                  product={r}
                  onClick={() => router.push(`/producto/${r._id}`)}
                  onAddToCart={(e) => {
                    e.stopPropagation();
                    if (productMode(r) === 'pieces') {
                      router.push(`/producto/${r._id}`);
                      return;
                    }
                    if (r.stock <= 0) return;
                    addItem(buildCartItem(r));
                    toast.success('Producto agregado al carrito');
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Barra fija de agregar (mobile) */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3.5 px-5 py-3.5 lg:hidden"
        style={{ background: 'var(--bg)', boxShadow: 'inset 0 1px 0 var(--line)' }}
      >
        {addControl(false)}
      </div>
    </PageTransition>
  );
}
