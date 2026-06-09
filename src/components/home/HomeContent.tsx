'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { Product, PaginatedResponse } from '@/lib/types';
import { useCartStore } from '@/store/cart';
import { useToast } from '@/hooks/useToast';
import { getWhatsAppUrl } from '@/lib/utils';
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '@/lib/constants';
import { BRAND_CATEGORIES, BRAND_FEATURES } from '@/lib/brand';
import { Icon } from '@/components/ui/Icons';
import { Price } from '@/components/ui/Price';
import { ProductCard } from '@/components/menu/ProductCard';
import { PageTransition } from '@/components/layout/PageTransition';

const HERO_CORTE = '/assets/hero-corte.png';
const HERO_MILA = '/assets/hero-milanesas.png';

export function HomeContent() {
  const addItem = useCartStore((s) => s.addItem);
  const toast = useToast();
  const whatsappUrl = getWhatsAppUrl(WHATSAPP_NUMBER, WHATSAPP_MESSAGE);

  const { data } = useSWR<PaginatedResponse<Product>>('home-featured', () =>
    api.getProducts({ page: 1, limit: 3 })
  );
  const featured = data?.data ?? [];

  const handleAdd = (p: Product) => {
    if (p.stock <= 0) return;
    addItem({
      productId: p._id,
      name: p.name,
      price: p.price,
      quantity: 1,
      imageUrl: p.imageUrl || '',
    });
    toast.success('Producto agregado al carrito');
  };

  return (
    <PageTransition>
      {/* ============ HERO ============ */}
      <section className="hero relative overflow-hidden">
        {/* fotos del hero (solo desktop, fundidas con mix-blend) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_CORTE}
          alt="Corte de carne"
          className="pointer-events-none absolute bottom-[-36px] left-[-28px] z-[3] hidden w-[35%] lg:block"
          style={{ mixBlendMode: 'lighten', filter: 'drop-shadow(0 24px 44px rgba(0,0,0,.55))' }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_MILA}
          alt="Milanesas"
          className="pointer-events-none absolute bottom-[-12px] right-[-24px] z-[3] hidden w-[34%] lg:block"
          style={{ mixBlendMode: 'lighten', filter: 'drop-shadow(0 24px 44px rgba(0,0,0,.55))' }}
        />
        <div className="hero-grain z-[2]" />

        <div className="relative z-[5] mx-auto flex max-w-[760px] flex-col items-center gap-[18px] px-6 pb-12 pt-8 text-center lg:gap-[22px] lg:pb-[110px] lg:pt-[44px]">
          <div className="geo-pill">
            <Icon.mapPin /> Barrio Real · Junín (B)
          </div>
          <h1
            className="font-display text-cream text-[34px] leading-[0.96] lg:whitespace-nowrap lg:text-[66px] lg:leading-[0.92]"
            style={{ textShadow: '0 4px 24px rgba(0,0,0,.75)' }}
          >
            Calidad que se siente,
            <br />
            <span className="text-gold">confianza que vuelve</span>
          </h1>
          <p className="m-0 max-w-[280px] text-[13.5px] leading-[1.5] text-tan lg:max-w-[460px] lg:text-[17px]">
            Cortes seleccionados y milanesas elaboradas al día. Del mostrador a
            tu casa.
          </p>
          <div className="flex w-full flex-col gap-[11px] lg:mt-1 lg:w-auto lg:flex-row lg:gap-[14px]">
            <Link
              href="/menu"
              className="btn btn-gold h-[50px] text-[14px] lg:h-[54px] lg:px-7 lg:text-[15px]"
            >
              <Icon.bag style={{ width: 18, height: 18 }} /> Ver catálogo
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost h-[50px] text-[14px] lg:h-[54px] lg:px-7 lg:text-[15px]"
            >
              <Icon.whatsapp style={{ width: 18, height: 18 }} /> Pedí por WhatsApp
            </a>
          </div>

          {/* chips de categoría (solo mobile) */}
          <div className="m-cats mt-[10px] w-full lg:hidden">
            {BRAND_CATEGORIES.map((c) => {
              const I = Icon[c.icon];
              return (
                <Link key={c.id} href="/menu" className="m-cat">
                  <div className="ring">
                    <I />
                  </div>
                  <span className="cl">{c.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ Tiles de categoría (desktop, superpuestas) ============ */}
      <div className="relative z-10 mx-auto -mt-14 hidden max-w-[1440px] px-8 lg:block">
        <div className="grid grid-cols-4 gap-4">
          {BRAND_CATEGORIES.map((c) => {
            const I = Icon[c.icon];
            return (
              <Link key={c.id} href="/menu" className="cat-tile">
                <I />
                <span className="lbl">{c.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ============ Destacados ============ */}
      <section className="mx-auto max-w-[1440px] px-[22px] pb-2 pt-6 lg:px-8 lg:pb-2 lg:pt-12">
        <div className="sec-head">
          <h2 className="sec-title text-[22px] lg:text-[30px]">
            Destacados de la semana
          </h2>
          <Link href="/menu" className="sec-link hidden lg:inline-flex">
            Ver todo <Icon.arrowRight style={{ width: 15, height: 15 }} />
          </Link>
        </div>

        {/* desktop: grid de pcards */}
        <div className="hidden grid-cols-3 gap-[18px] lg:grid">
          {featured.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              onClick={() => {}}
              onAddToCart={(e) => {
                e.stopPropagation();
                handleAdd(p);
              }}
            />
          ))}
        </div>

        {/* mobile: tarjetas horizontales */}
        <div className="flex flex-col gap-3 lg:hidden">
          {featured.map((p) => (
            <div key={p._id} className="m-feat-card">
              <div className="thumb">
                {p.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.name} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                {p.category?.name && (
                  <div className="eyebrow text-[10px]">{p.category.name}</div>
                )}
                <div className="my-[3px] text-[15px] font-bold text-cream">
                  {p.name}
                </div>
                <Price value={p.price} style={{ fontSize: 18 }} />
              </div>
              <button
                className="add-btn"
                onClick={() => handleAdd(p)}
                disabled={p.stock <= 0}
                aria-label="Agregar al carrito"
              >
                <Icon.plus />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ============ Features ============ */}
      <section className="mx-auto max-w-[1440px] px-[22px] pb-12 pt-7 lg:px-8 lg:pb-[52px]">
        {/* desktop: barra de 4 */}
        <div className="features hidden lg:grid">
          {BRAND_FEATURES.map((f) => {
            const I = Icon[f.icon];
            return (
              <div key={f.title} className="feat">
                <I />
                <div>
                  <div className="ft">{f.title}</div>
                  <div className="fd">{f.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* mobile: grilla 2x2 */}
        <div className="grid grid-cols-2 gap-2.5 lg:hidden">
          {BRAND_FEATURES.map((f) => {
            const I = Icon[f.icon];
            return (
              <div
                key={f.title}
                className="flex flex-col gap-2 rounded-2xl p-4"
                style={{
                  background: 'linear-gradient(180deg,var(--card-a),var(--card-b))',
                  boxShadow: 'inset 0 0 0 1px var(--line)',
                }}
              >
                <span className="inline-flex text-gold">
                  <I style={{ width: 26, height: 26 }} />
                </span>
                <div className="ft">{f.title}</div>
                <div className="fd">{f.desc}</div>
              </div>
            );
          })}
        </div>
      </section>
    </PageTransition>
  );
}
