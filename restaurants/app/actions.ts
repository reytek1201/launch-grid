"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { after } from "next/server";
import { emailRequestAlert } from "@/lib/email";
import type { Guard, Inquiry, InquiryResult } from "@/lib/inquiry";

const KINDS = ["reservation", "event", "contact"];
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const LINK = /https?:\/\/|www\./gi;

/*
 * Runs on the server only. Hands a request to the restaurant's inbox through the database function
 * `submit_request` (the only way in; the tables themselves are closed to the browser), then emails the
 * restaurant (lib/email.ts) once the request is stored.
 *
 * Spam guards, cheapest first:
 *  - a hidden trap field that only scripts fill in, and a form submitted within 3 seconds of the page opening:
 *    both are dropped quietly and the sender is told it worked, so bots learn nothing;
 *  - more than two links, or an email address that is not one: dropped the same way;
 *  - in the database: one visitor (a salted hash, never the IP) may send 5 requests per 10 minutes, and an
 *    identical request sent twice is stored once.
 *
 * Returns { delivered: false } when the inbox is not configured, unreachable or the limit is hit, and the forms
 * then offer the email / phone fallback, exactly as in the demo without a backend.
 */
export async function sendRequest(inquiry: Inquiry, guard?: Guard): Promise<InquiryResult> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return { delivered: false };

  if (!KINDS.includes(inquiry?.kind) || typeof inquiry.summary !== "string" || !inquiry.summary.trim() || !inquiry.fields || typeof inquiry.fields !== "object") {
    return { delivered: false };
  }
  // Keep only short strings, so a bad client cannot stuff the inbox.
  const fields: Record<string, string> = {};
  for (const [k, v] of Object.entries(inquiry.fields).slice(0, 30)) {
    if (typeof v === "string") fields[k.slice(0, 60)] = v.slice(0, 2000);
  }

  // Looks like a script: pretend it worked.
  const trapped = typeof guard?.trap === "string" && guard.trap.trim() !== "";
  const tooFast = typeof guard?.waited === "number" && guard.waited >= 0 && guard.waited < 3000;
  const links = (JSON.stringify(fields).match(LINK) ?? []).length;
  const badEmail = Object.entries(fields).some(([k, v]) => k.toLowerCase() === "email" && v.trim() !== "" && !EMAIL.test(v.trim()));
  if (trapped || tooFast || links > 2 || badEmail) return { delivered: true };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const client = createHash("sha256").update(`${ip}|${process.env.SPAM_SALT ?? "cinque-lune"}`).digest("hex").slice(0, 32);

  try {
    const res = await fetch(`${url}/rest/v1/rpc/submit_request`, {
      method: "POST",
      headers: {
        apikey: key,
        "Content-Type": "application/json",
        "Content-Profile": process.env.SUPABASE_SCHEMA ?? "trattoria_demo",
      },
      body: JSON.stringify({ p_kind: inquiry.kind, p_summary: inquiry.summary.slice(0, 200), p_fields: fields, p_client: client }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { delivered: false };

    // The function answers true for a new request, false for an identical repeat (stored once, announced once).
    const isNew = (await res.json().catch(() => true)) !== false;
    if (isNew) {
      const host = h.get("x-forwarded-host") ?? h.get("host");
      const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
      const inboxUrl = `${proto}://${host}/admin/inbox`;
      after(() => emailRequestAlert({ kind: inquiry.kind, summary: inquiry.summary.slice(0, 200), fields, inboxUrl }));
    }
    return { delivered: true };
  } catch {
    return { delivered: false };
  }
}
