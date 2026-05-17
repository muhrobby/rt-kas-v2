"use server"

import { requirePermission } from "@/lib/auth/permissions"
import { getPdfBranding } from "@/lib/branding/format-branding"
import type { PdfBranding } from "@/lib/branding/format-branding"
import { getAppSettings } from "@/lib/services/app-settings-service"
import { getKuitansiForAdmin } from "@/lib/services/kuitansi-service"

type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false
      error: string
    }

type KuitansiAdminPdfData = Awaited<ReturnType<typeof getKuitansiForAdmin>> & {
  branding: PdfBranding
}

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof Error && error.message.startsWith("Kuitansi tidak ditemukan")) {
    return { ok: false, error: error.message }
  }
  return { ok: false, error: "Terjadi kesalahan server. Coba lagi." }
}

export async function getKuitansiAdminAction(transaksiId: number): Promise<ActionResult<KuitansiAdminPdfData>> {
  await requirePermission("kuitansi.admin.read")
  try {
    const [kuitansi, settings] = await Promise.all([getKuitansiForAdmin(transaksiId), getAppSettings()])
    return { ok: true, data: { ...kuitansi, branding: getPdfBranding(settings) } }
  } catch (error) {
    return toActionError(error)
  }
}
