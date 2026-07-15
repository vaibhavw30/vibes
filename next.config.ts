import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray parent lockfile otherwise confuses Turbopack.
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // Letterboxd poster CDN (film art for /about/movies + home breadcrumb).
    remotePatterns: [
      { protocol: "https", hostname: "a.ltrbxd.com" },
      { protocol: "https", hostname: "*.ltrbxd.com" },
    ],
  },
};

export default nextConfig;
