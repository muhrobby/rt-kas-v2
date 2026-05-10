import { z } from "zod"

export const createKasMasukSchema = z.object({
  wargaId: z.number().int().positive("Pilih warga."),
  kategoriId: z.number().int().positive("Pilih kategori."),
  nominal: z.number().int().positive("Nominal harus lebih dari 0."),
  bulanTagihan: z.union([z.string(), z.array(z.string())]).optional(),
  tahunTagihan: z.number().int().min(2000).max(2100).optional(),
  keterangan: z.string().trim().max(500).optional(),
})

export const createKasKeluarSchema = z.object({
  kategoriId: z.number().int().positive("Pilih kategori."),
  nominal: z.number().int().positive("Nominal harus lebih dari 0."),
  waktuTransaksi: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid.")
    .refine((val) => {
      const year = Number(val.slice(0, 4))
      return year >= 2000 && year <= 2100
    }, { message: "Tahun transaksi harus antara 2000-2100." })
    .refine((val) => {
      const d = new Date()
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      return val <= today
    }, { message: "Tanggal transaksi tidak boleh di masa depan." }),
  keterangan: z.string().trim().max(500).optional(),
})

export type CreateKasMasukInput = z.infer<typeof createKasMasukSchema>
export type CreateKasKeluarInput = z.infer<typeof createKasKeluarSchema>
