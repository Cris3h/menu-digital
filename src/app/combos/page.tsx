import type { Metadata } from 'next';
import { COMBOS } from '@/lib/brand';
import { fmtPrice } from '@/lib/utils';
import { Icon } from '@/components/ui/Icons';

export const metadata: Metadata = {
  title: 'Combos · MIINUTA. CARNES',
  description: 'Packs pensados para la parrilla del finde. Más cantidad, mejor precio.',
};

export default function CombosPage() {
  return (
    <div className="mx-auto max-w-[1440px]">
      {/* Encabezado */}
      <section className="hero px-[18px] py-9 text-center lg:px-14 lg:pb-9 lg:pt-10">
        <div className="eyebrow" style={{ color: 'var(--gold)' }}>
          Armados para compartir
        </div>
        <h1 className="font-display mx-0 my-3 text-[26px] text-cream lg:text-[50px]">
          Combos de la casa
        </h1>
        <p className="mx-auto max-w-[520px] text-[13px] text-tan lg:text-[16px]">
          Packs pensados para la parrilla del finde. Más cantidad, mejor precio.
        </p>
      </section>

      {/* Grilla de combos */}
      <section className="grid grid-cols-1 gap-4 px-[18px] pb-12 pt-2 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 lg:px-14 lg:pb-[52px]">
        {COMBOS.map((c) => (
          <div
            key={c.id}
            className="flex flex-col overflow-hidden rounded-[18px]"
            style={{
              background: 'linear-gradient(180deg,var(--card-a),var(--card-b))',
              boxShadow: 'inset 0 0 0 1px var(--line)',
            }}
          >
            <div className="relative h-[150px] lg:h-[188px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.img} alt={c.name} className="h-full w-full object-cover" />
              <span
                className="absolute left-[14px] top-[14px] rounded-full px-3 py-[6px] text-[11px] font-extrabold"
                style={{ background: 'var(--gold)', color: '#2a1c08', letterSpacing: '.04em' }}
              >
                AHORRÁS {fmtPrice(c.old - c.price)}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-[20px_22px_22px]">
              <div className="eyebrow">{c.serves}</div>
              <div className="font-display my-[6px] mb-[14px] text-[22px] text-cream lg:text-[26px]">
                {c.name}
              </div>
              <div className="flex flex-1 flex-col gap-[9px]">
                {c.items.map((it) => (
                  <div
                    key={it}
                    className="flex items-center gap-2.5 text-[13.5px] text-tan"
                  >
                    <span className="inline-flex text-gold">
                      <Icon.check style={{ width: 15, height: 15 }} />
                    </span>
                    {it}
                  </div>
                ))}
              </div>
              <div className="mb-[14px] mt-[18px] flex items-baseline gap-2.5">
                <span className="price" style={{ fontSize: 30 }}>
                  {fmtPrice(c.price)}
                </span>
                <span className="text-[16px] text-tan-dim line-through">
                  {fmtPrice(c.old)}
                </span>
              </div>
              <button className="btn btn-gold h-[50px] text-[14px]">
                <Icon.bag style={{ width: 17, height: 17 }} /> Agregar combo
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
