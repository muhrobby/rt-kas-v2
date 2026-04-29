"use server"

import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/auth/permissions"
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

export async function listKategoriAction(
  input: { search?: string; jenisArus?: "semua" | "masuk" | "keluar"; tipeTagihan?: "semua" | "bulanan" | "sekali" } = {},
) {
  await requireAdmin()
  const data = await listKategori(input)
  return { ok: true as const, data }
}

export async function createKategoriAction(input: CreateKategoriInput): Promise<ActionResult<{ id: number }>> {
  const admin = await requireAdmin()

  try {
    const parsed = createKategoriInputSchema.parse(input)

    const [created] = await db
      .insert(kategoriKas)
      .values({
        namaKategori: parsed.nama,
        jenisArus: parsed.jenisArus,
        tipeTagihan: parsed.tipeTagihan,
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
  const admin = await requireAdmin()

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
  const admin = await requireAdmin()

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
