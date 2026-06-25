"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { ZodError } from "zod"

import { requireAuth, requireEventAccess } from "@/lib/auth/permissions"
import { getAdminRoleFresh } from "@/lib/auth/session"
import { hasPermission } from "@/lib/auth/permission-matrix"
import { checkIsPanitiaAktif } from "@/lib/services/event-panitia-service"
import { writeAuditLog } from "@/lib/services/audit-log-service"
import { getEventById } from "@/lib/services/event-service"
import {
  bulkCreatePengeluaran,
  updatePengeluaran,
  deletePengeluaran,
  getPengeluaranById,
} from "@/lib/services/pengeluaran-event-service"
import {
  bulkCreatePengeluaranSchema,
  updatePengeluaranSchema,
  type BulkCreatePengeluaranInput,
  type UpdatePengeluaranInput,
} from "@/lib/validations/pengeluaran-event"

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    return { ok: false, error: "Input tidak valid.", fieldErrors: error.flatten().fieldErrors as Record<string, string[]> }
  }
  if (error instanceof Error) return { ok: false, error: error.message }
  return { ok: false, error: "Terjadi kesalahan server." }
}

/**
 * SEC-E01: authorize mutation by loading row, checking eventId ownership.
 * Pengurus (event.write) OR panitia pencatat aktif.
 */
async function authorizePengeluaranMutation(pengeluaranId: number) {
  const row = await getPengeluaranById(pengeluaranId)
  if (!row) throw new Error("Pengeluaran tidak ditemukan.")

  const currentUser = await requireAuth()

  // Pengurus with event.write
  if (currentUser.role === "admin") {
    const adminRole = await getAdminRoleFresh(currentUser.id)
    if (adminRole && hasPermission(adminRole, "event.write")) {
      return { user: currentUser, row }
    }
  }

  // Panitia pencatat aktif (Req 4.4)
  if (row.recordedBy === currentUser.id) {
    const isPanitia = await checkIsPanitiaAktif(currentUser.id, row.eventId)
    if (isPanitia) return { user: currentUser, row }
  }

  redirect("/unauthorized")
}

export async function bulkCreatePengeluaranAction(
  input: BulkCreatePengeluaranInput,
): Promise<ActionResult<{ count: number; ids: number[] }>> {
  try {
    const parsed = bulkCreatePengeluaranSchema.parse(input)
    const currentUser = await requireEventAccess(parsed.eventId)
    const ev = await getEventById(parsed.eventId)
    const eventLabel = ev ? `"${ev.nama}"` : `#${parsed.eventId}`

    const result = await bulkCreatePengeluaran(parsed, currentUser.id)

    writeAuditLog({
      userId: currentUser.id,
      modul: "Pengeluaran Event",
      aksi: "tambah",
      keterangan: `Mencatat ${result.count} item pengeluaran event ${eventLabel}`,
    })

    revalidatePath(`/admin/event/${parsed.eventId}`)
    return { ok: true, data: result }
  } catch (error) {
    return toActionError(error)
  }
}

export async function updatePengeluaranAction(
  input: UpdatePengeluaranInput,
): Promise<ActionResult<void>> {
  try {
    const parsed = updatePengeluaranSchema.parse(input)
    const { user: currentUser, row } = await authorizePengeluaranMutation(parsed.id)

    const { id, ...patch } = parsed
    await updatePengeluaran(id, patch)

    const ev = await getEventById(row.eventId)
    const eventLabel = ev ? `"${ev.nama}"` : `#${row.eventId}`

    writeAuditLog({
      userId: currentUser.id,
      modul: "Pengeluaran Event",
      aksi: "edit",
      keterangan: `Mengedit pengeluaran "${row.deskripsi}" (Rp ${row.nominal.toLocaleString("id-ID")}) event ${eventLabel}`,
    })

    revalidatePath(`/admin/event/${row.eventId}`)
    return { ok: true, data: undefined }
  } catch (error) {
    return toActionError(error)
  }
}

export async function deletePengeluaranAction(
  input: { id: number },
): Promise<ActionResult<void>> {
  try {
    const id = input.id
    if (!id || typeof id !== "number") throw new Error("ID tidak valid.")

    const { user: currentUser, row } = await authorizePengeluaranMutation(id)

    await deletePengeluaran(id)

    const ev = await getEventById(row.eventId)
    const eventLabel = ev ? `"${ev.nama}"` : `#${row.eventId}`

    writeAuditLog({
      userId: currentUser.id,
      modul: "Pengeluaran Event",
      aksi: "hapus",
      keterangan: `Menghapus pengeluaran "${row.deskripsi}" (Rp ${row.nominal.toLocaleString("id-ID")}) event ${eventLabel}`,
    })

    revalidatePath(`/admin/event/${row.eventId}`)
    return { ok: true, data: undefined }
  } catch (error) {
    return toActionError(error)
  }
}
