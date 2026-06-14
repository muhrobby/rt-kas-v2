"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { ZodError } from "zod"

import { requirePermission } from "@/lib/auth/permissions"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { writeAuditLog } from "@/lib/services/audit-log-service"
import { getEventById } from "@/lib/services/event-service"
import {
  appointPanitia,
  listAvailableUsers,
  removePanitia,
} from "@/lib/services/event-panitia-service"
import {
  appointPanitiaSchema,
  removePanitiaSchema,
  type AppointPanitiaInput,
  type RemovePanitiaInput,
} from "@/lib/validations/event-panitia"

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

export async function appointPanitiaAction(input: AppointPanitiaInput): Promise<ActionResult<void>> {
  const admin = await requirePermission("event.panitia.manage")

  try {
    const parsed = appointPanitiaSchema.parse(input)
    await appointPanitia({ ...parsed, appointedBy: admin.id })

    const [u] = await db.select({ name: user.name }).from(user).where(eq(user.id, parsed.userId)).limit(1)
    const ev = await getEventById(parsed.eventId)
    const userLabel = u?.name ?? `user #${parsed.userId}`
    const eventLabel = ev ? `"${ev.nama}"` : `#${parsed.eventId}`

    writeAuditLog({
      userId: admin.id,
      modul: "Panitia Event",
      aksi: "tambah",
      keterangan: `Menunjuk ${userLabel} sebagai panitia event ${eventLabel}`,
    })

    revalidatePath(`/admin/event/${parsed.eventId}`)
    return { ok: true, data: undefined }
  } catch (error) {
    return toActionError(error)
  }
}

export async function removePanitiaAction(input: RemovePanitiaInput): Promise<ActionResult<void>> {
  const admin = await requirePermission("event.panitia.manage")

  try {
    const parsed = removePanitiaSchema.parse(input)
    await removePanitia(parsed)

    const [u] = await db.select({ name: user.name }).from(user).where(eq(user.id, parsed.userId)).limit(1)
    const ev = await getEventById(parsed.eventId)
    const userLabel = u?.name ?? `user #${parsed.userId}`
    const eventLabel = ev ? `"${ev.nama}"` : `#${parsed.eventId}`

    writeAuditLog({
      userId: admin.id,
      modul: "Panitia Event",
      aksi: "hapus",
      keterangan: `Mencabut ${userLabel} dari panitia event ${eventLabel}`,
    })

    revalidatePath(`/admin/event/${parsed.eventId}`)
    return { ok: true, data: undefined }
  } catch (error) {
    return toActionError(error)
  }
}

export async function listAvailableUsersAction(
  eventId: number,
  q?: string,
): Promise<{ id: string; name: string; email: string }[]> {
  await requirePermission("event.panitia.manage")
  return listAvailableUsers(eventId, q)
}

export async function registerAndAppointPanitiaAction(
  input: { eventId: number; nama: string; phone: string },
): Promise<ActionResult<{ userId: string }>> {
  const admin = await requirePermission("event.panitia.manage")

  try {
    const { eventId, nama, phone } = input
    if (!nama || nama.trim().length < 2) return { ok: false, error: "Nama minimal 2 karakter." }
    if (!phone || phone.trim().length < 8) return { ok: false, error: "Nomor telepon minimal 8 digit." }

    const cleanPhone = phone.replace(/\D/g, "")
    if (cleanPhone.length < 8 || cleanPhone.length > 15) return { ok: false, error: "Nomor telepon tidak valid." }

    let userId: string = ""

    await db.transaction(async (tx) => {
      const { createPanitiaUserAccount } = await import("@/lib/services/user-account-service")
      const result = await createPanitiaUserAccount({ nama: nama.trim(), phone: cleanPhone }, tx)
      userId = result.userId
    })

    // Appoint as panitia
    await appointPanitia({ eventId, userId, appointedBy: admin.id })

    const ev = await getEventById(eventId)
    const eventLabel = ev ? `"${ev.nama}"` : `#${eventId}`

    writeAuditLog({
      userId: admin.id,
      modul: "Panitia Event",
      aksi: "tambah",
      keterangan: `Mendaftarkan ${nama.trim()} (${cleanPhone}) dan menunjuk sebagai panitia event ${eventLabel}`,
    })

    revalidatePath(`/admin/event/${eventId}`)
    return { ok: true, data: { userId } }
  } catch (error) {
    if (error instanceof Error && error.message === "Nomor telepon sudah dipakai akun lain.") {
      return { ok: false, error: error.message }
    }
    return toActionError(error)
  }
}
