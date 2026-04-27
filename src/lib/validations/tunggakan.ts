import { z } from "zod"

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
      const mulai = data.tahunMulai * 12 + data.bulanMulai
      const selesai = data.tahunSelesai * 12 + data.bulanSelesai
      return mulai <= selesai
    },
    {
      message: "Periode mulai tidak boleh lebih besar dari periode selesai.",
      path: ["bulanMulai"],
    }
  )

export type TunggakanFilterInput = z.infer<typeof tunggakanFilterSchema>
