"use server"

import { requireAdmin } from "@/lib/auth/permissions"
import { getKuitansiForAdmin } from "@/lib/services/kuitansi-service"

type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false
      error: string
    }

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof Error && error.message.startsWith("Kuitansi tidak ditemukan")) {
    return { ok: false, error: error.message }
  }
  return { ok: false, error: "Terjadi kesalahan server. Coba lagi." }
}

export async function getKuitansiAdminAction(transaksiId: number): Promise<ActionResult<Awaited<ReturnType<typeof getKuitansiForAdmin>>>> {
  await requireAdmin()
  try {
    const data = await getKuitansiForAdmin(transaksiId)
    return { ok: true, data }
  } catch (error) {
    return toActionError(error)
  }
}
