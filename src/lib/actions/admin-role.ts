"use server"

import { revalidatePath } from "next/cache"

import { requirePermission } from "@/lib/auth/permissions"
import { writeAuditLog } from "@/lib/services/audit-log-service"
import { listPengurus, updateAdminRole } from "@/lib/services/admin-role-service"
import { assignAdminRoleSchema, type AssignAdminRoleInput } from "@/lib/validations/admin-role"
import { ADMIN_ROLE_LABELS } from "@/lib/constants/admin-roles"
import { ZodError } from "zod"

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

/**
 * List semua pengurus admin.
 * Guard: pengurus.manage
 */
export async function listPengurusAction(): Promise<ActionResult<Awaited<ReturnType<typeof listPengurus>>>> {
  await requirePermission("pengurus.manage")

  try {
    const data = await listPengurus()
    return { ok: true, data }
  } catch {
    return { ok: false, error: "Gagal memuat data pengurus." }
  }
}

/**
 * Assign/update admin sub-role.
 * Guard: pengurus.manage
 * Proteksi: ketua RT terakhir tidak bisa didemote.
 */
export async function assignAdminRoleAction(input: AssignAdminRoleInput): Promise<ActionResult<{ userId: string }>> {
  const admin = await requirePermission("pengurus.manage")

  try {
    const parsed = assignAdminRoleSchema.parse(input)

    const { oldRole, newRole } = await updateAdminRole(parsed.userId, parsed.adminRole)

    const oldLabel = oldRole ? ADMIN_ROLE_LABELS[oldRole] : "Belum ditentukan"
    const newLabel = ADMIN_ROLE_LABELS[newRole]

    await writeAuditLog({
      userId: admin.id,
      modul: "Data Warga",
      aksi: "edit",
      keterangan: `Mengubah sub-role admin dari "${oldLabel}" menjadi "${newLabel}"`,
    })

    revalidatePath("/admin/pengurus")
    revalidatePath("/admin/warga")

    return { ok: true, data: { userId: parsed.userId } }
  } catch (error) {
    if (error instanceof ZodError) {
      return { ok: false, error: "Input tidak valid." }
    }
    if (error instanceof Error) {
      switch (error.message) {
        case "USER_NOT_FOUND":
          return { ok: false, error: "User tidak ditemukan." }
        case "USER_NOT_ADMIN":
          return { ok: false, error: "User bukan admin. Tidak bisa assign sub-role." }
        case "INVALID_ADMIN_ROLE":
          return { ok: false, error: "Sub-role tidak valid." }
        case "LAST_KETUA_RT":
          return { ok: false, error: "Tidak bisa mengubah sub-role Ketua RT terakhir. Minimal harus ada satu Ketua RT aktif." }
        default:
          break
      }
    }
    return { ok: false, error: "Terjadi kesalahan server. Coba lagi." }
  }
}
