import { redirect } from "next/navigation";
import { adminClient, adminConfigured } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";
import { brandOf } from "@/lib/brand";
import { getSiteData } from "@/lib/config";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const brand = brandOf((await getSiteData()).name);
  if (adminConfigured()) {
    const supabase = await adminClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) redirect("/admin");
  }
  return (
    <main id="main" className="mx-auto flex min-h-svh max-w-sm flex-col justify-center px-6 py-16">
      {brand.kicker && <p className="text-sm uppercase tracking-[0.2em] text-terracotta-deep">{brand.kicker}</p>}
      <h1 className="mt-2 font-heading text-5xl font-semibold leading-none text-espresso">{brand.main}</h1>
      <p className="mt-3 font-hand text-3xl text-terracotta-deep">back of house</p>
      {error && <p role="alert" className="mt-6 rounded-lg border border-wine/40 bg-wine/10 px-4 py-3 text-sm text-wine">That link did not work or has expired. Request a new one below.</p>}
      <LoginForm />
    </main>
  );
}
