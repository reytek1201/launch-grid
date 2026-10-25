import { redirect } from "next/navigation";
import { adminClient, adminConfigured } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  if (adminConfigured()) {
    const supabase = await adminClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) redirect("/admin");
  }
  return (
    <main id="main" className="mx-auto flex min-h-svh max-w-sm flex-col justify-center px-6 py-16">
      <p className="text-xs uppercase tracking-[0.35em] text-cream/70">Trattoria</p>
      <h1 className="font-heading text-4xl font-semibold">Cinque Lune</h1>
      <p className="mt-1 font-hand text-3xl text-[#f2b27a]">back of house</p>
      {error && <p role="alert" className="mt-6 rounded-lg border border-[#f2b27a]/50 px-4 py-3 text-sm">That link did not work or has expired. Request a new one below.</p>}
      <LoginForm />
    </main>
  );
}
