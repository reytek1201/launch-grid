import "server-only";

/**
 * Email through Resend's REST API (no extra package), same setup as Funkharp.
 *   RESEND_API_KEY   required; without it nothing is sent and nothing breaks
 *   EMAIL_FROM       "Your Restaurant <requests@yourdomain.com>" once the domain is verified in Resend.
 *                    Until then Resend's test sender works, but only to the Resend account owner.
 *   EMAIL_ALERTS_TO  who is told about each new request (comma-separated list allowed). Nothing is sent without it.
 */
const FALLBACK_FROM = "Website requests <onboarding@resend.dev>";

export const alertsConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_ALERTS_TO);

const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

type Mail = { to: string[]; subject: string; text: string; replyTo?: string };

/** Sends one email. Never throws; returns whether Resend accepted it. */
export async function sendEmail(mail: Mail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key || mail.to.length === 0) return false;
  try {
    const res = await fetch(process.env.RESEND_API_URL ?? "https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || FALLBACK_FROM,
        to: mail.to,
        subject: mail.subject,
        text: mail.text,
        html: `<div style="font:16px/1.5 Georgia,serif;color:#2b1d14;white-space:pre-wrap">${esc(mail.text)}</div>`,
        ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error("alert email failed", res.status, (await res.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (e) {
    console.error("alert email failed", e instanceof Error ? e.message : e);
    return false;
  }
}

const LABEL = { reservation: "Table request", event: "Event inquiry", contact: "New message" } as const;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Tells the restaurant a request just arrived. Reply-To is the guest, so Reply answers them. */
export async function emailRequestAlert(req: { kind: keyof typeof LABEL; summary: string; fields: Record<string, string>; inboxUrl: string }): Promise<void> {
  const to = (process.env.EMAIL_ALERTS_TO ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (to.length === 0) return;
  const guest = Object.entries(req.fields).find(([k, v]) => k.toLowerCase() === "email" && EMAIL.test(v))?.[1];
  const lines = Object.entries(req.fields).filter(([, v]) => v.trim()).map(([k, v]) => `${k}: ${v}`);
  await sendEmail({
    to,
    replyTo: guest,
    subject: `${LABEL[req.kind]}: ${req.summary}`,
    text: `${req.summary}\n\n${lines.join("\n")}\n\n${guest ? "Hit Reply to answer them directly.\n" : ""}Open the inbox: ${req.inboxUrl}`,
  });
}
