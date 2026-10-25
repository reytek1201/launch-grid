import { sendRequest } from "@/app/actions";

export type InquiryKind = "reservation" | "event" | "contact";

export type Inquiry = {
  kind: InquiryKind;
  /** one line for an inbox: "Table for 4, Sat Oct 31, 7 pm" */
  summary: string;
  fields: Record<string, string>;
};

export type InquiryResult = { delivered: boolean };

/*
 * The one place a request leaves the browser. It goes to a server action (app/actions.ts), which
 * writes it to the restaurant's inbox. If the inbox is not configured or cannot be reached the result is
 * { delivered: false } and the forms offer "Email this request" / "Call to confirm" instead.
 */
export async function submitInquiry(inquiry: Inquiry): Promise<InquiryResult> {
  try {
    return await sendRequest(inquiry);
  } catch {
    return { delivered: false };
  }
}

export function mailtoHref(to: string, subject: string, body: string) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Plain-text body for an email draft from the form fields. */
export function mailBody(lines: [string, string][]) {
  return lines.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n");
}
