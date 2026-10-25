import type { NextConfig } from "next";

// Photos uploaded in the admin live in Supabase Storage (public bucket) and are served through next/image.
const storage = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL) : null;

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,
  // Lets a phone on the home network open the dev server (e.g. http://10.0.0.107:3100).
  allowedDevOrigins: ["10.*.*.*", "192.168.*.*", "*.local"],
  // Admin photo uploads are resized in the browser first (about 150 KB); the default 1 MB cap is plenty, 3 MB leaves room.
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
  images: {
    // Only for local testing against a stand-in database on localhost; never true in production.
    dangerouslyAllowLocalIP: storage?.hostname === "localhost",
    remotePatterns: storage ? [{ protocol: storage.protocol === "http:" ? "http" : "https", hostname: storage.hostname, port: storage.port, pathname: "/storage/v1/object/public/trattoria-demo/**" }] : [],
    // Optimized masters live in public/demo/ (npm run images).
    qualities: [75, 85],
    // AVIF first, then WebP: the photos are the heaviest thing on the page.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
