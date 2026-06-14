"use server"

import { revalidatePath } from "next/cache"
import { ZodError } from "zod"

import { requirePermission } from "@/lib/auth/permissions"
import { writeAuditLogStrict } from "@/lib/services/audit-log-service"
import { getEventById } from "@/lib/services/event-service"
import {
  approvePengeluaran,
  rejectPengeluaran,
  getPengeluaranById,
} from "@/lib/services/pengeluaran-event-service"
import { approveSchema, rejectSchema } from "@/lib/validations/pengeluaran-event"

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

export async function approvePengeluaranAction(
  input: { id: number },
): Promise<ActionResult<void>> {
  const admin = await requirePermission("event.approve")

  try {
    const parsed = approveSchema.parse(input)

    // Load row for audit info
    const row = await getPengeluaranById(parsed.id)
    if (!row) return { ok: false, error: "Pengeluaran tidak ditemukan." }

    await approvePengeluaran(parsed.id, admin.id)

    const ev = await getEventById(row.eventId)
    const eventLabel = ev ? `"${ev.nama}"` : `#${row.eventId}`

    await writeAuditLogStrict({
      userId: admin.id,
      modul: "Pengeluaran Event",
      aksi: "approve",
      keterangan: `Menyetujui pengeluaran "${row.deskripsi}" Rp ${row.nominal.toLocaleString("id-ID")} event ${eventLabel}`,
    })

    revalidatePath(`/admin/event/${row.eventId}`)
    return { ok: true, data: undefined }
  } catch (error) {
    return toActionError(error)
  }
}

export async function rejectPengeluaranAction(
  input: { id: number; reason: string },
): Promise<ActionResult<void>> {
  const admin = await requirePermission("event.approve")

  try {
    const parsed = rejectSchema.parse(input)

    const row = await getPengeluaranById(parsed.id)
    if (!row) return { ok: false, error: "Pengeluaran tidak ditemukan." }

    await rejectPengeluaran(parsed.id, admin.id, parsed.reason)

    const ev = await getEventById(row.eventId)
    const eventLabel = ev ? `"${ev.nama}"` : `#${row.eventId}`

    await writeAuditLogStrict({
      userId: admin.id,
      modul: "Pengeluaran Event",
      aksi: "reject",
      keterangan: `Menolak pengeluaran "${row.deskripsi}" Rp ${row.nominal.toLocaleString("id-ID")} event ${eventLabel}. Alasan: ${parsed.reason}`,
    })

    revalidatePath(`/admin/event/${row.eventId}`)
    return { ok: true, data: undefined }
  } catch (error) {
    return toActionError(error)
  }
}
