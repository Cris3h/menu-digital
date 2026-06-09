import type { Metadata } from 'next';
import { NOSOTROS_VALUES, NOSOTROS_STATS, unsplash } from '@/lib/brand';
import { Icon } from '@/components/ui/Icons';

export const metadata: Metadata = {
  title: 'Nosotros · MIINUTA. CARNES',
  description: 'Carniceros de tres generaciones. Carnicería de barrio en Junín.',
};

const HERO = unsplash('photo-1607623814075-e51df1bdc82f', 800);

export default function NosotrosPage() {
  return (
    <div className="mx-auto max-w-[1440px]">
      {/* ---------- Mobile: header con foto ---------- */}
      <div className="lg:hidden">
        <div className="relative h-[196px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HERO} alt="Carnicería" className="h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg,rgba(12,8,5,.1),var(--bg))' }}
          />
          <div className="absolute inset-x-[22px] bottom-4">
            <div className="eyebrow" style={{ color: 'var(--gold)' }}>
              Nuestra historia
            </div>
            <h1 className="font-display mt-[6px] text-[26px] leading-none text-cream">
              Carniceros de tres generaciones
            </h1>
          </div>
        </div>
        <p className="px-[22px] py-[18px] text-[14px] leading-[1.6] text-tan">
          MIINUTA nació como una carnicería de barrio en Junín y sigue siéndolo.
          Ahora llegamos a tu casa con la calidad de siempre.
        </p>
      </div>

      {/* ---------- Desktop: split texto + foto ---------- */}
      <section className="hidden items-center gap-12 px-14 pb-5 pt-12 lg:grid lg:grid-cols-2">
        <div>
          <div className="eyebrow" style={{ color: 'var(--gold)' }}>
            Nuestra historia
          </div>
          <h1 className="font-display mb-5 mt-[14px] text-[50px] leading-[0.98] text-cream">
            Carniceros de
            <br />
            <span className="text-gold">tres generaciones</span>
          </h1>
          <p className="mb-4 text-[16px] leading-[1.65] text-tan">
            MIINUTA nació como una carnicería de barrio en Junín y sigue
            siéndolo. Lo que cambió es que ahora llegamos a tu casa con la misma
            calidad de siempre.
          </p>
          <p className="text-[15px] leading-[1.65] text-tan-dim">
            Elegimos cada corte, elaboramos las milanesas todos los días y
            atendemos como nos gusta que nos atiendan: de frente y sin vueltas.
          </p>
        </div>
        <div
          className="h-[380px] overflow-hidden rounded-[20px]"
          style={{ boxShadow: 'var(--shadow)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HERO} alt="Carnicería" className="h-full w-full object-cover" />
        </div>
      </section>

      {/* ---------- Valores ---------- */}
      <section className="grid grid-cols-1 gap-3 px-[22px] py-2 sm:grid-cols-3 lg:gap-[18px] lg:px-14 lg:pb-[18px] lg:pt-7">
        {NOSOTROS_VALUES.map((v) => {
          const I = Icon[v.icon];
          return (
            <div
              key={v.t}
              className="flex items-center gap-3.5 rounded-[16px] p-[14px_16px] sm:flex-col sm:items-start sm:p-[28px_26px]"
              style={{
                background: 'linear-gradient(180deg,var(--card-a),var(--card-b))',
                boxShadow: 'inset 0 0 0 1px var(--line)',
              }}
            >
              <span className="inline-flex shrink-0 text-gold">
                <I style={{ width: 30, height: 30, strokeWidth: 1.5 }} />
              </span>
              <div>
                <div className="font-bold text-cream sm:mb-2 sm:mt-4 sm:text-[18px]">
                  {v.t}
                </div>
                <div className="text-[12.5px] leading-[1.55] text-tan-dim sm:text-[14px]">
                  {v.d}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ---------- Stats (desktop) ---------- */}
      <section className="hidden px-14 pb-[52px] pt-[30px] lg:block">
        <div
          className="grid grid-cols-4 gap-4 rounded-[16px] p-[34px_8px]"
          style={{
            background: 'linear-gradient(180deg,var(--panel),var(--card-b))',
            boxShadow: 'inset 0 0 0 1px var(--line)',
          }}
        >
          {NOSOTROS_STATS.map(([n, l], i) => (
            <div
              key={l}
              className="text-center"
              style={i < 3 ? { boxShadow: 'inset -1px 0 0 var(--line-soft)' } : undefined}
            >
              <div className="font-display text-[38px] text-gold">{n}</div>
              <div className="eyebrow mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
