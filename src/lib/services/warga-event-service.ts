import "server-only"

import { and, asc, eq, inArray, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { event, pengeluaranEvent } from "@/lib/db/schema"
import { getSaldoForWarga, type SaldoForWargaResult } from "@/lib/services/saldo-event-service"

const MAX_LIMIT = 100
const VISIBLE_STATUSES = ["AKTIF", "BALANCING", "SELESAI"] as const

// SEC-E10: Strict whitelist — no panitia, no individual warga transactions
export type WargaEventListItem = {
  id: number
  nama: string
  tanggalPelaksanaan: string
  status: string
  totalSumbangan: number
  totalPengeluaranApproved: number
}

// Public pengeluaran — deskripsi + nominal only, no recorded/approved person name
export type WargaPengeluaranItem = {
  tanggal: string
  deskripsi: string
  nominal: number
}

export type WargaEventDetail = {
  event: {
    id: number
    nama: string
    tanggalPelaksanaan: string
    deskripsi: string | null
    status: string
    closedAt: Date | null
  }
  saldoForWarga: SaldoForWargaResult
  pengeluaranList: WargaPengeluaranItem[]
  sisaDanaTransferred: number | null
}

export async function listEventsForWarga(): Promise<WargaEventListItem[]> {
  const rows = await db
    .select({
      id: event.id,
      nama: event.nama,
      tanggalPelaksanaan: event.tanggalPelaksanaan,
      status: event.status,
      totalSumbangan: sql<number>`coalesce((
        select sum(nominal) from sumbangan_event where event_id = "event"."id"
      ), 0)`,
      totalPengeluaranApproved: sql<number>`coalesce((
        select sum(nominal) from pengeluaran_event
        where event_id = "event"."id" and status = 'APPROVED' and is_system = false
      ), 0)`,
    })
    .from(event)
    .where(inArray(event.status, [...VISIBLE_STATUSES]))
    .orderBy(sql`${event.tanggalPelaksanaan} desc`)
    .limit(MAX_LIMIT)

  return rows.map((r) => ({
    id: r.id,
    nama: r.nama,
    tanggalPelaksanaan: typeof r.tanggalPelaksanaan === "string" ? r.tanggalPelaksanaan : String(r.tanggalPelaksanaan),
    status: r.status,
    totalSumbangan: Number(r.totalSumbangan),
    totalPengeluaranApproved: Number(r.totalPengeluaranApproved),
  }))
}

export async function getEventDetailForWarga(eventId: number): Promise<WargaEventDetail | null> {
  const [ev] = await db
    .select({
      id: event.id,
      nama: event.nama,
      tanggalPelaksanaan: event.tanggalPelaksanaan,
      deskripsi: event.deskripsi,
      status: event.status,
      closedAt: event.closedAt,
    })
    .from(event)
    .where(eq(event.id, eventId))
    .limit(1)

  if (!ev) return null
  if (!VISIBLE_STATUSES.includes(ev.status as (typeof VISIBLE_STATUSES)[number])) return null

  const [saldoForWarga, pengeluaranRows, sistemRow] = await Promise.all([
    getSaldoForWarga(eventId),
    // Public pengeluaran: APPROVED, non-system only
    db
      .select({
        tanggal: pengeluaranEvent.tanggal,
        deskripsi: pengeluaranEvent.deskripsi,
        nominal: pengeluaranEvent.nominal,
      })
      .from(pengeluaranEvent)
      .where(and(
        eq(pengeluaranEvent.eventId, eventId),
        eq(pengeluaranEvent.status, "APPROVED"),
        eq(pengeluaranEvent.isSystem, false),
      ))
      .orderBy(asc(pengeluaranEvent.tanggal)),
    // Transfer sisa ke kas RT
    db
      .select({ total: sql<number>`coalesce(sum(${pengeluaranEvent.nominal}), 0)` })
      .from(pengeluaranEvent)
      .where(and(eq(pengeluaranEvent.eventId, eventId), eq(pengeluaranEvent.isSystem, true))),
  ])

  const sisaDana = Number(sistemRow[0]?.total ?? 0)

  return {
    event: {
      ...ev,
      tanggalPelaksanaan: typeof ev.tanggalPelaksanaan === "string" ? ev.tanggalPelaksanaan : String(ev.tanggalPelaksanaan),
    },
    saldoForWarga,
    pengeluaranList: pengeluaranRows.map((p) => ({
      tanggal: typeof p.tanggal === "string" ? p.tanggal : String(p.tanggal),
      deskripsi: p.deskripsi,
      nominal: p.nominal,
    })),
    sisaDanaTransferred: sisaDana > 0 ? sisaDana : null,
  }
}
