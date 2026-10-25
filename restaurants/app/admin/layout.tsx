import type { Metadata, Viewport } from "next";
import { getSiteData } from "@/lib/config";
import { getAdmin } from "@/lib/admin";
import { AdminBar } from "./AdminBar";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false, nocache: true },
};
export const viewport: Viewport = { themeColor: "#1a100b" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await getAdmin();
  // Signed out, or signed in but not an admin: just the page (sign-in or the "not an admin" notice).
  if (!me || !me.isAdmin) return <div className="min-h-svh bg-cream text-espresso">{children}</div>;
  const [{ count }, site] = await Promise.all([
    me.supabase.from("requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    getSiteData(),
  ]);
  return (
    <div className="min-h-svh bg-cream pb-28 text-espresso md:pb-0">
      <AdminBar name={site.name.replace("Trattoria ", "")} newCount={count ?? 0} />
      {children}
    </div>
  );
}
