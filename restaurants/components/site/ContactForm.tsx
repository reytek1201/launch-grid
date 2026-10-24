"use client";

import { useState } from "react";
import { Magnetic } from "@/components/motion/Magnetic";

const field = "mt-1 w-full rounded border border-espresso/30 bg-cream px-3 py-2 text-base";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div role="status" className="rounded-lg bg-paper p-8 text-center">
        <p className="font-hand text-4xl text-terracotta-deep">Grazie!</p>
        <p className="mt-3">This is a demo form, so nothing was sent. On a live site this would email the restaurant.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setSent(true); }}
      className="grid gap-4 rounded-lg bg-paper p-6 shadow-md sm:grid-cols-2 sm:p-8"
    >
      <label className="block">Your name<input required name="name" autoComplete="name" className={field} /></label>
      <label className="block">Email<input required type="email" name="email" autoComplete="email" className={field} /></label>
      <label className="block">Phone (optional)<input type="tel" name="phone" autoComplete="tel" className={field} /></label>
      <label className="block">Party size<input type="number" min={1} max={20} name="party" className={field} /></label>
      <label className="block sm:col-span-2">Message<textarea required name="message" rows={5} className={field} /></label>
      <div className="sm:col-span-2">
        <Magnetic><button type="submit" className="btn btn-solid">Send</button></Magnetic>
      </div>
    </form>
  );
}
