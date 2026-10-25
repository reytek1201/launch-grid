export const KINDS = { band: "A band or artist", restaurant: "A restaurant", other: "Something else" } as const;
export type Kind = keyof typeof KINDS;
export const TIMINGS = ["As soon as possible", "Within a month", "No rush"] as const;

export type Field = "name" | "email" | "kind" | "business" | "link" | "need";
export type FormValues = { name: string; email: string; kind: string; business: string; link: string; need: string; timing: string };
export type FormState =
  | { status: "idle" }
  | { status: "invalid"; errors: Partial<Record<Field, string>>; values: FormValues }
  | { status: "error"; message: string; values: FormValues }
  | { status: "sent"; name: string; email: string; copy: boolean };

export const EMPTY: FormValues = { name: "", email: "", kind: "", business: "", link: "", need: "", timing: "" };
export const NEED_MIN = 20;
export const NEED_MAX = 600;
