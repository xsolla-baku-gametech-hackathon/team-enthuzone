import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  allowedDevOrigins: ["169.58.183.137", "localhost", "127.0.0.1", "*"],
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${process.env.CORE_API_URL || "http://127.0.0.1:4000"}/api/:path*` }];
  },