'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { Product, PaginatedResponse } from '@/lib/types';
import { useCartStore } from '@/store/cart';
import { useToast } from '@/hooks/useToast';
import { fmtPrice } from '@/lib/utils';
import { Icon, type IconName } from '@/components/ui/Icons';
import { Price } from '@/components/ui/Price';
import { ProductCard } from '@/components/menu/ProductCard';
import { PageTransition } from '@/components/layout/PageTransition';

const PERKS: [IconName, string, string][] = [
  ['truck', 'Delivery hoy', 'Antes de las 22h'],
  ['cleaver', 'Corte a pedido', 'Como te guste'],
  ['check', 'Calidad garantizada', 'O te devolvemos'],
];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);

  const { data: product, isLoading } = useSWR<Product>(
    id ? ['product', id] : null,
    () => api.getProduct(id),
    { revalidateOnFocus: false }
  );

  const { data: related } = useSWR<PaginatedResponse<Product>>(
    product ? ['related', product.category?._id] : null,
    () =>
      api.getProducts({
        page: 1,
        limit: 5,
        categoryId: product?.category?._id,
      })
  );

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
  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    if (outOfStock) return;
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: qty,
      imageUrl: product.imageUrl || '',
    });
    toast.success('Producto agregado al carrito');
  };

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
            <div className="mb-[22px] flex items-baseline gap-2.5">
              <Price value={product.price} unit={false} className="!text-[38px]" />
              <span className="text-[15px] text-tan-dim">por kg</span>
            </div>
            {product.description && (
              <p className="mb-6 text-[15px] leading-[1.65] text-tan">
                {product.description}
              </p>
            )}

            {/* Cantidad + agregar (desktop) */}
            <div className="mb-[18px] hidden gap-3.5 lg:flex">
              <div
                className="qty-ctl h-[54px] rounded-[12px] px-2"
                style={{ boxShadow: 'inset 0 0 0 1px var(--line)' }}
              >
                <button className="!h-9 !w-9" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                  −
                </button>
                <span className="tnum min-w-[40px] text-[17px]">{qty} kg</span>
                <button className="!h-9 !w-9" onClick={() => setQty((q) => q + 1)}>
                  +
                </button>
              </div>
              <button
                onClick={handleAdd}
                disabled={outOfStock}
                className="btn btn-gold h-[54px] flex-1 text-[14.5px]"
                style={outOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
              >
                <Icon.bag style={{ width: 18, height: 18 }} />{' '}
                {outOfStock ? 'Sin stock' : `Agregar · ${fmtPrice(product.price * qty)}`}
              </button>
            </div>

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
                    if (r.stock <= 0) return;
                    addItem({
                      productId: r._id,
                      name: r.name,
                      price: r.price,
                      quantity: 1,
                      imageUrl: r.imageUrl || '',
                    });
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
        <div
          className="qty-ctl h-[52px] rounded-[12px] px-1.5"
          style={{ boxShadow: 'inset 0 0 0 1px var(--line)' }}
        >
          <button className="!h-8 !w-8" onClick={() => setQty((q) => Math.max(1, q - 1))}>
            −
          </button>
          <span className="tnum min-w-[38px] text-[15px]">{qty} kg</span>
          <button className="!h-8 !w-8" onClick={() => setQty((q) => q + 1)}>
            +
          </button>
        </div>
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="btn btn-gold h-[52px] flex-1 text-[13.5px]"
          style={outOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
        >
          <Icon.bag style={{ width: 17, height: 17 }} />{' '}
          {outOfStock ? 'Sin stock' : `Agregar · ${fmtPrice(product.price * qty)}`}
        </button>
      </div>
    </PageTransition>
  );
}
