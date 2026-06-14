'use client';

import { Icon } from '@/components/ui/Icons';
import { Price } from '@/components/ui/Price';
import type { Product } from '@/lib/types';
import { fmtPrice } from '@/lib/utils';
import { productKind, productDisplayPrice } from '@/lib/product';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onAddToCart: (e: React.MouseEvent) => void;
  cartQuantity?: number;
}

/**
 * Tarjeta de producto del catálogo/destacados (estilo `.pcard` del diseño):
 * foto con degradé, categoría, nombre, precio/kg y botón (+) abajo a la derecha.
 */
export function ProductCard({
  product,
  onClick,
  onAddToCart,
  cartQuantity = 0,
}: ProductCardProps) {
  const outOfStock = product.stock <= 0;
  const kind = productKind(product);
  // Por unidad/fijo no se puede superar el stock. (Peso a elección se topea en kg en el store.)
  const atMax = !outOfStock && kind !== 'loose' && cartQuantity >= product.stock;
  const blocked = outOfStock || atMax;

  return (
    <article className="pcard" onClick={onClick}>
      {cartQuantity > 0 && (
        <span className="tag-pedida">
          <Icon.check style={{ width: 12, height: 12 }} />
          Pedida{cartQuantity > 1 ? ` ·${cartQuantity}` : ''}
        </span>
      )}
      <div className="ph">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="flex h-full items-center justify-center text-tan-dim">
            Sin imagen
          </div>
        )}
      </div>
      <div className="body">
        {product.category?.name && (
          <div className="pcat eyebrow">{product.category.name}</div>
        )}
        <div className="pname">{product.name}</div>
        <Price value={productDisplayPrice(product)} unit={kind === 'loose'} />
        {kind === 'fixed' && product.unitWeightKg ? (
          <div className="mt-0.5 text-[11px] text-tan-dim">
            ≈ {product.unitWeightKg} kg · {fmtPrice(product.price)}/kg
          </div>
        ) : null}
        <button
          className="add-btn bottom-right"
          onClick={onAddToCart}
          disabled={blocked}
          aria-label="Agregar al carrito"
          title={
            outOfStock
              ? 'Sin stock'
              : atMax
                ? 'Alcanzaste el stock disponible'
                : 'Agregar al carrito'
          }
          style={blocked ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
        >
          <Icon.plus />
        </button>
      </div>
    </article>
  );
}
