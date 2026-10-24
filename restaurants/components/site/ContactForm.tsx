"use client";

import { useState } from "react";
import { Magnetic } from "@/components/motion/Magnetic";
import { Moons } from "./Moons";

// Lines on a postcard rather than boxes.
const line = "mt-1 w-full border-0 border-b border-espresso/40 bg-transparent px-0 py-1.5 text-base text-espresso focus:border-terracotta-deep focus:ring-0";

export function ContactForm({ name }: { name: string }) {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div role="status" className="relative px-8 py-14 text-center">
        <p className="font-hand text-6xl text-terracotta-deep">Grazie!</p>
        <p className="mt-3 text-espresso/85">This is a demo postcard, so nothing was sent. On a live site it would reach the kitchen.</p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1.25fr_1fr] md:gap-0">
      {/* Message side: lined paper */}
      <label className="block md:border-r md:border-dashed md:border-espresso/30 md:pr-8">
        <span className="font-hand text-3xl text-terracotta-deep">Cara {name},</span>
        <textarea
          required
          name="message"
          rows={8}
          className="mt-2 w-full resize-none border-0 bg-transparent p-0 font-hand text-2xl leading-[2.25rem] text-espresso focus:ring-0"
          style={{ backgroundImage: "repeating-linear-gradient(transparent 0 2.2rem, rgb(43 29 20 / 0.22) 2.2rem 2.25rem)" }}
          placeholder="A table for six on Friday? A birthday? Just say hi."
        />
      </label>

      {/* Address side: stamp and lines */}
      <div className="md:pl-8">
        <div aria-hidden className="ml-auto flex h-20 w-16 rotate-3 flex-col items-center justify-center gap-1 border-2 border-dashed border-terracotta/70 text-terracotta">
          <Moons className="h-2.5 w-auto" />
          <span className="text-[0.55rem] uppercase tracking-widest">Lune</span>
        </div>
        <div className="mt-4 space-y-4">
          <label className="block text-sm text-espresso/75">From<input required name="name" autoComplete="name" className={line} /></label>
          <label className="block text-sm text-espresso/75">Email<input required type="email" name="email" autoComplete="email" className={line} /></label>
          <label className="block text-sm text-espresso/75">Phone (optional)<input type="tel" name="phone" autoComplete="tel" className={line} /></label>
          <label className="block text-sm text-espresso/75">Party size<input type="number" min={1} max={20} name="party" className={line} /></label>
        </div>
        <div className="mt-8 text-right">
          <Magnetic><button type="submit" className="btn btn-solid">Send the postcard</button></Magnetic>
        </div>
      </div>
    </form>
  );
}
