import "server-only"

import { and, desc, eq, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { event, sumbanganEvent, user, warga } from "@/lib/db/schema"
import type { StatusEvent } from "@/lib/constants/event-status"
import type { SumberSumbangan } from "@/lib/validations/sumbangan-event"
import type { CreateSumbanganInput, CreateBulkSumbanganInput } from "@/lib/validations/sumbangan-event"

const MAX_LIMIT = 500

/**
 * Pure util — status apa sumber apa yang diizinkan (SEC-E11).
 * AKTIF: semua sumber boleh.
 * BALANCING: hanya sumber non-MANDIRI (untuk tutup defisit).
 */
export function isSumbanganAllowed(
  eventStatus: StatusEvent,
  sumber: SumberSumbangan,
): boolean {
  if (eventStatus === "AKTIF") return true
  if (eventStatus === "BALANCING") {
    return sumber !== "MANDIRI_WARGA"
  }
  return false
}

export type SumbanganListItem = {
  id: number
  wargaId: number | null
  wargaNama: string | null
  wargaBlok: string | null
  nominal: number
  sumber: string
  tanggal: string
  keterangan: string | null
  recordedByName: string
  linkedTransaksiId: number | null
  createdAt: Date
}

export async function listSumbanganByEvent(
  eventId: number,
  opts?: { limit?: number; offset?: number },
): Promise<SumbanganListItem[]> {
  const limit = Math.min(opts?.limit ?? 100, MAX_LIMIT)
  const offset = opts?.offset ?? 0

  const rows = await db
    .select({
      id: sumbanganEvent.id,
      wargaId: sumbanganEvent.wargaId,
      wargaNama: warga.namaKepalaKeluarga,
      wargaBlok: warga.blokRumah,
      nominal: sumbanganEvent.nominal,
      sumber: sumbanganEvent.sumber,
      tanggal: sumbanganEvent.tanggal,
      keterangan: sumbanganEvent.keterangan,
      recordedByName: user.name,
      linkedTransaksiId: sumbanganEvent.linkedTransaksiId,
      createdAt: sumbanganEvent.createdAt,
    })
    .from(sumbanganEvent)
    .innerJoin(user, eq(sumbanganEvent.recordedBy, user.id))
    .leftJoin(warga, eq(sumbanganEvent.wargaId, warga.id))
    .where(eq(sumbanganEvent.eventId, eventId))
    .orderBy(desc(sumbanganEvent.createdAt))
    .limit(limit)
    .offset(offset)

  return rows.map((r) => ({
    ...r,
    tanggal: typeof r.tanggal === "string" ? r.tanggal : String(r.tanggal),
  }))
}

export async function sumSumbanganByEvent(eventId: number): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${sumbanganEvent.nominal}), 0)` })
    .from(sumbanganEvent)
    .where(eq(sumbanganEvent.eventId, eventId))
  return Number(row?.total ?? 0)
}

export async function createSumbangan(
  input: Omit<CreateSumbanganInput, "eventId"> & {
    eventId: number
    linkedTransaksiId?: number
  },
  recordedById: string,
): Promise<{ id: number; linkedTransaksiId?: number }> {
  const [ev] = await db
    .select({ status: event.status })
    .from(event)
    .where(eq(event.id, input.eventId))
    .limit(1)

  if (!ev) throw new Error("Event tidak ditemukan.")

  const status = ev.status as StatusEvent
  if (!isSumbanganAllowed(status, input.sumber ?? "MANDIRI_WARGA")) {
    throw new Error(
      `Sumbangan dengan sumber ${input.sumber} tidak diizinkan saat status event ${status}.`,
    )
  }

  const today = new Date().toISOString().slice(0, 10)

  const [row] = await db
    .insert(sumbanganEvent)
    .values({
      eventId: input.eventId,
      wargaId: input.wargaId ?? null,
      nominal: input.nominal,
      sumber: input.sumber ?? "MANDIRI_WARGA",
      tanggal: input.tanggal ?? today,
      keterangan: input.keterangan ?? null,
      recordedBy: recordedById,
      linkedTransaksiId: input.linkedTransaksiId ?? null,
    })
    .returning({ id: sumbanganEvent.id, linkedTransaksiId: sumbanganEvent.linkedTransaksiId })

  return { id: row.id, linkedTransaksiId: row.linkedTransaksiId ?? undefined }
}

export async function createBulkSumbanganMandiri(
  input: CreateBulkSumbanganInput,
  recordedById: string,
): Promise<{ count: number }> {
  const [ev] = await db
    .select({ status: event.status })
    .from(event)
    .where(eq(event.id, input.eventId))
    .limit(1)

  if (!ev) throw new Error("Event tidak ditemukan.")
  if (!isSumbanganAllowed(ev.status as StatusEvent, "MANDIRI_WARGA")) {
    throw new Error(`Tidak bisa mencatat sumbangan mandiri saat status event ${ev.status}.`)
  }

  const today = new Date().toISOString().slice(0, 10)

  await db.transaction(async (tx) => {
    await tx.insert(sumbanganEvent).values(
      input.items.map((item) => ({
        eventId: input.eventId,
        wargaId: item.wargaId,
        nominal: item.nominal,
        sumber: "MANDIRI_WARGA" as const,
        tanggal: today,
        recordedBy: recordedById,
      })),
    )
  })

  return { count: input.items.length }
}

/** Mark all sumbangan MANDIRI_WARGA/URUNAN/TAMBAHAN as refunded (refunded_at = now). */
export async function markAllAsRefunded(
  eventId: number,
  excludeSumber: string[],
  tx: import("@/lib/db").DbTransaction,
): Promise<void> {
  const { inArray, not } = await import("drizzle-orm")
  if (excludeSumber.length > 0) {
    await tx
      .update(sumbanganEvent)
      .set({ refundedAt: new Date() })
      .where(and(eq(sumbanganEvent.eventId, eventId), not(inArray(sumbanganEvent.sumber, excludeSumber as ("MANDIRI_WARGA" | "TALANGAN_KAS" | "URUNAN_PENGURUS" | "SUMBANGAN_TAMBAHAN_WARGA")[]))))
  } else {
    await tx
      .update(sumbanganEvent)
      .set({ refundedAt: new Date() })
      .where(eq(sumbanganEvent.eventId, eventId))
  }
}

/** Move all MANDIRI_WARGA sumbangan to another event. Updates event_id + transferred_to_event_id. */
export async function transferAllToEvent(
  fromEventId: number,
  toEventId: number,
  tx: import("@/lib/db").DbTransaction,
): Promise<{ count: number }> {
  const result = await tx
    .update(sumbanganEvent)
    .set({ eventId: toEventId, transferredToEventId: fromEventId })
    .where(and(eq(sumbanganEvent.eventId, fromEventId), eq(sumbanganEvent.sumber, "MANDIRI_WARGA")))
    .returning({ id: sumbanganEvent.id })

  return { count: result.length }
}

/** Get all TALANGAN_KAS sumbangan for an event with their nominal. */
export async function listTalanganForRefund(
  eventId: number,
  tx: import("@/lib/db").DbTransaction,
): Promise<{ id: number; nominal: number }[]> {
  return tx
    .select({ id: sumbanganEvent.id, nominal: sumbanganEvent.nominal })
    .from(sumbanganEvent)
    .where(and(eq(sumbanganEvent.eventId, eventId), eq(sumbanganEvent.sumber, "TALANGAN_KAS")))
}

/** Sum MANDIRI_WARGA sumbangan for use in PINDAH_KAS_RT handling. */
export async function sumMandiriByEvent(
  eventId: number,
  tx: import("@/lib/db").DbTransaction,
): Promise<number> {
  const [row] = await tx
    .select({ total: sql<number>`coalesce(sum(${sumbanganEvent.nominal}), 0)` })
    .from(sumbanganEvent)
    .where(and(eq(sumbanganEvent.eventId, eventId), eq(sumbanganEvent.sumber, "MANDIRI_WARGA")))
  return Number(row?.total ?? 0)
}
