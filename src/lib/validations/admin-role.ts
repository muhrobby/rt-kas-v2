import { z } from "zod"

import { ADMIN_ROLES } from "@/lib/constants/admin-roles"

/**
 * Schema untuk assign/update admin sub-role.
 * Hanya menerima enum valid dari konstanta ADMIN_ROLES.
 */
export const assignAdminRoleSchema = z.object({
  userId: z.string().min(1, "User ID wajib diisi."),
  adminRole: z.enum(ADMIN_ROLES, { message: "Sub-role tidak valid." }),
})

export type AssignAdminRoleInput = z.infer<typeof assignAdminRoleSchema>
