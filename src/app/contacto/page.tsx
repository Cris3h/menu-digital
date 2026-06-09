import type { Metadata } from 'next';
import { CONTACT_INFO, unsplash } from '@/lib/brand';
import { Icon, type IconName } from '@/components/ui/Icons';
import { getWhatsAppUrl } from '@/lib/utils';
import {
  WHATSAPP_NUMBER,
  WHATSAPP_MESSAGE,
  CONTACT_PHONE,
} from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contacto · MIINUTA. CARNES',
  description: 'Dónde estamos y cómo hacer tu pedido en Junín (B).',
};

const MAP = unsplash('photo-1524661135-423995f22d0b', 800);

const ROWS: [IconName, string, string][] = [
  ['mapPin', 'Dirección', CONTACT_INFO.address],
  ['phone', 'Teléfono / WhatsApp', CONTACT_PHONE],
  ['clock', 'Horario', CONTACT_INFO.hours],
  ['mail', 'Email', CONTACT_INFO.email],
  ['instagram', 'Instagram', CONTACT_INFO.instagram],
];

export default function ContactoPage() {
  const whatsappUrl = getWhatsAppUrl(WHATSAPP_NUMBER, WHATSAPP_MESSAGE);

  return (
    <div className="mx-auto max-w-[1440px] px-[18px] pb-12 pt-6 lg:px-14 lg:pb-[52px] lg:pt-11">
      <div className="eyebrow" style={{ color: 'var(--gold)' }}>
        Estamos cerca
      </div>
      <h1 className="font-display my-3 mb-7 text-[30px] text-cream lg:text-[48px]">
        Contacto y pedidos
      </h1>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_1.15fr]">
        {/* Filas de contacto */}
        <div className="flex flex-col gap-3.5">
          {ROWS.map(([ic, t, v]) => {
            const I = Icon[ic];
            return (
              <div
                key={t}
                className="flex items-center gap-4 rounded-[14px] p-[18px_22px]"
                style={{
                  background: 'linear-gradient(180deg,var(--card-a),var(--card-b))',
                  boxShadow: 'inset 0 0 0 1px var(--line)',
                }}
              >
                <span
                  className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[12px] text-gold"
                  style={{ background: 'rgba(216,162,62,.12)' }}
                >
                  <I style={{ width: 22, height: 22 }} />
                </span>
                <div>
                  <div className="eyebrow">{t}</div>
                  <div className="mt-[3px] text-[16px] font-bold text-cream">{v}</div>
                </div>
              </div>
            );
          })}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-gold mt-1 h-[54px] text-[15px]"
          >
            <Icon.whatsapp style={{ width: 18, height: 18 }} /> Escribinos por
            WhatsApp
          </a>
        </div>

        {/* Mapa */}
        <div
          className="relative min-h-[300px] overflow-hidden rounded-[18px] lg:min-h-[480px]"
          style={{ boxShadow: 'var(--shadow)', background: '#1a2620' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={MAP}
            alt="Mapa"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ opacity: 0.55 }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg,rgba(12,8,5,.2),rgba(12,8,5,.75))' }}
          />
          <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 text-gold">
            <Icon.mapPin style={{ width: 52, height: 52 }} />
          </div>
          <div
            className="absolute inset-x-6 bottom-6 rounded-[14px] p-[18px_22px]"
            style={{
              background: 'rgba(20,13,8,.82)',
              backdropFilter: 'blur(6px)',
              boxShadow: 'inset 0 0 0 1px var(--line)',
            }}
          >
            <div className="font-display text-[22px] text-cream">
              Sucursal Barrio Real
            </div>
            <div className="mt-1 text-[14px] text-tan">{CONTACT_INFO.address}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
