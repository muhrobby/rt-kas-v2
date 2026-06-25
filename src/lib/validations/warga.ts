import { z } from "zod"

const statusHunianSchema = z.enum(["tetap", "kontrak", "kos"])

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
  // Validasi dilakukan setelah normalisasi: nomor Indonesia minimal 10 digit (08xxxxxxxx)
  // dan maksimal 15 digit sesuai standar E.164
  telp: z
    .string()
    .trim()
    .min(1, "Nomor telepon wajib diisi.")
    .refine(
      (val) => {
        const normalized = normalizePhone(val)
        return normalized.length >= 10 && normalized.length <= 15
      },
      "Nomor telepon tidak valid. Gunakan format 08xxx atau 628xxx.",
    ),
  statusHunian: statusHunianSchema,
  jumlahAnggota: z.number().int().min(1, "Jumlah anggota minimal 1."),
  tglBatasDomisili: z.string().optional(),
  tglPindah: z.string().optional(),
  pemilikHunianId: z.number().int().nullable().optional(),
  pemilikHunianOptionValue: z.string().optional(),
})

export const createWargaInputSchema = baseWargaSchema.superRefine((value, ctx) => {
  if ((value.statusHunian === "kontrak" || value.statusHunian === "kos") && !value.tglBatasDomisili) {
    ctx.addIssue({
      path: ["tglBatasDomisili"],
      code: z.ZodIssueCode.custom,
      message: "Batas domisili wajib diisi untuk status kontrak/kos.",
    })
  }
  if ((value.statusHunian === "kontrak" || value.statusHunian === "kos") && !value.pemilikHunianOptionValue && !value.pemilikHunianId) {
    ctx.addIssue({
      path: ["pemilikHunianOptionValue"],
      code: z.ZodIssueCode.custom,
      message: "Pemilik hunian wajib dipilih untuk status kontrak/kos.",
    })
  }
})

export const updateWargaInputSchema = createWargaInputSchema

export type CreateWargaInput = z.infer<typeof createWargaInputSchema>
export type UpdateWargaInput = z.infer<typeof updateWargaInputSchema>

export const toggleWargaPengurusInputSchema = z.object({
  isPengurus: z.boolean(),
  adminRole: z.enum(["ketua_rt", "bendahara", "sekretaris", "anggota"]).optional(),
}).refine(
  (val) => !val.isPengurus || val.adminRole,
  { message: "Sub-role wajib dipilih saat menjadikan pengurus.", path: ["adminRole"] },
)

export type ToggleWargaPengurusInput = z.infer<typeof toggleWargaPengurusInputSchema>

export function toDbPhoneNumber(telp: string) {
  return normalizePhone(telp)
}

export function parseWargaInput<T extends CreateWargaInput | UpdateWargaInput>(input: T) {
  const parsed = createWargaInputSchema.parse(input)
  const isNonTetap = parsed.statusHunian === "kontrak" || parsed.statusHunian === "kos"
  return {
    ...parsed,
    telp: toDbPhoneNumber(parsed.telp),
    tglBatasDomisili: isNonTetap ? (parsed.tglBatasDomisili ?? null) : null,
    tglPindah: parsed.tglPindah ?? null,
    pemilikHunianId: isNonTetap ? (parsed.pemilikHunianId ?? null) : null,
    pemilikHunianOptionValue: parsed.pemilikHunianOptionValue,
  }
}
