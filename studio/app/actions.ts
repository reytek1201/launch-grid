"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { after } from "next/server";
import { copyConfigured, emailAlert, emailCopy } from "@/lib/email";
import { KINDS, NEED_MAX, NEED_MIN, TIMINGS, type Field, type FormState, type FormValues, type Kind } from "@/lib/inquiry";

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const LINKS = /https?:\/\/|www\./gi;
const str = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);

/*
 * The Start a project form. Runs on the server only and is the only way into the inbox: it calls the database
 * function launchgrid_site.submit_inquiry (the table itself is closed to the browser), then emails Reytek and,
 * once a sending domain is verified, sends the visitor a copy.
 *
 * Spam guards, cheapest first: a hidden trap field and a form sent within 3 seconds of opening are dropped
 * quietly and shown as sent; more than two links in the message is dropped the same way. In the database: one
 * visitor (a salted hash, never the IP) may send 5 per 10 minutes, the whole site 20 a minute, and the same
 * message twice is stored once.
 */
export async function startProject(_prev: FormState, form: FormData): Promise<FormState> {
  const values: FormValues = {
    name: str(form, "name", 120),
    email: str(form, "email", 200),
    kind: str(form, "kind", 20),
    business: str(form, "business", 160),
    link: str(form, "link", 300),
    need: str(form, "need", NEED_MAX),
    timing: str(form, "timing", 40),
  };
  const ref = str(form, "ref", 40).replace(/[^a-z0-9-]/gi, "");

  const errors: Partial<Record<Field, string>> = {};
  if (!values.name) errors.name = "Add your name so I know who to reply to.";
  if (!EMAIL.test(values.email)) errors.email = "That email doesn't look right. Check for a typo.";
  if (!(values.kind in KINDS)) errors.kind = "Pick one.";
  if (!values.business) errors.business = "Add the name so I can look it up.";
  if (values.link && !/^https?:\/\/\S+\.\S+/.test(values.link)) errors.link = "That link doesn't look right. Start it with https://";
  if (values.need.length < NEED_MIN) errors.need = "Add a little more detail, at least a sentence.";
  if (Object.keys(errors).length) return { status: "invalid", errors, values };
  if (!TIMINGS.includes(values.timing as (typeof TIMINGS)[number])) values.timing = "";

  const sent: FormState = { status: "sent", name: values.name, email: values.email, copy: copyConfigured() };

  // Looks like a script: pretend it worked so it learns nothing.
  const trapped = str(form, "website", 200) !== "";
  const waited = Number(form.get("waited"));
  const tooFast = Number.isFinite(waited) && waited >= 0 && waited < 3000;
  const links = (`${values.need}`.match(LINKS) ?? []).length;
  if (trapped || tooFast || links > 2) return sent;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  const failed: FormState = { status: "error", message: "That didn't send. Your text is still here, so try again in a minute.", values };
  if (!url || !key) return failed;

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const client = createHash("sha256").update(`${ip}|${process.env.SPAM_SALT ?? "launchgrid"}`).digest("hex").slice(0, 32);

  try {
    const res = await fetch(`${url}/rest/v1/rpc/submit_inquiry`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json", "Content-Profile": process.env.SUPABASE_SCHEMA ?? "launchgrid_site" },
      body: JSON.stringify({
        p_kind: values.kind, p_name: values.name, p_email: values.email, p_business: values.business, p_need: values.need,
        p_link: values.link || null, p_timing: values.timing || null, p_ref: ref || null, p_client: client,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const body = await res.text();
      if (body.includes("too many requests")) return { status: "error", message: "You've sent a few already. Wait ten minutes and try again.", values };
      console.error("submit_inquiry failed", res.status, body.slice(0, 300));
      return failed;
    }
    const isNew = (await res.json().catch(() => true)) !== false;
    if (isNew) {
      const mail = { ...values, kind: values.kind as Kind, ref };
      after(async () => { await emailAlert(mail); await emailCopy(mail); });
    }
    return sent;
  } catch {
    return failed;
  }
}
