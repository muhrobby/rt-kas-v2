"use server"

import { revalidatePath } from "next/cache"

import { requirePermission } from "@/lib/auth/permissions"
import { db } from "@/lib/db"
import { kategoriKas, transaksi } from "@/lib/db/schema"
import { writeAuditLog } from "@/lib/services/audit-log-service"
import { type CreateKasKeluarInput, createKasKeluarSchema } from "@/lib/validations/transaksi"
import { ZodError } from "zod"
import { eq } from "drizzle-orm"

type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false
      error: string
      fieldErrors?: Record<string, string[]>
    }

export async function listKategoriKeluarAction() {
  await requirePermission("kas_keluar.read")
  const rows = await db
    .select({
      id: kategoriKas.id,
      nama: kategoriKas.namaKategori,
      jenisArus: kategoriKas.jenisArus,
      tipeTagihan: kategoriKas.tipeTagihan,
      bulanTagihan: kategoriKas.bulanTagihan,
      tahunTagihan: kategoriKas.tahunTagihan,
      nominalDefault: kategoriKas.nominalDefault,
    })
    .from(kategoriKas)
    .where(eq(kategoriKas.jenisArus, "keluar"))
  return { ok: true as const, data: rows }
}

export async function listTransaksiKeluarAction() {
  await requirePermission("kas_keluar.read")
  const { listTransaksiKeluar } = await import("@/lib/services/transaksi-service")
  const rows = await listTransaksiKeluar({})
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
      userName: row.userName,
    })),
  }
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

export async function createKasKeluarAction(input: CreateKasKeluarInput): Promise<ActionResult<{ id: number }>> {
  const admin = await requirePermission("kas_keluar.write")

  try {
    const parsed = createKasKeluarSchema.parse(input)

    const [kategori] = await db
      .select()
      .from(kategoriKas)
      .where(eq(kategoriKas.id, parsed.kategoriId))
      .limit(1)

    if (!kategori) {
      return { ok: false, error: "Kategori tidak ditemukan." }
    }
    if (kategori.jenisArus !== "keluar") {
      return { ok: false, error: "Kategori ini bukan kategori keluar." }
    }

    if (kategori.tipeTagihan === "sekali") {
      const bulanTagihan = Number(kategori.bulanTagihan)
      const tahunTagihan = kategori.tahunTagihan
      if (!Number.isInteger(bulanTagihan) || bulanTagihan < 1 || bulanTagihan > 12 || tahunTagihan == null) {
        return { ok: false, error: "Kategori sekali bayar belum memiliki periode yang valid." }
      }

      const [created] = await db
        .insert(transaksi)
        .values({
          userId: admin.id,
          wargaId: null,
          kategoriId: parsed.kategoriId,
          nominal: parsed.nominal,
          waktuTransaksi: new Date(parsed.waktuTransaksi),
          tipeArus: "keluar",
          bulanTagihan: String(bulanTagihan),
          tahunTagihan,
          keterangan: parsed.keterangan ?? null,
        })
        .returning({ id: transaksi.id })

      await writeAuditLog({
        userId: admin.id,
        modul: "Kas Keluar",
        aksi: "tambah",
        keterangan: `Mencatat pengeluaran "${kategori.namaKategori}"`,
      })

      revalidatePath("/admin/kas-keluar")
      revalidatePath("/admin/dashboard")

      return { ok: true, data: created }
    }

    const [created] = await db
      .insert(transaksi)
      .values({
        userId: admin.id,
        wargaId: null,
        kategoriId: parsed.kategoriId,
        nominal: parsed.nominal,
        waktuTransaksi: new Date(parsed.waktuTransaksi),
        tipeArus: "keluar",
        bulanTagihan: null,
        tahunTagihan: null,
        keterangan: parsed.keterangan ?? null,
      })
      .returning({ id: transaksi.id })

    await writeAuditLog({
      userId: admin.id,
      modul: "Kas Keluar",
      aksi: "tambah",
      keterangan: `Mencatat pengeluaran "${kategori.namaKategori}"`,
    })

    revalidatePath("/admin/kas-keluar")
    revalidatePath("/admin/dashboard")

    return { ok: true, data: created }
  } catch (error) {
    return toActionError(error)
  }
}
