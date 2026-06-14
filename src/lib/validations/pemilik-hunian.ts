import { z } from "zod"

function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return ""
  if (digits.startsWith("0")) return digits
  if (digits.startsWith("62")) return `0${digits.slice(2)}`
  return `0${digits}`
}

export const createPemilikHunianSchema = z.object({
  nama: z
    .string()
    .trim()
    .min(1, "Nama pemilik wajib diisi.")
    .max(100, "Nama maksimal 100 karakter.")
    .transform((v) => v.replace(/[<>]/g, "")),
  noTelp: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? normalizePhone(v) : undefined))
    .refine(
      (v) => !v || (v.length >= 10 && v.length <= 15),
      "Nomor telepon tidak valid.",
    ),
})

export type CreatePemilikHunianInput = z.infer<typeof createPemilikHunianSchema>
