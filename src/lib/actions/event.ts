"use server"

import { revalidatePath } from "next/cache"
import { ZodError } from "zod"

import { requirePermission } from "@/lib/auth/permissions"
import { db } from "@/lib/db"
import { writeAuditLog, writeAuditLogStrict } from "@/lib/services/audit-log-service"
import {
  cancelEvent,
  closeEvent,
  createEvent,
  deleteEvent,
  getEventById,
  transitionStatus,
  updateEvent,
} from "@/lib/services/event-service"
import {
  cancelEventSchema,
  createEventSchema,
  transitionStatusSchema,
  updateEventSchema,
  type CancelEventInput,
  type CreateEventInput,
  type TransitionStatusInput,
  type UpdateEventInput,
} from "@/lib/validations/event"

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    return {
      ok: false,
      error: "Input tidak valid.",
      fieldErrors: error.flatten().fieldErrors as Record<string, string[]>,
    }
  }
  if (error instanceof Error) {
    return { ok: false, error: error.message }
  }
  return { ok: false, error: "Terjadi kesalahan server." }
}

export async function createEventAction(
  input: CreateEventInput,
): Promise<ActionResult<{ id: number }>> {
  const admin = await requirePermission("event.write")

  try {
    const parsed = createEventSchema.parse(input)
    const result = await createEvent(parsed, admin.id)

    writeAuditLog({
      userId: admin.id,
      modul: "Event Acara",
      aksi: "tambah",
      keterangan: `Membuat event "${parsed.nama}"`,
    })

    revalidatePath("/admin/event")
    return { ok: true, data: result }
  } catch (error) {
    return toActionError(error)
  }
}

export async function updateEventAction(
  input: UpdateEventInput,
): Promise<ActionResult<void>> {
  const admin = await requirePermission("event.write")

  try {
    const parsed = updateEventSchema.parse(input)
    const { id, ...patch } = parsed
    const existing = await getEventById(id)
    await updateEvent(id, patch)

    const eventLabel = existing ? `"${existing.nama}"` : `#${id}`

    writeAuditLog({
      userId: admin.id,
      modul: "Event Acara",
      aksi: "edit",
      keterangan: `Mengubah event ${eventLabel}`,
    })

    revalidatePath("/admin/event")
    revalidatePath(`/admin/event/${id}`)
    return { ok: true, data: undefined }
  } catch (error) {
    return toActionError(error)
  }
}

export async function transitionEventStatusAction(
  input: TransitionStatusInput,
): Promise<ActionResult<void>> {
  const admin = await requirePermission("event.write")

  try {
    const parsed = transitionStatusSchema.parse(input)

    if (parsed.target === "SELESAI" || parsed.target === "DIBATALKAN") {
      return { ok: false, error: "Gunakan aksi khusus untuk menutup/membatalkan event." }
    }

    const existing = await getEventById(parsed.id)
    if (!existing) return { ok: false, error: "Event tidak ditemukan." }

    const from = existing.status
    await transitionStatus(parsed.id, parsed.target, admin.id)

    writeAuditLog({
      userId: admin.id,
      modul: "Event Acara",
      aksi: "edit",
      keterangan: `Status event "${existing.nama}": ${from} → ${parsed.target}`,
    })

    revalidatePath("/admin/event")
    revalidatePath(`/admin/event/${parsed.id}`)
    return { ok: true, data: undefined }
  } catch (error) {
    return toActionError(error)
  }
}

export async function deleteEventAction(
  input: { id: number },
): Promise<ActionResult<void>> {
  const admin = await requirePermission("event.write")

  try {
    const ev = await getEventById(input.id)
    if (!ev) return { ok: false, error: "Event tidak ditemukan." }
    if (ev.status !== "DRAFT") {
      return { ok: false, error: "Hanya event berstatus DRAFT yang bisa dihapus." }
    }

    await deleteEvent(input.id)

    writeAuditLog({
      userId: admin.id,
      modul: "Event Acara",
      aksi: "hapus",
      keterangan: `Menghapus event "${ev.nama}"`,
    })

    revalidatePath("/admin/event")
    return { ok: true, data: undefined }
  } catch (error) {
    return toActionError(error)
  }
}

export async function closeEventAction(
  input: { id: number },
): Promise<ActionResult<void>> {
  const admin = await requirePermission("event.close")

  try {
    const ev = await getEventById(input.id)
    if (!ev) return { ok: false, error: "Event tidak ditemukan." }

    await db.transaction(async (tx) => {
      await closeEvent(tx, input.id, admin.id)
    })

    await writeAuditLogStrict({
      userId: admin.id,
      modul: "Event Acara",
      aksi: "close",
      keterangan: `Menutup event "${ev.nama}"`,
    })

    revalidatePath("/admin/event")
    revalidatePath(`/admin/event/${input.id}`)
    return { ok: true, data: undefined }
  } catch (error) {
    return toActionError(error)
  }
}

export async function cancelEventAction(
  input: CancelEventInput,
): Promise<ActionResult<void>> {
  const admin = await requirePermission("event.cancel")

  try {
    const parsed = cancelEventSchema.parse(input)

    const ev = await getEventById(parsed.id)
    if (!ev) return { ok: false, error: "Event tidak ditemukan." }

    await db.transaction(async (tx) => {
      await cancelEvent(tx, {
        eventId: parsed.id,
        reason: parsed.reason,
        sumbanganHandling: parsed.sumbanganHandling,
        eventTujuanId: parsed.eventTujuanId,
      }, admin.id)
    })

    await writeAuditLogStrict({
      userId: admin.id,
      modul: "Event Acara",
      aksi: "cancel",
      keterangan: `Membatalkan event "${ev.nama}". Alasan: ${parsed.reason}. Opsi: ${parsed.sumbanganHandling}`,
    })

    revalidatePath("/admin/event")
    revalidatePath(`/admin/event/${parsed.id}`)
    revalidatePath("/admin/kas-masuk")
    revalidatePath("/admin/kas-keluar")
    return { ok: true, data: undefined }
  } catch (error) {
    return toActionError(error)
  }
}
