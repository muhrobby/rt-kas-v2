import { cache } from "react";
import { headers } from "next/headers"

import { auth } from "@/lib/auth";

export const getSession = cache(async function getSession() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });
  return session;
});

export const getCurrentUser = cache(async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
