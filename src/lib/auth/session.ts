import { cache } from "react";
import { headers } from "next/headers"
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { isValidAdminRole } from "@/lib/constants/admin-roles";
import type { AdminRole } from "@/lib/constants/admin-roles";

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

/**
 * Strategi stale session (SEC-03):
 * Better Auth menyimpan adminRole di session payload saat login.
 * Jika admin di-demote sementara session masih aktif, payload bisa stale.
 *
 * Fungsi ini selalu membaca adminRole terbaru dari DB, bukan dari session cache.
 * Gunakan di `requirePermission()` agar permission check selalu fresh.
 *
 * Tidak di-cache per-request karena tujuannya justru membaca data terkini.
 */
export async function getAdminRoleFresh(userId: string): Promise<AdminRole | null> {
  try {
    const row = await db
      .select({ adminRole: user.adminRole })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    const rawRole = row[0]?.adminRole ?? null;
    if (!isValidAdminRole(rawRole)) return null;
    return rawRole;
  } catch {
    // Fail-closed: jika query gagal, tolak akses
    return null;
  }
}
