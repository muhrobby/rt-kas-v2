/**
 * TASK-001: Permission Matrix
 *
 * Readonly mapping dari AdminRole ke set Permission yang diizinkan.
 * Ini adalah single source of truth untuk otorisasi backend dan filtering UI.
 * Jangan mutasi nilai ini di runtime.
 */

import type { AdminRole, Permission } from "@/lib/constants/admin-roles";

type PermissionMatrix = Readonly<Record<AdminRole, ReadonlySet<Permission>>>;

export const PERMISSION_MATRIX: PermissionMatrix = Object.freeze({
  ketua_rt: new Set<Permission>([
    "dashboard.read",
    "warga.read",
    "warga.write",
    "warga.delete",
    "pengurus.manage",
    "kategori.read",
    "kategori.write",
    "kategori.delete",
    "kas_masuk.read",
    "kas_masuk.write",
    "kas_keluar.read",
    "kas_keluar.write",
    "tunggakan.read",
    "laporan.read",
    "laporan.export",
    "log.read",
    "log.export",
    "settings.read",
    "settings.write",
    "kuitansi.admin.read",
  ]),

  bendahara: new Set<Permission>([
    "dashboard.read",
    "warga.read",
    "kategori.read",
    "kategori.write",
    "kas_masuk.read",
    "kas_masuk.write",
    "kas_keluar.read",
    "kas_keluar.write",
    "tunggakan.read",
    "laporan.read",
    "laporan.export",
    "log.read",
    "kuitansi.admin.read",
  ]),

  sekretaris: new Set<Permission>([
    "dashboard.read",
    "warga.read",
    "warga.write",
    "kategori.read",
    "kas_masuk.read",
    "kas_keluar.read",
    "tunggakan.read",
    "laporan.read",
    "laporan.export",
    "log.read",
    "log.export",
    "kuitansi.admin.read",
  ]),

  anggota: new Set<Permission>([
    "dashboard.read",
    "warga.read",
    "kategori.read",
    "kas_masuk.read",
    "kas_keluar.read",
    "tunggakan.read",
    "laporan.read",
  ]),
} as const);

/**
 * Cek apakah adminRole memiliki permission tertentu.
 * Jika adminRole null/undefined/tidak dikenal → selalu false (fail-closed).
 */
export function hasPermission(
  adminRole: AdminRole | null | undefined,
  permission: Permission,
): boolean {
  if (!adminRole) return false;
  const permissions = PERMISSION_MATRIX[adminRole];
  if (!permissions) return false;
  return permissions.has(permission);
}

/**
 * Ambil semua permission untuk adminRole tertentu.
 * Jika adminRole tidak dikenal → kembalikan Set kosong (fail-closed).
 */
export function getPermissions(adminRole: AdminRole | null | undefined): ReadonlySet<Permission> {
  if (!adminRole) return new Set();
  return PERMISSION_MATRIX[adminRole] ?? new Set();
}
