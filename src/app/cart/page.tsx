'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { fmtPrice } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { Icon } from '@/components/ui/Icons';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PageTransition } from '@/components/layout/PageTransition';

export default function CartPage() {
  const router = useRouter();
  const toast = useToast();
  const { items, updateQuantity, removeItem, getTotal, clearCart } =
    useCartStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const total = getTotal();

  if (items.length === 0) {
    return (
      <PageTransition>
        <EmptyCart />
      </PageTransition>
    );
  }

  const dec = (id: string, qty: number) =>
    qty <= 1 ? removeItem(id) : updateQuantity(id, qty - 1);

  return (
    <PageTransition>
      <div className="mx-auto max-w-[1100px] px-[20px] pb-12 pt-6 lg:px-8 lg:pt-10">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="font-display text-[28px] text-cream lg:text-[40px]">
            Tu carrito
          </h1>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-tan-dim transition-colors hover:text-gold"
          >
            <Icon.trash style={{ width: 16, height: 16 }} /> Vaciar
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          {/* Ítems */}
          <div>
            {items.map((it) => (
              <div key={it.productId} className="cart-item">
                <div className="thumb">
                  {it.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.imageUrl} alt={it.name} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-bold text-cream">{it.name}</div>
                  <div className="price mt-0.5" style={{ fontSize: 14 }}>
                    {fmtPrice(it.price)}
                    <span className="unit">/kg</span>
                  </div>
                </div>
                <div className="qty-ctl">
                  <button onClick={() => dec(it.productId, it.quantity)} aria-label="Quitar uno">
                    −
                  </button>
                  <span className="tnum">{it.quantity}</span>
                  <button
                    onClick={() => updateQuantity(it.productId, it.quantity + 1)}
                    aria-label="Agregar uno"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen */}
          <div
            className="rounded-[18px] p-6 lg:sticky lg:top-24"
            style={{
              background: 'linear-gradient(180deg,var(--panel),var(--card-b))',
              boxShadow: 'inset 0 0 0 1px var(--line)',
            }}
          >
            <h3 className="font-display mb-4 text-[22px] text-cream">Resumen</h3>
            <div className="mb-2 flex justify-between text-[13.5px] text-tan">
              <span>Subtotal</span>
              <span className="tnum">{fmtPrice(total)}</span>
            </div>
            <div className="mb-3.5 flex justify-between text-[13.5px] text-tan">
              <span>Envío</span>
              <span className="text-gold">A confirmar</span>
            </div>
            <div
              className="mb-4 flex items-center justify-between pt-3.5"
              style={{ boxShadow: 'inset 0 1px 0 var(--line)' }}
            >
              <span className="eyebrow">Total estimado</span>
              <span className="price" style={{ fontSize: 24 }}>
                {fmtPrice(total)}
              </span>
            </div>
            <button
              onClick={() => router.push('/checkout')}
              className="btn btn-gold h-[52px] w-full text-[14px]"
            >
              Continuar al checkout <Icon.arrowRight style={{ width: 17, height: 17 }} />
            </button>
            <p className="mt-2.5 text-center text-[11.5px] text-tan-dim">
              El precio final se confirma según el peso de cada corte.
            </p>
            <Link
              href="/menu"
              className="mt-3 block text-center text-[13px] font-semibold text-gold transition-colors hover:text-gold-lite"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          clearCart();
          toast.info('Carrito vaciado');
        }}
        title="Vaciar carrito"
        message="¿Estás seguro de que querés vaciar el carrito?"
        confirmLabel="Vaciar"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </PageTransition>
  );
}
