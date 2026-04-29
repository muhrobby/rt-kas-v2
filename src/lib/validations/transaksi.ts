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
  waktuTransaksi: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid."),
  keterangan: z.string().trim().max(500).optional(),
})

export type CreateKasMasukInput = z.infer<typeof createKasMasukSchema>
export type CreateKasKeluarInput = z.infer<typeof createKasKeluarSchema>
