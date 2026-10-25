"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Flourish } from "@/components/motion/Flourish";
import { Reveal } from "@/components/motion/Reveal";
import { useMedia } from "@/components/motion/useMedia";
import { DietTags } from "@/components/site/DietTags";
import { price } from "@/lib/format";
import type { MenuItem, MenuSection, Photo } from "@/lib/types";
import type { InkName } from "../signature/Ink";
import { InkOnView } from "./InkOnView";

type Diet = "vegetarian" | "vegan" | "gluten-free";
type WineLink = { id: string; name: string };
const DIETS: { id: Diet; label: string }[] = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-free" },
];
const EASE = [0.2, 0.7, 0.2, 1] as const;

const matches = (i: MenuItem, diets: Diet[]) =>
  diets.every((d) => i.tags?.includes(d) || (d === "vegetarian" && i.tags?.includes("vegan")));

/*
 * The printed menu, with two helpers that never move prices or reflow the page:
 * diet chips fade what does not match, and any photographed dish opens large in a viewer you can step or swipe through.
 */
export function MenuBook({
  sections,
  photos,
  wines,
  dividers,
}: {
  sections: MenuSection[];
  photos: Record<string, Photo>;
  wines: Record<string, WineLink[]>;
  dividers: Record<string, InkName>;
}) {
  const [diets, setDiets] = useState<Diet[]>([]);
  const toggle = (d: Diet) => setDiets((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));
  const food = sections.filter((s) => s.id !== "bevande").flatMap((s) => s.items);
  const matching = food.filter((i) => matches(i, diets)).length;

  // Viewer: every photographed dish, in menu order.
  const viewable = sections.flatMap((s) => s.items.filter((i) => i.photo && photos[i.photo]).map((i) => ({ item: i, course: s.title })));
  const [open, setOpen] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const swipeX = useRef<number | null>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);

  const show = (id: string, el: HTMLElement) => {
    opener.current = el;
    setOpen(viewable.findIndex((v) => v.item.id === id));
  };
  const step = (n: number) => {
    setDir(n);
    setOpen((i) => (i === null ? i : (i + n + viewable.length) % viewable.length));
  };
  const current = open === null ? null : viewable[open];
  const currentPhoto = current?.item.photo ? photos[current.item.photo] : undefined;

  const calm = useMedia("(prefers-reduced-motion: reduce)");

  return (
    <>
      {/* Diet chips */}
      <div className="mx-auto max-w-3xl px-3 pt-8 sm:px-6">
        <div role="group" aria-label="Filter by diet" className="flex flex-wrap items-center justify-center gap-2">
          <span className="mr-1 font-hand text-2xl text-[#f2b27a]">Only show</span>
          {DIETS.map((d) => {
            const on = diets.includes(d.id);
            return (
              <button
                key={d.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(d.id)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors duration-[250ms] ${on ? "border-cream bg-cream text-espresso" : "border-cream/45 text-cream hover:border-cream hover:bg-cream/10"}`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
        <p aria-live="polite" className="mt-2 min-h-[1.5rem] text-center text-sm text-cream/85">
          {diets.length > 0 && (matching === 0 ? "Nothing matches all of those. Ask us, the kitchen can often adapt." : `${matching} ${matching === 1 ? "dish matches" : "dishes match"}. The rest are faded, not gone.`)}
        </p>
      </div>

      {/* The printed menu, on aged paper, lying on the table */}
      <div className="px-3 pb-10 pt-4 sm:px-6 md:pb-16">
        <article className="relative mx-auto max-w-3xl drop-shadow-[0_30px_50px_rgb(0_0_0/0.55)]">
          <div aria-hidden className="paper absolute inset-0" />
          <div className="relative px-5 pb-12 pt-10 sm:px-12 md:px-16">
            <header className="text-center">
              <p className="text-[0.7rem] uppercase tracking-[0.4em] text-espresso/70">Trattoria</p>
              <p className="font-heading text-4xl text-espresso md:text-5xl">Cinque Lune</p>
              <p className="mt-3 text-sm text-espresso/75">
                <abbr title="vegetarian">V</abbr> vegetarian · <abbr title="vegan">VG</abbr> vegan · <abbr title="gluten-free">GF</abbr> gluten-free · MP market price
              </p>
            </header>

            {sections.map((s, n) => (
              <section key={s.id} id={s.id} className="scroll-mt-28 pt-10 md:scroll-mt-36">
                {n > 0 && dividers[s.id] && <InkOnView name={dividers[s.id]} className={`mx-auto mb-6 text-espresso/55 ${["fork", "glass"].includes(dividers[s.id]) ? "w-6" : "w-14"}`} />}
                <Reveal>
                  <div className="text-center">
                    <h2 className="font-hand text-5xl text-terracotta-deep">{s.title}</h2>
                    <Flourish width={140} className="mx-auto -mt-1" />
                    {s.note && <p className="mt-1 text-espresso/75">{s.note}</p>}
                    {s.id === "bevande" && <p className="mt-2"><Link href="/cellar" className="ink font-semibold text-terracotta-deep">See the whole wine cellar →</Link></p>}
                  </div>
                </Reveal>
                <ul className="mt-6 divide-y divide-dashed divide-espresso/20">
                  {s.items.map((i) => {
                    const photo = i.photo ? photos[i.photo] : undefined;
                    const faded = diets.length > 0 && !matches(i, diets);
                    const pair = wines[i.id] ?? [];
                    return (
                      <li
                        key={i.id}
                        id={i.id}
                        data-faded={faded || undefined}
                        className={`group flex scroll-mt-28 gap-3 py-4 transition-[opacity,transform] duration-[250ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:-translate-y-0.5 md:scroll-mt-36 md:gap-4 ${faded ? "opacity-30" : ""}`}
                      >
                        {photo && (
                          <button
                            type="button"
                            aria-haspopup="dialog"
                            aria-label={`Open photo: ${i.name}`}
                            onClick={(e) => show(i.id, e.currentTarget)}
                            className="relative h-16 w-16 shrink-0 cursor-zoom-in overflow-hidden rounded-sm transition-transform duration-[250ms] hover:scale-105 sm:h-20 sm:w-20"
                          >
                            <Image src={photo.src} alt="" fill sizes="96px" quality={75} className="paper-photo object-cover" style={{ objectPosition: photo.focal }} />
                          </button>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-4">
                            <h3 className={`font-heading text-lg leading-snug ${i.soldOut ? "text-espresso/70 line-through" : "text-espresso"}`}>
                              {photo ? (
                                <button type="button" aria-haspopup="dialog" onClick={(e) => show(i.id, e.currentTarget)} className="cursor-zoom-in text-left decoration-terracotta/60 decoration-dashed underline-offset-4 hover:underline">
                                  {i.name}
                                </button>
                              ) : (
                                i.name
                              )}
                              <DietTags tags={i.tags} />
                            </h3>
                            <span aria-hidden className="leader hidden sm:block" />
                            <span className={`shrink-0 font-semibold ${i.soldOut ? "text-espresso/70 line-through" : "text-espresso"}`}>{price(i.price)}</span>
                          </div>
                          {i.description && <p className={`mt-1 text-[0.95rem] ${i.soldOut ? "text-espresso/70" : "text-espresso/80"}`}>{i.description}</p>}
                          {!i.soldOut && pair.length > 0 && (
                            <p className="mt-1 text-sm text-espresso/80">
                              <span className="font-hand text-xl text-wine">with </span>
                              {pair.map((w, k) => (
                                <span key={w.id}>
                                  {k > 0 && " or "}
                                  <Link href={`/cellar#${w.id}`} className="ink text-terracotta-deep">{w.name}</Link>
                                </span>
                              ))}
                            </p>
                          )}
                          {i.soldOut && <p className="mt-1 font-hand text-2xl text-wine">finito</p>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}

            <footer className="mt-12 text-center">
              <p className="font-hand text-3xl text-terracotta-deep">Buon appetito</p>
              <p className="mt-2 text-sm text-espresso/75">Ask us about allergies. Prices before tax.</p>
            </footer>
          </div>
        </article>
      </div>

      {/* Dish viewer */}
      <dialog
        ref={dialog}
        aria-label={current ? current.item.name : "Dish"}
        onClose={() => { setOpen(null); opener.current?.focus(); }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}
        onTouchStart={(e) => { swipeX.current = e.touches[0]?.clientX ?? null; }}
        onTouchEnd={(e) => {
          const start = swipeX.current;
          swipeX.current = null;
          const end = e.changedTouches[0]?.clientX;
          if (start === null || end === undefined) return;
          const dx = end - start;
          if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
        }}
        className="m-auto max-h-[94svh] w-[min(94vw,980px)] touch-pan-y overflow-y-auto overscroll-contain bg-transparent p-0 text-espresso backdrop:bg-[#140c08]/90 backdrop:backdrop-blur-sm"
      >
        {current && currentPhoto && (
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={current.item.id}
              initial={calm ? false : { opacity: 0, x: 40 * dir }}
              animate={{ opacity: 1, x: 0 }}
              exit={calm ? undefined : { opacity: 0, x: -40 * dir }}
              transition={{ duration: 0.3, ease: EASE }}
              className="relative mt-5 drop-shadow-[0_30px_50px_rgb(0_0_0/0.6)]"
            >
              {/* Aged paper with torn edges, taped down, like the menu card itself */}
              <div aria-hidden className="paper absolute inset-0" />
              <span aria-hidden className="tape" />
              <span aria-hidden className="tape !left-auto !right-6 !translate-x-0 !rotate-[6deg] max-md:hidden" />
              <div className="relative grid p-3 md:grid-cols-[1.15fr_1fr] md:p-4">
              <div className="paper-photo relative aspect-square overflow-hidden md:aspect-auto md:min-h-[30rem]">
                <Image src={currentPhoto.src} alt={currentPhoto.alt} draggable={false} fill sizes="(min-width: 768px) 520px, 94vw" quality={85} className="object-cover" style={{ objectPosition: currentPhoto.focal }} />
              </div>
              <div className="flex flex-col px-3 pb-3 pt-5 md:px-7 md:py-5">
                <p className="font-hand text-2xl text-terracotta-deep">{current.course}</p>
                <h2 className="mt-1 font-heading text-3xl leading-tight">
                  {current.item.name}
                  <DietTags tags={current.item.tags} />
                </h2>
                {current.item.description && <p className="mt-3 text-espresso/80">{current.item.description}</p>}
                <p className="mt-4 text-xl font-semibold">{current.item.soldOut ? <span className="font-hand text-3xl font-normal text-wine">finito tonight</span> : price(current.item.price)}</p>
                {(wines[current.item.id] ?? []).length > 0 && (
                  <div className="mt-5 border-t border-dashed border-espresso/30 pt-4">
                    <p className="font-hand text-2xl text-wine">Pairs with</p>
                    <ul className="mt-1 space-y-1">
                      {wines[current.item.id].map((w) => (
                        <li key={w.id}><Link href={`/cellar#${w.id}`} className="ink text-terracotta-deep">{w.name}</Link></li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
                  <button type="button" onClick={() => step(-1)} aria-label="Previous dish" className="rounded-full border border-espresso/40 px-4 py-2 text-sm hover:bg-espresso/5">← Prev</button>
                  <button type="button" onClick={() => step(1)} aria-label="Next dish" className="rounded-full border border-espresso/40 px-4 py-2 text-sm hover:bg-espresso/5">Next →</button>
                  <button type="button" autoFocus onClick={() => setOpen(null)} className="ml-auto rounded-full bg-espresso px-5 py-2 text-sm text-cream">Close</button>
                </div>
                <p className="mt-3 text-xs text-espresso/70">{(open ?? 0) + 1} of {viewable.length} · swipe or use the arrow keys</p>
              </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </dialog>
    </>
  );
}
