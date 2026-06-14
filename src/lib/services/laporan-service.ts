import "server-only"

import { and, eq, gte, isNotNull, lte, or } from "drizzle-orm"

import { db } from "@/lib/db"
import { kategoriKas, transaksi } from "@/lib/db/schema"

const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"]

export type GetLaporanKeuanganParams = {
  startMonth: number
  startYear: number
  endMonth: number
  endYear: number
  saldoAwal?: number
}

export type KategoriBreakdown = {
  kategoriId: number
  kategoriNama: string
  nominal: number
  items?: Array<{ keterangan: string | null; nominal: number; tanggal: string }>
}

export type MonthlyCashflowRow = {
  bulan: string
  tahun: number
  bulanNum: number
  pemasukan: number
  pengeluaran: number
  saldo: number
  rincianPemasukan?: KategoriBreakdown[]
  rincianPengeluaran?: KategoriBreakdown[]
}

export type LaporanResult = {
  rows: MonthlyCashflowRow[]
  totalPemasukan: number
  totalPengeluaran: number
  saldoPeriode: number
}

function getStartOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1)
}

function getEndOfMonth(year: number, month: number) {
  return new Date(year, month, 0, 23, 59, 59, 999)
}

export async function getLaporanKeuangan(
  params: GetLaporanKeuanganParams,
): Promise<LaporanResult> {
  const { startMonth, startYear, endMonth, endYear, saldoAwal = 0 } = params

  const startDate = getStartOfMonth(startYear, startMonth)
  const endDate = getEndOfMonth(endYear, endMonth)

  // Kas masuk: filter by bulanTagihan/tahunTagihan (billing period), not waktuTransaksi.
  // Kas keluar: filter by waktuTransaksi (transaction date).
  // Using OR so a single query covers both, with each branch scoped to its tipeArus.
  const rows = await db
    .select({
      tipeArus: transaksi.tipeArus,
      bulanTagihan: transaksi.bulanTagihan,
      tahunTagihan: transaksi.tahunTagihan,
      waktuTransaksi: transaksi.waktuTransaksi,
      nominal: transaksi.nominal,
      kategoriId: transaksi.kategoriId,
      kategoriNama: kategoriKas.namaKategori,
      keterangan: transaksi.keterangan,
    })
    .from(transaksi)
    .leftJoin(kategoriKas, eq(transaksi.kategoriId, kategoriKas.id))
    .where(
      or(
        // Kas masuk: match by billing period (tahunTagihan + bulanTagihan)
        and(
          eq(transaksi.tipeArus, "masuk"),
          isNotNull(transaksi.tahunTagihan),
          isNotNull(transaksi.bulanTagihan),
          gte(transaksi.tahunTagihan, startYear),
          lte(transaksi.tahunTagihan, endYear),
        ),
        // Kas keluar: match by transaction date
        and(
          eq(transaksi.tipeArus, "keluar"),
          gte(transaksi.waktuTransaksi, startDate),
          lte(transaksi.waktuTransaksi, endDate),
        ),
      ),
    )

  type RawMonthlyRow = Omit<MonthlyCashflowRow, "saldo">
  const monthMap = new Map<string, RawMonthlyRow & { rincianPemasukan: KategoriBreakdown[], rincianPengeluaran: KategoriBreakdown[] }>()
  let totalPemasukan = 0
  let totalPengeluaran = 0

  // Precompute period indices for boundary checks
  const startPeriodIndex = startYear * 12 + startMonth
  const endPeriodIndex = endYear * 12 + endMonth

  for (const trx of rows) {
    let year: number
    let monthNum: number

    if (trx.tipeArus === "masuk") {
      if (!trx.bulanTagihan || !trx.tahunTagihan) {
        continue
      }
      year = trx.tahunTagihan
      monthNum = parseInt(trx.bulanTagihan, 10)
      if (monthNum < 1 || monthNum > 12) continue
      // Exclude masuk rows outside the requested billing period range
      const periodIndex = year * 12 + (monthNum - 1)
      if (periodIndex < startPeriodIndex || periodIndex > endPeriodIndex) continue
    } else {
      const trxDate = new Date(trx.waktuTransaksi)
      year = trxDate.getFullYear()
      monthNum = trxDate.getMonth() + 1
    }

    if (monthNum < 1 || monthNum > 12) {
      continue
    }

    const key = `${year}-${monthNum}`

    if (!monthMap.has(key)) {
      monthMap.set(key, {
        bulan: monthNames[monthNum - 1],
        tahun: year,
        bulanNum: monthNum,
        pemasukan: 0,
        pengeluaran: 0,
        rincianPemasukan: [],
        rincianPengeluaran: [],
      })
    }

    const entry = monthMap.get(key)!
    const kategoriNama = trx.kategoriNama ?? "Lainnya"
    const kategoriId = trx.kategoriId ?? 0

    if (trx.tipeArus === "masuk") {
      entry.pemasukan += Number(trx.nominal)
      totalPemasukan += Number(trx.nominal)
      const existing = entry.rincianPemasukan.find((r) => r.kategoriId === kategoriId)
      if (existing) {
        existing.nominal += Number(trx.nominal)
      } else {
        entry.rincianPemasukan.push({ kategoriId, kategoriNama, nominal: Number(trx.nominal) })
      }
    } else {
      entry.pengeluaran += Number(trx.nominal)
      totalPengeluaran += Number(trx.nominal)
      const tanggal = new Date(trx.waktuTransaksi).toISOString().slice(0, 10)
      const existing = entry.rincianPengeluaran.find((r) => r.kategoriId === kategoriId)
      if (existing) {
        existing.nominal += Number(trx.nominal)
        existing.items = existing.items ?? []
        existing.items.push({ keterangan: trx.keterangan, nominal: Number(trx.nominal), tanggal })
      } else {
        entry.rincianPengeluaran.push({
          kategoriId,
          kategoriNama,
          nominal: Number(trx.nominal),
          items: [{ keterangan: trx.keterangan, nominal: Number(trx.nominal), tanggal }],
        })
      }
    }
  }

  const sortedKeys = Array.from(monthMap.keys()).sort((a, b) => {
    const [yearA, monthA] = a.split("-").map(Number)
    const [yearB, monthB] = b.split("-").map(Number)
    if (yearA !== yearB) return yearA - yearB
    return monthA - monthB
  })

  const monthlyRows = sortedKeys.map((key) => monthMap.get(key)!)

  let saldo = saldoAwal
  const rowsWithSaldo = monthlyRows.map((row) => {
    saldo += row.pemasukan - row.pengeluaran
    const { rincianPemasukan, rincianPengeluaran, ...rest } = row
    return { ...rest, saldo, rincianPemasukan, rincianPengeluaran }
  })

  return {
    rows: rowsWithSaldo,
    totalPemasukan,
    totalPengeluaran,
    saldoPeriode: totalPemasukan - totalPengeluaran,
  }
}
