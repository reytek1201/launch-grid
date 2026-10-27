import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { CinqueLive } from "@/components/restaurants/CinqueLive";
import { RestaurantsHero } from "@/components/restaurants/RestaurantsHero";
import { LowRolling } from "@/components/restaurants/LowRolling";
import { SparrowSkillet } from "@/components/restaurants/SparrowSkillet";
import { chalk, clDisplay, lrCond, lrSlab, ssSans, ssSerif } from "./fonts";

export const metadata: Metadata = {
  title: "For restaurants",
  description: "Custom restaurant, café and food truck websites with a back office on your phone, built by Reytek.",
};

export default function Restaurants() {
  return (
    <main>
      <RestaurantsHero fontClass={chalk.variable} />

      <section className={`section cl ${clDisplay.variable} ${chalk.variable}`} id="cinque" aria-labelledby="cl-title">
        <div className="cl-grid">
          <div className="cl-head">
            <span className="lbl">A meal, in scroll · Trattoria Cinque Lune, a demo restaurant <em>(not a real business)</em></span>
            <h2 id="cl-title">The menu is a meal. Scroll it.</h2>
            <p>This is the live site running in the phone, not a picture of it. Scroll from the front door to the check: each course arrives as you go, and the room warms toward evening.</p>
            <ul className="cl-try" aria-label="Things to try in the phone">
              <li><b>Scroll</b> from the door to the check</li>
              <li><b>Tap Menu</b> and filter by what you eat</li>
              <li><b>Tap Reserve</b> and fill in the paper slip</li>
              <li><b>Find the hours</b>: it knows if they&rsquo;re open right now</li>
            </ul>
            <p className="cl-open"><a href="https://cinque-lune-demo.vercel.app" target="_blank" rel="noopener">Open the full demo<span className="sr-only"> (opens in a new tab)</span> <span aria-hidden="true">↗</span></a> <span>The owner runs the menu, specials, hours and photos from a phone.</span></p>
          </div>
          <CinqueLive />
        </div>

        <div className="cl-admin">
          <div className="cl-admin-bar" aria-hidden="true"><b>Cinque Lune</b><i>Admin</i><span>Home</span><span className="on">Menu</span><span>Hours</span></div>
          <div className="cl-admin-in">
            <span className="lbl">Now run it</span>
            <h3>Try the admin. Nothing you do is saved.</h3>
            <p>Open the trattoria&rsquo;s real back office in a sandbox. Make three changes an owner makes every week and watch the site change beside it.</p>
            <ul aria-label="What to try">
              <li>Mark a dish sold out</li>
              <li>Post tonight&rsquo;s special</li>
              <li>Close for a holiday</li>
            </ul>
            <a className="cl-admin-go" href="https://cinque-lune-demo.vercel.app/try" target="_blank" rel="noopener">Try the admin<span className="sr-only"> (opens in a new tab)</span> <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>

      <section className={`section lr ${lrSlab.variable} ${lrCond.variable}`} id="truck" aria-labelledby="lr-title">
        <div className="lr-window" aria-hidden="true"><Image src="/lowrolling/window.webp" alt="" fill sizes="100vw" /></div>
        <div className="lr-head">
          <span className="lbl">Where we&rsquo;re parked today · Low &amp; Rolling, a demo food truck <em>(not a real business)</em></span>
          <h2 id="lr-title">Your site is the link in your bio.</h2>
          <p>Food trucks live on social. Put one link in your bio that always knows where you&rsquo;re parked, until when, and what&rsquo;s left on the pit. Change it from the owner&rsquo;s phone and watch the fan&rsquo;s phone.</p>
        </div>
        <LowRolling />
        <p className="lr-demo">Demo food truck with sample spots and prices. Nothing is saved.</p>
      </section>

      <section className={`section ss ${ssSerif.variable} ${ssSans.variable} ${chalk.variable}`} id="cafe" aria-labelledby="ss-title">
        <div className="ss-head">
          <span className="lbl">Today&rsquo;s board · Sparrow &amp; Skillet, a demo brunch café <em>(not a real business)</em></span>
          <h2 id="ss-title">The rolls sold out at 9:40. The site already knows.</h2>
          <p>Brunch moves fast. From one screen on the owner&rsquo;s phone: set the wait, write the special on the chalkboard, and tap anything that just sold out.</p>
        </div>
        <SparrowSkillet />
        <p className="ss-demo">Demo café with a sample menu. Nothing is saved.</p>
      </section>

      <section className="section fw rs-fw" id="fair" aria-labelledby="fw-title">
        <div className="section-head">
          <span className="label">Fair warning</span>
          <h2 id="fw-title">If a template is enough, use one.</h2>
          <p>Plenty of places are fine with a template or an all-in-one ordering platform. Hire me when you want a site that feels like your place, with a back office shaped around how you actually run it.</p>
        </div>
        <ol className="fw-rider">
          <li>
            <span className="fw-k">General site builder</span>
            <b>Squarespace</b>
            <span className="fw-p">From $19/mo <small>billed yearly · $25 monthly</small></span>
            <span className="fw-n">Polished templates for any kind of site. You build it.</span>
          </li>
          <li>
            <span className="fw-k">Restaurant platform</span>
            <b>Owner.com</b>
            <span className="fw-p">From $249/mo <small>plus 5% per online order · $499 flat rate</small></span>
            <span className="fw-n">Website, online ordering, app and marketing in one package.</span>
          </li>
          <li className="fw-me">
            <span className="fw-k">Custom, built with you</span>
            <b>LaunchGrid</b>
            <span className="fw-p">A fixed price in writing</span>
            <span className="fw-n">Designed around your place, with a back office on your phone. I build it.</span>
          </li>
        </ol>
        <p className="fw-src">Prices from each company&rsquo;s pricing page, checked Oct 27, 2026, and they change: <a href="https://www.squarespace.com/pricing" target="_blank" rel="noopener">Squarespace<span className="sr-only"> (opens in a new tab)</span></a>, <a href="https://www.owner.com/pricing" target="_blank" rel="noopener">Owner.com<span className="sr-only"> (opens in a new tab)</span></a>. Lowest plan shown; Owner.com also lists a guest order fee.</p>
      </section>

      <section className="encore rs-encore" id="encore" aria-labelledby="en-title">
        <span className="en-beam" aria-hidden="true" />
        <span className="en-pool" aria-hidden="true" />
        <div className="en-in">
          <span className="en-label">Last call</span>
          <h2 id="en-title">Your table&rsquo;s ready.</h2>
          <p>Tell me about your place in a few lines. I reply in writing by the next business day.</p>
          <Link className="btn en-btn" href="/start?kind=restaurant">Start a restaurant project <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </main>
  );
}
