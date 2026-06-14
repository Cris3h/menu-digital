'use client';

/**
 * Ayuda contextual: un "?" que muestra una explicación al pasar el mouse
 * (o al enfocarlo con teclado). Pensado para que el dueño entienda cada campo
 * sin saber de tecnología.
 */
export function InfoTip({ text }: { text: string }) {
  return (
    <span className="group relative ml-1.5 inline-flex align-middle">
      <span
        tabIndex={0}
        role="button"
        aria-label={text}
        className="flex h-[18px] w-[18px] cursor-help items-center justify-center rounded-full border border-gold-300/50 text-[11px] font-bold leading-none text-gold-300/90 outline-none focus:ring-2 focus:ring-gold-300/50"
      >
        ?
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-[80] mb-2 w-60 -translate-x-1/2 rounded-lg border border-gold-300/25 bg-dark-900 px-3 py-2 text-[12px] font-normal leading-snug text-white/90 opacity-0 shadow-2xl transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}
