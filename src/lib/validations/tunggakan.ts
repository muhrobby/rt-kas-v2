import { z } from "zod"

export const MAX_TUNGGAKAN_RANGE_MONTHS = 24

function getPeriodIndex(year: number, month: number) {
  return year * 12 + month
}

export const tunggakanFilterSchema = z
  .object({
    kategoriId: z.number().int().positive().optional(),
    bulanMulai: z.number().int().min(1).max(12, "Bulan harus antara 1-12."),
    tahunMulai: z.number().int().min(2000).max(2100, "Tahun harus antara 2000-2100."),
    bulanSelesai: z.number().int().min(1).max(12, "Bulan harus antara 1-12."),
    tahunSelesai: z.number().int().min(2000).max(2100, "Tahun harus antara 2000-2100."),
  })
  .refine(
    (data) => {
      const mulai = getPeriodIndex(data.tahunMulai, data.bulanMulai)
      const selesai = getPeriodIndex(data.tahunSelesai, data.bulanSelesai)
      return mulai <= selesai
    },
    {
      message: "Periode mulai tidak boleh lebih besar dari periode selesai.",
      path: ["bulanMulai"],
    }
  )
  .refine(
    (data) => {
      const mulai = getPeriodIndex(data.tahunMulai, data.bulanMulai)
      const selesai = getPeriodIndex(data.tahunSelesai, data.bulanSelesai)
      return selesai - mulai + 1 <= MAX_TUNGGAKAN_RANGE_MONTHS
    },
    {
      message: `Range periode maksimal ${MAX_TUNGGAKAN_RANGE_MONTHS} bulan.`,
      path: ["bulanSelesai"],
    },
  )

export type TunggakanFilterInput = z.infer<typeof tunggakanFilterSchema>
