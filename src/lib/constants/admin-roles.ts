/**
 * TASK-001: Permission Contract dan Admin Role Constants
 *
 * Single source of truth untuk sub-role admin dan permission key.
 * Jangan mutasi nilai ini di runtime.
 */

// ─── Sub-Role Admin ───────────────────────────────────────────────────────────

export const ADMIN_ROLES = ["super_admin", "ketua_rt", "bendahara", "sekretaris", "anggota"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  ketua_rt: "Ketua RT",
  bendahara: "Bendahara",
  sekretaris: "Sekretaris",
  anggota: "Anggota Pengurus",
} as const;

/**
 * Validasi apakah nilai adalah AdminRole yang valid.
 * Gunakan ini sebelum mempercayai nilai dari DB atau input eksternal.
 */
export function isValidAdminRole(value: unknown): value is AdminRole {
  return typeof value === "string" && (ADMIN_ROLES as readonly string[]).includes(value);
}

// ─── Permission Keys ──────────────────────────────────────────────────────────

export const PERMISSIONS = [
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
  "feature_flags.read",
  "feature_flags.write",
  "super_admin.manage",
  "kuitansi.admin.read",
  "event.read",
  "event.write",
  "event.panitia.manage",
  "event.approve",
  "event.transfer",
  "event.close",
  "event.cancel",
] as const;

export type Permission = (typeof PERMISSIONS)[number];
