import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Force single worker during build to reduce memory pressure
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization = {
        ...config.optimization,
        nodeEnv: 'production',
      };
      config.performance = {
        ...config.performance,
        maxAssetSize: 128000,
      };
    }
    return config;
  },
};

export default nextConfig;
