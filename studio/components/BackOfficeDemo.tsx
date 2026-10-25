"use client";

import { useState } from "react";

type Dish = { n: string; p: string; out: boolean };
type Show = { d: string; v: string; out: boolean };

function Switch({ on, label, onChange }: { on: boolean; label: string; onChange: (v: boolean) => void }) {
  return <button type="button" className="sw" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} />;
}

/** A working sample of the back office. Everything lives in this component's state; nothing is saved. */
export function BackOfficeDemo() {
  const [mode, setMode] = useState<"tr" | "fh">("tr");
  const [dishes, setDishes] = useState<Dish[]>([
    { n: "Cacio e pepe", p: "18", out: false },
    { n: "Branzino al forno", p: "29", out: false },
    { n: "Tiramisù", p: "11", out: false },
  ]);
  const [closed, setClosed] = useState(false);
  const [special, setSpecial] = useState("");
  const [draft, setDraft] = useState("");
  const [shows, setShows] = useState<Show[]>([
    { d: "Fri, Nov 6", v: "Sample venue", out: false },
    { d: "Sat, Nov 21", v: "Sample venue", out: true },
  ]);
  const [newDate, setNewDate] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [flash, setFlash] = useState(0);
  const changed = () => setFlash((f) => f + 1);

  return (
    <>
      <div className="tabs" role="tablist" aria-label="Sample business">
        <button type="button" role="tab" id="t-tr" className="tab" aria-selected={mode === "tr"} aria-controls="demo" onClick={() => setMode("tr")}>Restaurant</button>
        <button type="button" role="tab" id="t-fh" className="tab" aria-selected={mode === "fh"} aria-controls="demo" onClick={() => setMode("fh")}>Band</button>
      </div>
      <div className="demo" id="demo" role="tabpanel" aria-labelledby={mode === "tr" ? "t-tr" : "t-fh"}>
        {mode === "tr" ? (
          <div className="panel">
            <h3>Back office · Tonight</h3>
            {dishes.map((d, i) => (
              <div className="ctl" key={d.n}>
                <span>{d.n} sold out</span>
                <Switch on={d.out} label={`${d.n} sold out`} onChange={(v) => { setDishes(dishes.map((x, j) => (j === i ? { ...x, out: v } : x))); changed(); }} />
              </div>
            ))}
            <div className="ctl"><span>Closed today</span><Switch on={closed} label="Closed today" onChange={(v) => { setClosed(v); changed(); }} /></div>
            <div className="field">
              <label htmlFor="demo-special">Specials banner</label>
              <div className="inline">
                <input id="demo-special" value={draft} maxLength={60} placeholder="Example: Truffle risotto tonight" onChange={(e) => setDraft(e.target.value)} />
                <button type="button" className="btn btn-sm" onClick={() => { setSpecial(draft.trim()); changed(); }}>Post</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSpecial(""); setDraft(""); changed(); }}>Clear</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="panel">
            <h3>Back office · Shows</h3>
            {shows.map((s, i) => (
              <div className="ctl" key={`${s.d}-${i}`}>
                <span>{s.d} sold out</span>
                <Switch on={s.out} label={`${s.d} sold out`} onChange={(v) => { setShows(shows.map((x, j) => (j === i ? { ...x, out: v } : x))); changed(); }} />
              </div>
            ))}
            <div className="field">
              <label htmlFor="demo-date">Add a show</label>
              <div className="inline">
                <input id="demo-date" value={newDate} maxLength={24} placeholder="Date, e.g. Sat, Dec 5" onChange={(e) => setNewDate(e.target.value)} />
                <input aria-label="Venue" value={newVenue} maxLength={30} placeholder="Venue" onChange={(e) => setNewVenue(e.target.value)} />
                <button type="button" className="btn btn-sm" onClick={() => {
                  if (!newDate.trim()) return;
                  setShows([...shows, { d: newDate.trim(), v: newVenue.trim() || "Sample venue", out: false }].slice(-4));
                  setNewDate(""); setNewVenue(""); changed();
                }}>Add</button>
              </div>
            </div>
          </div>
        )}
        <div className="site-preview">
          <div className="bar"><span>yoursite.com</span><span>live preview</span></div>
          <div key={`${mode}-${flash}`} className={`pv ${mode}${flash ? " flash" : ""}`} aria-live="polite">
            {mode === "tr" ? (
              <>
                {special && <div className="ban">Tonight: {special}</div>}
                <div className="nm-site">Cinque Lune</div>
                <div className="hrs">{closed ? "Closed today. See you tomorrow." : "Open tonight · 5 to 10 PM"}</div>
                {dishes.map((d) => (
                  <div key={d.n} className={`dish${d.out ? " out" : ""}`}><span className="nm">{d.n}</span><span>{d.out ? <span className="pill">Sold out</span> : d.p}</span></div>
                ))}
              </>
            ) : (
              <>
                <div className="nm-site">Your band · Shows</div>
                {shows.map((s, i) => (
                  <div key={`${s.d}-${i}`} className="show"><div>{s.d}<small>{s.v}</small></div><span className={`tk${s.out ? " so" : ""}`}>{s.out ? "Sold out" : "Tickets"}</span></div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
      <p className="muted" style={{ fontSize: ".875rem" }}>Working sample · nothing is saved</p>
    </>
  );
}
