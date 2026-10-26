"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  band,
  contactReasons,
  emptyBooking,
  emptyContact,
  eventKinds,
  location,
  photos,
  type ContactRequest,
  type InquiryRecord,
  type InquiryType,
} from "./data";
import { SketchMan } from "./SketchMan";

type SubmitInquiryResult = { ok: true } | { ok: false; error: string; fallback?: boolean };

type Stage = "writing" | "sealing" | "sealed";

type Who = { name: string; email: string };

function Blank({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  autoComplete,
  name,
  maxLength,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  name?: string;
  maxLength?: number;
  className?: string;
}) {
  return (
    <label className="inline">
      <span className="sr-only">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        required={required}
        maxLength={maxLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        size={Math.max(placeholder.length, value.length) + 1}
        onChange={(event) => onChange(event.target.value)}
        className={`mx-1 inline-block max-w-full rounded-none border-b-2 border-dashed border-ink/25 bg-transparent px-1 leading-tight text-dirt outline-none placeholder:text-ink/30 focus:border-solid focus:border-clay focus-visible:outline-none max-md:mx-0 max-md:my-1 max-md:block max-md:min-h-12 max-md:w-full ${className}`}
      />
    </label>
  );
}

function Circle({ reduce }: { reduce: boolean | null }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 50"
      preserveAspectRatio="none"
      className="absolute -inset-x-1 -inset-y-0.5 h-[calc(100%+4px)] w-[calc(100%+8px)] overflow-visible"
    >
      <motion.path
        d="M8 26 C 6 8, 104 4, 114 22 C 122 40, 30 50, 10 36 C 2 30, 20 12, 60 8"
        fill="none"
        stroke="var(--clay)"
        strokeWidth="2.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: reduce ? 0 : 0.45, ease: "easeOut" }}
      />
    </svg>
  );
}

function CircledChoice({
  legend,
  name,
  options,
  value,
  onChange,
  lower = false,
}: {
  legend: string;
  name: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  lower?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <fieldset className="mt-5 border-0 p-0 leading-snug md:mt-0 md:leading-normal">
      <legend className="mb-2 p-0 md:float-left md:mr-3 md:mb-0 md:leading-[3.3rem]">{legend}</legend>
      <div className="flex flex-wrap items-center gap-x-1 gap-y-2 md:pt-2.5">
        {options.map((option) => {
          const on = value === option;
          return (
            <label key={option} className="relative cursor-pointer px-3 py-2 md:py-1.5">
              <input
                type="radio"
                name={name}
                value={option}
                checked={on}
                onChange={() => onChange(option)}
                className="peer sr-only"
              />
              <span className={`relative z-10 transition-colors ${on ? "text-dirt" : "text-ink/45 hover:text-ink"}`}>
                {lower ? option.toLowerCase() : option}
              </span>
              <span className="absolute inset-0 rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-dirt" />
              {on ? <Circle reduce={reduce} /> : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Envelope({ name, onDone }: { name: string; onDone: () => void }) {
  return (
    <motion.div
      className="mx-auto w-full max-w-lg"
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [40, 0, 0, -80],
        x: ["0vw", "0vw", "0vw", "60vw"],
        rotate: [0, 0, -2, 14],
        scale: [0.9, 1, 1, 0.8],
      }}
      transition={{ duration: 2.8, times: [0, 0.15, 0.7, 1], ease: "easeInOut" }}
      onAnimationComplete={onDone}
    >
      <div className="relative aspect-[1.6] rounded-md bg-[#eadfca] [perspective:900px] shadow-[0_30px_60px_rgb(28_23_18/0.25)]">
        <span className="absolute inset-0 rounded-md bg-[#e1d4bb] [clip-path:polygon(0_100%,50%_48%,100%_100%)]" />
        <span className="absolute inset-0 rounded-md bg-[#e6dac3] [clip-path:polygon(0_0,48%_52%,0_100%)]" />
        <span className="absolute inset-0 rounded-md bg-[#e6dac3] [clip-path:polygon(100%_0,52%_52%,100%_100%)]" />
        <div className="absolute right-5 bottom-5 left-[38%] font-display text-lg leading-snug text-ink/80 md:text-xl">
          {band.contactPerson.name}
          <br />
          c/o {band.name}
          <br />
          {location}
        </div>
        <div className="absolute top-4 right-4 rotate-3 bg-cloud p-1 shadow-sm">
          <div className="relative h-16 w-14 overflow-hidden outline-2 outline-dashed outline-offset-2 outline-cloud md:h-20 md:w-16">
            <Image src={photos.harmonica.src} alt="" fill sizes="4rem" className="object-cover" />
          </div>
        </div>
        <p className="absolute top-5 left-5 font-sans text-[0.65rem] tracking-[0.2em] text-ink/50 uppercase">
          From {name || "a friend"}
        </p>
        <motion.span
          className="absolute inset-x-0 top-0 h-[55%] origin-top rounded-t-md bg-[#dccdb1] shadow-[0_2px_0_rgb(28_23_18/0.06)] [clip-path:polygon(0_0,100%_0,50%_100%)]"
          initial={{ rotateX: 180 }}
          animate={{ rotateX: 0 }}
          transition={{ delay: 0.45, duration: 0.55, ease: [0.6, 0, 0.3, 1] }}
        />
        <motion.span
          className="absolute top-[55%] left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--clay),var(--dirt)_70%)] font-display text-2xl text-cloud shadow-[0_4px_10px_rgb(28_23_18/0.35)]"
          initial={{ scale: 0, rotate: -40 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1, type: "spring", stiffness: 380, damping: 14 }}
        >
          F
        </motion.span>
      </div>
    </motion.div>
  );
}

/**
 * Funkharp's real booking letter (components/harp/BookingLetter.tsx in the Funkharp repo), unchanged except
 * that "Seal it and send" hands the letter to the demo inbox beside it instead of a server. Nothing is sent.
 */
export function BookingLetter({ onSent }: { onSent: (row: InquiryRecord) => void }) {
  const reduce = useReducedMotion();
  const [type, setType] = useState<InquiryType>("booking");
  const typeName = useId();
  const alertRef = useRef<HTMLParagraphElement>(null);
  const outcome = useRef<SubmitInquiryResult | null>(null);
  const envelopeDone = useRef(false);
  const letter = useRef<InquiryRecord | null>(null);
  const [who, setWho] = useState<Who>({ name: "", email: "" });
  const [booking, setBooking] = useState(emptyBooking);
  const [note, setNote] = useState<ContactRequest>(emptyContact);
  const [stage, setStage] = useState<Stage>("writing");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const choose = (next: InquiryType) => {
    if (next !== type) setType(next);
  };

  const settle = () => {
    const result = outcome.current;
    if (!result) return;
    if (!result.ok && !result.fallback) {
      setError(result.error);
      setSending(false);
      setStage("writing");
      return;
    }
    if (!envelopeDone.current) return;
    setError(null);
    if (letter.current) onSent(letter.current);
    setSending(false);
    setStage("sealed");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    setError(null);
    setSending(true);
    outcome.current = null;
    envelopeDone.current = Boolean(reduce);
    const f = new FormData(event.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim() || null;
    letter.current = {
      id: `demo-${Date.now()}`, type, name: who.name.trim(), email: who.email.trim(),
      venue: get("venue"), city: get("city"), event_date: get("date"), kind: get("kind"), crowd: get("crowd"), notes: get("notes"),
      reason: get("reason"), message: get("message"), status: "new", created_at: new Date().toISOString(),
    };
    if (!reduce) setStage("sealing");
    outcome.current = { ok: true };
    settle();
  };

  useEffect(() => {
    if (error && stage === "writing") alertRef.current?.focus();
  }, [error, stage]);

  const first = who.name.split(" ")[0] || "friend";

  return (
    <div className="relative min-h-[34rem]">
      <AnimatePresence mode="wait" initial={false}>
        {stage === "writing" ? (
          <motion.form
            key="letter"
            onSubmit={onSubmit}
            className="relative rounded-sm bg-paper px-5 pt-10 pb-8 shadow-[0_30px_70px_rgb(28_23_18/0.16)] md:-rotate-[0.6deg] md:px-14 md:pt-14 md:pb-12"
            exit={{ scaleY: 0.2, y: 80, opacity: 0, transition: { duration: 0.45, ease: [0.6, 0, 0.4, 1] } }}
            style={{ transformOrigin: "50% 100%" }}
          >
            <span aria-hidden="true" className="absolute -top-3 left-10 h-7 w-28 -rotate-6 bg-ocean-light/45 shadow-sm" />
            <span aria-hidden="true" className="absolute -top-3 right-12 h-7 w-24 rotate-3 bg-clay/35 shadow-sm" />
            <span aria-hidden="true" className="absolute inset-y-0 left-4 w-px bg-clay/40 md:left-8" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-[19rem] bottom-24 hidden bg-[repeating-linear-gradient(180deg,transparent_0_calc(3.3rem-1px),rgb(27_79_92/0.12)_calc(3.3rem-1px)_3.3rem)] md:top-[22rem] md:block"
            />


            {/* band stationery: the artist's color logo printed at the top of the letter */}
            <header className="relative mb-7 flex items-center gap-4 border-b-[3px] border-double border-clay/45 pb-5 md:mb-9 md:gap-6 md:pb-6">
              <Image
                src="/funkharp/funkharp-logo-color.webp"
                alt={`${band.name} logo`}
                width={744}
                height={900}
                sizes="(min-width: 768px) 92px, 64px"
                className="h-auto w-16 shrink-0 md:w-[92px]"
              />
              <div className="min-w-0">
                <p className="font-sans text-xs tracking-[0.22em] text-dirt uppercase md:text-sm">{band.name} · {location}</p>
                <p className="mt-1.5 font-serif text-base text-ink/60 italic md:text-lg">{band.booking.kicker}</p>
              </div>
            </header>

            <fieldset className="relative border-0 p-0">
              <legend className="font-display text-xl text-ink/85 md:text-2xl">I&apos;d like to…</legend>
              <div className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-2">
                {(
                  [
                    ["booking", `book ${band.name}`],
                    ["contact", "ask something else"],
                  ] as const
                ).map(([value, label]) => {
                  const on = type === value;
                  return (
                    <label key={value} className="relative cursor-pointer px-3 py-2">
                      <input
                        type="radio"
                        name={typeName}
                        value={value}
                        checked={on}
                        onChange={() => choose(value)}
                        className="peer sr-only"
                      />
                      <span className={`relative z-10 transition-colors ${on ? "text-dirt" : "text-ink/45 hover:text-ink"}`}>
                        {label}
                      </span>
                      <span className="absolute inset-0 rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-dirt" />
                      {on ? <Circle reduce={reduce} /> : null}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={type}
                className="motion-reduce:!opacity-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.28 }}
              >
                <p className="relative mt-6 font-sans text-xs tracking-[0.25em] text-dirt uppercase">
                  {type === "booking" ? "Booking request" : "A note"}
                </p>
                <div className="relative mt-5 font-display text-xl leading-snug text-ink/85 md:text-2xl md:leading-[3.3rem]">
                  <p>Hey {band.contactPerson.firstName},</p>
                  {type === "booking" ? (
                    <>
                      <p className="max-md:mt-4">
                        I&apos;m
                        <Blank
                          label="Your name"
                          value={who.name}
                          onChange={(name) => setWho((current) => ({ ...current, name }))}
                          placeholder="your name"
                          required
                          autoComplete="name"
                          name="name"
                          maxLength={200}
                        />
                        <span className="max-md:mt-4 max-md:block">and I&apos;m booking for</span>
                        <Blank
                          label="Venue or event"
                          value={booking.venue}
                          onChange={(venue) => setBooking((current) => ({ ...current, venue }))}
                          placeholder="the venue or event"
                          required
                          name="venue"
                          maxLength={200}
                        />
                        <span className="max-md:mt-4 max-md:block">
                          <span className="max-md:hidden">. </span>
                          We&apos;d love {band.name} on
                        </span>
                        <Blank
                          label="Date"
                          type="date"
                          value={booking.date}
                          onChange={(date) => setBooking((current) => ({ ...current, date }))}
                          placeholder=""
                          className="md:w-[12rem]"
                          name="date"
                        />
                        <span className="max-md:mt-4 max-md:block">in</span>
                        <Blank
                          label="City"
                          value={booking.city}
                          onChange={(city) => setBooking((current) => ({ ...current, city }))}
                          placeholder="what city"
                          autoComplete="address-level2"
                          name="city"
                          maxLength={200}
                        />
                        <span className="max-md:hidden">.</span>
                      </p>
                      <CircledChoice
                        legend="It's a"
                        name="kind"
                        options={eventKinds}
                        value={booking.kind}
                        onChange={(kind) => setBooking((current) => ({ ...current, kind }))}
                        lower
                      />
                      <p className="clear-left max-md:mt-5">
                        We&apos;re expecting about
                        <Blank
                          label="Expected crowd"
                          value={booking.crowd}
                          onChange={(crowd) => setBooking((current) => ({ ...current, crowd }))}
                          placeholder="100"
                          name="crowd"
                          maxLength={200}
                        />
                        <span className="max-md:mt-1 max-md:block">people.</span>
                      </p>
                      <label className="mt-4 block md:mt-1">
                        <span className="sr-only">Anything else</span>
                        <textarea
                          name="notes"
                          value={booking.notes}
                          onChange={(event) => setBooking((current) => ({ ...current, notes: event.target.value }))}
                          rows={3}
                          maxLength={5000}
                          placeholder="Anything else? Set length, the room, the pay..."
                          className="block min-h-24 w-full resize-none bg-transparent text-base leading-relaxed text-dirt outline-none placeholder:text-ink/30 md:min-h-0 md:text-xl md:leading-[3.3rem]"
                        />
                      </label>
                    </>
                  ) : (
                    <>
                      <p className="max-md:mt-4">
                        I&apos;m
                        <Blank
                          label="Your name"
                          value={who.name}
                          onChange={(name) => setWho((current) => ({ ...current, name }))}
                          placeholder="your name"
                          required
                          autoComplete="name"
                          name="name"
                          maxLength={200}
                        />
                      </p>
                      <CircledChoice
                        legend="and I'm writing about"
                        name="reason"
                        options={contactReasons}
                        value={note.reason}
                        onChange={(reason) => setNote((current) => ({ ...current, reason }))}
                      />
                      <label className="clear-left mt-4 block md:mt-1">
                        <span className="sr-only">Your note</span>
                        <textarea
                          name="message"
                          value={note.message}
                          onChange={(event) => setNote((current) => ({ ...current, message: event.target.value }))}
                          rows={4}
                          required
                          maxLength={5000}
                          placeholder="what's on your mind"
                          className="block min-h-28 w-full resize-none bg-transparent text-base leading-relaxed text-dirt outline-none placeholder:text-ink/30 md:min-h-0 md:text-xl md:leading-[3.3rem]"
                        />
                      </label>
                    </>
                  )}
                  <p className="max-md:mt-4">
                    Write me back at
                    <Blank
                      label="Your email"
                      type="email"
                      value={who.email}
                      onChange={(email) => setWho((current) => ({ ...current, email }))}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      name="email"
                      maxLength={200}
                    />
                    <span className="max-md:hidden">.</span>
                  </p>
                </div>

                {error ? (
                  <p ref={alertRef} tabIndex={-1} role="alert" className="relative mt-6 font-serif text-lg text-dirt outline-none">
                    {error}
                  </p>
                ) : null}

                <div className="relative mt-8 flex flex-col items-stretch gap-6 md:flex-row md:flex-wrap md:items-end md:justify-between">
                  <p className="font-display text-3xl text-ink/80 md:-rotate-3 md:text-4xl">
                    <span className="text-ink/40">— </span>
                    {who.name || "you"}
                  </p>
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex min-h-12 w-full scroll-mb-[calc(6.25rem+env(safe-area-inset-bottom)+var(--now-playing,0px))] items-center justify-center gap-3 rounded-full bg-[linear-gradient(120deg,var(--dirt),var(--clay))] px-7 font-semibold text-cloud shadow-lg shadow-dirt/30 transition-transform hover:-translate-y-0.5 disabled:opacity-60 md:w-auto"
                  >
                    {sending ? "Sending…" : "Seal it and send"}
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 6h16v12H4zM4 7l8 6 8-6" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.form>
        ) : stage === "sealing" ? (
          <motion.div key="envelope" className="flex min-h-[34rem] items-center overflow-hidden" exit={{ opacity: 0 }}>
            <Envelope
              name={who.name}
              onDone={() => {
                envelopeDone.current = true;
                settle();
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="sealed"
            role="status"
            className="flex min-h-[34rem] flex-col justify-center"
            initial={reduce ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="letter-done">
              <SketchMan pose="harp" className="sketch-slot-letter" />
              <div className="letter-done-text">
                <p className="font-sans text-xs tracking-[0.25em] text-dirt uppercase">Sealed and stamped</p>
                <p className="font-display text-5xl leading-none md:text-6xl">Thanks, {first}.</p>
                <p className="max-w-md font-serif text-lg break-words text-ink/75">
                  {`It's in ${band.contactPerson.firstName}'s hands. Watch for a reply at ${who.email}.`}
                </p>
                <div className="mt-4 flex flex-col items-stretch gap-4 md:flex-row md:flex-wrap md:items-center">
                  <button
                    type="button"
                    onClick={() => setStage("writing")}
                    className="min-h-12 px-2 font-semibold text-ink/60 underline decoration-clay decoration-2 underline-offset-4 hover:text-ink"
                  >
                    Edit the letter
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
