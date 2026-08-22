import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Set empty turbopack config to silence the webpack/Turbopack conflict warning
  turbopack: {},
};

export default nextConfig;
