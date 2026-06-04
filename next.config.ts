import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "mongoose",
    "playwright",
    "bcryptjs",
    "jsonwebtoken",
  ],
  turbopack: {},
};

export default nextConfig;
