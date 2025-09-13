import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: '/crtiers-backup',
  assetPrefix: '/crtiers-backup/',
};

export default nextConfig;
