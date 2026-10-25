import { redirect } from "next/navigation";
import { adminClient, adminConfigured } from "@/lib/supabase/server";

/** The signed-in admin, or null. `isAdmin` is false for someone signed in but not on the allow-list. */
export async function getAdmin() {
  if (!adminConfigured()) return null;
  const supabase = await adminClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: ok } = await supabase.rpc("is_admin");
  return { supabase, email: data.user.email ?? "", isAdmin: ok === true };
}

/** For admin pages and actions: sends strangers to sign in, and non-admins back to the front page of the admin. */
export async function requireAdmin() {
  const me = await getAdmin();
  if (!me) redirect("/admin/login");
  if (!me.isAdmin) redirect("/admin");
  return me;
}
