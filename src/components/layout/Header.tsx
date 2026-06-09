'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { Logo } from '@/components/ui/Logo';
import { Icon } from '@/components/ui/Icons';
import { cn, getWhatsAppUrl } from '@/lib/utils';
import {
  WHATSAPP_NUMBER,
  WHATSAPP_MESSAGE,
  DELIVERY_ZONE,
  BUSINESS_HOURS,
} from '@/lib/constants';

const NAV = [
  { label: 'Inicio', href: '/' },
  { label: 'Catálogo', href: '/menu' },
  { label: 'Combos', href: '/combos' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Contacto', href: '/contacto' },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const itemCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  const whatsappUrl = getWhatsAppUrl(WHATSAPP_NUMBER, WHATSAPP_MESSAGE);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-md">
      {/* Barra de aviso */}
      <div className="announce">
        <span>
          Delivery en {DELIVERY_ZONE} · {BUSINESS_HOURS}
        </span>
        <Icon.truck style={{ width: 16, height: 16 }} />
      </div>

      {/* ---------- Desktop ---------- */}
      <div className="mx-auto hidden max-w-[1440px] items-center justify-between px-8 py-5 lg:flex">
        <Link href="/" aria-label="Inicio">
          <Logo />
        </Link>
        <nav className="flex items-center gap-[34px]" aria-label="Navegación principal">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn('nav-link', isActive(n.href) && 'active')}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/mis-pedidos" className="icon-btn" title="Mis pedidos">
            <Icon.clipboard />
          </Link>
          <Link href="/cart" className="icon-btn" aria-label={`Carrito (${itemCount})`}>
            <Icon.cart />
            {itemCount > 0 && (
              <span className="badge-count tnum">{itemCount > 99 ? '99+' : itemCount}</span>
            )}
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-gold ml-1.5"
            style={{ height: 42, padding: '0 18px', fontSize: 13 }}
          >
            <Icon.whatsapp style={{ width: 16, height: 16 }} /> Pedí ahora
          </a>
        </div>
      </div>

      {/* ---------- Mobile topbar ---------- */}
      <div className="m-topbar lg:hidden">
        <div className="flex w-14">
          <button
            className="icon-btn"
            aria-label="Menú"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Icon.menu />
          </button>
        </div>
        <Link href="/" className="flex flex-1 justify-center" aria-label="Inicio">
          <Logo className="scale-[0.82]" />
        </Link>
        <div className="flex w-14 justify-end">
          <Link href="/cart" className="icon-btn" aria-label={`Carrito (${itemCount})`}>
            <Icon.cart />
            {itemCount > 0 && (
              <span className="badge-count tnum">{itemCount > 99 ? '99+' : itemCount}</span>
            )}
          </Link>
        </div>
      </div>

      {/* Drawer mobile */}
      {menuOpen && (
        <nav
          className="flex flex-col gap-1 border-t border-[var(--line-soft)] bg-bg px-5 py-3 lg:hidden"
          aria-label="Navegación móvil"
        >
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setMenuOpen(false)}
              className={cn('nav-link py-3', isActive(n.href) && 'active')}
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/mis-pedidos"
            onClick={() => setMenuOpen(false)}
            className={cn('nav-link py-3', isActive('/mis-pedidos') && 'active')}
          >
            Mis pedidos
          </Link>
        </nav>
      )}
    </header>
  );
}
