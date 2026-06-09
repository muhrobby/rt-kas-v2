"use server"

import { revalidatePath } from "next/cache"

import { requirePermission } from "@/lib/auth/permissions"
import { db } from "@/lib/db"
import { kategoriKas } from "@/lib/db/schema"
import { writeAuditLog } from "@/lib/services/audit-log-service"
import { isKategoriUsedInTransaksi, listKategori } from "@/lib/services/kategori-service"
import {
  type CreateKategoriInput,
  type UpdateKategoriInput,
  createKategoriInputSchema,
} from "@/lib/validations/kategori"
import { ZodError } from "zod"
import { eq } from "drizzle-orm"

type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false
      error: string
      fieldErrors?: Record<string, string[]>
    }

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    const flattened = error.flatten().fieldErrors as Record<string, string[] | undefined>
    return {
      ok: false,
      error: "Input tidak valid.",
      fieldErrors: flattened as Record<string, string[]>,
    }
  }

  return {
    ok: false,
    error: "Terjadi kesalahan server. Coba lagi.",
  }
}

const MONTH_TO_NUMBER: Record<string, string> = {
  januari: "1",
  februari: "2",
  maret: "3",
  april: "4",
  mei: "5",
  juni: "6",
  juli: "7",
  agustus: "8",
  september: "9",
  oktober: "10",
  november: "11",
  desember: "12",
}

function normalizeBulanTagihan(value: CreateKategoriInput["bulanTagihan"]): string | null {
  if (value === undefined || value === null || value === "") return null
  if (typeof value === "number") return String(value)

  const trimmed = value.trim()
  if (/^\d+$/.test(trimmed)) return String(Number(trimmed))

  return MONTH_TO_NUMBER[trimmed.toLowerCase()] ?? trimmed
}

function normalizeTahunTagihan(value: CreateKategoriInput["tahunTagihan"]): number | null {
  if (value === undefined || value === null || value === "") return null
  return typeof value === "number" ? value : Number(value)
}

export async function listKategoriAction(
  input: { search?: string; jenisArus?: "semua" | "masuk" | "keluar"; tipeTagihan?: "semua" | "bulanan" | "sekali" } = {},
) {
  await requirePermission("kategori.read")
  const data = await listKategori(input)
  return { ok: true as const, data }
}

export async function createKategoriAction(input: CreateKategoriInput): Promise<ActionResult<{ id: number }>> {
  const admin = await requirePermission("kategori.write")

  try {
    const parsed = createKategoriInputSchema.parse(input)

    const [created] = await db
      .insert(kategoriKas)
      .values({
        namaKategori: parsed.nama,
        jenisArus: parsed.jenisArus,
        tipeTagihan: parsed.tipeTagihan,
        bulanTagihan: normalizeBulanTagihan(parsed.bulanTagihan),
        tahunTagihan: normalizeTahunTagihan(parsed.tahunTagihan),
        nominalDefault: parsed.nominalDefault,
      })
      .returning({ id: kategoriKas.id })

    await writeAuditLog({
      userId: admin.id,
      modul: "Kategori Kas",
      aksi: "tambah",
      keterangan: `Menambah kategori "${parsed.nama}" (${parsed.jenisArus})`,
    })

    revalidatePath("/admin/kategori")
    return { ok: true, data: created }
  } catch (error) {
    return toActionError(error)
  }
}

export async function updateKategoriAction(id: number, input: UpdateKategoriInput): Promise<ActionResult<{ id: number }>> {
  const admin = await requirePermission("kategori.write")

  try {
    const parsed = createKategoriInputSchema.parse(input)

    const [existing] = await db.select({ id: kategoriKas.id }).from(kategoriKas).where(eq(kategoriKas.id, id)).limit(1)
    if (!existing) {
      return { ok: false, error: "Kategori tidak ditemukan." }
    }

    const [updated] = await db
      .update(kategoriKas)
      .set({
        namaKategori: parsed.nama,
        jenisArus: parsed.jenisArus,
        tipeTagihan: parsed.tipeTagihan,
        bulanTagihan: normalizeBulanTagihan(parsed.bulanTagihan),
        tahunTagihan: normalizeTahunTagihan(parsed.tahunTagihan),
        nominalDefault: parsed.nominalDefault,
      })
      .where(eq(kategoriKas.id, id))
      .returning({ id: kategoriKas.id })

    await writeAuditLog({
      userId: admin.id,
      modul: "Kategori Kas",
      aksi: "edit",
      keterangan: `Mengubah kategori "${parsed.nama}" (${parsed.jenisArus})`,
    })

    revalidatePath("/admin/kategori")
    return { ok: true, data: updated }
  } catch (error) {
    return toActionError(error)
  }
}

export async function deleteKategoriAction(id: number): Promise<ActionResult<{ id: number }>> {
  const admin = await requirePermission("kategori.delete")

  try {
    const [existing] = await db
      .select({ id: kategoriKas.id, nama: kategoriKas.namaKategori })
      .from(kategoriKas)
      .where(eq(kategoriKas.id, id))
      .limit(1)

    if (!existing) {
      return { ok: false, error: "Kategori tidak ditemukan." }
    }

    const used = await isKategoriUsedInTransaksi(id)
    if (used) {
      return {
        ok: false,
        error: `Kategori "${existing.nama}" sudah dipakai di transaksi dan tidak bisa dihapus.`,
      }
    }

    await db.delete(kategoriKas).where(eq(kategoriKas.id, id))

    await writeAuditLog({
      userId: admin.id,
      modul: "Kategori Kas",
      aksi: "hapus",
      keterangan: `Menghapus kategori "${existing.nama}"`,
    })

    revalidatePath("/admin/kategori")
    return { ok: true, data: { id } }
  } catch (error) {
    return toActionError(error)
  }
}
