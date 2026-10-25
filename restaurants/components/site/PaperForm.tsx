"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Magnetic } from "@/components/motion/Magnetic";

// Lines on a page rather than boxes.
export const LINE =
  "mt-1 w-full border-0 border-b border-espresso/40 bg-transparent px-0 py-1.5 text-base text-espresso [color-scheme:light] focus:border-terracotta-deep focus:ring-0";
export const LABEL = "block text-sm text-espresso/75";

/** A group of choices drawn as small paper tags (radio buttons underneath). */
export function Chips({ legend, name, options, value, onChange, required = false, hint }: {
  legend: string;
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  hint?: ReactNode;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-sm text-espresso/75">{legend}</legend>
      {options.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {options.map((o, i) => (
            <label key={o.value} className="cursor-pointer">
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={value === o.value}
                onChange={() => onChange(o.value)}
                required={required && i === 0}
                className="peer sr-only"
              />
              <span className="block rounded-full border border-espresso/35 px-3.5 py-1.5 text-sm text-espresso transition-colors duration-[250ms] hover:border-espresso peer-checked:border-terracotta-deep peer-checked:bg-terracotta-deep peer-checked:text-cream peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-terracotta-deep">
                {o.label}
              </span>
            </label>
          ))}
        </div>
      ) : null}
      {hint && <div className="mt-2 text-sm text-espresso/80">{hint}</div>}
    </fieldset>
  );
}

/** What the guest sees once a request is in: a paper ticket with the details and a way to follow up. */
export function RequestSent({ heading, rows, note, mailHref, telHref, onAgain, againLabel, delivered }: {
  heading: string;
  rows: [string, string][];
  note: string;
  mailHref: string;
  telHref: string;
  onAgain: () => void;
  againLabel: string;
  /** true once the request reached the restaurant's inbox; false means it only exists as an email draft */
  delivered?: boolean;
}) {
  const h = useRef<HTMLHeadingElement>(null);
  useEffect(() => { h.current?.focus(); }, []);
  return (
    <div role="status" className="relative px-6 py-10 text-center sm:px-10 sm:py-14">
      <h2 ref={h} tabIndex={-1} className="font-hand text-6xl text-terracotta-deep outline-none sm:text-7xl">{heading}</h2>
      <div aria-hidden className="mx-auto mt-3 inline-block -rotate-6 border-2 border-double border-terracotta/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">Richiesta</div>
      <dl className="mx-auto mt-6 max-w-sm space-y-2 border-y border-dashed border-espresso/35 py-4 text-left font-mono text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-espresso/75">{k}</dt>
            <dd className="text-right">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mx-auto mt-5 max-w-md text-espresso/85">{note}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {delivered ? (
          <>
            <Magnetic><a href={telHref} className="btn btn-solid">Call to confirm</a></Magnetic>
            <Magnetic><a href={mailHref} className="btn btn-line-dark">Email us a copy</a></Magnetic>
          </>
        ) : (
          <>
            <Magnetic><a href={mailHref} className="btn btn-solid">Email this request</a></Magnetic>
            <Magnetic><a href={telHref} className="btn btn-line-dark">Call to confirm</a></Magnetic>
          </>
        )}
      </div>
      <button type="button" onClick={onAgain} className="ink mt-6 text-sm text-espresso/80">{againLabel}</button>
    </div>
  );
}
