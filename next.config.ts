import type { NextConfig } from "next";

/**
 * Plan B (same domain):
 * - Browser calls same-origin `/api` (NEXT_PUBLIC_API_URL=/api)
 * - Next proxies /api + /media to the real Django app via BACKEND_URL
 *
 * BACKEND_URL must be the Python App origin on cPanel, e.g.:
 *   https://gzsedu.example.com/path-to-python-app
 *   or whatever Application URL Setup Python App shows
 * DO NOT set BACKEND_URL to https://gzs.edu.ps — that creates a proxy loop.
 */
function resolveBackendOrigin(): string {
  const explicit = (process.env.BACKEND_URL ?? process.env.DJANGO_BACKEND_URL ?? "").trim();
  if (explicit) {
    return explicit.replace(/\/$/, "").replace(/\/api\/?$/, "");
  }

  const publicApi = (process.env.NEXT_PUBLIC_API_URL ?? "").trim();
  if (
    !publicApi ||
    publicApi === "/api" ||
    publicApi.startsWith("/") ||
    /\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(publicApi)
  ) {
    return "http://127.0.0.1:8000";
  }

  // Absolute public URL — strip /api. Warn: if this equals the frontend host, set BACKEND_URL.
  return publicApi.replace(/\/api\/?$/, "");
}

const backendOrigin = resolveBackendOrigin();

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    cpus: 1,
  },
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
        destination: `${backendOrigin}/api/:path*`,
      },
      {
        source: "/media/:path*",
        destination: `${backendOrigin}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
