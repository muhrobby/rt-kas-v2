import { z } from "zod"

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/

export const appSettingsInputSchema = z.object({
  appName: z.string().trim().min(1, "Nama aplikasi wajib diisi.").max(80, "Nama aplikasi maksimal 80 karakter."),
  organizationName: z.string().trim().min(1, "Nama organisasi wajib diisi.").max(120, "Nama organisasi maksimal 120 karakter."),
  rtNumber: z.string().trim().min(1, "Nomor RT wajib diisi.").regex(/^\d{1,4}$/, "Nomor RT harus angka 1-4 digit."),
  rwNumber: z.string().trim().min(1, "Nomor RW wajib diisi.").regex(/^\d{1,4}$/, "Nomor RW harus angka 1-4 digit."),
  address: z.string().trim().max(240, "Alamat maksimal 240 karakter.").nullable().optional(),
  phone: z.string().trim().max(30, "Nomor telepon maksimal 30 karakter.").nullable().optional(),
  email: z.string().trim().email("Format email tidak valid.").max(120, "Email maksimal 120 karakter.").optional().or(z.literal("").transform(() => undefined)),
  primaryColor: z.string().trim().regex(hexColorRegex, "Warna utama harus format HEX (#RRGGBB).").default("#2d6bb4"),
  secondaryColor: z.string().trim().regex(hexColorRegex, "Warna sekunder harus format HEX (#RRGGBB).").default("#1f4f8a"),
  accentColor: z.string().trim().regex(hexColorRegex, "Warna aksen harus format HEX (#RRGGBB).").default("#d6e7fb"),
  receiptTitle: z.string().trim().min(1, "Judul kuitansi wajib diisi.").max(100, "Judul kuitansi maksimal 100 karakter."),
  receiptFooter: z.string().trim().max(240, "Footer kuitansi maksimal 240 karakter.").nullable().optional(),
})

export type AppSettingsInput = z.infer<typeof appSettingsInputSchema>
