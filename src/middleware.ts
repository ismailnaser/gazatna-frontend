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
  const hostHeader = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const hostname = hostHeader.split(":")[0].toLowerCase();
  const proto = (request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "")).split(",")[0].trim();

  if (
    process.env.NODE_ENV === "production" &&
    proto === "http" &&
    (hostname === "gzs.edu.ps" || hostname === "www.gzs.edu.ps") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/media")
  ) {
    const host = hostname === "www.gzs.edu.ps" ? "gzs.edu.ps" : hostname;
    return NextResponse.redirect(`https://${host}${pathname}${search}`, 308);
  }

  if (
    process.env.NODE_ENV === "production" &&
    hostname === "www.gzs.edu.ps" &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/media")
  ) {
    return NextResponse.redirect(`https://gzs.edu.ps${pathname}${search}`, 308);
  }

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
  } else {
    const isAppShell =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/teacher") ||
      pathname.startsWith("/parent") ||
      pathname === "/login";
    if (!isAppShell && request.method === "GET") {
      response.headers.set("Cache-Control", "public, s-maxage=45, stale-while-revalidate=180");
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|pwa-bootstrap.js|manifest.webmanifest|images/|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff2?)$).*)",
  ],
};
