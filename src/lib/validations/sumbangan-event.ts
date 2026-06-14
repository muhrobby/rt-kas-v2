import { z } from "zod"

export const SUMBER_SUMBANGAN = [
  "MANDIRI_WARGA",
  "TALANGAN_KAS",
  "URUNAN_PENGURUS",
  "SUMBANGAN_TAMBAHAN_WARGA",
] as const

export type SumberSumbangan = (typeof SUMBER_SUMBANGAN)[number]

export const createSumbanganSchema = z
  .object({
    eventId: z.number().int().positive(),
    wargaId: z.number().int().positive().nullable(),
    nominal: z.number().int().min(0, "Nominal tidak boleh negatif.").max(2_000_000_000),
    sumber: z.enum(SUMBER_SUMBANGAN).default("MANDIRI_WARGA"),
    tanggal: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid.")
      .optional(),
    keterangan: z.string().trim().max(500).optional(),
  })
  .refine(
    (data) => data.sumber === "URUNAN_PENGURUS" || data.sumber === "TALANGAN_KAS" || data.wargaId != null,
    { message: "Warga wajib dipilih.", path: ["wargaId"] },
  )

export const bulkSumbanganItemSchema = z.object({
  wargaId: z.number().int().positive(),
  nominal: z.number().int().min(0).max(2_000_000_000),
})

export const createBulkSumbanganSchema = z.object({
  eventId: z.number().int().positive(),
  items: z.array(bulkSumbanganItemSchema).min(1).max(200),
})

export type CreateSumbanganInput = z.infer<typeof createSumbanganSchema>
export type CreateBulkSumbanganInput = z.infer<typeof createBulkSumbanganSchema>
