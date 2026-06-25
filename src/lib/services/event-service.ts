import "server-only"

import { and, eq, ilike, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import type { DbTransaction } from "@/lib/db"
import { event, pengeluaranEvent, sumbanganEvent, user } from "@/lib/db/schema"
import { canTransition, type StatusEvent } from "@/lib/constants/event-status"

const MAX_LIMIT = 200

export class EventTransitionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "EventTransitionError"
  }
}

export type EventListItem = {
  id: number
  nama: string
  tanggalPelaksanaan: string
  status: string
  createdByName: string
  totalSumbangan: number
  totalPengeluaranApproved: number
  pengeluaranPendingCount: number
  saldo: number
}

export async function listEvents(filters: {
  status?: StatusEvent
  q?: string
  limit?: number
  offset?: number
} = {}): Promise<EventListItem[]> {
  const { status, q, limit = 50, offset = 0 } = filters
  const safeLimit = Math.min(Math.max(1, limit), MAX_LIMIT)

  const conditions = []
  if (status) conditions.push(eq(event.status, status))
  if (q) conditions.push(ilike(event.nama, `%${q}%`))

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const rows = await db
    .select({
      id: event.id,
      nama: event.nama,
      tanggalPelaksanaan: event.tanggalPelaksanaan,
      status: event.status,
      createdByName: user.name,
      totalSumbangan: sql<number>`coalesce((select sum(nominal) from sumbangan_event where event_id = "event"."id"), 0)`.as("total_sumbangan"),
      totalPengeluaranApproved: sql<number>`coalesce((select sum(nominal) from pengeluaran_event where event_id = "event"."id" and status = 'APPROVED'), 0)`.as("total_pengeluaran_approved"),
      pengeluaranPendingCount: sql<number>`coalesce((select count(*) from pengeluaran_event where event_id = "event"."id" and status = 'PENDING'), 0)`.as("pending_count"),
    })
    .from(event)
    .innerJoin(user, eq(event.createdBy, user.id))
    .where(whereClause)
    .orderBy(sql`${event.createdAt} desc`)
    .limit(safeLimit)
    .offset(offset)

  return rows.map((r) => ({
    ...r,
    totalSumbangan: Number(r.totalSumbangan),
    totalPengeluaranApproved: Number(r.totalPengeluaranApproved),
    pengeluaranPendingCount: Number(r.pengeluaranPendingCount),
    saldo: Number(r.totalSumbangan) - Number(r.totalPengeluaranApproved),
  }))
}

export async function getEventById(id: number) {
  const [row] = await db
    .select()
    .from(event)
    .where(eq(event.id, id))
    .limit(1)
  return row ?? null
}

export async function createEvent(
  input: { nama: string; tanggalPelaksanaan: string; deskripsi?: string },
  createdById: string,
): Promise<{ id: number }> {
  const [row] = await db
    .insert(event)
    .values({
      nama: input.nama,
      tanggalPelaksanaan: input.tanggalPelaksanaan,
      deskripsi: input.deskripsi ?? null,
      createdBy: createdById,
    })
    .returning({ id: event.id })
  return { id: row.id }
}

export async function updateEvent(
  id: number,
  patch: { nama?: string; tanggalPelaksanaan?: string; deskripsi?: string },
): Promise<void> {
  const existing = await getEventById(id)
  if (!existing) throw new Error("Event tidak ditemukan.")
  if (existing.status !== "DRAFT" && existing.status !== "AKTIF") {
    throw new Error("Event hanya bisa diedit saat status DRAFT atau AKTIF.")
  }

  await db.update(event).set(patch).where(eq(event.id, id))
}

export async function transitionStatus(
  id: number,
  target: StatusEvent,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _byUserId: string,
): Promise<void> {
  if (target === "SELESAI" || target === "DIBATALKAN") {
    throw new EventTransitionError("Gunakan closeEvent/cancelEvent untuk status ini.")
  }

  await db.transaction(async (tx) => {
    const [row] = await tx
      .select({ status: event.status })
      .from(event)
      .where(eq(event.id, id))
      .for("update")

    if (!row) throw new Error("Event tidak ditemukan.")

    const from = row.status as StatusEvent
    if (!canTransition(from, target)) {
      throw new EventTransitionError(`Transisi ${from} → ${target} tidak diizinkan.`)
    }

    await tx.update(event).set({ status: target }).where(eq(event.id, id))
  })
}

export async function deleteEvent(id: number): Promise<void> {
  await db.delete(event).where(eq(event.id, id))
}

export async function closeEvent(
  tx: DbTransaction,
  eventId: number,
  byUserId: string,
): Promise<void> {
  await tx.execute(sql`SELECT pg_advisory_xact_lock(${eventId})`)

  const [ev] = await tx
    .select({ id: event.id, status: event.status })
    .from(event)
    .where(eq(event.id, eventId))
    .for("update")

  if (!ev) throw new Error("Event tidak ditemukan.")

  const failures: string[] = []

  if (ev.status !== "BALANCING") {
    failures.push(`Status event harus BALANCING (saat ini: ${ev.status})`)
    throw new Error(`Tidak bisa tutup event:\n- ${failures.join("\n- ")}`)
  }

  const [pRow] = await tx
    .select({ count: sql<number>`count(*)` })
    .from(pengeluaranEvent)
    .where(and(eq(pengeluaranEvent.eventId, eventId), eq(pengeluaranEvent.status, "PENDING")))

  const pendingCount = Number(pRow?.count ?? 0)
  if (pendingCount > 0) failures.push(`Masih ada ${pendingCount} pengeluaran pending`)

  const [sRow] = await tx
    .select({ total: sql<number>`coalesce(sum(${sumbanganEvent.nominal}), 0)` })
    .from(sumbanganEvent)
    .where(eq(sumbanganEvent.eventId, eventId))

  const [aRow] = await tx
    .select({ total: sql<number>`coalesce(sum(${pengeluaranEvent.nominal}), 0)` })
    .from(pengeluaranEvent)
    .where(and(eq(pengeluaranEvent.eventId, eventId), eq(pengeluaranEvent.status, "APPROVED")))

  const saldo = Number(sRow?.total ?? 0) - Number(aRow?.total ?? 0)
  if (saldo !== 0) {
    failures.push(`Saldo masih ${saldo > 0 ? "+" : ""}Rp ${Math.abs(saldo).toLocaleString("id-ID")}`)
  }

  if (failures.length > 0) {
    throw new Error(`Tidak bisa tutup event:\n- ${failures.join("\n- ")}`)
  }

  await tx.update(event).set({ status: "SELESAI", closedAt: new Date() }).where(eq(event.id, eventId))
  void byUserId
}

export async function cancelEvent(
  tx: DbTransaction,
  {
    eventId,
    reason,
    sumbanganHandling,
    eventTujuanId,
  }: {
    eventId: number
    reason: string
    sumbanganHandling: "REFUND_MANUAL" | "PINDAH_KAS_RT" | "PINDAH_EVENT_LAIN"
    eventTujuanId?: number
  },
  byUserId: string,
): Promise<void> {
  // 1. Advisory lock + re-read event
  await tx.execute(sql`SELECT pg_advisory_xact_lock(${eventId})`)

  const [ev] = await tx
    .select({ id: event.id, status: event.status })
    .from(event)
    .where(eq(event.id, eventId))
    .for("update")

  if (!ev) throw new Error("Event tidak ditemukan.")
  if (ev.status !== "DRAFT" && ev.status !== "AKTIF") {
    throw new Error(`Cancel hanya untuk status DRAFT atau AKTIF (saat ini: ${ev.status}).`)
  }

  // 2. Lazy-import service functions to avoid circular deps
  const { batchRejectPendingForCancel } = await import("@/lib/services/pengeluaran-event-service")
  const {
    markAllAsRefunded,
    listTalanganForRefund,
    transferAllToEvent,
    sumMandiriByEvent,
  } = await import("@/lib/services/sumbangan-event-service")
  const { createRefundTalangan, dumpToKasRt } = await import("@/lib/services/transfer-kas-event-service")

  // 3. Reject all PENDING pengeluaran
  await batchRejectPendingForCancel(eventId, byUserId, "Event dibatalkan", tx)

  // 4. Handle sumbangan
  if (sumbanganHandling === "REFUND_MANUAL") {
    // Mark semua non-TALANGAN sebagai refunded_at
    await markAllAsRefunded(eventId, ["TALANGAN_KAS"], tx)
    // TALANGAN_KAS: refund ke kas RT satu per satu
    const talanganRows = await listTalanganForRefund(eventId, tx)
    for (const row of talanganRows) {
      await createRefundTalangan(tx, { eventId, nominal: row.nominal, recordedBy: byUserId })
    }
    // Mark TALANGAN sebagai refunded juga
    await markAllAsRefunded(eventId, [], tx)

  } else if (sumbanganHandling === "PINDAH_KAS_RT") {
    // MANDIRI_WARGA → masuk ke kas RT sebagai 1 transaksi
    const totalMandiri = await sumMandiriByEvent(eventId, tx)
    if (totalMandiri > 0) {
      await dumpToKasRt(tx, { eventId, nominal: totalMandiri, byUserId })
    }
    // TALANGAN_KAS → refund ke kas RT (cancel the outgoing transaction)
    const talanganRows = await listTalanganForRefund(eventId, tx)
    for (const row of talanganRows) {
      await createRefundTalangan(tx, { eventId, nominal: row.nominal, recordedBy: byUserId })
    }
    // Mark all as refunded
    await markAllAsRefunded(eventId, [], tx)

  } else if (sumbanganHandling === "PINDAH_EVENT_LAIN") {
    if (!eventTujuanId) throw new Error("Event tujuan wajib dipilih.")

    // Validate event tujuan
    const [eventTujuan] = await tx
      .select({ id: event.id, status: event.status })
      .from(event)
      .where(eq(event.id, eventTujuanId))
      .limit(1)

    if (!eventTujuan) throw new Error("Event tujuan tidak ditemukan.")
    if (eventTujuan.status !== "AKTIF") throw new Error("Event tujuan harus berstatus AKTIF.")

    // MANDIRI_WARGA → pindah ke event tujuan
    await transferAllToEvent(eventId, eventTujuanId, tx)

    // TALANGAN_KAS → wajib refund ke kas RT (tidak boleh dialihkan)
    const talanganRows = await listTalanganForRefund(eventId, tx)
    for (const row of talanganRows) {
      await createRefundTalangan(tx, { eventId, nominal: row.nominal, recordedBy: byUserId })
    }

    // Mark non-MANDIRI_WARGA sebagai refunded
    await markAllAsRefunded(eventId, ["MANDIRI_WARGA"], tx)
  }

  // 5. Update event status
  await tx.update(event).set({
    status: "DIBATALKAN",
    cancelledAt: new Date(),
    cancelReason: reason,
  }).where(eq(event.id, eventId))
}
