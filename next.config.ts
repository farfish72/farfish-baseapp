import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  turbopack: {
    root: __dirname,
  },
  serverExternalPackages: ['lit'],
};

export default nextConfig;
