import type { NextConfig } from "next";

const apiOrigin = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api").replace(
  /\/api\/?$/,
  ""
);

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/media/:path*",
        destination: `${apiOrigin}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
