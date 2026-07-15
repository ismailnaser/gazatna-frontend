import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy /api and /media to Django.
 * Prefer BACKEND_URL (Python App origin). Never proxy back to the public frontend host.
 */
function getBackendOrigin(): string {
  const explicit = (process.env.BACKEND_URL ?? process.env.DJANGO_BACKEND_URL ?? "").trim();
  if (explicit) {
    return explicit.replace(/\/$/, "").replace(/\/api\/?$/, "");
  }

  const publicApi = (process.env.NEXT_PUBLIC_API_URL ?? "").trim();
  if (
    !publicApi ||
    publicApi === "/api" ||
    publicApi.startsWith("/")
  ) {
    return "http://127.0.0.1:8000";
  }

  return publicApi.replace(/\/api\/?$/, "");
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const backend = getBackendOrigin();

  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return NextResponse.rewrite(new URL(`${backend}${pathname}${search}`));
  }

  if (pathname === "/media" || pathname.startsWith("/media/")) {
    return NextResponse.rewrite(new URL(`${backend}${pathname}${search}`));
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
