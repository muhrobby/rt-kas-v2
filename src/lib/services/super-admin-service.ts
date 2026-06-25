import "server-only"

import { and, count, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { isValidAdminRole, type AdminRole } from "@/lib/constants/admin-roles"

const VALID_NON_SUPER_ADMIN_ROLES: (AdminRole | null)[] = [
  "ketua_rt",
  "bendahara",
  "sekretaris",
  "anggota",
  null,
]

/** Reads adminRole fresh from DB (anti stale-session). */
async function getActorAdminRole(userId: string): Promise<AdminRole | null> {
  const [row] = await db
    .select({ adminRole: user.adminRole })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)
  return isValidAdminRole(row?.adminRole) ? row!.adminRole : null
}

/** Asserts actor is super_admin. Throws on failure. */
async function assertActorIsSuperAdmin(actorUserId: string): Promise<void> {
  const role = await getActorAdminRole(actorUserId)
  if (role !== "super_admin") {
    throw new Error("FORBIDDEN")
  }
}

/** Lists all super admins with role='admin' and adminRole='super_admin'. */
export async function listSuperAdmins(): Promise<Array<{ id: string; name: string; username: string | null }>> {
  const rows = await db
    .select({ id: user.id, name: user.name, username: user.username })
    .from(user)
    .where(and(eq(user.role, "admin"), eq(user.adminRole, "super_admin")))
  return rows.map((r) => ({ id: r.id, name: r.name, username: r.username }))
}

/** Promote target user to super_admin. Only actor super_admin fresh can do this. */
export async function promoteToSuperAdmin(targetUserId: string, actorUserId: string): Promise<void> {
  await assertActorIsSuperAdmin(actorUserId)

  const [targetUser] = await db
    .select({ id: user.id, role: user.role })
    .from(user)
    .where(eq(user.id, targetUserId))
    .limit(1)

  if (!targetUser) {
    throw new Error("USER_NOT_FOUND")
  }

  if (targetUser.role !== "admin") {
    throw new Error("USER_NOT_ADMIN")
  }

  await db
    .update(user)
    .set({ adminRole: "super_admin", updatedAt: new Date() })
    .where(eq(user.id, targetUserId))
}

/** Demote target user from super_admin. Cannot demote the last super_admin. */
export async function demoteSuperAdmin(
  targetUserId: string,
  nextAdminRole: AdminRole | null,
  actorUserId: string,
): Promise<void> {
  await assertActorIsSuperAdmin(actorUserId)

  if (!VALID_NON_SUPER_ADMIN_ROLES.includes(nextAdminRole)) {
    throw new Error("INVALID_ADMIN_ROLE")
  }

  const [targetUser] = await db
    .select({ id: user.id, adminRole: user.adminRole })
    .from(user)
    .where(eq(user.id, targetUserId))
    .limit(1)

  if (!targetUser) {
    throw new Error("USER_NOT_FOUND")
  }

  if (targetUser.adminRole !== "super_admin") {
    throw new Error("NOT_SUPER_ADMIN")
  }

  const [countRow] = await db
    .select({ total: count() })
    .from(user)
    .where(and(eq(user.role, "admin"), eq(user.adminRole, "super_admin")))

  const totalSuperAdmins = countRow?.total ?? 0
  if (totalSuperAdmins <= 1) {
    throw new Error("LAST_SUPER_ADMIN")
  }

  await db
    .update(user)
    .set({ adminRole: nextAdminRole, updatedAt: new Date() })
    .where(eq(user.id, targetUserId))
}
