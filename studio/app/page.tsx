import Link from "next/link";
import { BackOfficeDemo } from "@/components/BackOfficeDemo";
import { LaunchSequence } from "@/components/LaunchSequence";
import { Hero } from "@/components/Hero";
import { StartForm } from "@/components/StartForm";
import { copyConfigured } from "@/lib/email";

const FAQ = [
  ["Do we ever need to get on a call?", "No. The brief, the proposal and all feedback happen in writing. If you'd rather see something walked through, I can record a short screen video."],
  ["Can I really change things from my phone?", "Yes. The back office is built for a phone screen first. Try the sample above: it is the same kind of back office you would get."],
  ["How long does it take?", "Your proposal states a launch date in writing. Most of the time goes to gathering your photos and words."],
];

export default function Home() {
  const copyOn = copyConfigured();
  return (
    <main>
      <Hero />

      <section className="section" id="back-office" aria-labelledby="bo-title">
        <div className="section-head"><span className="label">The back of the house</span><h2 id="bo-title">Change it in your hand. It changes on the site.</h2><p>Every site comes with a back office built for a phone. This is a working sample: flip a switch on the left and watch the site on the right.</p></div>
        <BackOfficeDemo />
      </section>

      <LaunchSequence />

      <section className="section" aria-labelledby="doors-title">
        <div className="section-head"><span className="label">Who it&rsquo;s for</span><h2 id="doors-title">Pick your door.</h2></div>
        <div className="grid3">
          <Link className="door" href="/start?kind=band"><h3>Bands and artists</h3><p>Shows, music, videos, a booking inbox and your fan list.</p><span className="go">Start a band project →</span></Link>
          <Link className="door" href="/start?kind=restaurant"><h3>Restaurants</h3><p>Menu, specials, hours, reservations and photos you change yourself.</p><span className="go">Start a restaurant project →</span></Link>
          <Link className="door" href="/start?kind=other"><h3>Other small businesses</h3><p>The same build and back office, shaped to what you sell. I&rsquo;ll reply with the nearest fit.</p><span className="go">Tell me what you run →</span></Link>
        </div>
      </section>

      <section className="section" aria-labelledby="how-title">
        <div className="section-head"><span className="label">How I work</span><h2 id="how-title">Everything in writing.</h2><p>No calls to schedule. You always have a record of what was agreed.</p></div>
        <ol className="steps">
          <li><span className="n">01</span><div><b>You fill in the project form.</b><span>A few questions about your business and what you need.</span></div></li>
          <li><span className="n">02</span><div><b>You get a written proposal.</b><span>A fixed price, what&rsquo;s included and a launch date.</span></div></li>
          <li><span className="n">03</span><div><b>Feedback happens in one thread.</b><span>Comments go in writing, so nothing gets lost.</span></div></li>
        </ol>
      </section>

      <section className="section" aria-labelledby="faq-title">
        <div className="section-head"><span className="label">Questions</span><h2 id="faq-title">Short answers.</h2></div>
        <div>{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
      </section>

      <section className="section form-grid" id="start" aria-labelledby="start-title">
        <div className="section-head">
          <span className="label">Start a project</span>
          <h2 id="start-title">Tell me what you&rsquo;re launching.</h2>
          <p>A few lines is enough. I reply in writing by the next business day. No sales calls.</p>
        </div>
        <StartForm copyOn={copyOn} />
      </section>
    </main>
  );
}
