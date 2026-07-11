import type { NextConfig } from "next";

// We proxy API calls through Next.js so the frontend can work from:
// - localhost (same machine)
// - LAN IP (other browsers/devices)
// without the browser trying to call "localhost:8000" on *its own* device.
const apiOrigin = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api").replace(/\/api\/?$/, "");

const nextConfig: NextConfig = {
  // Important for API proxying: avoid stripping trailing slashes (causes redirect loops with Django/DRF).
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
      {
        source: "/media/:path*",
        destination: `${apiOrigin}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
