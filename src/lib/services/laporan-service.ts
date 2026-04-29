import "server-only"

import { and, eq, gte, lte } from "drizzle-orm"

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
  return new Date(year, month, 1)
}

function getEndOfMonth(year: number, month: number) {
  return new Date(year, month + 1, 0, 23, 59, 59, 999)
}

export async function getLaporanKeuangan(
  params: GetLaporanKeuanganParams,
): Promise<LaporanResult> {
  const { startMonth, startYear, endMonth, endYear, saldoAwal = 0 } = params

  const startDate = getStartOfMonth(startYear, startMonth)
  const endDate = getEndOfMonth(endYear, endMonth)

  const rows = await db
    .select({
      tipeArus: transaksi.tipeArus,
      bulanTagihan: transaksi.bulanTagihan,
      tahunTagihan: transaksi.tahunTagihan,
      waktuTransaksi: transaksi.waktuTransaksi,
      nominal: transaksi.nominal,
      kategoriId: transaksi.kategoriId,
      kategoriNama: kategoriKas.namaKategori,
    })
    .from(transaksi)
    .leftJoin(kategoriKas, eq(transaksi.kategoriId, kategoriKas.id))
    .where(
      and(
        gte(transaksi.waktuTransaksi, startDate),
        lte(transaksi.waktuTransaksi, endDate),
      ),
    )

  type RawMonthlyRow = Omit<MonthlyCashflowRow, "saldo">
  const monthMap = new Map<string, RawMonthlyRow & { rincianPemasukan: KategoriBreakdown[], rincianPengeluaran: KategoriBreakdown[] }>()
  let totalPemasukan = 0
  let totalPengeluaran = 0

  for (const trx of rows) {
    let year: number
    let monthNum: number

    if (trx.tipeArus === "masuk") {
      if (!trx.bulanTagihan || !trx.tahunTagihan) {
        continue
      }
      year = trx.tahunTagihan
      monthNum = parseInt(trx.bulanTagihan, 10) - 1
    } else {
      const trxDate = new Date(trx.waktuTransaksi)
      year = trxDate.getFullYear()
      monthNum = trxDate.getMonth()
    }

    if (monthNum < 0 || monthNum > 11) {
      continue
    }

    const key = `${year}-${monthNum}`

    if (!monthMap.has(key)) {
      monthMap.set(key, {
        bulan: monthNames[monthNum],
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
      const existing = entry.rincianPengeluaran.find((r) => r.kategoriId === kategoriId)
      if (existing) {
        existing.nominal += Number(trx.nominal)
      } else {
        entry.rincianPengeluaran.push({ kategoriId, kategoriNama, nominal: Number(trx.nominal) })
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
