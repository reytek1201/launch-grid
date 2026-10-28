"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { track } from "@/lib/track";
import { startProject } from "@/app/actions";
import { EMPTY, KINDS, NEED_MAX, TIMINGS, type FormState } from "@/lib/inquiry";
import { Mark, type MarkHandle } from "./Mark";
import { LaunchPass, type Draft } from "./LaunchPass";

const REF_KEY = "lg-ref";

/** The ?ref= tag a client site's footer credit adds, remembered for the visit (see RefCapture). */
function currentRef() {
  try {
    return (new URLSearchParams(window.location.search).get("ref") ?? sessionStorage.getItem(REF_KEY) ?? "").slice(0, 40);
  } catch {
    return "";
  }
}

/** Mounted once in the layout: keeps ?ref= for the rest of the visit, so it survives the walk to the form. */
export function RefCapture() {
  useEffect(() => {
    try {
      const r = new URLSearchParams(window.location.search).get("ref");
      if (r) sessionStorage.setItem(REF_KEY, r.slice(0, 40));
    } catch {}
  }, []);
  return null;
}

export function StartForm({ initialKind = "", initialBusiness = "", initialNeed = "", copyOn = false, ticket = false }: { initialKind?: string; initialBusiness?: string; initialNeed?: string; copyOn?: boolean; ticket?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(startProject, { status: "idle" });
  const opened = useRef(0);
  const waited = useRef<HTMLInputElement>(null);
  const mark = useRef<MarkHandle>(null);
  const sentBox = useRef<HTMLDivElement>(null);
  const refInput = useRef<HTMLInputElement>(null);
  const formEl = useRef<HTMLFormElement>(null);
  const [needLen, setNeedLen] = useState(initialNeed.length);
  const [draft, setDraft] = useState<Draft>({ name: "", email: "", kind: initialKind, business: initialBusiness, need: initialNeed });
  const touchedKind = useRef(false);

  // a bay locked in above ("Pick your bay") sets the type here, unless the visitor already chose one
  useEffect(() => {
    const on = (ev: Event) => {
      const k = (ev as CustomEvent<string>).detail;
      const radio = formEl.current?.querySelector<HTMLInputElement>(`input[name="kind"][value="${k}"]`);
      if (!radio || touchedKind.current) return;
      radio.checked = true;
      setDraft((d) => ({ ...d, kind: k }));
    };
    window.addEventListener("lg:kind", on);
    return () => window.removeEventListener("lg:kind", on);
  }, []);

  useEffect(() => { opened.current = Date.now(); }, []);
  useEffect(() => {
    if (state.status === "sent") {
      track("Project form sent");
      mark.current?.arm();
      requestAnimationFrame(() => { mark.current?.play(); sentBox.current?.focus(); });
    }
  }, [state]);

  if (state.status === "sent") {
    return (
      <>
      {ticket && <LaunchPass d={draft} sent />}
      <div className="card" ref={sentBox} tabIndex={-1} role="status" aria-live="polite">
        <div className="sent">
          <div className="mark-box"><Mark ref={mark} armed label={null} /></div>
          <div>
            <h3>Received.</h3>
            <p>Thanks, {state.name}. {state.copy ? <>A copy is on its way to {state.email}. </> : null}I&rsquo;ll reply in writing by the next business day.</p>
          </div>
        </div>
      </div>
      </>
    );
  }

  const v = state.status === "idle" ? { ...EMPTY, kind: initialKind, business: initialBusiness, need: initialNeed } : state.values;
  const e = state.status === "invalid" ? state.errors : {};
  const err = (k: keyof typeof e) => (e[k] ? { "aria-invalid": true as const, "aria-describedby": `${k}-err` } : {});

  const onInput = (ev: React.FormEvent<HTMLFormElement>) => {
    const t = ev.target as HTMLInputElement;
    if (t.name === "kind") touchedKind.current = true;
    const f = new FormData(ev.currentTarget);
    setDraft({ name: String(f.get("name") ?? ""), email: String(f.get("email") ?? ""), kind: String(f.get("kind") ?? ""), business: String(f.get("business") ?? ""), need: String(f.get("need") ?? "") });
  };

  return (
    <>
    {ticket && <LaunchPass d={draft} />}
    <form
      ref={formEl}
      onInput={onInput}
      className="card"
      action={action}
      noValidate
      key={state.status === "idle" ? "idle" : JSON.stringify(v)}
      onSubmit={() => {
        if (waited.current) waited.current.value = String(Date.now() - opened.current);
        if (refInput.current) refInput.current.value = currentRef();
      }}
    >
      {state.status === "error" && <p className="form-error" role="alert">{state.message}</p>}
      {state.status === "invalid" && <p className="sr-only" role="alert">Some fields need a fix. They are marked below.</p>}

      <div className="field">
        <label htmlFor="f-name">Your name</label>
        <input id="f-name" name="name" autoComplete="name" defaultValue={v.name} maxLength={120} required {...err("name")} />
        {e.name && <p className="err" id="name-err">{e.name}</p>}
      </div>

      <div className="field">
        <label htmlFor="f-email">Email</label>
        <input id="f-email" name="email" type="email" autoComplete="email" inputMode="email" defaultValue={v.email} maxLength={200} required aria-describedby={e.email ? "email-err email-help" : "email-help"} aria-invalid={e.email ? true : undefined} />
        <p className="help" id="email-help">I reply here and send you a copy of this form.</p>
        {e.email && <p className="err" id="email-err">{e.email}</p>}
      </div>

      <fieldset className="field" aria-describedby={e.kind ? "kind-err" : undefined}>
        <legend>What are you launching?</legend>
        <div className="kinds">
          {Object.entries(KINDS).map(([k, label]) => (
            <label className="kind" key={k}>
              <input type="radio" name="kind" value={k} defaultChecked={v.kind === k} required />
              <span>{label}</span>
            </label>
          ))}
        </div>
        {e.kind && <p className="err" id="kind-err">{e.kind}</p>}
      </fieldset>

      <div className="field">
        <label htmlFor="f-business">Name of the band, restaurant or business</label>
        <input id="f-business" name="business" defaultValue={v.business} maxLength={160} required {...err("business")} />
        {e.business && <p className="err" id="business-err">{e.business}</p>}
      </div>

      <div className="field">
        <label htmlFor="f-link">Current site or socials <span className="muted">(optional)</span></label>
        <input id="f-link" name="link" type="url" inputMode="url" placeholder="https://" defaultValue={v.link} maxLength={300} aria-describedby={e.link ? "link-err link-help" : "link-help"} aria-invalid={e.link ? true : undefined} />
        <p className="help" id="link-help">Paste one link if you have it.</p>
        {e.link && <p className="err" id="link-err">{e.link}</p>}
      </div>

      <div className="field">
        <label htmlFor="f-need">What do you need?</label>
        <textarea id="f-need" name="need" defaultValue={v.need} maxLength={NEED_MAX} required onChange={(ev) => setNeedLen(ev.target.value.length)} aria-describedby={e.need ? "need-err need-help" : "need-help"} aria-invalid={e.need ? true : undefined} />
        <p className="help" id="need-help">A few lines in your own words. {needLen > 0 ? `${needLen} of ${NEED_MAX}` : `Up to ${NEED_MAX} characters`}.</p>
        {e.need && <p className="err" id="need-err">{e.need}</p>}
      </div>

      <div className="field">
        <label htmlFor="f-timing">When would you like to launch?</label>
        <select id="f-timing" name="timing" defaultValue={v.timing} aria-describedby="timing-help">
          <option value="">Pick one</option>
          {TIMINGS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <p className="help" id="timing-help">This helps me plan. Your proposal sets the real date.</p>
      </div>

      <div className="trap" aria-hidden="true">
        <label htmlFor="f-website">Leave this empty</label>
        <input id="f-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="waited" ref={waited} defaultValue="" />
      <input type="hidden" name="ref" ref={refInput} defaultValue="" />

      <button className="btn" type="submit" disabled={pending}>{pending ? "Sending…" : "Start a project"}</button>
      <p className="help">No calls. {copyOn ? "You get an email copy of exactly what you sent." : "Everything stays in writing."} <a href="/privacy">How I use what you send</a></p>
    </form>
    </>
  );
}
