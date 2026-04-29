import type { MonthlyCashflow } from "@/types/rt-kas"

const monthIndexMap: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  Mei: 4,
  Jun: 5,
  Jul: 6,
  Agt: 7,
  Sep: 8,
  Okt: 9,
  Nov: 10,
  Des: 11,
}

export interface LaporanPeriod {
  year: number
  startMonth: number
  endMonth: number
}

export function filterCashflowByPeriod(data: MonthlyCashflow[], period: LaporanPeriod) {
  return data.filter((row) => {
    const monthIndex = monthIndexMap[row.bulan]
    return monthIndex >= period.startMonth && monthIndex <= period.endMonth
  })
}

export function calculateLaporanTotals(data: MonthlyCashflow[]) {
  const totalMasuk = data.reduce((sum, row) => sum + row.pemasukan, 0)
  const totalKeluar = data.reduce((sum, row) => sum + row.pengeluaran, 0)
  const saldoPeriode = totalMasuk - totalKeluar

  return {
    totalMasuk,
    totalKeluar,
    saldoPeriode,
  }
}

export function buildRunningSaldo(data: MonthlyCashflow[], saldoAwal: number) {
  let saldo = saldoAwal
  return data.map((row) => {
    saldo += row.pemasukan - row.pengeluaran
    return {
      ...row,
      saldo,
    }
  })
}
