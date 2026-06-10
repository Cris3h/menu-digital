import type { Product } from './types';
import type { CartItem, CartKind } from '@/store/cart';

/** Tipo de venta efectivo del producto para el carrito. */
export function productKind(p: Product): CartKind {
  if ((p.sellBy ?? 'unit') !== 'weight') return 'unit';
  return p.unitWeightKg && p.unitWeightKg > 0 ? 'fixed' : 'loose';
}

export function isWeightProduct(p: Product): boolean {
  return (p.sellBy ?? 'unit') === 'weight';
}

/** Precio principal a mostrar en una card. unit: total · fixed: peso×$/kg · loose: $/kg. */
export function productDisplayPrice(p: Product): number {
  return productKind(p) === 'fixed'
    ? Math.round(p.price * (p.unitWeightKg ?? 0))
    : p.price;
}

/** Sufijo del precio: '/kg' solo para corte suelto. */
export function productPriceUnit(p: Product): string {
  return productKind(p) === 'loose' ? '/kg' : '';
}

export function looseStep(p: Product): number {
  return p.stepWeightKg && p.stepWeightKg > 0 ? p.stepWeightKg : 0.5;
}

export function looseMin(p: Product): number {
  return p.minWeightKg && p.minWeightKg > 0 ? p.minWeightKg : looseStep(p);
}

/** Construye el CartItem desde un producto + cantidad/peso elegidos. */
export function buildCartItem(
  p: Product,
  quantity = 1,
  weightKg?: number
): CartItem {
  const kind = productKind(p);
  const wk =
    kind === 'fixed'
      ? p.unitWeightKg
      : kind === 'loose'
        ? (weightKg ?? looseMin(p))
        : undefined;
  return {
    productId: p._id,
    name: p.name,
    price: p.price,
    imageUrl: p.imageUrl || '',
    quantity: kind === 'loose' ? 1 : quantity,
    kind,
    weightKg: wk,
  };
}
