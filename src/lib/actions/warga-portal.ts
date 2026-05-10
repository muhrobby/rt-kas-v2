"use server"

import { requireWarga } from "@/lib/auth/permissions"
import { getPdfBranding } from "@/lib/branding/format-branding"
import type { PdfBranding } from "@/lib/branding/format-branding"
import { getAppSettings } from "@/lib/services/app-settings-service"
import { getKuitansiForWarga } from "@/lib/services/kuitansi-service"
import {
  getWargaDashboardData,
  getWargaLaporanTransparansi,
  getWargaRiwayatPembayaran,
  getWargaRiwayatPembayaranPeriods,
  type WargaLaporanFilter,
  type WargaRiwayatFilter,
} from "@/lib/services/warga-portal-service"
import { z } from "zod"

type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false
      error: string
    }

type KuitansiWargaPdfData = Awaited<ReturnType<typeof getKuitansiForWarga>> & {
  branding: PdfBranding
}

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof Error && error.message.startsWith("Kuitansi tidak ditemukan")) {
    return { ok: false, error: error.message }
  }
  if (error instanceof z.ZodError) {
    return { ok: false, error: "Filter tidak valid." }
  }
  return { ok: false, error: "Terjadi kesalahan server. Coba lagi." }
}

const riwayatFilterSchema = z.object({
  bulan: z.number().int().min(1).max(12).optional(),
  tahun: z.number().int().min(2000).max(2100).optional(),
}).optional()

const laporanFilterSchema = z.object({
  tahun: z.number().int().min(2000).max(2100).optional(),
})

const kuitansiTransaksiIdSchema = z.number().int().positive()

function getSessionWargaId(currentUser: Awaited<ReturnType<typeof requireWarga>>) {
  if (!currentUser.wargaId) {
    throw new Error("Session warga tidak valid.")
  }
  return currentUser.wargaId
}

export async function getMyDashboardAction() {
  const currentUser = await requireWarga()
  return getWargaDashboardData(getSessionWargaId(currentUser))
}

export async function getMyRiwayatAction(filter?: Partial<WargaRiwayatFilter>): Promise<ActionResult<Awaited<ReturnType<typeof getWargaRiwayatPembayaranPeriods>>>> {
  const currentUser = await requireWarga()
  const wargaId = getSessionWargaId(currentUser)

  try {
    const parsed = riwayatFilterSchema.parse(filter)
    if ((parsed?.bulan && !parsed.tahun) || (!parsed?.bulan && parsed?.tahun)) {
      return { ok: false, error: "Bulan dan tahun wajib diisi bersama." }
    }

    if (parsed?.bulan && parsed.tahun) {
      const period = await getWargaRiwayatPembayaran(wargaId, { bulan: parsed.bulan, tahun: parsed.tahun })
      return { ok: true, data: [period] }
    }

    const periods = await getWargaRiwayatPembayaranPeriods(wargaId)
    return { ok: true, data: periods }
  } catch (error) {
    return toActionError(error)
  }
}

export async function getMyKuitansiAction(transaksiId: number): Promise<ActionResult<KuitansiWargaPdfData>> {
  const currentUser = await requireWarga()

  try {
    const parsedTransaksiId = kuitansiTransaksiIdSchema.parse(transaksiId)
    const [kuitansi, settings] = await Promise.all([
      getKuitansiForWarga({ wargaId: getSessionWargaId(currentUser), transaksiId: parsedTransaksiId }),
      getAppSettings(),
    ])
    return { ok: true, data: { ...kuitansi, branding: getPdfBranding(settings) } }
  } catch (error) {
    return toActionError(error)
  }
}

export async function getWargaLaporanAction(filter: WargaLaporanFilter = {}) {
  await requireWarga()
  const parsed = laporanFilterSchema.parse(filter)
  return getWargaLaporanTransparansi(parsed)
}
