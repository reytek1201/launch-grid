export function ago(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
  return `${Math.round(mins / 1440)} d ago`;
}
export const KIND = { reservation: "Table", event: "Event", contact: "Postcard" } as const;
export type Req = { id: string; kind: keyof typeof KIND; summary: string; fields: Record<string, string>; status: "new" | "seen" | "done"; created_at: string };
