import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit/limiter";
import { rateLimitKeys } from "@/lib/rate-limit/keys";

export const GET = (req: NextRequest) => auth.handler(req);

export const POST = async (req: NextRequest) => {
  const pathname = req.nextUrl.pathname;
  
  // Apply rate limit specifically to sign-in attempts
  if (pathname.includes("/sign-in")) {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const key = rateLimitKeys.login(ip, pathname);
    const limit = 5; // 5 attempts
    const windowMs = 60 * 1000; // per 1 minute

    const result = await rateLimit(key, limit, windowMs);

    if (!result.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil((result.reset - Date.now()) / 1000).toString(),
          }
        }
      );
    }
  }

  return auth.handler(req);
};
