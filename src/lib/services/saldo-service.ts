import "server-only"

import { and, count, desc, eq, gte, isNull, lte, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { logAktivitas, transaksi, user, warga } from "@/lib/db/schema"

const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"]
const monthNamesLong = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

/** Konversi bulan_tagihan (angka string atau nama bulan) ke 1-12. Return null jika tidak valid. */
function parseBulanTagihan(value: string | null): number | null {
  if (!value) return null
  const numeric = Number(value)
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 12) return numeric
  const longIdx = monthNamesLong.findIndex((m) => m.toLowerCase() === value.toLowerCase())
  if (longIdx >= 0) return longIdx + 1
  const shortIdx = monthNames.findIndex((m) => m.toLowerCase() === value.toLowerCase())
  if (shortIdx >= 0) return shortIdx + 1
  return null
}

export type MonthlyCashflow = {
  bulan: string
  tahun: number
  bulanNum: number
  pemasukan: number
  pengeluaran: number
}

export type SaldoSummary = {
  saldoKas: number
  totalPemasukanBulanIni: number
  totalPengeluaranBulanIni: number
  totalTransaksiMasukBulanIni: number
  totalTransaksiKeluarBulanIni: number
  totalWargaAktif: number
}

function getStartOfMonth(year: number, month: number) {
  return new Date(year, month, 1)
}

function getEndOfMonth(year: number, month: number) {
  return new Date(year, month + 1, 0, 23, 59, 59, 999)
}

export async function getSaldoSummary(): Promise<SaldoSummary> {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const startOfMonth = getStartOfMonth(currentYear, currentMonth)

  const [
    [pemasukanResult],
    [pengeluaranResult],
    [allPemasukan],
    [allPengeluaran],
    [wargaCount],
  ] = await Promise.all([
    db
      .select({ total: count(), sum: sql<number>`coalesce(sum(${transaksi.nominal}), 0)` })
      .from(transaksi)
      .where(
        and(
          eq(transaksi.tipeArus, "masuk"),
          gte(transaksi.waktuTransaksi, startOfMonth),
        ),
      ),
    db
      .select({ total: count(), sum: sql<number>`coalesce(sum(${transaksi.nominal}), 0)` })
      .from(transaksi)
      .where(
        and(
          eq(transaksi.tipeArus, "keluar"),
          gte(transaksi.waktuTransaksi, startOfMonth),
        ),
      ),
    db
      .select({ sum: sql<number>`coalesce(sum(${transaksi.nominal}), 0)` })
      .from(transaksi)
      .where(eq(transaksi.tipeArus, "masuk")),
    db
      .select({ sum: sql<number>`coalesce(sum(${transaksi.nominal}), 0)` })
      .from(transaksi)
      .where(eq(transaksi.tipeArus, "keluar")),
    db
      .select({ total: count() })
      .from(warga)
      .where(isNull(warga.tglPindah)),
  ])

  return {
    saldoKas: Number(allPemasukan?.sum ?? 0) - Number(allPengeluaran?.sum ?? 0),
    totalPemasukanBulanIni: Number(pemasukanResult?.sum ?? 0),
    totalPengeluaranBulanIni: Number(pengeluaranResult?.sum ?? 0),
    totalTransaksiMasukBulanIni: Number(pemasukanResult?.total ?? 0),
    totalTransaksiKeluarBulanIni: Number(pengeluaranResult?.total ?? 0),
    totalWargaAktif: Number(wargaCount?.total ?? 0),
  }
}

export async function getMonthlyCashflow(year: number = new Date().getFullYear()): Promise<MonthlyCashflow[]> {
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999)

  const [masukRows, keluarRows] = await Promise.all([
    // Pemasukan: filter by tahun_tagihan, group by bulan_tagihan
    db
      .select({
        bulanTagihan: transaksi.bulanTagihan,
        nominal: transaksi.nominal,
      })
      .from(transaksi)
      .where(and(eq(transaksi.tipeArus, "masuk"), eq(transaksi.tahunTagihan, year))),
    // Pengeluaran: filter by waktu_transaksi
    db
      .select({
        waktuTransaksi: transaksi.waktuTransaksi,
        nominal: transaksi.nominal,
      })
      .from(transaksi)
      .where(and(eq(transaksi.tipeArus, "keluar"), gte(transaksi.waktuTransaksi, startDate), lte(transaksi.waktuTransaksi, endDate))),
  ])

  const result: MonthlyCashflow[] = []

  for (let m = 0; m < 12; m++) {
    const monthStart = getStartOfMonth(year, m)
    const monthEnd = getEndOfMonth(year, m)

    const pemasukan = masukRows
      .filter((trx) => {
        const bulanNum = parseBulanTagihan(trx.bulanTagihan)
        return bulanNum === m + 1
      })
      .reduce((sum, trx) => sum + Number(trx.nominal), 0)

    const pengeluaran = keluarRows
      .filter((trx) => {
        const waktu = new Date(trx.waktuTransaksi)
        return waktu >= monthStart && waktu <= monthEnd
      })
      .reduce((sum, trx) => sum + Number(trx.nominal), 0)

    result.push({
      bulan: monthNames[m],
      tahun: year,
      bulanNum: m,
      pemasukan,
      pengeluaran,
    })
  }

  return result
}

export async function getCashflowWithSaldo(year: number = new Date().getFullYear()): Promise<{ bulan: string; pemasukan: number; pengeluaran: number; saldo: number }[]> {
  const monthly = await getMonthlyCashflow(year)
  let running = 0
  return monthly.map((m) => {
    running += m.pemasukan - m.pengeluaran
    return {
      bulan: m.bulan,
      pemasukan: m.pemasukan,
      pengeluaran: m.pengeluaran,
      saldo: running,
    }
  })
}

export type RecentLogEntry = {
  waktuLog: Date
  userName: string
  modul: string
  aksi: string
  keterangan: string
}

export async function getRecentLogs(limit = 5): Promise<RecentLogEntry[]> {
  const rows = await db
    .select({
      waktuLog: logAktivitas.waktuLog,
      userName: user.name,
      modul: logAktivitas.modul,
      aksi: logAktivitas.aksi,
      keterangan: logAktivitas.keterangan,
    })
    .from(logAktivitas)
    .leftJoin(user, eq(logAktivitas.userId, user.id))
    .orderBy(desc(logAktivitas.waktuLog))
    .limit(limit)

  return rows.map((row) => ({
    waktuLog: row.waktuLog,
    userName: row.userName ?? "Unknown",
    modul: row.modul,
    aksi: row.aksi,
    keterangan: row.keterangan,
  }))
}
