import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove static export to enable API routes and server-side auth
  trailingSlash: true,
  images: {
    unoptimized: true
  },
};

export default nextConfig;
