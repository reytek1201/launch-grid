import type { SiteData } from "@/lib/types";
import { hoursRows } from "@/lib/hours";

export function HoursReceipt({ site, className = "", as: Heading = "h3" }: { site: SiteData; className?: string; as?: "h2" | "h3" }) {
  const rows = hoursRows(site);
  return (
    <div className={`bg-paper text-espresso shadow-md [clip-path:polygon(0_0,100%_0,100%_calc(100%-10px),97%_100%,94%_calc(100%-10px),91%_100%,88%_calc(100%-10px),85%_100%,82%_calc(100%-10px),79%_100%,76%_calc(100%-10px),73%_100%,70%_calc(100%-10px),67%_100%,64%_calc(100%-10px),61%_100%,58%_calc(100%-10px),55%_100%,52%_calc(100%-10px),49%_100%,46%_calc(100%-10px),43%_100%,40%_calc(100%-10px),37%_100%,34%_calc(100%-10px),31%_100%,28%_calc(100%-10px),25%_100%,22%_calc(100%-10px),19%_100%,16%_calc(100%-10px),13%_100%,10%_calc(100%-10px),7%_100%,4%_calc(100%-10px),1%_100%,0_calc(100%-10px))] px-6 pb-8 pt-6 ${className}`}>
      <Heading className="text-center font-hand text-3xl text-terracotta-deep">Orari · Hours</Heading>
      <dl className="mt-4 space-y-2 border-t border-dashed border-espresso/40 pt-4 font-mono text-sm">
        {rows.map((r) => (
          <div key={r.days} className="flex justify-between gap-4">
            <dt>{r.days}</dt>
            <dd className="whitespace-pre-line text-right">{r.text}</dd>
          </div>
        ))}
      </dl>
      {site.closures.length > 0 && (
        <div className="mt-4 border-t border-dashed border-espresso/40 pt-3 font-mono text-xs">
          <p className="font-semibold">Closed on</p>
          <ul className="mt-1">
            {site.closures.map((c) => (
              <li key={c.date}>{new Date(c.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {c.label}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
