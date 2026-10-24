import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,
  // Lets a phone on the home network open the dev server (e.g. http://10.0.0.107:3100).
  allowedDevOrigins: ["10.*.*.*", "192.168.*.*", "*.local"],
  images: {
    // Optimized masters live in public/demo/ (npm run images).
    qualities: [75, 85],
    // AVIF first, then WebP: the photos are the heaviest thing on the page.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
