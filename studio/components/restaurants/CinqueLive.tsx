"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const DEMO = "https://cinque-lune-demo.vercel.app";

/**
 * The real Trattoria Cinque Lune demo site, live inside a phone. The frame loads only when the section is
 * about a screen away; until then (and if it can't load) the phone shows a still of the home screen.
 */
export function CinqueLive() {
  const box = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: "700px 0px" });
    io.observe(el);
    // the site is laid out at a real phone width (390 px) and scaled to fit this phone's screen
    const v = view.current;
    const ro = new ResizeObserver(() => {
      if (!v) return;
      const sc = v.clientWidth / 390;
      v.style.setProperty("--s", sc.toFixed(4));
      v.style.setProperty("--fh", `${Math.round(v.clientHeight / sc)}px`);
    });
    if (v) ro.observe(v);
    return () => { io.disconnect(); ro.disconnect(); };
  }, []);

  return (
    <div ref={box} className="cl-phone-wrap">
      <div className="cl-phone">
        <div className="cl-screen">
          <div className="cl-status" aria-hidden="true"><span>9:41</span><span className="cl-island" /><span className="fh-bars"><i /><i /><i /><i /></span></div>
          <div ref={view} className="cl-viewport">
            <Image className="cl-poster" src="/work/cinque-lune-home.webp" alt="" fill sizes="320px" aria-hidden="true" />
            {near ? (
              <iframe
                className="cl-frame"
                data-loaded={loaded}
                src={DEMO}
                title="Trattoria Cinque Lune, the live demo site. Scroll inside it."
                loading="lazy"
                onLoad={() => setLoaded(true)}
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : null}
            {!loaded ? <span className="cl-wait" aria-hidden="true"><i />Seating you</span> : null}
          </div>
          <span className="cl-glare" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
