import type { Metadata } from "next";
import { getSiteData } from "@/lib/config";
import { Sandbox } from "./Sandbox";

export const metadata: Metadata = {
  title: "Try the admin",
  description: "Run a restaurant back office for a few minutes: mark a dish sold out, post a specials banner, add a closure, and watch the site change.",
  robots: { index: false, follow: false, nocache: true },
};

export default async function TryTheAdmin() {
  const site = await getSiteData();
  return <Sandbox site={site} />;
}
