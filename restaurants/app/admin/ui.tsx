import type { ReactNode } from "react";

// Shared look for the admin: ink bar, cream page, paper cards, terracotta accent.
export const input =
  "mt-1 w-full rounded-xl border border-espresso/25 bg-white/70 px-3.5 py-2.5 text-base text-espresso placeholder:text-espresso/40 focus:border-terracotta-deep focus:outline-none focus:ring-2 focus:ring-terracotta/25";
export const btn = "inline-flex min-h-10 items-center justify-center rounded-full border border-espresso/25 px-4 text-sm font-medium text-espresso transition-colors duration-[250ms] hover:border-espresso hover:bg-white/60 active:scale-95 [touch-action:manipulation]";
export const btnPrimary =
  "inline-flex min-h-10 items-center justify-center rounded-full bg-[linear-gradient(120deg,#9A3F20,#B9532F)] px-5 text-sm font-semibold text-cream shadow-[0_8px_20px_rgb(154_63_32/0.28)] transition-transform duration-[250ms] active:scale-95 [touch-action:manipulation]";
export const btnDanger = "inline-flex min-h-10 items-center justify-center rounded-full border border-wine/50 px-4 text-sm font-medium text-wine transition-colors duration-[250ms] hover:bg-wine hover:text-cream active:scale-95";

export function PageHead({ title, sub, aside }: { title: string; sub?: string; aside?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-heading text-3xl font-semibold leading-none text-espresso sm:text-4xl">{title}</h1>
        {sub && <p className="mt-2 text-espresso/75">{sub}</p>}
      </div>
      {aside}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-espresso/10 bg-paper p-4 shadow-[0_1px_0_rgb(43_29_20/0.04),0_12px_28px_rgb(43_29_20/0.06)] sm:p-5 ${className}`}>{children}</section>;
}

export function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block text-sm text-espresso/80 ${className}`}>
      {label}
      {children}
    </label>
  );
}

export function Banner({ error, saved }: { error?: string; saved?: boolean }) {
  if (error) return <p role="alert" className="mt-4 rounded-xl border border-wine/40 bg-wine/10 px-4 py-3 text-sm text-wine">{error}</p>;
  if (saved) return <p role="status" className="mt-4 rounded-xl border border-olive/40 bg-olive/10 px-4 py-3 text-sm text-olive">Saved. The public site is already showing it.</p>;
  return null;
}

export const SwitchLabel = ({ on, onLabel, offLabel }: { on: boolean; onLabel: string; offLabel: string }) => (
  <span className="inline-flex items-center gap-2">
    <span aria-hidden className={`relative h-6 w-11 rounded-full transition-colors duration-[250ms] ${on ? "bg-wine" : "bg-olive/70"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left] duration-[250ms] ${on ? "left-[1.375rem]" : "left-0.5"}`} />
    </span>
    <span className="text-sm font-medium">{on ? onLabel : offLabel}</span>
  </span>
);
