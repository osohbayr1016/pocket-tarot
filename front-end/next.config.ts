import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {root:process.cwd()},
  outputFileTracingRoot:process.cwd(),
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        {key:"X-Content-Type-Options",value:"nosniff"},
        {key:"X-Frame-Options",value:"DENY"},
        {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
        {key:"Strict-Transport-Security",value:"max-age=31536000"},
        {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"},
      ],
    }];
  },
};
export default nextConfig;
