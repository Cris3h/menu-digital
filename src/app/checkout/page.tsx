'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { api } from '@/lib/api';
import type { CheckoutFormData, DeliveryMethod } from '@/lib/types';
import { useToast } from '@/hooks/useToast';
import { Logo } from '@/components/ui/Logo';
import { Icon } from '@/components/ui/Icons';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { PageTransition } from '@/components/layout/PageTransition';

export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();
  const { items, getTotal } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');

  const total = getTotal();

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/cart');
    }
  }, [items.length, router]);

  const handleSubmit = useCallback(
    async (data: CheckoutFormData) => {
      if (items.length === 0) {
        toast.error('El carrito está vacío');
        return;
      }
      setLoading(true);
      try {
        const address = data.notes
          ? [data.customerAddress, `Notas: ${data.notes}`]
              .filter(Boolean)
              .join(' | ')
          : data.customerAddress;

        const order = await api.createOrder({
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerAddress: address || undefined,
          customerZipCode: data.customerZipCode || undefined,
          customerEmail: data.customerEmail,
          deliveryMethod: data.deliveryMethod,
          items: items.map((i) =>
            i.comboId
              ? { comboId: i.comboId, quantity: i.quantity }
              : i.pieceId
                ? { productId: i.productId, pieceId: i.pieceId, quantity: i.quantity }
                : { productId: i.productId, quantity: i.quantity, weightKg: i.weightKg }
          ),
        });

        const { initPoint } = await api.createPaymentPreference(order._id);
        // El carrito se limpia en /payment/success cuando el pago se confirma.
        window.location.href = initPoint;
      } catch (err) {
        setLoading(false);
        const message =
          err instanceof Error ? err.message : 'Ocurrió un error inesperado';
        if (message.includes('preference') || message.includes('payment')) {
          toast.error('Error al procesar el pago. Contactanos.');
        } else {
          toast.error(message);
        }
      }
    },
    [items, toast]
  );

  if (items.length === 0) return null;

  return (
    <PageTransition>
      {/* Header propio del checkout (reemplaza el global vía pantalla completa) */}
      <header
        className="flex items-center justify-between px-[20px] py-5 lg:px-14"
        style={{ boxShadow: 'inset 0 -1px 0 var(--line)' }}
      >
        <Link href="/cart" aria-label="Volver al carrito">
          <Logo className="scale-90 lg:scale-100" />
        </Link>
        <div
          className="hidden items-center gap-2 rounded-full px-4 py-2 sm:inline-flex"
          style={{
            background: 'rgba(216,162,62,.12)',
            boxShadow: 'inset 0 0 0 1px var(--line)',
          }}
        >
          <Icon.flame style={{ width: 16, height: 16, color: 'var(--gold)' }} />
          <span className="text-[12.5px] font-extrabold uppercase tracking-[0.1em] text-gold-lite">
            Compra en 1 paso
          </span>
        </div>
        <div className="flex items-center gap-2 text-[13px] font-semibold text-tan-dim">
          <Icon.lock style={{ width: 16, height: 16, color: 'var(--gold)' }} />
          <span className="hidden sm:inline">Pago seguro</span>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-9 px-[20px] py-9 lg:grid-cols-[1.5fr_1fr] lg:px-14 lg:pb-[52px]">
        <div>
          <h1 className="font-display mb-1.5 text-[26px] text-cream lg:text-[30px]">
            Finalizá tu pedido
          </h1>
          <p className="mb-6 text-[14.5px] text-tan-dim">
            Completá tus datos y confirmá. Todo en una sola pantalla.
          </p>
          <CheckoutForm
            onSubmit={handleSubmit}
            loading={loading}
            total={total}
            deliveryMethod={deliveryMethod}
            onDeliveryMethodChange={setDeliveryMethod}
          />
        </div>

        <div className="lg:sticky lg:top-6">
          <OrderSummary items={items} total={total} deliveryMethod={deliveryMethod} />
        </div>
      </section>
    </PageTransition>
  );
}
