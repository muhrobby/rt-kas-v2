import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const PUBLIC_PATHS = ["/login", "/api/auth", "/unauthorized"];

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

  const [sessionUser] = await db
    .select({
      id: user.id,
      role: user.role,
      wargaId: user.wargaId,
      mustChangePassword: user.mustChangePassword,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  if (!sessionUser) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Force change password redirect
  if (sessionUser.mustChangePassword) {
    const changePasswordPath = sessionUser.role === "admin"
      ? "/admin/change-password"
      : "/warga/change-password";

    // Don't redirect if already on change-password page
    if (pathname !== changePasswordPath) {
      return NextResponse.redirect(new URL(changePasswordPath, request.url));
    }
  }

  if (pathname === "/") {
    const redirectUrl =
      sessionUser.role === "admin"
        ? new URL("/admin/dashboard", request.url)
        : new URL("/warga/dashboard", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith("/admin") && sessionUser.role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (pathname.startsWith("/warga")) {
    if (sessionUser.role !== "user" || !sessionUser.wargaId) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return withPathnameRequestHeader(request, pathname)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
