import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,
  allowedDevOrigins: ["10.*.*.*", "192.168.*.*", "*.local"],
};

export default nextConfig;
