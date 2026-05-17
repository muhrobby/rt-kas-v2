"use server"

import { db } from "@/lib/db"
import { user, warga } from "@/lib/db/schema"
import { eq, and, count } from "drizzle-orm"
import { isValidAdminRole, ADMIN_ROLE_LABELS } from "@/lib/constants/admin-roles"
import type { AdminRole } from "@/lib/constants/admin-roles"

export interface PengurusListItem {
  userId: string
  name: string
  blokRumah: string
  noTelp: string
  adminRole: AdminRole | null
  adminRoleLabel: string
  wargaId: number | null
}

/**
 * List semua user admin yang isPengurus = true (join user + warga).
 */
export async function listPengurus(): Promise<PengurusListItem[]> {
  const rows = await db
    .select({
      userId: user.id,
      name: user.name,
      adminRole: user.adminRole,
      wargaId: user.wargaId,
      blokRumah: warga.blokRumah,
      noTelp: warga.noTelp,
    })
    .from(user)
    .innerJoin(warga, eq(user.wargaId, warga.id))
    .where(and(eq(user.role, "admin"), eq(warga.isPengurus, true)))

  return rows.map((row) => {
    const role = isValidAdminRole(row.adminRole) ? row.adminRole : null
    return {
      userId: row.userId,
      name: row.name,
      blokRumah: row.blokRumah,
      noTelp: row.noTelp,
      adminRole: role,
      adminRoleLabel: role ? ADMIN_ROLE_LABELS[role] : "Belum ditentukan",
      wargaId: row.wargaId,
    }
  })
}

/**
 * Hitung jumlah ketua_rt aktif.
 * Digunakan untuk proteksi demote ketua RT terakhir.
 */
export async function countKetuaRt(): Promise<number> {
  const [result] = await db
    .select({ total: count() })
    .from(user)
    .where(and(eq(user.role, "admin"), eq(user.adminRole, "ketua_rt")))
  return result?.total ?? 0
}

/**
 * Update admin sub-role user.
 * Mengembalikan old role dan new role untuk audit log.
 *
 * Validasi:
 * - User harus role 'admin'
 * - Tidak boleh demote ketua RT terakhir
 * - adminRole harus valid enum
 */
export async function updateAdminRole(
  targetUserId: string,
  newRole: AdminRole,
): Promise<{ oldRole: AdminRole | null; newRole: AdminRole }> {
  // Ambil user target
  const [targetUser] = await db
    .select({ id: user.id, role: user.role, adminRole: user.adminRole })
    .from(user)
    .where(eq(user.id, targetUserId))
    .limit(1)

  if (!targetUser) {
    throw new Error("USER_NOT_FOUND")
  }

  if (targetUser.role !== "admin") {
    throw new Error("USER_NOT_ADMIN")
  }

  if (!isValidAdminRole(newRole)) {
    throw new Error("INVALID_ADMIN_ROLE")
  }

  const oldRole = isValidAdminRole(targetUser.adminRole) ? targetUser.adminRole : null

  // Proteksi: jangan demote ketua RT terakhir
  if (oldRole === "ketua_rt" && newRole !== "ketua_rt") {
    const ketuaCount = await countKetuaRt()
    if (ketuaCount <= 1) {
      throw new Error("LAST_KETUA_RT")
    }
  }

  // Update admin_role
  await db
    .update(user)
    .set({ adminRole: newRole, updatedAt: new Date() })
    .where(eq(user.id, targetUserId))

  // Sync warga.rolePengurus agar label tetap konsisten
  const [targetUserFull] = await db
    .select({ wargaId: user.wargaId })
    .from(user)
    .where(eq(user.id, targetUserId))
    .limit(1)

  if (targetUserFull?.wargaId) {
    const label = ADMIN_ROLE_LABELS[newRole]
    await db
      .update(warga)
      .set({ rolePengurus: label, updatedAt: new Date() })
      .where(eq(warga.id, targetUserFull.wargaId))
      .catch(() => {
        // Non-critical: rolePengurus sync failure should not fail the operation
      })
  }

  return { oldRole, newRole }
}
