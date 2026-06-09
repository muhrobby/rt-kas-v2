import "server-only"

import { and, eq, inArray } from "drizzle-orm"

import { db } from "@/lib/db"
import { kategoriKas, transaksi, warga } from "@/lib/db/schema"
import { TunggakanFilterInput } from "@/lib/validations/tunggakan"
import { shouldIncludeTunggakanBulananPeriod } from "@/lib/services/tunggakan-eligibility"

export interface TunggakanItem {
  kategori: string
  periode: string
  nominal: number
}

export interface TunggakanWargaOutput {
  wargaId: number
  nama: string
  blok: string
  items: TunggakanItem[]
  totalNominal: number
}

export interface TunggakanSummary {
  totalWarga: number
  totalNominal: number
  data: TunggakanWargaOutput[]
}

const BULAN_INDO = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
]

async function getActiveWarga() {
  const rows = await db
    .select({
      id: warga.id,
      nama: warga.namaKepalaKeluarga,
      blok: warga.blokRumah,
      createdAt: warga.createdAt,
    })
    .from(warga)
    .orderBy(warga.blokRumah, warga.id)

  return rows
}

async function getKategoriBulanan() {
  return db
    .select({
      id: kategoriKas.id,
      nama: kategoriKas.namaKategori,
      nominalDefault: kategoriKas.nominalDefault,
    })
    .from(kategoriKas)
    .where(and(eq(kategoriKas.jenisArus, "masuk"), eq(kategoriKas.tipeTagihan, "bulanan")))
    .orderBy(kategoriKas.id)
}

async function getKategoriSekali() {
  return db
    .select({
      id: kategoriKas.id,
      nama: kategoriKas.namaKategori,
      bulanTagihan: kategoriKas.bulanTagihan,
      tahunTagihan: kategoriKas.tahunTagihan,
      nominalDefault: kategoriKas.nominalDefault,
    })
    .from(kategoriKas)
    .where(and(eq(kategoriKas.jenisArus, "masuk"), eq(kategoriKas.tipeTagihan, "sekali")))
    .orderBy(kategoriKas.id)
}

function generateMonthYearCombinations(
  bulanMulai: number,
  tahunMulai: number,
  bulanSelesai: number,
  tahunSelesai: number,
): Array<{ bulan: number; tahun: number }> {
  const combinations: Array<{ bulan: number; tahun: number }> = []
  let bulan = bulanMulai
  let tahun = tahunMulai

  while (tahun < tahunSelesai || (tahun === tahunSelesai && bulan <= bulanSelesai)) {
    combinations.push({ bulan, tahun })
    bulan++
    if (bulan > 12) {
      bulan = 1
      tahun++
    }
  }

  return combinations
}

async function getPaidBulanan(
  wargaIds: number[],
  kategoriIds: number[],
): Promise<Set<string>> {
  if (wargaIds.length === 0 || kategoriIds.length === 0) {
    return new Set()
  }

  const paidRows = await db
    .select({
      wargaId: transaksi.wargaId,
      kategoriId: transaksi.kategoriId,
      bulanTagihan: transaksi.bulanTagihan,
      tahunTagihan: transaksi.tahunTagihan,
    })
    .from(transaksi)
    .where(
      and(
        inArray(transaksi.wargaId, wargaIds),
        inArray(transaksi.kategoriId, kategoriIds),
        eq(transaksi.tipeArus, "masuk"),
      ),
    )

  const paidSet = new Set<string>()
  for (const row of paidRows) {
    if (row.bulanTagihan && row.tahunTagihan) {
      const key = `${row.wargaId}-${row.kategoriId}-${row.bulanTagihan}-${row.tahunTagihan}`
      paidSet.add(key)
    }
  }

  return paidSet
}

async function getPaidSekaliMap(
  wargaIds: number[],
  kategoriIds: number[],
): Promise<Map<string, Set<string>>> {
  const paidMap = new Map<string, Set<string>>()

  if (wargaIds.length === 0 || kategoriIds.length === 0) {
    return paidMap
  }

  const paidRows = await db
    .select({
      wargaId: transaksi.wargaId,
      kategoriId: transaksi.kategoriId,
      bulanTagihan: transaksi.bulanTagihan,
      tahunTagihan: transaksi.tahunTagihan,
    })
    .from(transaksi)
    .where(
      and(
        inArray(transaksi.wargaId, wargaIds),
        inArray(transaksi.kategoriId, kategoriIds),
        eq(transaksi.tipeArus, "masuk"),
      ),
    )

  for (const row of paidRows) {
    if (row.wargaId && row.kategoriId && row.bulanTagihan && row.tahunTagihan) {
      const mapKey = `${row.wargaId}-${row.kategoriId}`
      const periodKey = `${row.bulanTagihan}-${row.tahunTagihan}`

      if (!paidMap.has(mapKey)) {
        paidMap.set(mapKey, new Set())
      }
      paidMap.get(mapKey)!.add(periodKey)
    }
  }

  return paidMap
}

function formatPeriode(bulan: number, tahun: number): string {
  return `${BULAN_INDO[bulan - 1]} ${tahun}`
}

function getMonthIndex(bulan: number, tahun: number) {
  return tahun * 12 + (bulan - 1)
}

function getSekaliPeriodIndex(bulanTagihan: string | null, tahunTagihan: number | null) {
  if (!bulanTagihan || tahunTagihan == null) return null

  const bulan = Number(bulanTagihan)
  if (!Number.isInteger(bulan) || bulan < 1 || bulan > 12) return null

  return getMonthIndex(bulan, tahunTagihan)
}

function hasSekaliPeriodOverlap(
  kat: { bulanTagihan: string | null; tahunTagihan: number | null },
  bulanCombinations: Array<{ bulan: number; tahun: number }>,
) {
  const kategoriIndex = getSekaliPeriodIndex(kat.bulanTagihan, kat.tahunTagihan)
  if (kategoriIndex == null) return false

  return bulanCombinations.some(({ bulan, tahun }) => getMonthIndex(bulan, tahun) === kategoriIndex)
}

export async function getTunggakan(filter: TunggakanFilterInput): Promise<TunggakanSummary> {
  const { bulanMulai, tahunMulai, bulanSelesai, tahunSelesai, kategoriId } = filter

  const [allWarga, kategorisBulanan, kategorisSekali] = await Promise.all([
    getActiveWarga(),
    getKategoriBulanan(),
    getKategoriSekali(),
  ])

  if (allWarga.length === 0) {
    return { totalWarga: 0, totalNominal: 0, data: [] }
  }

  const wargaIds = allWarga.map((w) => w.id)

  const filteredBulanan = kategoriId
    ? kategorisBulanan.filter((k) => k.id === kategoriId)
    : kategorisBulanan

  const filteredSekali = kategoriId
    ? kategorisSekali.filter((k) => k.id === kategoriId)
    : kategorisSekali

  if (filteredBulanan.length === 0 && filteredSekali.length === 0) {
    return { totalWarga: 0, totalNominal: 0, data: [] }
  }

  const bulanCombinations = generateMonthYearCombinations(bulanMulai, tahunMulai, bulanSelesai, tahunSelesai)

  const filteredSekaliWithNominal = filteredSekali.filter((kat) => kat.nominalDefault > 0)
  const filteredSekaliRelevant = filteredSekaliWithNominal.filter((kat) => hasSekaliPeriodOverlap(kat, bulanCombinations))

  const [paidBulanan, paidSekaliMap] = await Promise.all([
    getPaidBulanan(
      wargaIds,
      filteredBulanan.map((k) => k.id),
    ),
    getPaidSekaliMap(
      wargaIds,
      filteredSekaliRelevant.map((k) => k.id),
    ),
  ])

  const wargaTunggakanMap = new Map<
    number,
    { wargaId: number; nama: string; blok: string; items: TunggakanItem[]; totalNominal: number }
  >()

  for (const w of allWarga) {
    wargaTunggakanMap.set(w.id, {
      wargaId: w.id,
      nama: w.nama,
      blok: w.blok,
      items: [],
      totalNominal: 0,
    })
  }

  for (const kat of filteredBulanan) {
    for (const { bulan, tahun } of bulanCombinations) {
      for (const w of allWarga) {
        if (!shouldIncludeTunggakanBulananPeriod(w.createdAt, bulan, tahun)) {
          continue
        }
        const wargaPaidKey = `${w.id}-${kat.id}-${bulan}-${tahun}`

        if (!paidBulanan.has(wargaPaidKey)) {
          const entry = wargaTunggakanMap.get(w.id)!
          entry.items.push({
            kategori: kat.nama,
            periode: formatPeriode(bulan, tahun),
            nominal: kat.nominalDefault,
          })
          entry.totalNominal += kat.nominalDefault
        }
      }
    }
  }

  for (const kat of filteredSekaliRelevant) {
    const kategoriBulan = Number(kat.bulanTagihan)
    const kategoriTahun = kat.tahunTagihan

    if (!Number.isInteger(kategoriBulan) || kategoriBulan < 1 || kategoriBulan > 12 || kategoriTahun == null) {
      continue
    }

    for (const w of allWarga) {
      if (!shouldIncludeTunggakanBulananPeriod(w.createdAt, kategoriBulan, kategoriTahun)) {
        continue
      }

      const mapKey = `${w.id}-${kat.id}`
      const paidPeriods = paidSekaliMap.get(mapKey)

      if (!paidPeriods || paidPeriods.size === 0) {
        const entry = wargaTunggakanMap.get(w.id)!
        entry.items.push({
          kategori: kat.nama,
          periode: formatPeriode(kategoriBulan, kategoriTahun),
          nominal: kat.nominalDefault,
        })
        entry.totalNominal += kat.nominalDefault
      }
    }
  }

  const data: TunggakanWargaOutput[] = []
  for (const entry of wargaTunggakanMap.values()) {
    if (entry.items.length > 0) {
      data.push(entry)
    }
  }

  data.sort((a, b) => {
    const blokCompare = a.blok.localeCompare(b.blok, undefined, { numeric: true })
    if (blokCompare !== 0) return blokCompare
    return b.totalNominal - a.totalNominal
  })

  const totalNominal = data.reduce((sum, w) => sum + w.totalNominal, 0)

  return {
    totalWarga: data.length,
    totalNominal,
    data,
  }
}
