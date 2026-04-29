"use server"

import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/auth/permissions"
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
    .where(eq(kategoriKas.jenisArus, "keluar"))
  return { ok: true as const, data: rows }
}

export async function listTransaksiKeluarAction() {
  await requireAdmin()
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
  const admin = await requireAdmin()

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

    const [created] = await db
      .insert(transaksi)
      .values({
        userId: admin.id,
        wargaId: null,
        kategoriId: parsed.kategoriId,
        nominal: parsed.nominal,
        waktuTransaksi: new Date(parsed.waktuTransaksi),
        tipeArus: "keluar",
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
