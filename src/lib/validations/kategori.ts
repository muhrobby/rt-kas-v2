import { z } from "zod"

const jenisArusSchema = z.enum(["masuk", "keluar"])
const tipeTagihanSchema = z.enum(["bulanan", "sekali"])

export const createKategoriInputSchema = z.object({
  nama: z.string().trim().min(1, "Nama kategori wajib diisi."),
  jenisArus: jenisArusSchema,
  tipeTagihan: tipeTagihanSchema.default("bulanan"),
  nominalDefault: z.number().int().min(0, "Nominal default tidak boleh negatif."),
})

export const updateKategoriInputSchema = createKategoriInputSchema

export type CreateKategoriInput = z.infer<typeof createKategoriInputSchema>
export type UpdateKategoriInput = z.infer<typeof updateKategoriInputSchema>
