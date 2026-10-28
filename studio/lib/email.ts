import "server-only";
import { KINDS, type Kind } from "./inquiry";

/**
 * Email through Resend's REST API (no extra package), same pattern as the restaurant app.
 *   RESEND_API_KEY   required; without it nothing is sent and nothing breaks
 *   EMAIL_ALERTS_TO  who hears about each new inquiry (reytek@launchgrid.studio)
 *   EMAIL_FROM       "Reytek at LaunchGrid <reytek@launchgrid.studio>" once the domain is verified in Resend.
 *                    The copy to the sender goes out only when this is set; the alert falls back to Resend's test sender.
 */
const FALLBACK_FROM = "LaunchGrid inquiries <onboarding@resend.dev>";

type Mail = { to: string[]; subject: string; text: string; replyTo?: string; from?: string };

export const copyConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

async function sendEmail(mail: Mail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key || mail.to.length === 0) return false;
  try {
    const res = await fetch(process.env.RESEND_API_URL ?? "https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: mail.from ?? (process.env.EMAIL_FROM || FALLBACK_FROM),
        to: mail.to,
        subject: mail.subject,
        text: mail.text,
        ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("email failed", res.status, (await res.text()).slice(0, 300));
    return res.ok;
  } catch (e) {
    console.error("email failed", e instanceof Error ? e.message : e);
    return false;
  }
}

export type Sent = { kind: Kind; name: string; email: string; business: string; link: string; need: string; timing: string; ref: string };

function summary(i: Sent) {
  return [
    `Name: ${i.name}`,
    `Email: ${i.email}`,
    `Launching: ${KINDS[i.kind]}`,
    `Name of the business: ${i.business}`,
    i.link && `Site or socials: ${i.link}`,
    `What they need: ${i.need}`,
    i.timing && `When: ${i.timing}`,
  ].filter(Boolean).join("\n");
}

/** The alert to Reytek. Reply-To is the sender, so Reply answers them. */
export async function emailAlert(i: Sent) {
  const to = (process.env.EMAIL_ALERTS_TO ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  await sendEmail({
    to,
    replyTo: i.email,
    subject: `New project: ${KINDS[i.kind]} · ${i.business}`,
    text: `${summary(i)}\n\n${i.ref ? `Came from: ${i.ref}\n` : ""}Sent ${new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }).format(new Date())} (Atlanta time)\nHit Reply to answer them.`,
  });
}

/** The copy to the sender: exactly what they sent and what happens next. */
export async function emailCopy(i: Sent) {
  if (!copyConfigured()) return;
  await sendEmail({
    to: [i.email],
    replyTo: (process.env.EMAIL_ALERTS_TO ?? "").split(",")[0]?.trim() || undefined,
    subject: `I got your project: ${i.business}`,
    text: `Hi ${i.name},\n\nThanks for writing. Here is a copy of what you sent.\n\n${summary(i)}\n\nWhat happens next: I'll reply in writing by the next business day, usually with a few questions. Then you get a written proposal with a price and a launch date.\n\nReytek\nLaunchGrid Studio · launchgrid.studio · reytek@launchgrid.studio`,
  });
}
