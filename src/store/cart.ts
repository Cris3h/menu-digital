import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Cómo se cobra la línea del carrito:
 * - 'unit'  → precio por unidad. total = price * quantity
 * - 'fixed' → por peso, peso fijo por unidad (costillar). total = price(/kg) * weightKg * quantity
 * - 'loose' → por peso, peso a elección del cliente. total = price(/kg) * weightKg  (quantity = 1)
 */
export type CartKind = 'unit' | 'fixed' | 'loose';

export interface CartItem {
  productId: string;
  name: string;
  /** Por unidad (unit) o por kg (fixed/loose). */
  price: number;
  quantity: number;
  imageUrl: string;
  /** Por defecto 'unit' (compatibilidad). */
  kind?: CartKind;
  /** fixed: peso por unidad. loose: kilos elegidos. */
  weightKg?: number;
}

/** Subtotal de una línea según su tipo de venta. */
export function cartLineTotal(i: CartItem): number {
  const kind = i.kind ?? 'unit';
  if (kind === 'loose') return Math.round(i.price * (i.weightKg ?? 0));
  if (kind === 'fixed') return Math.round(i.price * (i.weightKg ?? 0) * i.quantity);
  return Math.round(i.price * i.quantity);
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateWeight: (productId: string, weightKg: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const exists = state.items.find((i) => i.productId === item.productId);
          if (exists) {
            return {
              items: state.items.map((i) => {
                if (i.productId !== item.productId) return i;
                // Peso a elección: se suman los kilos. Resto: se suma la cantidad.
                if ((item.kind ?? 'unit') === 'loose') {
                  return { ...i, ...item, weightKg: (i.weightKg ?? 0) + (item.weightKg ?? 0) };
                }
                return { ...i, ...item, quantity: i.quantity + item.quantity };
              }),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        })),

      updateWeight: (productId, weightKg) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, weightKg: Math.max(0, weightKg) }
              : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      getTotal: () => get().items.reduce((sum, i) => sum + cartLineTotal(i), 0),
    }),
    { name: 'miinuta-cart' }
  )
);
