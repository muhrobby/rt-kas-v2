"use server"

import {
  getCashflowWithSaldo,
  getMonthlyCashflow,
  getRecentLogs,
  getSaldoSummary,
} from "@/lib/services/saldo-service"

export async function getDashboardSummaryAction() {
  const [saldo, cashflow, cashflowSaldo, logs] = await Promise.all([
    getSaldoSummary(),
    getMonthlyCashflow(new Date().getFullYear()),
    getCashflowWithSaldo(new Date().getFullYear()),
    getRecentLogs(5),
  ])

  return {
    saldoKas: saldo.saldoKas,
    pemasukanBulanIni: saldo.totalPemasukanBulanIni,
    pengeluaranBulanIni: saldo.totalPengeluaranBulanIni,
    totalWargaAktif: saldo.totalWargaAktif,
    cashflowBulanan: cashflow.map((c) => ({
      bulan: c.bulan,
      tahun: c.tahun,
      bulanNum: c.bulanNum,
      pemasukan: c.pemasukan,
      pengeluaran: c.pengeluaran,
    })),
    cashflowDenganSaldo: cashflowSaldo,
    logTerbaru: logs.map((l) => ({
      waktuLog: l.waktuLog.toISOString(),
      petugas: l.userName,
      modul: l.modul,
      aksi: l.aksi,
      detail: l.keterangan,
    })),
  }
}
