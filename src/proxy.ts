import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const PUBLIC_PATHS = ["/login", "/api/auth", "/unauthorized"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
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
    return NextResponse.next()
  }

  if (!session) {
    if (pathname.startsWith("/admin") || pathname.startsWith("/warga")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  const [sessionUser] = await db
    .select({
      id: user.id,
      role: user.role,
      wargaId: user.wargaId,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  if (!sessionUser) {
    return NextResponse.redirect(new URL("/login", request.url));
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
