import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Ensure API routes work properly (no static export)
  output: undefined  // Explicitly remove any static export configuration
};

export default nextConfig;
