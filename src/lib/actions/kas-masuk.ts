"use server"

import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/auth/permissions"
import { db } from "@/lib/db"
import { kategoriKas, transaksi, warga } from "@/lib/db/schema"
import { writeAuditLog } from "@/lib/services/audit-log-service"
import { hasPaidMonthly, hasPaidSekali } from "@/lib/services/transaksi-service"
import { listWarga } from "@/lib/services/warga-service"
import {
  type CreateKasMasukInput,
  createKasMasukSchema,
} from "@/lib/validations/transaksi"
import { ZodError } from "zod"
import { eq } from "drizzle-orm"
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
    data: data.map((w) => ({
      id: w.id,
      nama: w.nama,
      blok: w.blok,
      telp: w.telp,
      statusHunian: w.statusHunian,
    })),
  }
}

export async function listKategoriAction() {
  await requireAdmin()
  const rows = await db.select({
    id: kategoriKas.id,
    nama: kategoriKas.namaKategori,
    jenisArus: kategoriKas.jenisArus,
    tipeTagihan: kategoriKas.tipeTagihan,
    nominalDefault: kategoriKas.nominalDefault,
  }).from(kategoriKas)
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
  return { ok: true as const, data: paid.sort((a, b) => a - b) }
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

    if (kategori.tipeTagihan === "bulanan") {
      const bulanInput = parsed.bulanTagihan
      const tahun = parsed.tahunTagihan
      if (bulanInput === undefined || !tahun) {
        return { ok: false, error: "Bulan dan tahun tagihan wajib untuk kategori bulanan." }
      }

      const daftarBulan = Array.isArray(bulanInput) ? bulanInput : [bulanInput]
      if (daftarBulan.length === 0) {
        return { ok: false, error: "Pilih minimal 1 bulan tagihan." }
      }

      for (const bulan of daftarBulan) {
        const paid = await hasPaidMonthly(parsed.wargaId, parsed.kategoriId, Number(bulan), tahun)
        if (paid) {
          return {
            ok: false,
            error: `Warga sudah membayar ${kategori.namaKategori} untuk bulan ${bulan}/${tahun}.`,
          }
        }
      }
    } else {
      const paid = await hasPaidSekali(parsed.wargaId, parsed.kategoriId)
      if (paid) {
        return {
          ok: false,
          error: `Warga sudah pernah membayar ${kategori.namaKategori}.`,
        }
      }
    }

    const createdRows = kategori.tipeTagihan === "bulanan"
      ? await db
          .insert(transaksi)
          .values(
            (Array.isArray(parsed.bulanTagihan) ? parsed.bulanTagihan : [parsed.bulanTagihan ?? ""]).map((bulan) => ({
              userId: admin.id,
              wargaId: parsed.wargaId,
              kategoriId: parsed.kategoriId,
              nominal: parsed.nominal,
              bulanTagihan: bulan,
              tahunTagihan: parsed.tahunTagihan,
              tipeArus: "masuk" as const,
              keterangan: parsed.keterangan ?? null,
            })),
          )
          .returning({ id: transaksi.id })
      : await db
          .insert(transaksi)
          .values({
            userId: admin.id,
            wargaId: parsed.wargaId,
            kategoriId: parsed.kategoriId,
            nominal: parsed.nominal,
            bulanTagihan: null,
            tahunTagihan: null,
            tipeArus: "masuk",
            keterangan: parsed.keterangan ?? null,
          })
          .returning({ id: transaksi.id })

    const created = createdRows[0]

    await writeAuditLog({
      userId: admin.id,
      modul: "Kas Masuk",
      aksi: "tambah",
      keterangan:
        kategori.tipeTagihan === "bulanan" && Array.isArray(parsed.bulanTagihan)
          ? `Mencatat kas masuk "${kategori.namaKategori}" (${parsed.bulanTagihan.length} bulan) dari ${wargaRow.namaKepalaKeluarga} (${wargaRow.blokRumah})`
          : `Mencatat kas masuk "${kategori.namaKategori}" dari ${wargaRow.namaKepalaKeluarga} (${wargaRow.blokRumah})`,
    })

    revalidatePath("/admin/kas-masuk")
    revalidatePath("/admin/dashboard")
    revalidatePath("/warga/dashboard")

    return { ok: true, data: created }
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "23505") {
      return {
        ok: false,
        error: "Pembayaran untuk warga dan kategori ini sudah tercatat (duplikat).",
      }
    }
    return toActionError(error)
  }
}
