import "server-only"

import { and, asc, eq, gte, lt, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { BULAN } from "@/lib/constants/months"
import { kategoriKas, transaksi, warga } from "@/lib/db/schema"
import { getSaldoSummary } from "@/lib/services/saldo-service"
import type { ExpenseBreakdownItem, MonthlyCashflow, WargaHistoryPeriod, WargaPaymentStatus } from "@/types/rt-kas"

const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"]

export type WargaPortalProfile = {
  id: number
  nama: string
  blok: string
  statusHunian: "tetap" | "kontrak"
  jumlahAnggota: number
  tglBatasDomisili: string | null
}

export type WargaContractWarning = {
  show: boolean
  expired: boolean
  daysRemaining: number | null
  message: string | null
}

export type WargaDashboardData = {
  profile: WargaPortalProfile
  saldoKas: number
  billStatusCurrent: WargaPaymentStatus[]
  contractWarning: WargaContractWarning
}

export type WargaRiwayatFilter = {
  bulan: number
  tahun: number
}

export type WargaLaporanFilter = {
  tahun?: number
}

export type WargaLaporanTransparansi = {
  tahun: number
  summary: {
    saldoKas: number
    totalPemasukan: number
    totalPengeluaran: number
    selisihYtd: number
  }
  monthlyCashflow: MonthlyCashflow[]
  cashflowDenganSaldo: MonthlyCashflow[]
  breakdownPengeluaran: Record<string, ExpenseBreakdownItem[]>
}

function getPeriodLabel(bulan: number, tahun: number) {
  return `${monthNames[bulan - 1] ?? bulan} ${tahun}`
}

function getReceiptRef(transaksiId: number, tahun: number) {
  return `KW-${tahun}-${String(transaksiId).padStart(4, "0")}`
}

function normalizeMonthTagihan(value: string | null) {
  if (!value) return null

  const numeric = Number(value)
  if (Number.isInteger(numeric)) {
    if (numeric >= 1 && numeric <= 12) return numeric
    if (numeric >= 0 && numeric <= 11) return numeric + 1
  }

  const longMonthIndex = BULAN.findIndex((month) => month.toLowerCase() === value.toLowerCase())
  if (longMonthIndex >= 0) return longMonthIndex + 1

  const shortMonthIndex = monthNames.findIndex((month) => month.toLowerCase() === value.toLowerCase())
  if (shortMonthIndex >= 0) return shortMonthIndex + 1

  return null
}

function formatDateId(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function toProfile(row: typeof warga.$inferSelect): WargaPortalProfile {
  return {
    id: row.id,
    nama: row.namaKepalaKeluarga,
    blok: row.blokRumah,
    statusHunian: row.statusHunian,
    jumlahAnggota: row.jumlahAnggota,
    tglBatasDomisili: row.tglBatasDomisili,
  }
}

function getContractWarning(profile: WargaPortalProfile): WargaContractWarning {
  if (profile.statusHunian !== "kontrak" || !profile.tglBatasDomisili) {
    return { show: false, expired: false, daysRemaining: null, message: null }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const limit = new Date(profile.tglBatasDomisili)
  limit.setHours(0, 0, 0, 0)
  const daysRemaining = Math.ceil((limit.getTime() - today.getTime()) / 86_400_000)

  if (daysRemaining < 0) {
    return {
      show: true,
      expired: true,
      daysRemaining,
      message: `Masa domisili kontrak berakhir pada ${formatDateId(limit)}. Hubungi pengurus untuk pembaruan data.`,
    }
  }

  if (daysRemaining <= 30) {
    return {
      show: true,
      expired: false,
      daysRemaining,
      message: `Masa domisili kontrak tersisa ${daysRemaining} hari. Siapkan pembaruan data sebelum ${formatDateId(limit)}.`,
    }
  }

  return { show: false, expired: false, daysRemaining, message: null }
}

async function getWargaProfile(wargaId: number) {
  const [row] = await db.select().from(warga).where(eq(warga.id, wargaId)).limit(1)
  if (!row) {
    throw new Error("Data warga tidak ditemukan.")
  }
  return toProfile(row)
}

async function getPaymentStatusForPeriod(wargaId: number, filter: WargaRiwayatFilter): Promise<WargaPaymentStatus[]> {
  const categories = await db
    .select({
      id: kategoriKas.id,
      nama: kategoriKas.namaKategori,
      tipeTagihan: kategoriKas.tipeTagihan,
      nominalDefault: kategoriKas.nominalDefault,
    })
    .from(kategoriKas)
    .where(eq(kategoriKas.jenisArus, "masuk"))
    .orderBy(asc(kategoriKas.id))

  const paidRows = await db
    .select({
      id: transaksi.id,
      kategoriId: transaksi.kategoriId,
      bulanTagihan: transaksi.bulanTagihan,
      tahunTagihan: transaksi.tahunTagihan,
      nominal: transaksi.nominal,
      waktuTransaksi: transaksi.waktuTransaksi,
    })
    .from(transaksi)
    .where(and(eq(transaksi.tipeArus, "masuk"), eq(transaksi.wargaId, wargaId)))

  return categories.map((category) => {
    const paid = paidRows.find((row) => {
      if (row.kategoriId !== category.id) return false
      if (category.tipeTagihan === "sekali") {
        return row.bulanTagihan == null && row.tahunTagihan == null
      }
      return normalizeMonthTagihan(row.bulanTagihan) === filter.bulan && row.tahunTagihan === filter.tahun
    })

    if (paid) {
      return {
        kategori: category.nama,
        tipeTagihan: category.tipeTagihan,
        status: "lunas" as const,
        nominal: Number(paid.nominal),
        tanggalBayar: formatDateId(paid.waktuTransaksi),
        transaksiId: paid.id,
        refKuitansi: getReceiptRef(paid.id, paid.waktuTransaksi.getFullYear()),
      }
    }

    return {
      kategori: category.nama,
      tipeTagihan: category.tipeTagihan,
      status: category.tipeTagihan === "sekali" ? "belum-tempo" as const : "belum" as const,
      nominal: Number(category.nominalDefault),
      jatuhTempoLabel: category.tipeTagihan === "sekali" ? "Sesuai pengumuman" : undefined,
    }
  })
}

export async function getWargaDashboardData(wargaId: number): Promise<WargaDashboardData> {
  const today = new Date()
  const bulan = today.getMonth() + 1
  const tahun = today.getFullYear()
  const [profile, saldo, billStatusCurrent] = await Promise.all([
    getWargaProfile(wargaId),
    getSaldoSummary(),
    getPaymentStatusForPeriod(wargaId, { bulan, tahun }),
  ])

  return {
    profile,
    saldoKas: saldo.saldoKas,
    billStatusCurrent,
    contractWarning: getContractWarning(profile),
  }
}

export async function getWargaRiwayatPembayaran(wargaId: number, periode: WargaRiwayatFilter): Promise<WargaHistoryPeriod> {
  const items = await getPaymentStatusForPeriod(wargaId, periode)
  return {
    periode: getPeriodLabel(periode.bulan, periode.tahun),
    items: items.map((item) => ({
      kategori: item.kategori,
      status: item.status,
      tanggalBayar: item.tanggalBayar,
      nominal: item.nominal,
      transaksiId: item.transaksiId,
      refKuitansi: item.refKuitansi,
    })),
  }
}

export async function getWargaRiwayatPembayaranPeriods(wargaId: number, count = 6): Promise<WargaHistoryPeriod[]> {
  const now = new Date()
  const periods = Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1)
    return { bulan: date.getMonth() + 1, tahun: date.getFullYear() }
  })

  return Promise.all(periods.map((period) => getWargaRiwayatPembayaran(wargaId, period)))
}

export async function getWargaLaporanTransparansi(filter: WargaLaporanFilter = {}): Promise<WargaLaporanTransparansi> {
  const tahun = filter.tahun ?? new Date().getFullYear()
  const startDate = new Date(tahun, 0, 1)
  const endDate = new Date(tahun + 1, 0, 1)

  const [saldo, transaksiRows, pengeluaranRows] = await Promise.all([
    getSaldoSummary(),
    db
      .select({
        tipeArus: transaksi.tipeArus,
        nominal: transaksi.nominal,
        waktuTransaksi: transaksi.waktuTransaksi,
      })
      .from(transaksi)
      .where(and(gte(transaksi.waktuTransaksi, startDate), lt(transaksi.waktuTransaksi, endDate))),
    db
      .select({
        bulanNum: sql<number>`extract(month from ${transaksi.waktuTransaksi})::int`,
        kategori: kategoriKas.namaKategori,
        nominal: sql<number>`coalesce(sum(${transaksi.nominal}), 0)::int`,
      })
      .from(transaksi)
      .innerJoin(kategoriKas, eq(transaksi.kategoriId, kategoriKas.id))
      .where(and(eq(transaksi.tipeArus, "keluar"), gte(transaksi.waktuTransaksi, startDate), lt(transaksi.waktuTransaksi, endDate)))
      .groupBy(sql`extract(month from ${transaksi.waktuTransaksi})`, kategoriKas.namaKategori)
      .orderBy(sql`extract(month from ${transaksi.waktuTransaksi})`, kategoriKas.namaKategori),
  ])

  let runningSaldo = 0
  let totalPemasukan = 0
  let totalPengeluaran = 0

  const monthlyCashflow: MonthlyCashflow[] = monthNames.map((bulan, index) => {
    const pemasukan = transaksiRows
      .filter((row) => row.tipeArus === "masuk" && row.waktuTransaksi.getMonth() === index)
      .reduce((sum, row) => sum + Number(row.nominal), 0)
    const pengeluaran = transaksiRows
      .filter((row) => row.tipeArus === "keluar" && row.waktuTransaksi.getMonth() === index)
      .reduce((sum, row) => sum + Number(row.nominal), 0)

    totalPemasukan += pemasukan
    totalPengeluaran += pengeluaran

    return { bulan, pemasukan, pengeluaran }
  })

  const cashflowDenganSaldo = monthlyCashflow.map((row) => {
    runningSaldo += row.pemasukan - row.pengeluaran
    return { ...row, saldo: runningSaldo }
  })

  const breakdownPengeluaran = monthNames.reduce<Record<string, ExpenseBreakdownItem[]>>((acc, bulan, index) => {
    acc[bulan] = pengeluaranRows
      .filter((row) => Number(row.bulanNum) === index + 1)
      .map((row) => ({ kategori: row.kategori, nominal: Number(row.nominal) }))
    return acc
  }, {})

  return {
    tahun,
    summary: {
      saldoKas: saldo.saldoKas,
      totalPemasukan,
      totalPengeluaran,
      selisihYtd: totalPemasukan - totalPengeluaran,
    },
    monthlyCashflow,
    cashflowDenganSaldo,
    breakdownPengeluaran,
  }
}
