"use client";

import { useEffect, useRef, useState } from "react";
import { BandPhone } from "./BandPhone";
import { BookingLetter } from "./BookingLetter";
import { alertFor, band, sampleRows, type InquiryRecord } from "./data";

/**
 * Funkharp's booking letter on the left, Joseph's phone on the right. Seal a letter and it flies over,
 * the phone buzzes with the band's real alert and the letter lands on top of the inbox. Nothing is sent.
 */
export function FunkharpDesk() {
  const [now] = useState(() => Date.now());
  const [rows, setRows] = useState<InquiryRecord[]>(() => sampleRows(now));
  const [alert, setAlert] = useState<InquiryRecord | null>(null);
  const [buzz, setBuzz] = useState(0);
  const [said, setSaid] = useState("");
  const phone = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const onSent = (row: InquiryRecord) => {
    timers.current.forEach((t) => window.clearTimeout(t));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = phone.current;
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    }
    const go = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, reduce ? 0 : ms));
    go(() => { setAlert(row); setBuzz((b) => b + 1); setSaid(`${band.contactPerson.firstName}'s phone: ${alertFor(row).title}. It's at the top of the band's inbox.`); }, 450);
    go(() => setRows((rs) => [row, ...rs.map((r) => (r.status === "new" ? { ...r, status: "read" as const } : r))]), 1250);
    go(() => setAlert(null), 5200);
  };

  return (
    <div className="fh-desk">
      <div className="fh-letter">
        <BookingLetter onSent={onSent} />
        <p className="fh-demo">Demo. Your letter stays on this page and goes nowhere.</p>
      </div>
      <div ref={phone} className="fh-side">
        <p className="fh-cap"><span className="font-sans">Joseph&rsquo;s phone</span> <span className="font-display">the band&rsquo;s back office</span></p>
        <BandPhone rows={rows} alert={alert} now={now} buzz={buzz} />
      </div>
      <p className="sr-only" role="status" aria-live="polite">{said}</p>
    </div>
  );
}
