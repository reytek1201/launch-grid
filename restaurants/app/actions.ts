"use server";

import type { Inquiry, InquiryResult } from "@/lib/inquiry";

const KINDS = ["reservation", "event", "contact"];

/*
 * Runs on the server only. Hands a request to the restaurant's inbox through the database function
 * `submit_request` (the only way in; the tables themselves are closed to the browser).
 * Returns { delivered: false } when the inbox is not configured or unreachable, and the forms then
 * offer the email / phone fallback, exactly as in the demo without a backend.
 */
export async function sendRequest(inquiry: Inquiry): Promise<InquiryResult> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return { delivered: false };

  if (!KINDS.includes(inquiry?.kind) || typeof inquiry.summary !== "string" || !inquiry.fields || typeof inquiry.fields !== "object") {
    return { delivered: false };
  }
  // Keep only short strings, so a bad client cannot stuff the inbox.
  const fields: Record<string, string> = {};
  for (const [k, v] of Object.entries(inquiry.fields).slice(0, 30)) {
    if (typeof v === "string") fields[k.slice(0, 60)] = v.slice(0, 2000);
  }

  try {
    const res = await fetch(`${url}/rest/v1/rpc/submit_request`, {
      method: "POST",
      headers: {
        apikey: key,
        "Content-Type": "application/json",
        "Content-Profile": process.env.SUPABASE_SCHEMA ?? "trattoria_demo",
      },
      body: JSON.stringify({ p_kind: inquiry.kind, p_summary: inquiry.summary.slice(0, 200), p_fields: fields }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    return { delivered: res.ok };
  } catch {
    return { delivered: false };
  }
}
