export type Draft = { name: string; email: string; kind: string; business: string; need: string };

const BAY: Record<string, [string, string]> = { band: ["01", "Band"], restaurant: ["02", "Restaurant"], other: ["03", "Other"] };

/** A boarding pass for the project: fills in as the form is typed, the barcode is drawn from what was typed, stamped when sent. Decorative: the form itself carries every label. */
export function LaunchPass({ d, sent = false }: { d: Draft; sent?: boolean }) {
  const have = [d.name.trim().length > 1, /.+@.+\..+/.test(d.email), d.kind in BAY, d.business.trim().length > 1, d.need.trim().length > 5];
  const n = have.filter(Boolean).length;
  const ready = n === 5;
  const bay = BAY[d.kind];
  const seed = `${d.name}|${d.business}|${d.kind}`;
  let h = 2166136261;
  const bars: number[] = [];
  for (let i = 0; i < 46; i++) {
    h = Math.imul(h ^ (seed.charCodeAt(i % Math.max(seed.length, 1)) || 7 + i), 16777619) >>> 0;
    bars.push(1 + (h % 4));
  }
  let x = 0;
  const rects = bars.map((w, i) => { const r = i % 2 === 0 ? <rect key={i} x={x} y="0" width={w} height="30" /> : null; x += w + 1; return r; });

  return (
    <aside className="lp" data-ready={ready} data-sent={sent} aria-hidden="true">
      <div className="lp-top"><b>Launch pass</b><span>LaunchGrid Studio</span></div>
      <div className="lp-body">
        <div className="lp-row"><small>Passenger</small><span className={d.name.trim() ? "on" : undefined}>{d.name.trim() || "Your name"}</span></div>
        <div className="lp-row"><small>Project</small><span className={d.business.trim() ? "on" : undefined}>{d.business.trim() || "Your business"}</span></div>
        <div className="lp-meta">
          <div><small>Type</small><span>{bay ? bay[1] : "—"}</span></div>
          <div><small>Bay</small><span>{bay ? bay[0] : "—"}</span></div>
          <div><small>Status</small><span className="st">{sent ? "In flight" : ready ? "Cleared" : n ? "Boarding" : "Standby"}</span></div>
        </div>
        <div className="lp-bar">{have.map((ok, i) => <i key={i} data-on={ok} />)}</div>
      </div>
      <div className="lp-perf"><i /><i /></div>
      <div className="lp-stub">
        <svg viewBox={`0 0 ${x} 30`} preserveAspectRatio="none">{rects}</svg>
        <span className="lp-stamp">{sent ? "Sent" : "Cleared to send"}</span>
      </div>
    </aside>
  );
}
