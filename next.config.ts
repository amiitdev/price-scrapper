import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "mongoose",
    "puppeteer-core",
    "bcryptjs",
    "jsonwebtoken",
  ],
  turbopack: {},
};

export default nextConfig;
