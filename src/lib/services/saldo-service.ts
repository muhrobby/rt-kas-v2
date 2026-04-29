import "server-only"

import { and, count, desc, eq, gte, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { logAktivitas, transaksi, user, warga } from "@/lib/db/schema"

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth()

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

const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"]

function getStartOfMonth(year: number, month: number) {
  return new Date(year, month, 1)
}

function getEndOfMonth(year: number, month: number) {
  return new Date(year, month + 1, 0, 23, 59, 59, 999)
}

export async function getSaldoSummary(): Promise<SaldoSummary> {
  const startOfMonth = getStartOfMonth(currentYear, currentMonth)

  const [pemasukanResult] = await db
    .select({ total: count(), sum: sql<number>`coalesce(sum(${transaksi.nominal}), 0)` })
    .from(transaksi)
    .where(
      and(
        eq(transaksi.tipeArus, "masuk"),
        gte(transaksi.waktuTransaksi, startOfMonth),
      ),
    )

  const [pengeluaranResult] = await db
    .select({ total: count(), sum: sql<number>`coalesce(sum(${transaksi.nominal}), 0)` })
    .from(transaksi)
    .where(
      and(
        eq(transaksi.tipeArus, "keluar"),
        gte(transaksi.waktuTransaksi, startOfMonth),
      ),
    )

  const [allPemasukan] = await db
    .select({ sum: sql<number>`coalesce(sum(${transaksi.nominal}), 0)` })
    .from(transaksi)
    .where(eq(transaksi.tipeArus, "masuk"))

  const [allPengeluaran] = await db
    .select({ sum: sql<number>`coalesce(sum(${transaksi.nominal}), 0)` })
    .from(transaksi)
    .where(eq(transaksi.tipeArus, "keluar"))

  const [wargaCount] = await db
    .select({ total: count() })
    .from(warga)

  return {
    saldoKas: Number(allPemasukan?.sum ?? 0) - Number(allPengeluaran?.sum ?? 0),
    totalPemasukanBulanIni: Number(pemasukanResult?.sum ?? 0),
    totalPengeluaranBulanIni: Number(pengeluaranResult?.sum ?? 0),
    totalTransaksiMasukBulanIni: Number(pemasukanResult?.total ?? 0),
    totalTransaksiKeluarBulanIni: Number(pengeluaranResult?.total ?? 0),
    totalWargaAktif: Number(wargaCount?.total ?? 0),
  }
}

export async function getMonthlyCashflow(year: number = currentYear): Promise<MonthlyCashflow[]> {
  const startDate = new Date(year, 0, 1)

  const rows = await db
    .select({
      tipeArus: transaksi.tipeArus,
      bulanTagihan: transaksi.bulanTagihan,
      tahunTagihan: transaksi.tahunTagihan,
      waktuTransaksi: transaksi.waktuTransaksi,
      nominal: transaksi.nominal,
    })
    .from(transaksi)
    .where(gte(transaksi.waktuTransaksi, startDate))

  const result: MonthlyCashflow[] = []

  for (let m = 0; m < 12; m++) {
    const monthStart = getStartOfMonth(year, m)
    const monthEnd = getEndOfMonth(year, m)

    const monthTransactions = rows.filter((trx) => {
      const waktu = new Date(trx.waktuTransaksi)
      return waktu >= monthStart && waktu <= monthEnd
    })

    const pemasukan = monthTransactions.filter((trx) => trx.tipeArus === "masuk").reduce((sum, trx) => sum + Number(trx.nominal), 0)
    const pengeluaran = monthTransactions.filter((trx) => trx.tipeArus === "keluar").reduce((sum, trx) => sum + Number(trx.nominal), 0)

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

export async function getCashflowWithSaldo(year: number = currentYear): Promise<{ bulan: string; pemasukan: number; pengeluaran: number; saldo: number }[]> {
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
