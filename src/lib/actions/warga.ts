"use server"

import { revalidatePath } from "next/cache"

import { requirePermission } from "@/lib/auth/permissions"
import { db } from "@/lib/db"
import { user, warga } from "@/lib/db/schema"
import { writeAuditLog } from "@/lib/services/audit-log-service"
import {
  DuplicateUsernameError,
  createWargaUserAccount,
  deleteWargaUserAccount,
  resetWargaPassword,
  updateWargaUserAccount,
} from "@/lib/services/user-account-service"
import { hasWargaTransaksi, listWarga } from "@/lib/services/warga-service"
import { parseWargaInput, toggleWargaPengurusInputSchema, type CreateWargaInput, type UpdateWargaInput, type ToggleWargaPengurusInput } from "@/lib/validations/warga"
import { ZodError } from "zod"
import { and, eq, sql } from "drizzle-orm"

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
  await requirePermission("warga.read")
  const data = await listWarga(input)
  return {
    ok: true as const,
    data,
  }
}

export async function createWargaAction(input: CreateWargaInput): Promise<ActionResult<{ id: number }>> {
  const admin = await requirePermission("warga.write")

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
          pemilikHunianId: payload.pemilikHunianId,
        })
        .returning({ id: warga.id })

      await createWargaUserAccount(
        {
          wargaId: newWarga.id,
          nama: payload.nama,
          phone: payload.telp,
          password: "warga123",
        },
        tx,
      )

      await writeAuditLog({
        userId: admin.id,
        modul: "Data Warga",
        aksi: "tambah",
        keterangan: `Menambahkan warga ${payload.nama} (${payload.blok})`,
      })

      return { id: newWarga.id }
    })

    revalidatePath("/admin/warga")
    return { ok: true, data: created }
  } catch (error) {
    return toActionError(error)
  }
}

export async function updateWargaAction(id: number, input: UpdateWargaInput): Promise<ActionResult<{ id: number }>> {
  const admin = await requirePermission("warga.write")

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
          pemilikHunianId: payload.pemilikHunianId,
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
  const admin = await requirePermission("warga.delete")

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
  const admin = await requirePermission("pengurus.manage")

  try {
    const parsed = toggleWargaPengurusInputSchema.parse(input)

    const [existing] = await db
      .select({ id: warga.id, nama: warga.namaKepalaKeluarga, isPengurus: warga.isPengurus })
      .from(warga)
      .where(eq(warga.id, id))
      .limit(1)

    if (!existing) {
      return { ok: false, error: "Data warga tidak ditemukan." }
    }

    // Protect last Ketua RT: if demoting a current ketua_rt, ensure at least one other exists
    if (!parsed.isPengurus && existing.isPengurus) {
      const [currentUser] = await db
        .select({ adminRole: user.adminRole })
        .from(user)
        .where(eq(user.wargaId, id))
        .limit(1)

      if (currentUser?.adminRole === "ketua_rt") {
        // Count ketua_rt users; if only 1 (this one), block
        const ketuaCount = await db
          .select({ total: sql<number>`count(*)` })
          .from(user)
          .where(and(eq(user.adminRole, "ketua_rt"), eq(user.role, "admin")))

        if (Number(ketuaCount[0]?.total ?? 0) <= 1) {
          return { ok: false, error: "Tidak bisa menonaktifkan Ketua RT terakhir. Tetapkan Ketua RT lain terlebih dahulu." }
        }
      }
    }

    const adminRoleLabel = parsed.adminRole
      ? { ketua_rt: "Ketua RT", bendahara: "Bendahara", sekretaris: "Sekretaris", anggota: "Anggota Pengurus" }[parsed.adminRole]
      : null

    await db
      .update(warga)
      .set({
        isPengurus: parsed.isPengurus,
        rolePengurus: parsed.isPengurus ? (adminRoleLabel ?? "Pengurus") : null,
        updatedAt: new Date(),
      })
      .where(eq(warga.id, id))

    await db
      .update(user)
      .set({
        role: parsed.isPengurus ? "admin" : "user",
        adminRole: parsed.isPengurus ? (parsed.adminRole ?? null) : null,
        updatedAt: new Date(),
      })
      .where(eq(user.wargaId, id))

    const statusText = parsed.isPengurus ? `menjadi ${adminRoleLabel ?? "Pengurus"}` : "bukan pengurus"
    await writeAuditLog({
      userId: admin.id,
      modul: "Data Warga",
      aksi: "edit",
      keterangan: `Mengubah status pengurus warga ${existing.nama} ${statusText}`,
    })

    revalidatePath("/admin/warga")
    return { ok: true, data: { id } }
  } catch (error) {
    if (error instanceof ZodError) {
      return { ok: false, error: "Input tidak valid." }
    }
    return toActionError(error)
  }
}

export async function resetWargaPasswordAction(wargaId: number): Promise<ActionResult<null>> {
  const admin = await requirePermission("warga.write")

  try {
    await resetWargaPassword(wargaId)

    // Get warga name for audit log
    const [w] = await db.select({ nama: warga.namaKepalaKeluarga }).from(warga).where(eq(warga.id, wargaId)).limit(1)

    await writeAuditLog({
      userId: admin.id,
      modul: "Data Warga",
      aksi: "edit",
      keterangan: `Reset password warga ${w?.nama ?? wargaId}`,
    })

    return { ok: true, data: null }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal reset password." }
  }
}

export async function pindahWargaAction(wargaId: number, tglPindah: string): Promise<ActionResult<null>> {
  const admin = await requirePermission("warga.write")

  // Validate ISO date
  if (!tglPindah || Number.isNaN(Date.parse(tglPindah))) {
    return { ok: false, error: "Tanggal pindah tidak valid." }
  }

  try {
    const [w] = await db
      .update(warga)
      .set({ tglPindah })
      .where(eq(warga.id, wargaId))
      .returning({ nama: warga.namaKepalaKeluarga })

    if (!w) return { ok: false, error: "Warga tidak ditemukan." }

    await writeAuditLog({
      userId: admin.id,
      modul: "Data Warga",
      aksi: "edit",
      keterangan: `Tandai warga ${w.nama} pindah (${tglPindah})`,
    })

    revalidatePath("/admin/warga")
    return { ok: true, data: null }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal menyimpan data pindah." }
  }
}
