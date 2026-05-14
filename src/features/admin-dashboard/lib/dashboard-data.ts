import { and, eq, gte, notExists, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { kategoriKas, transaksi, warga } from "@/lib/db/schema"
import { getTunggakan } from "@/lib/services/tunggakan-service"
import { tunggakanFilterSchema } from "@/lib/validations/tunggakan"
import {
  getCashflowWithSaldo,
  getMonthlyCashflow,
  getRecentLogs,
  getSaldoSummary,
} from "@/lib/services/saldo-service"

export interface DashboardSummary {
  saldoKas: number
  pemasukanBulanIni: number
  pengeluaranBulanIni: number
  totalWargaAktif: number
  cashflowBulanan: {
    bulan: string
    tahun: number
    bulanNum: number
    pemasukan: number
    pengeluaran: number
  }[]
  cashflowDenganSaldo: {
    bulan: string
    pemasukan: number
    pengeluaran: number
    saldo: number
  }[]
  logTerbaru: {
    waktuLog: string
    petugas: string
    modul: string
    aksi: string
    detail: string
  }[]
  reminders: {
    totalTunggakanNominal: number
    totalWargaMenunggak: number
    tunggakanTerbesar: {
      warga: string
      blok: string
      total: number
    }[]
    kontrakAkanHabis: {
      warga: string
      blok: string
      pindah: string
      sisaHari: number
    }[]
    kategoriBelumDitagih: {
      id: number
      nama: string
    }[]
  }
}

export async function getAdminDashboardData(): Promise<DashboardSummary> {
  const currentYear = new Date().getFullYear()
  const [saldo, cashflow, cashflowSaldo, logs, reminders] = await Promise.all([
    getSaldoSummary(),
    getMonthlyCashflow(currentYear),
    getCashflowWithSaldo(currentYear),
    getRecentLogs(5),
    getDashboardReminders(),
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
    reminders,
  }
}

async function getDashboardReminders(): Promise<DashboardSummary["reminders"]> {
  const today = new Date()
  const month = today.getMonth() + 1
  const year = today.getFullYear()
  const tunggakanFilter = tunggakanFilterSchema.parse({
    bulanMulai: month,
    tahunMulai: year,
    bulanSelesai: month,
    tahunSelesai: year,
  })

  const [tunggakan, kontrakAkanHabis, kategoriBelumDitagih] = await Promise.all([
    getTunggakan(tunggakanFilter),
    getKontrakAkanHabis(today),
    getKategoriBelumDitagih(month, year),
  ])

  return {
    totalTunggakanNominal: tunggakan.totalNominal,
    totalWargaMenunggak: tunggakan.totalWarga,
    tunggakanTerbesar: tunggakan.data
      .map((item) => ({
        warga: item.nama,
        blok: item.blok,
        total: item.totalNominal,
      }))
      .sort((a, b) => b.total - a.total),
    kontrakAkanHabis,
    kategoriBelumDitagih,
  }
}

async function getKontrakAkanHabis(today: Date): Promise<DashboardSummary["reminders"]["kontrakAkanHabis"]> {
  const warningLimit = new Date(today)
  warningLimit.setDate(warningLimit.getDate() + 90)

  const rows = await db
    .select({
      warga: warga.namaKepalaKeluarga,
      blok: warga.blokRumah,
      pindah: warga.tglBatasDomisili,
    })
    .from(warga)
    .where(
      and(
        eq(warga.statusHunian, "kontrak"),
        gte(warga.tglBatasDomisili, toDateOnly(today)),
        sql`${warga.tglBatasDomisili} <= ${toDateOnly(warningLimit)}`,
      ),
    )
    .orderBy(warga.tglBatasDomisili, warga.blokRumah)
    .limit(5)

  return rows.flatMap((row) => {
    if (!row.pindah) {
      return []
    }

    const limitDate = new Date(row.pindah)
    return [{
      warga: row.warga,
      blok: row.blok,
      pindah: row.pindah,
      sisaHari: Math.max(0, Math.ceil((limitDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))),
    }]
  })
}

async function getKategoriBelumDitagih(month: number, year: number): Promise<DashboardSummary["reminders"]["kategoriBelumDitagih"]> {
  return db
    .select({
      id: kategoriKas.id,
      nama: kategoriKas.namaKategori,
    })
    .from(kategoriKas)
    .where(
      and(
        eq(kategoriKas.jenisArus, "masuk"),
        eq(kategoriKas.tipeTagihan, "bulanan"),
        notExists(
          db
            .select({ id: transaksi.id })
            .from(transaksi)
            .where(
              and(
                eq(transaksi.kategoriId, kategoriKas.id),
                eq(transaksi.tipeArus, "masuk"),
                eq(transaksi.bulanTagihan, String(month)),
                eq(transaksi.tahunTagihan, year),
              ),
            ),
        ),
      ),
    )
    .orderBy(kategoriKas.namaKategori)
    .limit(5)
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10)
}
