/**
 * The bits of Funkharp's own data the booking letter and the back-office inbox use, copied from the
 * Funkharp repo (lib/band.ts, lib/booking.ts, lib/admin-inbox.ts). Nothing here talks to a server.
 */

export const band = {
  name: "Funkharp",
  contactPerson: { name: "Joseph Randle", firstName: "Joseph" },
  booking: {
    eventKinds: ["Bar or club", "Festival", "House party", "Private party", "Something else"],
    kicker: "Bars, festivals, house parties & the street",
    contactReasons: ["Press", "Collab", "Just saying hi", "Something else"],
  },
} as const;

export const location = "St. Augustine, FL";

export const photos = {
  harmonica: { src: "/funkharp/harmonica.jpg" },
};

export const eventKinds = band.booking.eventKinds;
export const contactReasons = band.booking.contactReasons;

export type InquiryType = "booking" | "contact";

export type BookingRequest = { name: string; email: string; venue: string; city: string; date: string; kind: string; crowd: string; notes: string };
export const emptyBooking: BookingRequest = { name: "", email: "", venue: "", city: "", date: "", kind: "", crowd: "", notes: "" };

export type ContactRequest = { name: string; email: string; reason: string; message: string };
export const emptyContact: ContactRequest = { name: "", email: "", reason: "Something else", message: "" };

export type InquiryStatus = "new" | "read" | "archived";

export type InquiryRecord = {
  id: string; type: InquiryType; name: string; email: string;
  venue: string | null; city: string | null; event_date: string | null; kind: string | null; crowd: string | null; notes: string | null;
  reason: string | null; message: string | null; status: InquiryStatus; created_at: string;
};

export function receivedLabel(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const minutes = Math.floor((now - then) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24 && nyDay(then) === nyDay(now)) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  if (nyDay(then) === nyDay(now - 24 * 60 * 60 * 1000)) return "Yesterday";
  return new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" }).format(then);
}

export function inquiryPreview(row: InquiryRecord): string {
  const source = row.type === "booking" ? row.notes : row.message;
  const line = (source ?? "").split(/\r?\n/).find((part) => part.trim())?.trim() ?? "";
  if (line) return line;
  return row.type === "booking" ? "Booking request" : "No message";
}

export function inquirySubject(row: InquiryRecord): string {
  if (row.type === "booking") {
    const when = row.event_date ? shortDate(row.event_date) : "";
    return `Booking: ${row.venue || row.name}${when ? `, ${when}` : ""}`;
  }
  return `Note: ${row.reason || "Something else"}`;
}

/** The push alert the band's phones get for a new letter (Funkharp app/(site)/booking/actions.ts). */
export function alertFor(row: InquiryRecord) {
  return {
    title: row.type === "booking" ? `Booking request from ${row.name}` : `Note from ${row.name}`,
    body: row.type === "booking"
      ? [row.venue, row.city, row.event_date ? prettyDate(row.event_date) : null].filter(Boolean).join(" · ")
      : `${row.reason ?? "Something else"}: ${(row.message ?? "").slice(0, 120)}`,
  };
}

export function shortDate(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function prettyDate(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function nyDay(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(ms);
}

/** Sample letters already in the inbox. Made-up names. */
export function sampleRows(now: number): InquiryRecord[] {
  const ago = (h: number) => new Date(now - h * 3600_000).toISOString();
  return [
    { id: "s1", type: "booking", name: "Dana Ruiz", email: "", venue: "The Ale House", city: "Jacksonville", event_date: null, kind: "Bar or club", crowd: "150", notes: "Saturday night, two sets, we have a PA.", reason: null, message: null, status: "read", created_at: ago(26) },
    { id: "s2", type: "contact", name: "Theo Park", email: "", venue: null, city: null, event_date: null, kind: null, crowd: null, notes: null, reason: "Press", message: "Can we feature the new single on our blog?", status: "read", created_at: ago(30) },
    { id: "s3", type: "booking", name: "Kim Alvarez", email: "", venue: "Backyard birthday", city: "St. Augustine", event_date: null, kind: "House party", crowd: "60", notes: "Turning 40, the whole street is invited.", reason: null, message: null, status: "read", created_at: ago(76) },
  ];
}
