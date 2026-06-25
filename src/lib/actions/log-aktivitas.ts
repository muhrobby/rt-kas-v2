"use server"

import { and, eq } from "drizzle-orm"

import { requirePermission, requireAuth } from "@/lib/auth/permissions"
import { getAdminRoleFresh } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { getLogFilters, listLogAktivitasWithCount, type LogAktivitasFilters } from "@/lib/services/log-aktivitas-service"

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

async function getSuperAdminUserIds(): Promise<string[]> {
  const rows = await db
    .select({ id: user.id })
    .from(user)
    .where(and(eq(user.role, "admin"), eq(user.adminRole, "super_admin")))
  return rows.map((r) => r.id)
}

export async function getLogFiltersAction(): Promise<ActionResult<Awaited<ReturnType<typeof getLogFilters>>>> {
  try {
    await requirePermission("log.read")
    const currentUser = await requireAuth()
    const adminRole = await getAdminRoleFresh(currentUser.id)

    let excludeUserIds: string[] | undefined
    if (adminRole !== "super_admin") {
      excludeUserIds = await getSuperAdminUserIds()
    }

    const result = await getLogFilters(excludeUserIds)
    return { ok: true, data: result }
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error
    return { ok: false, error: "Gagal memuat filter." }
  }
}

export async function getLogAktivitasAction(
  filter: LogAktivitasFilters = {},
): Promise<ActionResult<{
  data: import("@/types/rt-kas").LogAktivitas[]
  total: number
  limit: number
  offset: number
}>> {
  try {
    await requirePermission("log.read")
    const currentUser = await requireAuth()
    const adminRole = await getAdminRoleFresh(currentUser.id)

    let excludeUserIds: string[] | undefined
    if (adminRole !== "super_admin") {
      excludeUserIds = await getSuperAdminUserIds()
    }

    const result = await listLogAktivitasWithCount({ ...filter, excludeUserIds })

    return {
      ok: true,
      data: result,
    }
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error
    }
    return {
      ok: false,
      error: "Terjadi kesalahan server. Gagal memuat log aktivitas.",
    }
  }
}
