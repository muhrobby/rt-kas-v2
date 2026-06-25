import { z } from "zod"

import { STATUS_EVENT } from "@/lib/constants/event-status"

export const createEventSchema = z.object({
  nama: z.string().trim().min(3, "Nama minimal 3 karakter.").max(150, "Nama maksimal 150 karakter."),
  tanggalPelaksanaan: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid.")
    .refine((val) => {
      const year = Number(val.slice(0, 4))
      return year >= 2000 && year <= 2100
    }, { message: "Tahun harus antara 2000-2100." }),
  deskripsi: z.string().trim().max(2000, "Deskripsi maksimal 2000 karakter.").optional(),
})

export const updateEventSchema = createEventSchema.partial().extend({
  id: z.number().int().positive(),
})

export const transitionStatusSchema = z.object({
  id: z.number().int().positive(),
  target: z.enum(STATUS_EVENT),
})

export const cancelEventSchema = z.object({
  id: z.number().int().positive(),
  reason: z.string().trim().min(5, "Alasan minimal 5 karakter.").max(500, "Alasan maksimal 500 karakter."),
  sumbanganHandling: z.enum(["REFUND_MANUAL", "PINDAH_KAS_RT", "PINDAH_EVENT_LAIN"]),
  eventTujuanId: z.number().int().positive().optional(),
}).refine(
  (data) => data.sumbanganHandling !== "PINDAH_EVENT_LAIN" || data.eventTujuanId != null,
  { message: "Pilih event tujuan.", path: ["eventTujuanId"] },
)

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type TransitionStatusInput = z.infer<typeof transitionStatusSchema>
export type CancelEventInput = z.infer<typeof cancelEventSchema>
