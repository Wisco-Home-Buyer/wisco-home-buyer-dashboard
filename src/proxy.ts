import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicAuthRoutes = ["/login", "/accept-invite"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const isAuthenticated = !!(accessToken || refreshToken);

  const isPublicAuthRoute = publicAuthRoutes.some((route) => pathname.startsWith(route));

  // 1. Unauthenticated users: redirect ALL routes (except /login & /register) to /login
  if (!isAuthenticated && !isPublicAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated users: redirect away from /login and /register to /
  if (isAuthenticated && isPublicAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (/api/*)
     * - static files (_next/static, _next/image, favicon.ico)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)",
  ],
};
