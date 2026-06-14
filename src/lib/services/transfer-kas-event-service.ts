import "server-only"

import { and, eq, sql } from "drizzle-orm"

import type { DbTransaction } from "@/lib/db"
import { event, kategoriKas, pengeluaranEvent, sumbanganEvent, transaksi } from "@/lib/db/schema"

/**
 * Get current billing period (month/year) for event-related kas masuk transactions.
 * Used so transactions appear in the correct month's laporan/cashflow report.
 */
function currentBillingPeriod() {
  const now = new Date()
  return {
    bulanTagihan: String(now.getMonth() + 1),
    tahunTagihan: now.getFullYear(),
  }
}

const NAMA_KATEGORI_TALANGAN = "Talangan Event"

/** Cari atau buat kategori sistem "Talangan Event" — self-healing. */
async function resolveKategoriTalangan(tx: DbTransaction): Promise<number> {
  const [existing] = await tx
    .select({ id: kategoriKas.id })
    .from(kategoriKas)
    .where(eq(kategoriKas.namaKategori, NAMA_KATEGORI_TALANGAN))
    .limit(1)

  if (existing) return existing.id

  const [created] = await tx
    .insert(kategoriKas)
    .values({
      namaKategori: NAMA_KATEGORI_TALANGAN,
      jenisArus: "keluar",
      tipeTagihan: "sekali",
      nominalDefault: 0,
    })
    .returning({ id: kategoriKas.id })

  return created.id
}

/** Hitung saldo kas RT (transaksi non-event: event_id IS NULL). */
async function getKasRtBalance(tx: DbTransaction): Promise<number> {
  const [row] = await tx.execute(
    sql`SELECT COALESCE(SUM(CASE WHEN tipe_arus = 'masuk' THEN nominal ELSE -nominal END), 0) AS saldo
        FROM transaksi WHERE event_id IS NULL`,
  )
  return Number((row as Record<string, unknown>).saldo ?? 0)
}

/**
 * Catat transaksi talangan kas RT → keluar dari kas untuk event.
 * Harus dipanggil di dalam db.transaction().
 * Advisory lock kelas per-kas (id=0) untuk serialisasi concurrent talangan (SEC-E05).
 */
export async function createTalanganTransaksi(
  tx: DbTransaction,
  {
    eventId,
    nominal,
    eventNama,
    recordedBy,
  }: {
    eventId: number
    nominal: number
    eventNama: string
    recordedBy: string
  },
): Promise<{ transaksiId: number }> {
  // Advisory lock global kas RT untuk prevent double-spend
  await tx.execute(sql`SELECT pg_advisory_xact_lock(0)`)

  const saldo = await getKasRtBalance(tx)
  if (saldo < nominal) {
    throw new Error(
      `INSUFFICIENT_KAS_BALANCE: Saldo kas RT Rp ${saldo.toLocaleString("id-ID")} tidak cukup untuk talangan Rp ${nominal.toLocaleString("id-ID")}.`,
    )
  }

  const kategoriId = await resolveKategoriTalangan(tx)

  const [row] = await tx
    .insert(transaksi)
    .values({
      userId: recordedBy,
      wargaId: null,
      kategoriId,
      eventId,
      nominal,
      tipeArus: "keluar",
      keterangan: `Talangan untuk event "${eventNama}"`,
    })
    .returning({ id: transaksi.id })

  return { transaksiId: row.id }
}

const NAMA_KATEGORI_REFUND = "Refund Talangan Event"

async function resolveKategoriRefund(tx: DbTransaction): Promise<number> {
  const [existing] = await tx
    .select({ id: kategoriKas.id })
    .from(kategoriKas)
    .where(eq(kategoriKas.namaKategori, NAMA_KATEGORI_REFUND))
    .limit(1)

  if (existing) return existing.id

  const [created] = await tx
    .insert(kategoriKas)
    .values({
      namaKategori: NAMA_KATEGORI_REFUND,
      jenisArus: "masuk",
      tipeTagihan: "sekali",
      nominalDefault: 0,
    })
    .returning({ id: kategoriKas.id })

  return created.id
}

/**
 * Kembalikan talangan event sebagai pemasukan kas RT.
 * Dipakai saat Cancel Event atas sumbangan TALANGAN_KAS.
 * Harus dipanggil di dalam db.transaction().
 */
export async function createRefundTalangan(
  tx: DbTransaction,
  {
    eventId,
    nominal,
    recordedBy,
  }: {
    eventId: number
    nominal: number
    recordedBy: string
  },
): Promise<{ transaksiId: number }> {
  const kategoriId = await resolveKategoriRefund(tx)

  const period = currentBillingPeriod()
  const [row] = await tx
    .insert(transaksi)
    .values({
      userId: recordedBy,
      kategoriId,
      eventId,
      nominal,
      tipeArus: "masuk",
      bulanTagihan: period.bulanTagihan,
      tahunTagihan: period.tahunTagihan,
      keterangan: `Refund talangan event #${eventId}`,
    })
    .returning({ id: transaksi.id })

  return { transaksiId: row.id }
}

const NAMA_KATEGORI_SISA = "Sisa Dana Event"

async function resolveKategoriSisa(tx: DbTransaction): Promise<number> {
  const [existing] = await tx
    .select({ id: kategoriKas.id })
    .from(kategoriKas)
    .where(eq(kategoriKas.namaKategori, NAMA_KATEGORI_SISA))
    .limit(1)

  if (existing) return existing.id

  const [created] = await tx
    .insert(kategoriKas)
    .values({
      namaKategori: NAMA_KATEGORI_SISA,
      jenisArus: "masuk",
      tipeTagihan: "sekali",
      nominalDefault: 0,
    })
    .returning({ id: kategoriKas.id })

  return created.id
}

/**
 * Transfer sisa dana event ke Kas RT.
 * Atomic: harus dipanggil di dalam db.transaction().
 * SEC-E04: advisory lock per eventId.
 * SEC-E07: atomicity — transaksi + pengeluaran sistem dalam satu TX.
 */
export async function taruhDiKas(
  tx: DbTransaction,
  {
    eventId,
    eventNama,
    byUserId,
  }: {
    eventId: number
    eventNama: string
    byUserId: string
  },
): Promise<{ transaksiPemasukanId: number; pengeluaranSistemId: number; nominal: number }> {
  // 1. Advisory lock per event
  await tx.execute(sql`SELECT pg_advisory_xact_lock(${eventId})`)

  // 2. Re-read event FOR UPDATE
  const [ev] = await tx
    .select({ status: event.status })
    .from(event)
    .where(eq(event.id, eventId))
    .for("update")

  if (!ev) throw new Error("Event tidak ditemukan.")
  if (ev.status !== "BALANCING") throw new Error("Status event harus BALANCING.")

  // 3. Hitung saldo (sumbangan - approved)
  const [sRow] = await tx
    .select({ total: sql<number>`coalesce(sum(${sumbanganEvent.nominal}), 0)` })
    .from(sumbanganEvent)
    .where(eq(sumbanganEvent.eventId, eventId))

  const [aRow] = await tx
    .select({ total: sql<number>`coalesce(sum(${pengeluaranEvent.nominal}), 0)` })
    .from(pengeluaranEvent)
    .where(and(eq(pengeluaranEvent.eventId, eventId), eq(pengeluaranEvent.status, "APPROVED")))

  const saldo = Number(sRow?.total ?? 0) - Number(aRow?.total ?? 0)

  // 4. Assert saldo > 0
  if (saldo <= 0) {
    throw new Error(`Tidak ada sisa dana untuk dipindahkan. Saldo saat ini Rp ${saldo.toLocaleString("id-ID")}.`)
  }

  // 5. Assert tidak ada PENDING
  const [pRow] = await tx
    .select({ count: sql<number>`count(*)` })
    .from(pengeluaranEvent)
    .where(and(eq(pengeluaranEvent.eventId, eventId), eq(pengeluaranEvent.status, "PENDING")))

  const pendingCount = Number(pRow?.count ?? 0)
  if (pendingCount > 0) {
    throw new Error(`Masih ada ${pendingCount} pengeluaran pending. Selesaikan approval terlebih dahulu.`)
  }

  // 6. Resolve kategori
  const kategoriId = await resolveKategoriSisa(tx)

  // 7. Insert transaksi pemasukan ke Kas RT
  const period = currentBillingPeriod()
  const [trxRow] = await tx
    .insert(transaksi)
    .values({
      userId: byUserId,
      kategoriId,
      eventId,
      nominal: saldo,
      tipeArus: "masuk",
      bulanTagihan: period.bulanTagihan,
      tahunTagihan: period.tahunTagihan,
      keterangan: `Sisa dana event "${eventNama}"`,
    })
    .returning({ id: transaksi.id })

  // 8. Insert pengeluaran sistem (APPROVED) agar saldo event menjadi 0
  const now = new Date()
  const [penRow] = await tx
    .insert(pengeluaranEvent)
    .values({
      eventId,
      deskripsi: "Transfer sisa ke Kas RT",
      nominal: saldo,
      tanggal: now.toISOString().slice(0, 10),
      status: "APPROVED",
      recordedBy: byUserId,
      approvedBy: byUserId,
      approvedAt: now,
      isSystem: true,
    })
    .returning({ id: pengeluaranEvent.id })

  return { transaksiPemasukanId: trxRow.id, pengeluaranSistemId: penRow.id, nominal: saldo }
}

const NAMA_KATEGORI_ALIH = "Alih Sumbangan Event"

async function resolveKategoriAlih(tx: DbTransaction): Promise<number> {
  const [existing] = await tx
    .select({ id: kategoriKas.id })
    .from(kategoriKas)
    .where(eq(kategoriKas.namaKategori, NAMA_KATEGORI_ALIH))
    .limit(1)

  if (existing) return existing.id

  const [created] = await tx
    .insert(kategoriKas)
    .values({ namaKategori: NAMA_KATEGORI_ALIH, jenisArus: "masuk", tipeTagihan: "sekali", nominalDefault: 0 })
    .returning({ id: kategoriKas.id })

  return created.id
}

/**
 * Catat sumbangan mandiri event yang dibatalkan sebagai pemasukan Kas RT (PINDAH_KAS_RT).
 * Harus dipanggil di dalam db.transaction().
 */
export async function dumpToKasRt(
  tx: DbTransaction,
  { eventId, nominal, byUserId }: { eventId: number; nominal: number; byUserId: string },
): Promise<{ transaksiId: number } | null> {
  if (nominal <= 0) return null

  const kategoriId = await resolveKategoriAlih(tx)

  const period = currentBillingPeriod()
  const [row] = await tx
    .insert(transaksi)
    .values({
      userId: byUserId,
      kategoriId,
      eventId,
      nominal,
      tipeArus: "masuk",
      bulanTagihan: period.bulanTagihan,
      tahunTagihan: period.tahunTagihan,
      keterangan: `Alih sumbangan event #${eventId} ke Kas RT`,
    })
    .returning({ id: transaksi.id })

  return { transaksiId: row.id }
}
