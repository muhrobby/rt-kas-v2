import "server-only"

import { and, desc, eq } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"

import { db } from "@/lib/db"
import { event, eventPanitia, user, warga } from "@/lib/db/schema"

export type PanitiaListItem = {
  id: number
  userId: string
  userName: string
  wargaNama: string | null
  isActive: boolean
  appointedAt: Date
  revokedAt: Date | null
  appointedByName: string
}

export async function listPanitiaByEvent(eventId: number): Promise<PanitiaListItem[]> {
  const appointedByUser = alias(user, "appointed_by_user")

  const rows = await db
    .select({
      id: eventPanitia.id,
      userId: eventPanitia.userId,
      userName: user.name,
      wargaNama: warga.namaKepalaKeluarga,
      isActive: eventPanitia.isActive,
      appointedAt: eventPanitia.appointedAt,
      revokedAt: eventPanitia.revokedAt,
      appointedByName: appointedByUser.name,
    })
    .from(eventPanitia)
    .innerJoin(user, eq(eventPanitia.userId, user.id))
    .leftJoin(warga, eq(user.wargaId, warga.id))
    .innerJoin(appointedByUser, eq(eventPanitia.appointedBy, appointedByUser.id))
    .where(eq(eventPanitia.eventId, eventId))
    .orderBy(desc(eventPanitia.appointedAt))

  return rows
}

export async function appointPanitia({
  eventId,
  userId,
  appointedBy,
}: {
  eventId: number
  userId: string
  appointedBy: string
}): Promise<void> {
  // Status guard (SEC-E11)
  const [ev] = await db
    .select({ status: event.status })
    .from(event)
    .where(eq(event.id, eventId))
    .limit(1)

  if (!ev) throw new Error("Event tidak ditemukan.")
  if (ev.status === "SELESAI" || ev.status === "DIBATALKAN") {
    throw new Error("Tidak bisa menunjuk panitia untuk event yang sudah selesai/dibatalkan.")
  }

  // Pastikan user ada
  const [targetUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)
  if (!targetUser) throw new Error("User tidak ditemukan.")

  // Cek apakah sudah ada row (aktif atau tidak)
  const [existing] = await db
    .select({ id: eventPanitia.id, isActive: eventPanitia.isActive })
    .from(eventPanitia)
    .where(and(eq(eventPanitia.eventId, eventId), eq(eventPanitia.userId, userId)))
    .limit(1)

  if (existing) {
    if (existing.isActive) throw new Error("PANITIA_ALREADY_EXISTS")
    // Reactivate — update is_active + appointedBy + appointedAt, tapi biarkan id tetap (riwayat rownya ada)
    await db
      .update(eventPanitia)
      .set({ isActive: true, revokedAt: null, appointedBy, appointedAt: new Date() })
      .where(eq(eventPanitia.id, existing.id))
    return
  }

  await db.insert(eventPanitia).values({ eventId, userId, appointedBy })
}

export async function removePanitia({
  eventId,
  userId,
}: {
  eventId: number
  userId: string
}): Promise<void> {
  await db
    .update(eventPanitia)
    .set({ isActive: false, revokedAt: new Date() })
    .where(
      and(
        eq(eventPanitia.eventId, eventId),
        eq(eventPanitia.userId, userId),
        eq(eventPanitia.isActive, true),
      ),
    )
}

export async function isPanitiaAktif(userId: string, eventId: number): Promise<boolean> {
  const [row] = await db
    .select({ id: eventPanitia.id })
    .from(eventPanitia)
    .where(
      and(
        eq(eventPanitia.userId, userId),
        eq(eventPanitia.eventId, eventId),
        eq(eventPanitia.isActive, true),
      ),
    )
    .limit(1)
  return !!row
}

/** Alias untuk import di permissions.ts */
export const checkIsPanitiaAktif = isPanitiaAktif

/**
 * List user yang BUKAN panitia aktif event ini (untuk combobox pilih user).
 * Limit 50, optional search by name.
 */
export async function listAvailableUsers(
  eventId: number,
  q?: string,
): Promise<{ id: string; name: string; email: string }[]> {
  // Ambil userId yang sudah aktif di event ini
  const activeRows = await db
    .select({ userId: eventPanitia.userId })
    .from(eventPanitia)
    .where(and(eq(eventPanitia.eventId, eventId), eq(eventPanitia.isActive, true)))

  const activeIds = new Set(activeRows.map((r) => r.userId))

  let allUsers = await db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user)
    .limit(200)

  if (q) {
    const lower = q.toLowerCase()
    allUsers = allUsers.filter(
      (u) => u.name.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower),
    )
  }

  return allUsers.filter((u) => !activeIds.has(u.id)).slice(0, 50)
}
