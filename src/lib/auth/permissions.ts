import { redirect } from "next/navigation";

import { getCurrentUser, getAdminRoleFresh, type CurrentUser } from "./session";
import { hasPermission as checkPermission } from "./permission-matrix";
import type { Permission } from "@/lib/constants/admin-roles";
import { isValidAdminRole } from "@/lib/constants/admin-roles";

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
