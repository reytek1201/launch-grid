import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const adminConfigured = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

/** Supabase client acting as the signed-in admin (their session lives in cookies; row-level security does the rest). */
export async function adminClient() {
  const store = await cookies();
  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    db: { schema: process.env.SUPABASE_SCHEMA ?? "trattoria_demo" },
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        // Server Components cannot set cookies; the proxy refreshes the session instead.
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {}
      },
    },
  });
}
