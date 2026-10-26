"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";

/**
 * The fan list, as Josie Calloway (a demo country artist, not a real person). Her site's "Join the list"
 * form feeds the fan count on her phone; her phone's "Write to your fans" sends the new-single email,
 * which lands in a fan's inbox over her site. Sample data, nothing is sent or saved.
 */

type Fan = { id: string; email: string; when: string; fresh?: boolean };

const START_COUNT = 642;
const SUBJECT = "New single out Friday";
const MESSAGE = "Y'all, Gravel & Gold is out this Friday. I wrote it on my granddaddy's porch the week the fence went up. You're hearing it here first.";

const mask = (e: string) => { const [u, d] = e.split("@"); return `${(u || "fan").slice(0, 1)}•••@${d || "mail.com"}`; };

export function JosieDesk() {
  const reduce = useReducedMotion();
  const ids = useId();
  const [count, setCount] = useState(START_COUNT);
  const [fans, setFans] = useState<Fan[]>([
    { id: "a", email: "m•••@gmail.com", when: "12 min ago" },
    { id: "b", email: "t•••@icloud.com", when: "1 hour ago" },
    { id: "c", email: "r•••@yahoo.com", when: "Yesterday" },
  ]);
  const [joined, setJoined] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ subject: string; message: string; art: boolean } | null>(null);
  const [mailOpen, setMailOpen] = useState(false);
  const [say, setSay] = useState("");
  const site = useRef<HTMLDivElement>(null);
  const phone = useRef<HTMLDivElement>(null);
  const backBtn = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, reduce ? 0 : ms));
  const bring = (el: HTMLElement | null) => {
    if (!el || window.innerWidth >= 1024) return;
    const r = el.getBoundingClientRect();
    if (r.top < 0 || r.top > window.innerHeight * 0.5) el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
  };

  const onJoin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    setJoined(true);
    setSay("You're on Josie's list. Her phone shows a new fan.");
    later(() => {
      setCount((c) => c + 1);
      setFans((f) => [{ id: `n${Date.now()}`, email: mask(email), when: "Just now", fresh: true }, ...f.map((x) => ({ ...x, fresh: false }))].slice(0, 4));
      bring(phone.current);
    }, 500);
  };

  const onSend = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    const f = new FormData(e.currentTarget);
    const mail = { subject: String(f.get("subject") ?? "").trim() || SUBJECT, message: String(f.get("message") ?? "").trim() || MESSAGE, art: f.get("art") === "on" };
    setSending(true);
    later(() => {
      setSending(false);
      setSent(mail);
      setMailOpen(false);
      setSay(`Sent to ${count} fans. The email is in a fan's inbox.`);
      bring(site.current);
      later(() => setMailOpen(true), 1100);
    }, 800);
  };

  useEffect(() => { if (mailOpen) backBtn.current?.focus({ preventScroll: true }); }, [mailOpen]);

  return (
    <div className="jc-desk">
      {/* her public site */}
      <div ref={site} className="jc-site">
        <p className="jc-cap"><span>Her site</span> <b>where fans join the list</b></p>
        <div className="jc-browser" role="region" aria-label="Josie Calloway's site">
          <div className="jc-chrome" aria-hidden="true"><i /><i /><i /><span>Josie Calloway</span></div>
          <div className="jc-page">
            <div className="jc-banner" aria-hidden="true"><Image src="/josie/silhouette.webp" alt="" fill sizes="(min-width: 1024px) 640px, 100vw" /></div>
            <div className="jc-id">
              <Image className="jc-ink" src="/josie/emblem-ink.webp" alt="" width={84} height={84} />
              <p className="jc-name" aria-hidden="true">Josie Calloway</p>
            </div>
            <div className="jc-single">
              <span className="jc-cover"><Image src="/josie/cover.webp" alt="Cover art for Gravel & Gold: a fence line across a golden field at sunset" fill sizes="120px" /></span>
              <span><small>New single · out Friday</small><b>Gravel &amp; Gold</b></span>
            </div>
            <div className="jc-join">
              {joined ? (
                <p className="jc-welcome">You&rsquo;re on the list. Welcome, friend.<small>Look at her phone: you just joined.</small></p>
              ) : (
                <form onSubmit={onJoin}>
                  <label htmlFor={`${ids}-e`}>Hear new songs first. Join the list.</label>
                  <div className="jc-row">
                    <input id={`${ids}-e`} name="email" type="email" required autoComplete="off" placeholder="you@example.com" />
                    <button type="submit">Count me in</button>
                  </div>
                </form>
              )}
            </div>

            {/* a fan's inbox slides over her site once the email is sent */}
            <AnimatePresence>
              {sent ? (
                <motion.div
                  key="mail"
                  className="jc-mail"
                  role="region"
                  aria-label="A fan's inbox"
                  initial={reduce ? { opacity: 0 } : { y: "100%" }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { y: "100%" }}
                  transition={{ type: "spring", stiffness: 160, damping: 24 }}
                >
                  <div className="jc-mail-top"><b>A fan&rsquo;s inbox</b><button ref={backBtn} type="button" onClick={() => { setSent(null); setMailOpen(false); }}>Back to her site</button></div>
                  {!mailOpen ? (
                    <ul className="jc-inbox">
                      <li className="new"><i aria-hidden="true" /><span><b>Josie Calloway</b><em>{sent.subject}</em></span><time>now</time></li>
                      <li><i aria-hidden="true" /><span><b>Bank alerts</b><em>Your statement is ready</em></span><time>9:12</time></li>
                      <li><i aria-hidden="true" /><span><b>Groceries</b><em>Order delivered</em></span><time>Sat</time></li>
                    </ul>
                  ) : (
                    <motion.article className="jc-email" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="jc-email-head" aria-hidden="true"><Image src="/josie/stage.webp" alt="" fill sizes="(min-width: 1024px) 600px, 100vw" /></div>
                      <div className="jc-email-body">
                        <Image className="jc-email-mark" src="/josie/emblem-ink.webp" alt="" width={56} height={56} />
                        <p className="jc-email-from">From Josie Calloway</p>
                        <h3>{sent.subject}</h3>
                        <p className="jc-email-text">{sent.message}</p>
                        {sent.art ? <span className="jc-email-art"><Image src="/josie/cover.webp" alt="Cover art for Gravel & Gold: a fence line across a golden field at sunset" fill sizes="(min-width: 1024px) 360px, 80vw" /></span> : null}
                        <span className="jc-email-btn" aria-hidden="true">Listen first</span>
                        <p className="jc-email-foot">You joined Josie&rsquo;s list on her site. Unsubscribe anytime.</p>
                      </div>
                    </motion.article>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* her phone */}
      <div ref={phone} className="jc-side">
        <p className="jc-cap"><span>Her phone</span> <b>the fan list, in the back office</b></p>
        <div className="fh-phone-wrap">
          <div className="fh-phone jc-phone">
            <div className="fh-screen jc-screen">
              <div className="fh-status jc-status" aria-hidden="true"><span>9:41</span><span className="fh-island" /><span className="fh-bars"><i /><i /><i /><i /></span></div>
              <div className="jc-top" aria-hidden="true"><Image src="/josie/emblem-ink.webp" alt="" width={24} height={24} /><b>Josie Calloway</b><span>Admin</span></div>
              <div className="bs-scroll jc-scroll">
                <p className="jc-over">Fans</p>
                <div className="jc-count" aria-hidden="true">
                  <motion.b key={count} initial={reduce || count === START_COUNT ? false : { y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{count}</motion.b>
                  <span>on your list</span>
                </div>
                <ul className="jc-fans" aria-hidden="true">
                  <AnimatePresence initial={false}>
                    {fans.map((f) => (
                      <motion.li key={f.id} layout={!reduce} initial={reduce ? false : { opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className={f.fresh ? "fresh" : undefined}>
                        <i aria-hidden="true" />{f.email}<time>{f.when}</time>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <form className="jc-compose" onSubmit={onSend} aria-labelledby={`${ids}-w`}>
                  <p id={`${ids}-w`} className="jc-compose-h">Write to your fans</p>
                  <label htmlFor={`${ids}-s`}>Subject</label>
                  <input id={`${ids}-s`} name="subject" type="text" maxLength={70} defaultValue={SUBJECT} />
                  <label htmlFor={`${ids}-m`}>Message</label>
                  <textarea id={`${ids}-m`} name="message" rows={4} maxLength={400} defaultValue={MESSAGE} />
                  <label className="jc-check"><input type="checkbox" name="art" defaultChecked /> Add the single&rsquo;s artwork</label>
                  <button type="submit" disabled={sending}>{sending ? "Sending…" : sent ? `Sent to ${count} fans ✓` : `Send to ${count} fans`}</button>
                </form>
              </div>
              <div className="jc-tabs" aria-hidden="true">
                {["Shows", "Music", "Fans", "Videos", "Inbox"].map((t) => <span key={t} className={t === "Fans" ? "on" : undefined}>{t}</span>)}
              </div>
              <span className="fh-glare" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{say}</p>
    </div>
  );
}
