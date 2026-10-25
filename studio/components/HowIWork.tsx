"use client";

import { useEffect, useRef } from "react";

/**
 * "Everything in writing." The three steps, each with the actual piece of paper it produces:
 * the form fills itself in, the proposal gets signed in cobalt ink, the feedback thread types itself out.
 * Each document plays once when it scrolls into view. All sample content.
 */
export function HowIWork() {
  const root = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { (e.target as HTMLElement).dataset.in = "true"; io.unobserve(e.target); }
    }, { threshold: 0.4 });
    el.querySelectorAll(".pp").forEach((d) => io.observe(d));
    return () => io.disconnect();
  }, []);

  return (
    <ol ref={root} className="paper-trail">
      <li className="pt-step">
        <div className="pt-text"><span className="n">01</span><div><b>You fill in the project form.</b><span>A few questions about your business and what you need.</span></div></div>
        <div className="pp pp-form" aria-hidden="true">
          <span className="pp-clip" />
          <span className="pp-head"><b>Start a project</b><i>launchgrid.studio</i></span>
          <span className="pp-field" style={{ ["--d" as string]: 0 }}><small>Your name</small><span className="ty">Maria</span></span>
          <span className="pp-field" style={{ ["--d" as string]: 1 }}><small>Business</small><span className="ty">Bluebird Diner</span></span>
          <span className="pp-field" style={{ ["--d" as string]: 2 }}><small>What you need</small><span className="ty">Our menu, hours and reservations.</span></span>
          <span className="pp-sent">Sent ✓</span>
        </div>
      </li>
      <li className="pt-step">
        <div className="pt-text"><span className="n">02</span><div><b>You get a written proposal.</b><span>A fixed price, what&rsquo;s included and a launch date.</span></div></div>
        <div className="pp pp-prop" aria-hidden="true">
          <span className="pp-clip" />
          <span className="pp-head"><b>Proposal</b><i>Bluebird Diner</i></span>
          <span className="pp-list"><span>✓ Site with your menu and hours</span><span>✓ Reservation requests</span><span>✓ Back office on your phone</span></span>
          <span className="pp-terms"><span>Fixed price</span><i>Set before work starts</i><span>Launch date</span><i>On this page</i></span>
          <span className="pp-sign">
            <svg viewBox="0 0 220 60"><path pathLength="1" d="M8 42 C 18 10, 30 10, 30 34 S 44 58, 52 30 S 64 8, 70 36 C 74 52, 84 44, 90 30 C 96 18, 102 40, 110 34 C 120 26, 124 44, 136 36 C 150 26, 160 30, 176 28 S 200 22, 212 18" /></svg>
            <small>Agreed</small>
          </span>
          <span className="pp-stamp">Agreed in writing</span>
        </div>
      </li>
      <li className="pt-step">
        <div className="pt-text"><span className="n">03</span><div><b>Feedback happens in one thread.</b><span>Comments go in writing, so nothing gets lost.</span></div></div>
        <div className="pp pp-thread" aria-hidden="true">
          <span className="pp-clip" />
          <span className="pp-head"><b>Bluebird Diner · site</b><i>1 thread</i></span>
          <span className="msg them" style={{ ["--d" as string]: 0 }}><span>Can the specials go above the menu?</span><time>Tue 9:14</time></span>
          <span className="msg me" style={{ ["--d" as string]: 1 }}><span>Done. The preview is updated.</span><time>Tue 10:02</time></span>
          <span className="msg them" style={{ ["--d" as string]: 2 }}><span>Perfect, thank you!</span><time>Tue 10:05</time></span>
          <span className="pp-kept">Saved in the thread</span>
        </div>
      </li>
    </ol>
  );
}
