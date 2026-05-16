import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/api/auth", "/unauthorized", "/api/health"];

function withPathnameRequestHeader(request: NextRequest, pathname: string) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-pathname", pathname)
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return withPathnameRequestHeader(request, pathname)
  }

  let session: Awaited<ReturnType<typeof auth.api.getSession>> | null = null
  try {
    session = await auth.api.getSession({
      headers: request.headers,
    })
  } catch {
    if (pathname.startsWith("/admin") || pathname.startsWith("/warga") || pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return withPathnameRequestHeader(request, pathname)
  }

  if (!session) {
    if (pathname.startsWith("/admin") || pathname.startsWith("/warga")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return withPathnameRequestHeader(request, pathname)
  }

  const { role, wargaId, mustChangePassword } = session.user;

  // Force change password redirect
  // Exclude API routes so sign-out and other API calls still work
  if (mustChangePassword && !pathname.startsWith("/api/")) {
    const changePasswordPath = role === "admin"
      ? "/admin/change-password"
      : "/warga/change-password";

    // Don't redirect if already on change-password page
    if (pathname !== changePasswordPath) {
      return NextResponse.redirect(new URL(changePasswordPath, request.url));
    }
  }

  if (pathname === "/") {
    const redirectUrl =
      role === "admin"
        ? new URL("/admin/dashboard", request.url)
        : new URL("/warga/dashboard", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (pathname.startsWith("/warga")) {
    if (role !== "user" || !wargaId) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return withPathnameRequestHeader(request, pathname)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
