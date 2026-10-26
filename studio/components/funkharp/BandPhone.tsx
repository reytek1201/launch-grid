"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";
import { AdminTop, CalendarIcon, InboxIcon, NoteIcon, TabBar } from "./AdminChrome";
import { alertFor, band, inquiryPreview, inquirySubject, receivedLabel, type InquiryRecord } from "./data";

/**
 * Joseph's phone with the Funkharp back office open on the inbox. The top bar, folder chips, letter rows and
 * floating tab bar are copied from the Funkharp admin (app/admin/admin-bar.tsx, app/admin/inbox/mailbox.tsx).
 * When a letter is sealed, the phone buzzes, the band's real alert drops in, and the letter lands on top.
 */
export function BandPhone({ rows, alert, now, buzz }: { rows: InquiryRecord[]; alert: InquiryRecord | null; now: number; buzz: number }) {
  const reduce = useReducedMotion();
  const unread = rows.filter((r) => r.status === "new").length;
  const bookings = rows.filter((r) => r.status === "new" && r.type === "booking").length;
  const notes = rows.filter((r) => r.status === "new" && r.type === "contact").length;
  const a = alert ? alertFor(alert) : null;

  return (
    <div className="fh-phone-wrap" aria-hidden="true">
      <motion.div
        key={buzz}
        className="fh-phone"
        animate={buzz && !reduce ? { x: [0, -5, 5, -4, 4, -2, 2, 0], rotate: [0, -0.6, 0.6, -0.4, 0.4, 0] } : undefined}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <div className="fh-screen bg-cloud text-ink">
          <div className="fh-status"><span>9:41</span><span className="fh-island" /><span className="fh-bars"><i /><i /><i /><i /></span></div>

          <AdminTop />

          {/* folder chips (phone layout of the mailbox) */}
          <div className="flex gap-1.5 overflow-hidden px-2.5 pt-3 [mask-image:linear-gradient(90deg,#000_82%,transparent)]">
            <Chip on icon={<InboxIcon />} label="Inbox" count={unread} />
            <Chip icon={<CalendarIcon />} label="Bookings" count={bookings} />
            <Chip icon={<NoteIcon />} label="Notes" count={notes} />
          </div>

          <LayoutGroup>
            <ul className="grid gap-2 px-2.5 pt-3">
              <AnimatePresence initial={false}>
                {rows.slice(0, 5).map((row) => (
                  <motion.li
                    key={row.id}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, y: -18, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="min-w-0"
                  >
                    <LetterRow row={row} now={now} fresh={row.status === "new"} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </LayoutGroup>

          <TabBar active="Inbox" badge={unread} />

          {/* the band's push alert */}
          <AnimatePresence>
            {a ? (
              <motion.div
                key={alert?.id}
                className="fh-alert"
                initial={reduce ? { opacity: 0 } : { y: -110, opacity: 0, scale: 0.96 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { y: -110, opacity: 0 }}
                transition={{ type: "spring", stiffness: 360, damping: 28 }}
              >
                <span className="fh-alert-icon"><Image src="/funkharp/funkharp-eye.svg" alt="" width={28} height={17} /></span>
                <span className="min-w-0">
                  <span className="fh-alert-top"><b>{band.name}</b><span>now</span></span>
                  <span className="fh-alert-title">{a.title}</span>
                  {a.body ? <span className="fh-alert-body">{a.body}</span> : null}
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <span className="fh-glare" />
        </div>
      </motion.div>
    </div>
  );
}

function Chip({ on = false, icon, label, count }: { on?: boolean; icon: ReactNode; label: string; count: number }) {
  return (
    <span className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs ${on ? "bg-[linear-gradient(120deg,var(--dirt),var(--clay))] font-semibold text-cloud shadow-[0_10px_24px_rgb(140_70_50/0.28)]" : "text-ink/75"}`}>
      {icon}
      <span>{label}</span>
      {count > 0 ? <span className={`ml-0.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-ink ${on ? "bg-cloud" : "bg-clay"}`}>{count}</span> : null}
    </span>
  );
}

function LetterRow({ row, now, fresh }: { row: InquiryRecord; now: number; fresh: boolean }) {
  return (
    <span className={`block min-h-11 rounded-2xl bg-paper px-3 py-2.5 shadow-[0_10px_24px_rgb(28_23_18/0.06)] ${fresh ? "ring-2 ring-clay" : ""}`}>
      <span className="flex items-baseline gap-2">
        <span className={`size-2 shrink-0 translate-y-px rounded-full ${fresh ? "bg-clay" : "bg-transparent"}`} />
        <span className="min-w-0 flex-1 truncate">
          <span className={`font-display text-base leading-none ${fresh ? "text-ink" : "text-ink/50"}`}>{row.name}</span>
          <span className={`font-serif text-xs ${fresh ? "text-ink/75" : "text-ink/40"}`}> {inquirySubject(row)}</span>
        </span>
        <span className="shrink-0 font-sans text-[10px] text-ink/45">{receivedLabel(row.created_at, now)}</span>
      </span>
      <span className="mt-1 block truncate pl-4 font-serif text-xs text-ink/45">{inquiryPreview(row)}</span>
    </span>
  );
}

