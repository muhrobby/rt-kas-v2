import "server-only"

import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm"

import { db } from "@/lib/db"
import { kategoriKas, transaksi, warga } from "@/lib/db/schema"

export type ListTransaksiFilters = {
  search?: string
  jenisArus?: "semua" | "masuk" | "keluar"
  limit?: number
  tahun?: number
  bulan?: number
  wargaId?: number
  kategoriId?: number
}

function mapTransaksiRow(row: typeof transaksi.$inferSelect) {
  return {
    id: row.id,
    waktuTransaksi: row.waktuTransaksi,
    userId: row.userId,
    wargaId: row.wargaId,
    kategoriId: row.kategoriId,
    bulanTagihan: row.bulanTagihan,
    tahunTagihan: row.tahunTagihan,
    nominal: row.nominal,
    tipeArus: row.tipeArus,
    keterangan: row.keterangan,
    createdAt: row.createdAt,
  }
}

export async function listTransaksi(filters: ListTransaksiFilters = {}) {
  const conditions = []

  if (filters.jenisArus && filters.jenisArus !== "semua") {
    conditions.push(eq(transaksi.tipeArus, filters.jenisArus))
  }

  if (filters.tahun) {
    conditions.push(eq(transaksi.tahunTagihan, filters.tahun))
  }

  if (filters.bulan !== undefined) {
    conditions.push(eq(transaksi.bulanTagihan, String(filters.bulan)))
  }

  if (filters.wargaId) {
    conditions.push(eq(transaksi.wargaId, filters.wargaId))
  }

  if (filters.kategoriId) {
    conditions.push(eq(transaksi.kategoriId, filters.kategoriId))
  }

  if (filters.search?.trim()) {
    conditions.push(
      or(
        ilike(kategoriKas.namaKategori, `%${filters.search.trim()}%`),
        ilike(warga.namaKepalaKeluarga, `%${filters.search.trim()}%`),
      ),
    )
  }

  const rows = await db
    .select({
      transaksi: transaksi,
      warga: {
        id: warga.id,
        nama: warga.namaKepalaKeluarga,
        blok: warga.blokRumah,
      },
      kategori: {
        id: kategoriKas.id,
        nama: kategoriKas.namaKategori,
        jenisArus: kategoriKas.jenisArus,
        tipeTagihan: kategoriKas.tipeTagihan,
      },
    })
    .from(transaksi)
    .leftJoin(warga, eq(transaksi.wargaId, warga.id))
    .leftJoin(kategoriKas, eq(transaksi.kategoriId, kategoriKas.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(transaksi.waktuTransaksi), desc(transaksi.id))
    .limit(filters.limit ?? 100)

  return rows.map((row) => ({
    ...mapTransaksiRow(row.transaksi),
    wargaNama: row.warga?.nama ?? null,
    wargaBlok: row.warga?.blok ?? null,
    kategoriNama: row.kategori?.nama ?? null,
  }))
}

export async function listTransaksiMasuk(filters: Omit<ListTransaksiFilters, "jenisArus"> = {}) {
  return listTransaksi({ ...filters, jenisArus: "masuk" })
}

export async function listTransaksiKeluar(filters: Omit<ListTransaksiFilters, "jenisArus"> = {}) {
  return listTransaksi({ ...filters, jenisArus: "keluar" })
}

export async function hasPaidMonthly(wargaId: number, kategoriId: number, bulan: number, tahun: number) {
  const [row] = await db
    .select({ total: count() })
    .from(transaksi)
    .where(
      and(
        eq(transaksi.wargaId, wargaId),
        eq(transaksi.kategoriId, kategoriId),
        eq(transaksi.bulanTagihan, String(bulan)),
        eq(transaksi.tahunTagihan, tahun),
        eq(transaksi.tipeArus, "masuk"),
      ),
    )
    .limit(1)
  return (row?.total ?? 0) > 0
}

export async function hasPaidSekali(wargaId: number, kategoriId: number) {
  const [row] = await db
    .select({ total: count() })
    .from(transaksi)
    .where(
      and(
        eq(transaksi.wargaId, wargaId),
        eq(transaksi.kategoriId, kategoriId),
        isNull(transaksi.bulanTagihan),
        isNull(transaksi.tahunTagihan),
        eq(transaksi.tipeArus, "masuk"),
      ),
    )
    .limit(1)
  return (row?.total ?? 0) > 0
}

export async function getRecentTransaksi(limit = 10) {
  return listTransaksi({ limit })
}

export async function getTransaksiById(id: number) {
  const [row] = await db
    .select({
      transaksi: transaksi,
      warga: {
        id: warga.id,
        nama: warga.namaKepalaKeluarga,
        blok: warga.blokRumah,
      },
      kategori: {
        id: kategoriKas.id,
        nama: kategoriKas.namaKategori,
      },
    })
    .from(transaksi)
    .leftJoin(warga, eq(transaksi.wargaId, warga.id))
    .leftJoin(kategoriKas, eq(transaksi.kategoriId, kategoriKas.id))
    .where(eq(transaksi.id, id))
    .limit(1)

  if (!row) return null
  return {
    ...mapTransaksiRow(row.transaksi),
    wargaNama: row.warga?.nama ?? null,
    wargaBlok: row.warga?.blok ?? null,
    kategoriNama: row.kategori?.nama ?? null,
  }
}
