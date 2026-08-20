import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Page middleware only (HTTPS / cache headers).
 * /api and /media are proxied in server.js at runtime (BACKEND_URL) so response
 * bodies are not dropped the way Edge middleware rewrites were on LiteSpeed.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hostHeader = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const hostname = hostHeader.split(":")[0].toLowerCase();
  const proto = (
    request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "")
  )
    .split(",")[0]
    .trim();

  if (
    process.env.NODE_ENV === "production" &&
    proto === "http" &&
    (hostname === "gzs.edu.ps" || hostname === "www.gzs.edu.ps")
  ) {
    const host = hostname === "www.gzs.edu.ps" ? "gzs.edu.ps" : hostname;
    return NextResponse.redirect(`https://${host}${pathname}${search}`, 308);
  }

  if (process.env.NODE_ENV === "production" && hostname === "www.gzs.edu.ps") {
    return NextResponse.redirect(`https://gzs.edu.ps${pathname}${search}`, 308);
  }

  const response = NextResponse.next();

  if (process.env.NODE_ENV === "development") {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("Pragma", "no-cache");
  } else if (request.method === "GET") {
    const isAppShell =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/teacher") ||
      pathname.startsWith("/parent") ||
      pathname === "/login";
    if (!isAppShell) {
      response.headers.set("Cache-Control", "public, s-maxage=90, stale-while-revalidate=300");
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api/|media/|_next/static|_next/image|favicon.ico|sw.js|pwa-bootstrap.js|manifest.webmanifest|images/|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff2?)$).*)",
  ],
};
