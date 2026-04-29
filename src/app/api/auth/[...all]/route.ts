import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export const GET = (req: NextRequest) => auth.handler(req);
export const POST = (req: NextRequest) => auth.handler(req);
