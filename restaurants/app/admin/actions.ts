"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminClient, adminConfigured } from "@/lib/supabase/server";

export type LoginState = { message: string } | null;

/** Emails a sign-in link. Only people already registered as users of this project can receive one. */
export async function requestLink(_: LoginState, form: FormData): Promise<LoginState> {
  if (!adminConfigured()) return { message: "The admin area is not set up on this deployment." };
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { message: "Enter a valid email address." };

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const supabase = await adminClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${proto}://${host}/auth/callback` },
  });
  if (error && error.status === 429) return { message: "Too many requests. Wait a minute and try again." };
  // The same answer whether or not the address is an admin, so this page reveals nothing.
  return { message: "If that address belongs to an admin, a sign-in link is on its way. Open it on this device." };
}

export async function signOut() {
  const supabase = await adminClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

async function requireAdmin() {
  const supabase = await adminClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  const { data: ok } = await supabase.rpc("is_admin");
  if (!ok) redirect("/admin");
  return supabase;
}

export async function setRequestStatus(id: string, status: "new" | "seen" | "done") {
  if (!["new", "seen", "done"].includes(status)) return;
  const supabase = await requireAdmin();
  await supabase.from("requests").update({ status }).eq("id", id);
  revalidatePath("/admin");
}

export async function deleteRequest(id: string) {
  const supabase = await requireAdmin();
  await supabase.from("requests").delete().eq("id", id);
  revalidatePath("/admin");
}
