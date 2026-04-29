"use server"

import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/auth/permissions"
import { db } from "@/lib/db"
import { user, warga } from "@/lib/db/schema"
import { writeAuditLog } from "@/lib/services/audit-log-service"
import {
  DuplicateUsernameError,
  createWargaUserAccount,
  deleteWargaUserAccount,
  updateWargaUserAccount,
} from "@/lib/services/user-account-service"
import { hasWargaTransaksi, listWarga } from "@/lib/services/warga-service"
import { parseWargaInput, toggleWargaPengurusInputSchema, type CreateWargaInput, type UpdateWargaInput, type ToggleWargaPengurusInput } from "@/lib/validations/warga"
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
    const mapped: Record<string, string[]> = {}
    if (flattened.nama) mapped.nama = flattened.nama
    if (flattened.blok) mapped.blok = flattened.blok
    if (flattened.telp) mapped.telp = flattened.telp
    if (flattened.tglBatasDomisili) mapped.pindah = flattened.tglBatasDomisili

    return {
      ok: false,
      error: "Input warga tidak valid.",
      fieldErrors: mapped,
    }
  }

  if (error instanceof DuplicateUsernameError) {
    return {
      ok: false,
      error: error.message,
      fieldErrors: {
        telp: [error.message],
      },
    }
  }

  if (error instanceof Error && "code" in error && error.code === "23505") {
    return {
      ok: false,
      error: "Nomor telepon sudah terdaftar.",
      fieldErrors: {
        telp: ["Nomor telepon sudah terdaftar."],
      },
    }
  }

  return {
    ok: false,
    error: "Terjadi kesalahan server. Coba lagi.",
  }
}

export async function listWargaAction(input: { search?: string; status?: "semua" | "tetap" | "kontrak" } = {}) {
  await requireAdmin()
  const data = await listWarga(input)
  return {
    ok: true as const,
    data,
  }
}

export async function createWargaAction(input: CreateWargaInput): Promise<ActionResult<{ id: number }>> {
  const admin = await requireAdmin()

  try {
    const payload = parseWargaInput(input)

    const created = await db.transaction(async (tx) => {
      const [newWarga] = await tx
        .insert(warga)
        .values({
          namaKepalaKeluarga: payload.nama,
          blokRumah: payload.blok,
          noTelp: payload.telp,
          statusHunian: payload.statusHunian,
          jumlahAnggota: payload.jumlahAnggota,
          tglBatasDomisili: payload.tglBatasDomisili,
          tglPindah: payload.tglPindah,
        })
        .returning({ id: warga.id })

      await createWargaUserAccount(
        {
          wargaId: newWarga.id,
          nama: payload.nama,
          phone: payload.telp,
        },
        tx,
      )

      await writeAuditLog({
        userId: admin.id,
        modul: "Data Warga",
        aksi: "tambah",
        keterangan: `Menambahkan warga ${payload.nama} (${payload.blok})`,
      })

      return newWarga
    })

    revalidatePath("/admin/warga")
    return { ok: true, data: created }
  } catch (error) {
    return toActionError(error)
  }
}

export async function updateWargaAction(id: number, input: UpdateWargaInput): Promise<ActionResult<{ id: number }>> {
  const admin = await requireAdmin()

  try {
    const payload = parseWargaInput(input)

    const updated = await db.transaction(async (tx) => {
      const [existing] = await tx.select({ id: warga.id }).from(warga).where(eq(warga.id, id)).limit(1)
      if (!existing) {
        throw new Error("DATA_NOT_FOUND")
      }

      const [result] = await tx
        .update(warga)
        .set({
          namaKepalaKeluarga: payload.nama,
          blokRumah: payload.blok,
          noTelp: payload.telp,
          statusHunian: payload.statusHunian,
          jumlahAnggota: payload.jumlahAnggota,
          tglBatasDomisili: payload.tglBatasDomisili,
          tglPindah: payload.tglPindah,
          updatedAt: new Date(),
        })
        .where(eq(warga.id, id))
        .returning({ id: warga.id })

      await updateWargaUserAccount(
        {
          wargaId: id,
          nama: payload.nama,
          phone: payload.telp,
        },
        tx,
      )

      await writeAuditLog({
        userId: admin.id,
        modul: "Data Warga",
        aksi: "edit",
        keterangan: `Mengubah data warga ${payload.nama} (${payload.blok})`,
      })

      return result
    })

    revalidatePath("/admin/warga")
    return { ok: true, data: updated }
  } catch (error) {
    if (error instanceof Error && error.message === "DATA_NOT_FOUND") {
      return {
        ok: false,
        error: "Data warga tidak ditemukan.",
      }
    }
    return toActionError(error)
  }
}

export async function deleteWargaAction(id: number): Promise<ActionResult<{ id: number }>> {
  const admin = await requireAdmin()

  try {
    await db.transaction(async (tx) => {
      const [existing] = await tx
        .select({ id: warga.id, nama: warga.namaKepalaKeluarga, blok: warga.blokRumah })
        .from(warga)
        .where(eq(warga.id, id))
        .limit(1)

      if (!existing) {
        throw new Error("DATA_NOT_FOUND")
      }

      const hasTransaksi = await hasWargaTransaksi(id, tx)
      if (hasTransaksi) {
        throw new Error("WARGA_HAS_TRANSAKSI")
      }

      await deleteWargaUserAccount(id, tx)
      await tx.delete(warga).where(eq(warga.id, id))

      await writeAuditLog({
        userId: admin.id,
        modul: "Data Warga",
        aksi: "hapus",
        keterangan: `Menghapus data warga ${existing.nama} (${existing.blok})`,
      })
    })

    revalidatePath("/admin/warga")
    return { ok: true, data: { id } }
  } catch (error) {
      if (error instanceof Error && error.message === "WARGA_HAS_TRANSAKSI") {
      return {
        ok: false,
        error: "Warga yang sudah memiliki transaksi tidak bisa dihapus.",
      }
    }
    if (error instanceof Error && error.message === "DATA_NOT_FOUND") {
      return {
        ok: false,
        error: "Data warga tidak ditemukan.",
      }
    }
    return toActionError(error)
  }
}

export async function updateWargaPengurusAction(id: number, input: ToggleWargaPengurusInput): Promise<ActionResult<{ id: number }>> {
  const admin = await requireAdmin()

  try {
    const parsed = toggleWargaPengurusInputSchema.parse(input)

    const [existing] = await db
      .select({ id: warga.id, nama: warga.namaKepalaKeluarga })
      .from(warga)
      .where(eq(warga.id, id))
      .limit(1)

    if (!existing) {
      return {
        ok: false,
        error: "Data warga tidak ditemukan.",
      }
    }

    await db
      .update(warga)
      .set({
        isPengurus: parsed.isPengurus,
        rolePengurus: parsed.isPengurus ? (parsed.rolePengurus ?? "Pengurus") : null,
        updatedAt: new Date(),
      })
      .where(eq(warga.id, id))

    await db
      .update(user)
      .set({ role: parsed.isPengurus ? "admin" : "user" })
      .where(eq(user.wargaId, id))

    const statusText = parsed.isPengurus ? `menjadi${parsed.rolePengurus ? ` ${parsed.rolePengurus}` : " Pengurus"}` : "bukan pengurus"
    await writeAuditLog({
      userId: admin.id,
      modul: "Data Warga",
      aksi: "edit",
      keterangan: `Mengubah status pengurus warga ${existing.nama} menjadi ${statusText}`,
    })

    revalidatePath("/admin/warga")
    return { ok: true, data: { id } }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        error: "Input tidak valid.",
      }
    }
    return toActionError(error)
  }
}
