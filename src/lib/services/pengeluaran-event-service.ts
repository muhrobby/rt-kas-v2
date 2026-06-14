import "server-only"

import { and, eq, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import type { DbLike } from "@/lib/db"
import { event, pengeluaranEvent, sumbanganEvent, user } from "@/lib/db/schema"
import type { StatusEvent } from "@/lib/constants/event-status"

const MAX_LIMIT = 500

export type PengeluaranListItem = {
  id: number
  deskripsi: string
  nominal: number
  tanggal: string
  status: string
  recordedBy: string
  recordedByName: string
  approvedAt: Date | null
  rejectedReason: string | null
  createdAt: Date
}

export async function listPengeluaranByEvent(
  eventId: number,
  opts?: { status?: string; limit?: number; offset?: number },
): Promise<PengeluaranListItem[]> {
  const limit = Math.min(opts?.limit ?? 100, MAX_LIMIT)
  const offset = opts?.offset ?? 0

  const conditions = [eq(pengeluaranEvent.eventId, eventId)]
  if (opts?.status) {
    conditions.push(eq(pengeluaranEvent.status, opts.status as "PENDING" | "APPROVED" | "REJECTED"))
  }

  const rows = await db
    .select({
      id: pengeluaranEvent.id,
      deskripsi: pengeluaranEvent.deskripsi,
      nominal: pengeluaranEvent.nominal,
      tanggal: pengeluaranEvent.tanggal,
      status: pengeluaranEvent.status,
      recordedBy: pengeluaranEvent.recordedBy,
      recordedByName: user.name,
      approvedAt: pengeluaranEvent.approvedAt,
      rejectedReason: pengeluaranEvent.rejectedReason,
      createdAt: pengeluaranEvent.createdAt,
    })
    .from(pengeluaranEvent)
    .innerJoin(user, eq(pengeluaranEvent.recordedBy, user.id))
    .where(and(...conditions))
    .orderBy(sql`${pengeluaranEvent.createdAt} desc`)
    .limit(limit)
    .offset(offset)

  return rows.map((r) => ({
    ...r,
    tanggal: typeof r.tanggal === "string" ? r.tanggal : String(r.tanggal),
  }))
}

export async function sumApprovedByEvent(eventId: number): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${pengeluaranEvent.nominal}), 0)` })
    .from(pengeluaranEvent)
    .where(and(eq(pengeluaranEvent.eventId, eventId), eq(pengeluaranEvent.status, "APPROVED")))
  return Number(row?.total ?? 0)
}

export async function sumPendingByEvent(eventId: number): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${pengeluaranEvent.nominal}), 0)` })
    .from(pengeluaranEvent)
    .where(and(eq(pengeluaranEvent.eventId, eventId), eq(pengeluaranEvent.status, "PENDING")))
  return Number(row?.total ?? 0)
}

export async function countPendingByEvent(eventId: number): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(pengeluaranEvent)
    .where(and(eq(pengeluaranEvent.eventId, eventId), eq(pengeluaranEvent.status, "PENDING")))
  return Number(row?.count ?? 0)
}

export async function getPengeluaranById(id: number) {
  const [row] = await db
    .select()
    .from(pengeluaranEvent)
    .where(eq(pengeluaranEvent.id, id))
    .limit(1)
  return row ?? null
}

export async function bulkCreatePengeluaran(
  input: { eventId: number; items: { deskripsi: string; nominal: number; tanggal: string }[] },
  recordedById: string,
): Promise<{ count: number; ids: number[] }> {
  // Status guard: hanya AKTIF
  const [ev] = await db
    .select({ status: event.status })
    .from(event)
    .where(eq(event.id, input.eventId))
    .limit(1)

  if (!ev) throw new Error("Event tidak ditemukan.")
  if ((ev.status as StatusEvent) !== "AKTIF") {
    throw new Error("Pengeluaran hanya bisa dicatat saat event berstatus AKTIF.")
  }

  const rows = await db.transaction(async (tx) => {
    return tx
      .insert(pengeluaranEvent)
      .values(
        input.items.map((item) => ({
          eventId: input.eventId,
          deskripsi: item.deskripsi,
          nominal: item.nominal,
          tanggal: item.tanggal,
          recordedBy: recordedById,
        })),
      )
      .returning({ id: pengeluaranEvent.id })
  })

  return { count: rows.length, ids: rows.map((r) => r.id) }
}

export async function updatePengeluaran(
  id: number,
  patch: { deskripsi?: string; nominal?: number; tanggal?: string },
): Promise<void> {
  const row = await getPengeluaranById(id)
  if (!row) throw new Error("Pengeluaran tidak ditemukan.")
  if (row.status !== "PENDING") throw new Error("Hanya pengeluaran PENDING yang bisa diedit.")

  // Validate event status
  const [ev] = await db
    .select({ status: event.status })
    .from(event)
    .where(eq(event.id, row.eventId))
    .limit(1)

  if (!ev || (ev.status as StatusEvent) !== "AKTIF") {
    throw new Error("Event harus berstatus AKTIF untuk mengedit pengeluaran.")
  }

  await db.update(pengeluaranEvent).set(patch).where(eq(pengeluaranEvent.id, id))
}

export async function deletePengeluaran(id: number): Promise<void> {
  const row = await getPengeluaranById(id)
  if (!row) throw new Error("Pengeluaran tidak ditemukan.")
  if (row.status !== "PENDING") throw new Error("Hanya pengeluaran PENDING yang bisa dihapus.")

  const [ev] = await db
    .select({ status: event.status })
    .from(event)
    .where(eq(event.id, row.eventId))
    .limit(1)

  if (!ev || (ev.status as StatusEvent) !== "AKTIF") {
    throw new Error("Event harus berstatus AKTIF untuk menghapus pengeluaran.")
  }

  await db.delete(pengeluaranEvent).where(eq(pengeluaranEvent.id, id))
}

export async function approvePengeluaran(id: number, byUserId: string): Promise<void> {
  await db.transaction(async (tx) => {
    // Advisory lock per event
    const [row] = await tx
      .select({
        id: pengeluaranEvent.id,
        eventId: pengeluaranEvent.eventId,
        nominal: pengeluaranEvent.nominal,
        status: pengeluaranEvent.status,
      })
      .from(pengeluaranEvent)
      .where(eq(pengeluaranEvent.id, id))
      .for("update")

    if (!row) throw new Error("Pengeluaran tidak ditemukan.")
    if (row.status !== "PENDING") throw new Error("Pengeluaran sudah diputuskan.")

    await tx.execute(sql`SELECT pg_advisory_xact_lock(${row.eventId})`)

    // Validate event status
    const [ev] = await tx
      .select({ status: event.status })
      .from(event)
      .where(eq(event.id, row.eventId))
      .limit(1)

    if (!ev || (ev.status as StatusEvent) !== "BALANCING") {
      throw new Error("Status event harus BALANCING untuk approve pengeluaran.")
    }

    // Compute projected balance
    const [sumbangan] = await tx
      .select({ total: sql<number>`coalesce(sum(${sumbanganEvent.nominal}), 0)` })
      .from(sumbanganEvent)
      .where(eq(sumbanganEvent.eventId, row.eventId))

    const [approved] = await tx
      .select({ total: sql<number>`coalesce(sum(${pengeluaranEvent.nominal}), 0)` })
      .from(pengeluaranEvent)
      .where(and(eq(pengeluaranEvent.eventId, row.eventId), eq(pengeluaranEvent.status, "APPROVED")))

    const totalSumbangan = Number(sumbangan?.total ?? 0)
    const totalApproved = Number(approved?.total ?? 0)
    const proyeksiSaldo = totalSumbangan - totalApproved - row.nominal

    if (proyeksiSaldo < 0) {
      const deficit = Math.abs(proyeksiSaldo)
      throw new Error(`Saldo event tidak cukup. Kekurangan Rp ${deficit.toLocaleString("id-ID")}.`)
    }

    await tx
      .update(pengeluaranEvent)
      .set({ status: "APPROVED", approvedBy: byUserId, approvedAt: new Date() })
      .where(eq(pengeluaranEvent.id, id))
  })
}

export async function rejectPengeluaran(id: number, byUserId: string, reason: string): Promise<void> {
  await db.transaction(async (tx) => {
    const [row] = await tx
      .select({ id: pengeluaranEvent.id, eventId: pengeluaranEvent.eventId, status: pengeluaranEvent.status })
      .from(pengeluaranEvent)
      .where(eq(pengeluaranEvent.id, id))
      .for("update")

    if (!row) throw new Error("Pengeluaran tidak ditemukan.")
    if (row.status !== "PENDING") throw new Error("Pengeluaran sudah diputuskan.")

    await tx.execute(sql`SELECT pg_advisory_xact_lock(${row.eventId})`)

    const [ev] = await tx
      .select({ status: event.status })
      .from(event)
      .where(eq(event.id, row.eventId))
      .limit(1)

    if (!ev || (ev.status as StatusEvent) !== "BALANCING") {
      throw new Error("Status event harus BALANCING untuk reject pengeluaran.")
    }

    await tx
      .update(pengeluaranEvent)
      .set({ status: "REJECTED", rejectedBy: byUserId, rejectedAt: new Date(), rejectedReason: reason })
      .where(eq(pengeluaranEvent.id, id))
  })
}

export async function batchRejectPendingForCancel(
  eventId: number,
  byUserId: string,
  reasonAuto = "Event dibatalkan",
  dbLike: DbLike = db,
): Promise<{ count: number }> {
  const result = await dbLike
    .update(pengeluaranEvent)
    .set({ status: "REJECTED", rejectedBy: byUserId, rejectedAt: new Date(), rejectedReason: reasonAuto })
    .where(and(eq(pengeluaranEvent.eventId, eventId), eq(pengeluaranEvent.status, "PENDING")))
    .returning({ id: pengeluaranEvent.id })

  return { count: result.length }
}
