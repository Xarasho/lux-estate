import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes
  if (pathname.startsWith("/admin")) {
    const userRole = request.cookies.get("lux_user_role")?.value;
    const userId = request.cookies.get("lux_user_id")?.value;

    // 1. Check if user is authenticated
    if (!userId || !userRole) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      loginUrl.searchParams.set("error", "auth_required");
      return NextResponse.redirect(loginUrl);
    }

    // 2. Check if user has admin role
    if (userRole !== "admin") {
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("error", "unauthorized");
      homeUrl.searchParams.set("role", userRole);
      return NextResponse.redirect(homeUrl);
    }

    // 3. Authenticated admin: allow access
    return NextResponse.next();
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/admin/:path*"],
};
