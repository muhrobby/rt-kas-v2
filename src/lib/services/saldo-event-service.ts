import "server-only"

import { and, eq, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { pengeluaranEvent, sumbanganEvent } from "@/lib/db/schema"

export type SaldoEventResult = {
  totalSumbangan: number
  totalApproved: number
  totalPending: number
  saldo: number
  proyeksi: number
  indikator: "MINUS" | "OK"
}

export type SaldoForWargaResult = {
  totalSumbangan: number
  totalPengeluaranApproved: number
}

export async function getSaldoEvent(eventId: number): Promise<SaldoEventResult> {
  const [row] = await db.execute<{
    sum_sumbangan: string
    sum_approved: string
    sum_pending: string
  }>(sql`
    WITH s AS (
      SELECT coalesce(sum(${sumbanganEvent.nominal}), 0) AS total
      FROM ${sumbanganEvent}
      WHERE ${sumbanganEvent.eventId} = ${eventId}
    ),
    pa AS (
      SELECT coalesce(sum(${pengeluaranEvent.nominal}), 0) AS total
      FROM ${pengeluaranEvent}
      WHERE ${pengeluaranEvent.eventId} = ${eventId} AND ${pengeluaranEvent.status} = 'APPROVED'
    ),
    pp AS (
      SELECT coalesce(sum(${pengeluaranEvent.nominal}), 0) AS total
      FROM ${pengeluaranEvent}
      WHERE ${pengeluaranEvent.eventId} = ${eventId} AND ${pengeluaranEvent.status} = 'PENDING'
    )
    SELECT s.total AS sum_sumbangan, pa.total AS sum_approved, pp.total AS sum_pending
    FROM s, pa, pp
  `)

  const totalSumbangan = Number(row.sum_sumbangan)
  const totalApproved = Number(row.sum_approved)
  const totalPending = Number(row.sum_pending)
  const saldo = totalSumbangan - totalApproved
  const proyeksi = totalSumbangan - totalApproved - totalPending

  return {
    totalSumbangan,
    totalApproved,
    totalPending,
    saldo,
    proyeksi,
    indikator: saldo < 0 ? "MINUS" : "OK",
  }
}

export async function getSaldoForWarga(eventId: number): Promise<SaldoForWargaResult> {
  const [sRow] = await db
    .select({ total: sql<number>`coalesce(sum(${sumbanganEvent.nominal}), 0)` })
    .from(sumbanganEvent)
    .where(eq(sumbanganEvent.eventId, eventId))

  const [pRow] = await db
    .select({ total: sql<number>`coalesce(sum(${pengeluaranEvent.nominal}), 0)` })
    .from(pengeluaranEvent)
    .where(and(eq(pengeluaranEvent.eventId, eventId), eq(pengeluaranEvent.status, "APPROVED"), eq(pengeluaranEvent.isSystem, false)))

  return {
    totalSumbangan: Number(sRow?.total ?? 0),
    totalPengeluaranApproved: Number(pRow?.total ?? 0),
  }
}

export async function canApprove(
  eventId: number,
  additionalNominal: number,
): Promise<{ allowed: boolean; deficit?: number }> {
  const saldo = await getSaldoEvent(eventId)
  const projected = saldo.saldo - additionalNominal
  if (projected < 0) {
    return { allowed: false, deficit: Math.abs(projected) }
  }
  return { allowed: true }
}
