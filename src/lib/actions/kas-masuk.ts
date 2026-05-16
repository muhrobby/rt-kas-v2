"use server"

import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/auth/permissions"
import { db } from "@/lib/db"
import { kategoriKas, transaksi, warga } from "@/lib/db/schema"
import { writeAuditLog } from "@/lib/services/audit-log-service"
import { listWarga } from "@/lib/services/warga-service"
import { getFirstBillablePeriod, isPeriodEligible } from "@/lib/billing/billing-eligibility"
import {
  type CreateKasMasukInput,
  createKasMasukSchema,
} from "@/lib/validations/transaksi"
import { ZodError } from "zod"
import { and, count, eq } from "drizzle-orm"
import { BULAN } from "@/lib/constants/months"

type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false
      error: string
      fieldErrors?: Record<string, string[]>
    }

export async function listWargaAction(input: { search?: string; status?: "semua" | "tetap" | "kontrak" } = {}) {
  await requireAdmin()
  const data = await listWarga({ search: input.search, status: input.status })
  return {
    ok: true as const,
    data: data.map((w) => {
      const firstBill = getFirstBillablePeriod(w.createdAt)
      return {
        id: w.id,
        nama: w.nama,
        blok: w.blok,
        telp: w.telp,
        statusHunian: w.statusHunian,
        createdAt: w.createdAt.toISOString(),
        firstBillMonth: firstBill.bulan,
        firstBillYear: firstBill.tahun,
      }
    }),
  }
}

export async function listKategoriAction() {
  await requireAdmin()
  const rows = await db
    .select({
      id: kategoriKas.id,
      nama: kategoriKas.namaKategori,
      jenisArus: kategoriKas.jenisArus,
      tipeTagihan: kategoriKas.tipeTagihan,
      nominalDefault: kategoriKas.nominalDefault,
    })
    .from(kategoriKas)
    .where(eq(kategoriKas.jenisArus, "masuk"))
  return { ok: true as const, data: rows }
}

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    const flattened = error.flatten().fieldErrors as Record<string, string[]>
    return {
      ok: false,
      error: "Input tidak valid.",
      fieldErrors: flattened,
    }
  }
  return {
    ok: false,
    error: "Terjadi kesalahan server. Coba lagi.",
  }
}

function isValidMonth(value: string) {
  const month = Number(value)
  return Number.isInteger(month) && month >= 1 && month <= 12
}

export async function listTransaksiMasukAction() {
  await requireAdmin()
  const { listTransaksiMasuk } = await import("@/lib/services/transaksi-service")
  const rows = await listTransaksiMasuk({})
  return {
    ok: true as const,
    data: rows.map((row) => ({
      id: row.id,
      tanggal: row.waktuTransaksi.toISOString().slice(0, 10),
      jenisArus: row.tipeArus,
      wargaId: row.wargaId,
      wargaNama: row.wargaNama,
      wargaBlok: row.wargaBlok,
      kategoriId: row.kategoriId,
      kategoriNama: row.kategoriNama,
      nominal: row.nominal,
      bulanTagihan: row.bulanTagihan,
      tahunTagihan: row.tahunTagihan,
      keterangan: row.keterangan,
    })),
  }
}

export async function getPaidMonthsAction(wargaId: number, kategoriId: number, tahun: number) {
  await requireAdmin()

  const [wargaRow] = await db.select().from(warga).where(eq(warga.id, wargaId)).limit(1)
  if (!wargaRow) {
    return { ok: false, error: "Data warga tidak ditemukan." }
  }

  const [kategori] = await db.select().from(kategoriKas).where(eq(kategoriKas.id, kategoriId)).limit(1)
  if (!kategori) {
    return { ok: false, error: "Kategori tidak ditemukan." }
  }

  // allow both bulanan and sekali

  const { listTransaksiMasuk } = await import("@/lib/services/transaksi-service")
  const rows = await listTransaksiMasuk({ wargaId, kategoriId })
  const paid: number[] = []
  for (const row of rows) {
    if (row.bulanTagihan != null && row.tahunTagihan === tahun) {
      const rawMonth = Number(row.bulanTagihan)
      const namedMonth = BULAN.findIndex((monthName) => monthName.toLowerCase() === row.bulanTagihan?.toLowerCase()) + 1
      const month = Number.isInteger(rawMonth) ? rawMonth : namedMonth || null
      if (month && !paid.includes(month)) paid.push(month)
    }
  }

  const firstBill = getFirstBillablePeriod(wargaRow.createdAt)
  const notEligible: number[] = []

  if (kategori.tipeTagihan === "bulanan") {
    if (tahun < firstBill.tahun) {
      for (let m = 1; m <= 12; m++) notEligible.push(m)
    } else if (tahun === firstBill.tahun) {
      for (let m = 1; m < firstBill.bulan; m++) notEligible.push(m)
    }
  }

  return {
    ok: true as const,
    data: {
      paid: paid.sort((a, b) => a - b),
      notEligible: notEligible.sort((a, b) => a - b),
    },
  }
}

export async function createKasMasukAction(input: CreateKasMasukInput): Promise<ActionResult<{ id: number }>> {
  const admin = await requireAdmin()

  try {
    const parsed = createKasMasukSchema.parse(input)

    const [kategori] = await db.select().from(kategoriKas).where(eq(kategoriKas.id, parsed.kategoriId)).limit(1)
    if (!kategori) {
      return { ok: false, error: "Kategori tidak ditemukan." }
    }
    if (kategori.jenisArus !== "masuk") {
      return { ok: false, error: "Kategori ini bukan kategori masuk." }
    }

    const [wargaRow] = await db.select().from(warga).where(eq(warga.id, parsed.wargaId)).limit(1)
    if (!wargaRow) {
      return { ok: false, error: "Data warga tidak ditemukan." }
    }

    const bulanInput = parsed.bulanTagihan
    const tahun = parsed.tahunTagihan
    if (bulanInput === undefined || !tahun) {
      return { ok: false, error: "Bulan dan tahun tagihan wajib untuk kategori ini." }
    }

    const daftarBulan = Array.isArray(bulanInput) ? bulanInput : [bulanInput]
    if (daftarBulan.length === 0) {
      return { ok: false, error: "Pilih minimal 1 bulan tagihan." }
    }

    if (daftarBulan.some((bulan) => !isValidMonth(bulan))) {
      return { ok: false, error: "Bulan tagihan tidak valid." }
    }

    if (kategori.tipeTagihan === "sekali" && daftarBulan.length !== 1) {
      return { ok: false, error: "Kategori sekali bayar hanya boleh memilih 1 bulan." }
    }

    if (kategori.tipeTagihan === "bulanan") {
      for (const bulan of daftarBulan) {
        if (!isPeriodEligible(wargaRow.createdAt, Number(bulan), tahun)) {
          return {
            ok: false,
            error: "Periode tagihan belum berlaku untuk warga ini.",
          }
        }
      }
    }

    const created = await db.transaction(async (tx) => {
      for (const bulan of daftarBulan) {
        const [dupRow] = await tx
          .select({ total: count() })
          .from(transaksi)
          .where(
            and(
              eq(transaksi.wargaId, parsed.wargaId),
              eq(transaksi.kategoriId, parsed.kategoriId),
              eq(transaksi.bulanTagihan, String(bulan)),
              eq(transaksi.tahunTagihan, tahun),
              eq(transaksi.tipeArus, "masuk"),
            ),
          )
          .limit(1)
        if ((dupRow?.total ?? 0) > 0) {
          throw Object.assign(new Error("DUPLICATE"), { bulan })
        }
      }

      const createdRows = await tx
        .insert(transaksi)
        .values(
          daftarBulan.map((bulan) => ({
            userId: admin.id,
            wargaId: parsed.wargaId,
            kategoriId: parsed.kategoriId,
            nominal: parsed.nominal,
            bulanTagihan: bulan,
            tahunTagihan: tahun,
            tipeArus: "masuk" as const,
            keterangan: parsed.keterangan ?? null,
          })),
        )
        .returning({ id: transaksi.id })

      return createdRows[0]
    })

    await writeAuditLog({
      userId: admin.id,
      modul: "Kas Masuk",
      aksi: "tambah",
      keterangan:
        Array.isArray(parsed.bulanTagihan)
          ? `Mencatat kas masuk "${kategori.namaKategori}" (${parsed.bulanTagihan.length} bulan) dari ${wargaRow.namaKepalaKeluarga} (${wargaRow.blokRumah})`
          : `Mencatat kas masuk "${kategori.namaKategori}" dari ${wargaRow.namaKepalaKeluarga} (${wargaRow.blokRumah})`,
    })

    revalidatePath("/admin/kas-masuk")
    revalidatePath("/admin/dashboard")
    revalidatePath("/warga/dashboard")

    return { ok: true, data: created }
  } catch (error) {
    if (error instanceof Error && error.message === "DUPLICATE") {
      const bulan = (error as Error & { bulan?: string }).bulan
      return {
        ok: false,
        error: bulan
          ? `Pembayaran untuk bulan ${bulan} sudah tercatat (duplikat).`
          : "Pembayaran untuk warga dan kategori ini sudah tercatat (duplikat).",
      }
    }
    if (error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "23505") {
      return {
        ok: false,
        error: "Pembayaran untuk warga dan kategori ini sudah tercatat (duplikat).",
      }
    }
    return toActionError(error)
  }
}
