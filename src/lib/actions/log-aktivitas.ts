"use server"

import { requireAdmin } from "@/lib/auth/permissions"
import { listLogAktivitasWithCount, type LogAktivitasFilters } from "@/lib/services/log-aktivitas-service"

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export async function getLogAktivitasAction(
  filter: LogAktivitasFilters = {},
): Promise<ActionResult<{
  data: import("@/types/rt-kas").LogAktivitas[]
  total: number
  limit: number
  offset: number
}>> {
  try {
    await requireAdmin()

    const result = await listLogAktivitasWithCount(filter)

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
