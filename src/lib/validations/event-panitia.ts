import { z } from "zod"

export const appointPanitiaSchema = z.object({
  eventId: z.number().int().positive(),
  userId: z.string().min(1, "User wajib dipilih."),
})

export const removePanitiaSchema = z.object({
  eventId: z.number().int().positive(),
  userId: z.string().min(1),
})

export type AppointPanitiaInput = z.infer<typeof appointPanitiaSchema>
export type RemovePanitiaInput = z.infer<typeof removePanitiaSchema>
