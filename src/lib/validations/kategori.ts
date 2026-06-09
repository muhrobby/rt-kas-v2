import { z } from "zod"

const jenisArusSchema = z.enum(["masuk", "keluar"])
const tipeTagihanSchema = z.enum(["bulanan", "sekali"])
const bulanTagihanSchema = z.union([
  z.number().int().min(1, "Bulan tagihan harus antara 1 dan 12.").max(12, "Bulan tagihan harus antara 1 dan 12."),
  z
    .string()
    .trim()
    .min(1, "Bulan tagihan wajib diisi.")
    .refine(
      (val) =>
        [
          "januari",
          "februari",
          "maret",
          "april",
          "mei",
          "juni",
          "juli",
          "agustus",
          "september",
          "oktober",
          "november",
          "desember",
        ].includes(val.toLowerCase()),
      "Bulan tagihan harus berupa nama bulan yang valid.",
    ),
])

export const createKategoriInputSchema = z.object({
  nama: z.string().trim().min(1, "Nama kategori wajib diisi."),
  jenisArus: jenisArusSchema,
  tipeTagihan: tipeTagihanSchema.default("bulanan"),
  nominalDefault: z.number().int().min(0, "Nominal default tidak boleh negatif."),
  bulanTagihan: z.union([bulanTagihanSchema, z.literal(""), z.null()]).optional(),
  tahunTagihan: z.union([z.number().int().min(2000, "Tahun tagihan harus antara 2000 dan 2100.").max(2100, "Tahun tagihan harus antara 2000 dan 2100."), z.literal(""), z.null()]).optional(),
}).superRefine((value, ctx) => {
  if (value.tipeTagihan === "sekali") {
    if (value.bulanTagihan === undefined || value.bulanTagihan === null || value.bulanTagihan === "") {
      ctx.addIssue({
        path: ["bulanTagihan"],
        code: z.ZodIssueCode.custom,
        message: "Bulan tagihan wajib diisi untuk tipe sekali.",
      })
    }

    if (value.tahunTagihan === undefined || value.tahunTagihan === null || value.tahunTagihan === "") {
      ctx.addIssue({
        path: ["tahunTagihan"],
        code: z.ZodIssueCode.custom,
        message: "Tahun tagihan wajib diisi untuk tipe sekali.",
      })
    }
  }

  if (value.tipeTagihan === "bulanan") {
    if (value.bulanTagihan !== undefined && value.bulanTagihan !== null && value.bulanTagihan !== "") {
      ctx.addIssue({
        path: ["bulanTagihan"],
        code: z.ZodIssueCode.custom,
        message: "Bulan tagihan harus kosong untuk tipe bulanan.",
      })
    }

    if (value.tahunTagihan !== undefined && value.tahunTagihan !== null && value.tahunTagihan !== "") {
      ctx.addIssue({
        path: ["tahunTagihan"],
        code: z.ZodIssueCode.custom,
        message: "Tahun tagihan harus kosong untuk tipe bulanan.",
      })
    }
  }
})

export const updateKategoriInputSchema = createKategoriInputSchema

export type CreateKategoriInput = z.infer<typeof createKategoriInputSchema>
export type UpdateKategoriInput = z.infer<typeof updateKategoriInputSchema>
