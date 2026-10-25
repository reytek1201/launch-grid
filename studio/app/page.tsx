import Link from "next/link";
import { BackOfficeDemo } from "@/components/BackOfficeDemo";
import { LaunchSequence } from "@/components/LaunchSequence";
import { HeroMark } from "@/components/Mark";
import { StartForm } from "@/components/StartForm";
import { copyConfigured } from "@/lib/email";

const FAQ = [
  ["Do we ever need to get on a call?", "No. The brief, the proposal and all feedback happen in writing. If you'd rather see something walked through, I can record a short screen video."],
  ["Can I really change things from my phone?", "Yes. The back office is built for a phone screen first. Try the sample above."],
  ["How long does it take?", "Your proposal states a launch date in writing. Most of the time goes to gathering your photos and words."],
];

export default function Home() {
  const copyOn = copyConfigured();
  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div className="plate"><div className="mark-box"><HeroMark /></div></div>
        <div>
          <span className="label">Atlanta · websites with a back office</span>
          <h1 id="hero-title">A website you run from your phone.</h1>
          <p className="lede">I build custom sites for bands, restaurants and small businesses, with a back office you run from your phone. Everything happens in writing.</p>
          <div className="row">
            <Link className="btn" href="/start">Start a project</Link>
            <a className="btn btn-ghost" href="#back-office">Try the back office</a>
          </div>
        </div>
      </section>

      <section className="section" id="work" aria-labelledby="work-title">
        <div className="section-head"><span className="label">Live work</span><h2 id="work-title">Real sites. Open them yourself.</h2></div>
        <div className="proof">
          <article className="proof-item">
            <div className="phone" role="img" aria-label="Illustration of a band website on a phone: a hero photo, upcoming shows with ticket links and a book-the-band button">
              <div className="scr"><div className="mini fh">
                <div className="hd">Funkharp</div><div className="img" />
                <div className="it"><span>Upcoming show</span><span className="tag">Tickets</span></div>
                <div className="it"><span>Upcoming show</span><span className="tag">Tickets</span></div>
                <div className="cta">Book the band</div>
              </div></div>
            </div>
            <h3>Funkharp</h3>
            <p>A band site with shows, a booking inbox, fans, music, videos and phone alerts.</p>
            <span className="label">Illustration · live link soon</span>
          </article>
          <article className="proof-item">
            <div className="phone" role="img" aria-label="Illustration of an artist website on a phone: a playable turntable and an enter-with-sound button">
              <div className="scr"><div className="mini rk">
                <div className="hd">Reytek</div><div className="tt" />
                <div className="rd">33⅓ RPM · pitch ±8%</div>
                <div>Electronic music with a memory.</div>
                <div className="cta">Enter with sound</div>
              </div></div>
            </div>
            <h3>Reytek</h3>
            <p>My own artist site. A turntable you can scratch, an intro that starts with sound, and a back office that finds each song&rsquo;s beat.</p>
            <a className="open" href="https://reytek1201.com/?ref=launchgrid" target="_blank" rel="noopener">Open reytek1201.com ↗</a>
          </article>
          <article className="proof-item">
            <div className="phone" role="img" aria-label="Illustration of a restaurant website on a phone: a dining room photo, menu items with prices and a reserve button">
              <div className="scr"><div className="mini tr">
                <div className="hd">Cinque Lune</div><div className="img" />
                <div className="it"><span>Cacio e pepe</span><span>18</span></div>
                <div className="it"><span>Branzino al forno</span><span>29</span></div>
                <div className="cta">Reserve a table</div>
              </div></div>
            </div>
            <h3>Trattoria Cinque Lune</h3>
            <p>Demo restaurant, not a real business. Menu, wine list, reservations and an owner back office.</p>
            <a className="open" href="https://cinque-lune-demo.vercel.app" target="_blank" rel="noopener">Open the demo ↗</a>
          </article>
        </div>
      </section>

      <LaunchSequence />

      <section className="section" id="back-office" aria-labelledby="bo-title">
        <div className="section-head"><span className="label">Try it</span><h2 id="bo-title">Change the site from the back office.</h2><p>This is a working sample. Flip a switch in the back office and watch the site change. Nothing here is saved.</p></div>
        <BackOfficeDemo />
      </section>

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
