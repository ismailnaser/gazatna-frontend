import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getBackendOrigin(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
  return apiBase.replace(/\/api\/?$/, "");
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Proxy API/media through Next in dev and LAN usage.
  // This avoids redirect loops / CORS issues when the frontend is opened
  // from a different browser/device and "localhost:8000" isn't reachable there.
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    const backend = getBackendOrigin();
    return NextResponse.rewrite(new URL(`${backend}${pathname}${search}`, request.url));
  }

  if (pathname === "/media" || pathname.startsWith("/media/")) {
    const backend = getBackendOrigin();
    return NextResponse.rewrite(new URL(`${backend}${pathname}${search}`, request.url));
  }

  const response = NextResponse.next();

  if (process.env.NODE_ENV === "development") {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("Pragma", "no-cache");
  }

  return response;
}

export const config = {
  matcher: ["/((?!sw.js|pwa-bootstrap.js|manifest.webmanifest|images/).*)"],
};
