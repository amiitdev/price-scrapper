import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "mongoose",
    "playwright",
    "bcryptjs",
    "jsonwebtoken",
  ],
  experimental: {
    outputFileTracingIncludes: {
      "/api/**": ["./node_modules/playwright-core/browsers.json"],
    },
  },
  turbopack: {},
};

export default nextConfig;
