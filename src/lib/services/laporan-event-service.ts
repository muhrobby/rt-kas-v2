import "server-only"

import { and, asc, eq, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { event, pengeluaranEvent, sumbanganEvent, user, warga } from "@/lib/db/schema"

export type LaporanFinalEvent = {
  event: {
    id: number
    nama: string
    tanggalPelaksanaan: string
    deskripsi: string | null
    status: string
    closedAt: Date | null
    createdByName: string
  }
  totalSumbangan: number
  totalPengeluaranApproved: number
  sisaDanaTransferred: number | null
  sumbangan: Array<{
    tanggal: string
    wargaNama: string | null
    nominal: number
    sumber: string
    keterangan: string | null
  }>
  pengeluaranApproved: Array<{
    tanggal: string
    deskripsi: string
    nominal: number
    recordedByName: string
    approvedByName: string | null
  }>
}

export async function generateFinalReport(eventId: number): Promise<LaporanFinalEvent> {
  const [ev] = await db
    .select({
      id: event.id,
      nama: event.nama,
      tanggalPelaksanaan: event.tanggalPelaksanaan,
      deskripsi: event.deskripsi,
      status: event.status,
      closedAt: event.closedAt,
      createdByName: user.name,
    })
    .from(event)
    .innerJoin(user, eq(event.createdBy, user.id))
    .where(eq(event.id, eventId))

  if (!ev) throw new Error("Event tidak ditemukan.")
  if (ev.status !== "SELESAI") throw new Error("Laporan hanya tersedia untuk event yang sudah ditutup (SELESAI).")

  const [sumbanganRows, pengeluaranRows, sistemRows] = await Promise.all([
    db
      .select({
        tanggal: sumbanganEvent.tanggal,
        wargaNama: warga.namaKepalaKeluarga,
        nominal: sumbanganEvent.nominal,
        sumber: sumbanganEvent.sumber,
        keterangan: sumbanganEvent.keterangan,
      })
      .from(sumbanganEvent)
      .leftJoin(warga, eq(sumbanganEvent.wargaId, warga.id))
      .where(eq(sumbanganEvent.eventId, eventId))
      .orderBy(asc(sumbanganEvent.tanggal)),

    db
      .select({
        tanggal: pengeluaranEvent.tanggal,
        deskripsi: pengeluaranEvent.deskripsi,
        nominal: pengeluaranEvent.nominal,
        recordedByName: user.name,
        approvedByName: sql<string | null>`(SELECT name FROM "user" WHERE id = ${pengeluaranEvent.approvedBy})`,
      })
      .from(pengeluaranEvent)
      .innerJoin(user, eq(pengeluaranEvent.recordedBy, user.id))
      .where(and(
        eq(pengeluaranEvent.eventId, eventId),
        eq(pengeluaranEvent.status, "APPROVED"),
        eq(pengeluaranEvent.isSystem, false),
      ))
      .orderBy(asc(pengeluaranEvent.tanggal)),

    // sistem entries = taruh di kas transfers
    db
      .select({ total: sql<number>`coalesce(sum(${pengeluaranEvent.nominal}), 0)` })
      .from(pengeluaranEvent)
      .where(and(eq(pengeluaranEvent.eventId, eventId), eq(pengeluaranEvent.isSystem, true))),
  ])

  const totalSumbangan = sumbanganRows.reduce((s, r) => s + r.nominal, 0)
  const totalPengeluaranApproved = pengeluaranRows.reduce((s, r) => s + r.nominal, 0)
  const sisaDanaTransferred = Number(sistemRows[0]?.total ?? 0) || null

  return {
    event: {
      ...ev,
      tanggalPelaksanaan: typeof ev.tanggalPelaksanaan === "string" ? ev.tanggalPelaksanaan : String(ev.tanggalPelaksanaan),
    },
    totalSumbangan,
    totalPengeluaranApproved,
    sisaDanaTransferred,
    sumbangan: sumbanganRows.map((r) => ({
      ...r,
      tanggal: typeof r.tanggal === "string" ? r.tanggal : String(r.tanggal),
    })),
    pengeluaranApproved: pengeluaranRows.map((r) => ({
      ...r,
      tanggal: typeof r.tanggal === "string" ? r.tanggal : String(r.tanggal),
    })),
  }
}
