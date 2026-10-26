import type { ReactNode } from "react";
import { band } from "./data";

/** Pieces of the Funkharp admin chrome (app/admin/admin-bar.tsx), drawn inside a demo phone. Not links. */
export function AdminTop() {
  return (
    <div className="flex min-h-12 items-center gap-2 border-b border-white/10 bg-ink px-3 text-cloud">
      <span className="flex items-baseline gap-2">
        <span className="font-display text-xl leading-none">{band.name}</span>
        <span className="font-sans text-[0.6rem] tracking-[0.18em] text-cloud/55 uppercase">Admin</span>
      </span>
      <span className="ml-auto inline-flex min-h-8 items-center rounded-full border border-cloud/25 px-2.5 text-xs text-cloud">Site</span>
    </div>
  );
}

const TABS: [string, () => ReactNode][] = [["Inbox", () => <InboxIcon size="size-5" />], ["Shows", () => <ShowsIcon />], ["Music", () => <MusicIcon />], ["Videos", () => <VideosIcon />], ["Fans", () => <FansIcon />]];

export function TabBar({ active, badge = 0 }: { active: string; badge?: number }) {
  return (
    <div className="fh-tabs absolute inset-x-2 bottom-2 z-20 rounded-3xl border border-white/40 bg-ink/80 text-cloud shadow-[0_12px_40px_rgb(28_23_18/0.35)] backdrop-blur-xl" aria-hidden="true">
      <div className="flex">
        {TABS.map(([label, Icon]) => (
          <span key={label} className="relative isolate flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[10px]">
            {label === active ? <span className="absolute inset-1 -z-10 rounded-2xl bg-[linear-gradient(140deg,var(--dirt),var(--clay))]" /> : null}
            <span className="relative">
              <Icon />
              {label === "Inbox" && badge ? <span className="absolute -top-1.5 -right-2.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-cloud px-1 text-[10px] font-semibold text-ink">{badge}</span> : null}
            </span>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function IconFrame({ children, size = "size-4" }: { children: ReactNode; size?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className={`${size} shrink-0`} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}
export const InboxIcon = ({ size = "size-4" }: { size?: string }) => <IconFrame size={size}><path d="M3 13h5l2 3h4l2-3h5v6H3z" /><path d="M3 13 6 4h12l3 9" /></IconFrame>;
export const CalendarIcon = () => <IconFrame><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></IconFrame>;
export const NoteIcon = () => <IconFrame><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></IconFrame>;
const ShowsIcon = () => <IconFrame size="size-5"><path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4zM12 7v10" /></IconFrame>;
const MusicIcon = () => <IconFrame size="size-5"><path d="M9 18V5l11-2v13" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></IconFrame>;
const VideosIcon = () => <IconFrame size="size-5"><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></IconFrame>;
const FansIcon = () => <IconFrame size="size-5"><path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14a6.5 6.5 0 0 1 3.5 6" /></IconFrame>;
