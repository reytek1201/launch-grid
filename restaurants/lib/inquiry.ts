export type InquiryKind = "reservation" | "event" | "contact";

export type Inquiry = {
  kind: InquiryKind;
  /** one line for an inbox: "Table for 4, Sat Oct 31, 7 pm" */
  summary: string;
  fields: Record<string, string>;
};

export type InquiryResult = { delivered: boolean };

/*
 * The one place a request leaves the browser.
 * Demo build: nothing is sent, the visitor gets an email/phone fallback instead.
 * Backend phase: POST the inquiry to the restaurant's inbox endpoint (Supabase or similar)
 * and return { delivered: true }. The forms already handle both outcomes.
 */
export async function submitInquiry(inquiry: Inquiry): Promise<InquiryResult> {
  void inquiry;
  await new Promise((r) => setTimeout(r, 450));
  return { delivered: false };
}

export function mailtoHref(to: string, subject: string, body: string) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Plain-text body for an email draft from the form fields. */
export function mailBody(lines: [string, string][]) {
  return lines.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n");
}
