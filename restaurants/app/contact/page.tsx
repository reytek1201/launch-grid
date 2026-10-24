import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "@/components/site/ContactForm";
import { getSiteData } from "@/lib/config";

export const metadata: Metadata = { title: "Contact" };

const tel = (p: string) => `tel:+1${p.replace(/\D/g, "")}`;

export default function Contact() {
  const site = getSiteData();
  return (
    <main id="main" className="mx-auto max-w-5xl px-5 py-10 sm:px-6 md:py-14">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl">Write to us</h1>
        <p className="mt-3 font-hand text-2xl text-terracotta-deep">Reservations, parties, questions, hellos.</p>
      </div>
      <div className="mt-12 grid items-start gap-10 md:grid-cols-[1.4fr_1fr]">
        <Reveal><ContactForm /></Reveal>
        <Reveal delay={0.1}><div>
          <h2 className="text-2xl">Or just call</h2>
          <p className="mt-3"><a href={tel(site.phone)} className="text-xl font-semibold text-terracotta-deep underline">{site.phone}</a></p>
          <address className="mt-4 not-italic leading-relaxed">{site.address.street}<br />{site.address.city}, {site.address.state} {site.address.zip}</address>
          <p className="mt-4"><a href={`mailto:${site.email}`} className="text-terracotta-deep underline">{site.email}</a></p>
        </div></Reveal>
      </div>
    </main>
  );
}
