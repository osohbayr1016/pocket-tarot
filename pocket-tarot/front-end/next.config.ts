import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production settings
  output: "standalone",
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Image optimization
  images: {
    domains: ["localhost"],
    unoptimized: false,
  },
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  // Redirects for API calls
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${
          process.env.NODE_ENV === "production"
            ? "https://pocket-tarot-slp7.onrender.com"
            : "http://localhost:5001"
        }/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
