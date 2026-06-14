import { z } from "zod"

export const pengeluaranItemSchema = z.object({
  deskripsi: z.string().trim().min(1, "Deskripsi wajib diisi.").max(255, "Deskripsi maksimal 255 karakter."),
  nominal: z.number().int().positive("Nominal harus lebih dari 0.").max(2_000_000_000, "Nominal terlalu besar."),
  tanggal: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid.")
    .refine((val) => {
      const year = Number(val.slice(0, 4))
      return year >= 2000 && year <= 2100
    }, { message: "Tahun harus antara 2000-2100." }),
})

export const bulkCreatePengeluaranSchema = z.object({
  eventId: z.number().int().positive(),
  items: z.array(pengeluaranItemSchema).min(1, "Minimal 1 item.").max(50, "Maksimal 50 item."),
})

export const updatePengeluaranSchema = z
  .object({
    id: z.number().int().positive(),
    deskripsi: z.string().trim().min(1).max(255).optional(),
    nominal: z.number().int().positive().max(2_000_000_000).optional(),
    tanggal: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid.")
      .refine((val) => {
        const year = Number(val.slice(0, 4))
        return year >= 2000 && year <= 2100
      }, { message: "Tahun harus antara 2000-2100." })
      .optional(),
  })
  .refine(
    (data) => data.deskripsi !== undefined || data.nominal !== undefined || data.tanggal !== undefined,
    { message: "Minimal 1 field harus di-update." },
  )

export const approveSchema = z.object({
  id: z.number().int().positive(),
})

export const rejectSchema = z.object({
  id: z.number().int().positive(),
  reason: z.string().trim().min(5, "Alasan minimal 5 karakter.").max(500, "Alasan maksimal 500 karakter."),
})

export type BulkCreatePengeluaranInput = z.infer<typeof bulkCreatePengeluaranSchema>
export type UpdatePengeluaranInput = z.infer<typeof updatePengeluaranSchema>
export type ApproveInput = z.infer<typeof approveSchema>
export type RejectInput = z.infer<typeof rejectSchema>
