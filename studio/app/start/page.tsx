import type { Metadata } from "next";
import { StartForm } from "@/components/StartForm";
import { copyConfigured } from "@/lib/email";
import { KINDS } from "@/lib/inquiry";

export const metadata: Metadata = {
  title: "Start a project",
  description: "Tell me what you're launching. A few lines is enough, and I reply in writing.",
};

export default async function StartPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const kind = String(sp.kind ?? "");
  const business = String(sp.business ?? "").slice(0, 160);
  const copyOn = copyConfigured();
  return (
    <main className="section form-grid" style={{ borderTop: 0, paddingTop: 24 }}>
      <div className="section-head" style={{ alignContent: "start" }}>
        <span className="label">Start a project</span>
        <h1>Tell me what you&rsquo;re launching.</h1>
        <p className="lede">A few lines is enough. I reply in writing by the next business day. No sales calls.</p>
        <ol className="next-steps" aria-label="What happens next">
          {copyOn && <li><b>1</b><span>You get a copy of your message by email.</span></li>}
          <li><b>{copyOn ? 2 : 1}</b><span>I reply in writing by the next business day, usually with a few questions.</span></li>
          <li><b>{copyOn ? 3 : 2}</b><span>You get a written proposal with a price and a launch date.</span></li>
        </ol>
      </div>
      <StartForm initialKind={kind in KINDS ? kind : ""} initialBusiness={business} copyOn={copyOn} />
    </main>
  );
}
