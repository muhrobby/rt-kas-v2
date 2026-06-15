"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { requirePermission } from "@/lib/auth/permissions"
import { getAdminRoleFresh } from "@/lib/auth/session"
import { promoteToSuperAdmin, demoteSuperAdmin, listSuperAdmins } from "@/lib/services/super-admin-service"
import { listPengurus } from "@/lib/services/admin-role-service"
import { writeAuditLog } from "@/lib/services/audit-log-service"
import { type AdminRole } from "@/lib/constants/admin-roles"

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

const NON_SUPER_ROLES = ["ketua_rt", "bendahara", "sekretaris", "anggota"] as const

const promoteSchema = z.object({
  userId: z.string().min(1),
})

const demoteSchema = z.object({
  userId: z.string().min(1),
  nextAdminRole: z.enum(NON_SUPER_ROLES).nullable(),
})

export async function promoteSuperAdminAction(
  input: z.infer<typeof promoteSchema>,
): Promise<ActionResult<null>> {
  const parsed = promoteSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Invalid input" }
  }

  const user = await requirePermission("super_admin.manage")
  const adminRole = await getAdminRoleFresh(user.id)
  if (adminRole !== "super_admin") {
    return { ok: false, error: "Unauthorized" }
  }

  try {
    await promoteToSuperAdmin(parsed.data.userId, user.id)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Terjadi kesalahan server." }
  }

  await writeAuditLog({
    userId: user.id,
    modul: "Pengaturan",
    aksi: "edit",
    keterangan: `Promote user ${parsed.data.userId} to super_admin`,
  })

  revalidatePath("/admin/settings/super-admins")
  return { ok: true, data: null }
}

export async function demoteSuperAdminAction(
  input: z.infer<typeof demoteSchema>,
): Promise<ActionResult<null>> {
  const parsed = demoteSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Invalid input" }
  }

  const user = await requirePermission("super_admin.manage")
  const adminRole = await getAdminRoleFresh(user.id)
  if (adminRole !== "super_admin") {
    return { ok: false, error: "Unauthorized" }
  }

  try {
    await demoteSuperAdmin(parsed.data.userId, parsed.data.nextAdminRole, user.id)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Terjadi kesalahan server." }
  }

  await writeAuditLog({
    userId: user.id,
    modul: "Pengaturan",
    aksi: "edit",
    keterangan: `Demote user ${parsed.data.userId} from super_admin to ${parsed.data.nextAdminRole ?? "null"}`,
  })

  revalidatePath("/admin/settings/super-admins")
  return { ok: true, data: null }
}

export async function listSuperAdminsAction(): Promise<Array<{ id: string; name: string; username: string | null }>> {
  return listSuperAdmins()
}

export async function listPengurusAction(): Promise<Array<{ userId: string; name: string; adminRole: AdminRole | null; adminRoleLabel: string }>> {
  const rows = await listPengurus()
  return rows.map((r) => ({
    userId: r.userId,
    name: r.name,
    adminRole: r.adminRole,
    adminRoleLabel: r.adminRoleLabel,
  }))
}
