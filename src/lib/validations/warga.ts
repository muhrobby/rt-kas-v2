import { z } from "zod"

const statusHunianSchema = z.enum(["tetap", "kontrak"])

function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return ""
  if (digits.startsWith("0")) return digits
  if (digits.startsWith("62")) return `0${digits.slice(2)}`
  return `0${digits}`
}

const baseWargaSchema = z.object({
  nama: z.string().trim().min(1, "Nama kepala keluarga wajib diisi."),
  blok: z.string().trim().min(1, "Blok rumah wajib diisi."),
  telp: z.string().trim().min(8, "Nomor telepon wajib diisi."),
  statusHunian: statusHunianSchema,
  jumlahAnggota: z.number().int().min(1, "Jumlah anggota minimal 1."),
  tglBatasDomisili: z.string().optional(),
  tglPindah: z.string().optional(),
})

export const createWargaInputSchema = baseWargaSchema.superRefine((value, ctx) => {
  if (value.statusHunian === "kontrak" && !value.tglBatasDomisili) {
    ctx.addIssue({
      path: ["tglBatasDomisili"],
      code: z.ZodIssueCode.custom,
      message: "Batas domisili wajib diisi untuk status kontrak.",
    })
  }
})

export const updateWargaInputSchema = createWargaInputSchema

export type CreateWargaInput = z.infer<typeof createWargaInputSchema>
export type UpdateWargaInput = z.infer<typeof updateWargaInputSchema>

export const toggleWargaPengurusInputSchema = z.object({
  isPengurus: z.boolean(),
  rolePengurus: z.string().trim().min(1).optional(),
})

export type ToggleWargaPengurusInput = z.infer<typeof toggleWargaPengurusInputSchema>

export function toDbPhoneNumber(telp: string) {
  return normalizePhone(telp)
}

export function parseWargaInput<T extends CreateWargaInput | UpdateWargaInput>(input: T) {
  const parsed = createWargaInputSchema.parse(input)
  return {
    ...parsed,
    telp: toDbPhoneNumber(parsed.telp),
    tglBatasDomisili: parsed.statusHunian === "kontrak" ? (parsed.tglBatasDomisili ?? null) : null,
    tglPindah: parsed.statusHunian === "kontrak" ? (parsed.tglPindah ?? null) : null,
  }
}
