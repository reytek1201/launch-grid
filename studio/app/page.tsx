import { Doors } from "@/components/Doors";
import { BackOfficeDemo } from "@/components/BackOfficeDemo";
import { LaunchSequence } from "@/components/LaunchSequence";
import { HowIWork } from "@/components/HowIWork";
import { Hero } from "@/components/Hero";
import { StartForm } from "@/components/StartForm";
import { YearOfWork } from "@/components/YearOfWork";
import type { Metadata } from "next";
import { copyConfigured } from "@/lib/email";
import { JsonLd, faqLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: { absolute: "LaunchGrid Studio · Band and restaurant websites, Atlanta" },
  description: "Custom websites for bands, musicians, restaurants, cafés and food trucks, built by one designer in Atlanta. Each comes with a back office you run from your phone.",
  alternates: { canonical: "/" },
};

const FAQ = [
  ["Who builds it?", "I do, Reytek, one person in Atlanta. You write to me and I write back, so nothing gets handed between people."],
  ["Do we ever need to get on a call?", "No. The brief, the proposal and all feedback happen in writing. If you'd rather see something walked through, I can record a short screen video."],
  ["Can I really change things from my phone?", "Yes. The back office is built for a phone screen first. Try the sample above: it is the same kind of back office you would get."],
  ["How much does it cost?", "Band sites start at $900 and restaurant sites at $1,500, each with a monthly care plan. The price is fixed in your written proposal before work starts. The full list is on the pricing page."],
  ["How long does it take?", "Your proposal states a launch date in writing. Most of the time goes to gathering your photos and words."],
  ["What do I need to send you?", "To start, just the form below. Later I'll ask for your photos, words and links, in writing, a little at a time."],
];

export default function Home() {
  const copyOn = copyConfigured();
  return (
    <main>
      <JsonLd data={faqLd(FAQ)} />
      <Hero />

      <section className="section" id="back-office" aria-labelledby="bo-title">
        <div className="section-head"><span className="label">The back of the house</span><h2 id="bo-title">Change it in your hand. It changes on the site.</h2><p>Every site comes with a back office built for a phone. This is a working sample: flip a switch on the left and watch the site on the right.</p></div>
        <BackOfficeDemo />
      </section>

      <LaunchSequence />

      <YearOfWork />

      <section className="section" aria-labelledby="doors-title">
        <div className="section-head"><span className="label">Who it&rsquo;s for</span><h2 id="doors-title">Pick your bay.</h2><p>Three bays, one for each kind of site. Tap one to lock it in.</p></div>
        <Doors />
      </section>

      <section className="section" aria-labelledby="how-title">
        <div className="section-head"><span className="label">How I work</span><h2 id="how-title">Everything in writing.</h2><p>No calls to schedule. You always have a record of what was agreed.</p></div>
        <HowIWork />
        <p className="pt-note">Sample documents. Names are made up.</p>
      </section>

      <section className="section" aria-labelledby="faq-title">
        <div className="section-head"><span className="label">Questions</span><h2 id="faq-title">Short answers.</h2></div>
        <div className="faq">{FAQ.map(([q, a]) => <details key={q}><summary><span className="faq-cell" aria-hidden="true"><i /></span>{q}</summary><p>{a}</p></details>)}<p className="faq-more">Something else? Ask it in the form below.</p></div>
      </section>

      <section className="section form-grid" id="start" aria-labelledby="start-title">
        <div className="section-head">
          <span className="label">Start a project</span>
          <h2 id="start-title">Tell me what you&rsquo;re launching.</h2>
          <p>A few lines is enough. I reply in writing by the next business day. No sales calls.</p>
        </div>
        <StartForm copyOn={copyOn} ticket />
      </section>
    </main>
  );
}
