import { redirect } from "next/navigation";

import { getCurrentUser, getAdminRoleFresh, type CurrentUser } from "./session";
import { hasPermission as checkPermission } from "./permission-matrix";
import type { Permission } from "@/lib/constants/admin-roles";
import { isValidAdminRole } from "@/lib/constants/admin-roles";
import { getFlagMeta } from "@/lib/constants/feature-flags";
import type { FeatureFlagKey } from "@/lib/constants/feature-flags";
import { isFeatureEnabled } from "@/lib/services/feature-flag-service";

export class AuthError extends Error {
  constructor(message: string, public code: "UNAUTHORIZED" | "FORBIDDEN") {
    super(message);
    this.name = "AuthError";
  }
}

export async function requireAuth(): Promise<CurrentUser> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }
  return currentUser;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const currentUser = await requireAuth();
  if (currentUser.role !== "admin") {
    redirect("/unauthorized");
  }
  return currentUser;
}

export async function requireWarga(): Promise<CurrentUser> {
  const currentUser = await requireAuth();
  if (currentUser.role !== "user") {
    redirect("/unauthorized");
  }
  if (!currentUser.wargaId) {
    redirect("/unauthorized");
  }
  return currentUser;
}

/**
 * Guard server action/page: pastikan user adalah admin DAN memiliki permission.
 *
 * Strategi stale session (SEC-03):
 * adminRole selalu dibaca fresh dari DB via getAdminRoleFresh() agar admin
 * yang sudah di-demote tidak bisa memakai session lama untuk bypass permission.
 *
 * Jika adminRole null/tidak dikenal → redirect ke /unauthorized (fail-closed).
 * Gunakan ini sebagai pengganti requireAdmin() untuk aksi granular.
 * requireAdmin() tetap ada untuk guard umum yang belum butuh granular permission.
 */
export async function requirePermission(permission: Permission): Promise<CurrentUser> {
  const currentUser = await requireAdmin();
  // Baca adminRole terbaru dari DB, bukan dari session cache (anti-stale)
  const adminRole = await getAdminRoleFresh(currentUser.id);
  if (!checkPermission(adminRole, permission)) {
    redirect("/unauthorized");
  }
  return currentUser;
}

/**
 * Helper non-throwing untuk filtering UI server-side.
 * Tidak melakukan redirect — hanya kembalikan boolean.
 * Membaca adminRole dari CurrentUser (session) — cukup untuk UX filtering.
 * Backend guard (requirePermission) tetap wajib sebagai boundary keamanan.
 */
export function hasAdminPermission(currentUser: CurrentUser, permission: Permission): boolean {
  if (currentUser.role !== "admin") return false;
  const rawRole = currentUser.adminRole ?? null;
  const adminRole = isValidAdminRole(rawRole) ? rawRole : null;
  return checkPermission(adminRole, permission);
}

/**
 * Guard untuk aksi event yang boleh dilakukan oleh pengurus (event.write) ATAU panitia aktif.
 * Membaca status panitia fresh dari DB setiap request (SEC-E13: anti stale-session).
 */
export async function requireEventAccess(eventId: number): Promise<CurrentUser> {
  const currentUser = await requireAuth();

  // Pengurus dengan event.write: boleh
  if (currentUser.role === "admin") {
    const adminRole = await getAdminRoleFresh(currentUser.id);
    if (adminRole && checkPermission(adminRole, "event.write")) return currentUser;
  }

  // Panitia aktif event ini: boleh (lazy import untuk hindari circular)
  const { checkIsPanitiaAktif } = await import("@/lib/services/event-panitia-service");
  const isPanitia = await checkIsPanitiaAktif(currentUser.id, eventId);
  if (isPanitia) return currentUser;

  redirect("/unauthorized");
}

/** Validates the key is in the registry and the feature is enabled. Redirects to /unauthorized if disabled or unknown. */
export async function requireFeatureEnabled(key: FeatureFlagKey, options?: { redirectTo?: string }): Promise<void> {
  const meta = getFlagMeta(key)
  if (!meta) {
    redirect("/unauthorized")
  }
  const enabled = await isFeatureEnabled(key)
  if (!enabled) {
    redirect(options?.redirectTo ?? "/unauthorized")
  }
}

/** Throws AuthError if the feature flag is disabled or unknown. Use in server actions. */
export async function assertFeatureEnabled(key: FeatureFlagKey): Promise<void> {
  const meta = getFlagMeta(key)
  if (!meta || !(await isFeatureEnabled(key))) {
    throw new AuthError("FEATURE_DISABLED", "FORBIDDEN")
  }
}
