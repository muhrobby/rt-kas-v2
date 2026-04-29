import "server-only"

import { and, count, desc, eq, ilike, or } from "drizzle-orm"

import { db, type DbLike } from "@/lib/db"
import { kategoriKas, transaksi } from "@/lib/db/schema"

type ListKategoriFilters = {
  search?: string
  jenisArus?: "semua" | "masuk" | "keluar"
  tipeTagihan?: "semua" | "bulanan" | "sekali"
}

function mapKategoriRow(row: typeof kategoriKas.$inferSelect) {
  return {
    id: row.id,
    nama: row.namaKategori,
    jenisArus: row.jenisArus,
    tipeTagihan: row.tipeTagihan,
    nominalDefault: row.nominalDefault,
    createdAt: row.createdAt,
  }
}

export async function listKategori(filters: ListKategoriFilters = {}) {
  const conditions = []

  if (filters.jenisArus && filters.jenisArus !== "semua") {
    conditions.push(eq(kategoriKas.jenisArus, filters.jenisArus))
  }

  if (filters.tipeTagihan && filters.tipeTagihan !== "semua") {
    conditions.push(eq(kategoriKas.tipeTagihan, filters.tipeTagihan))
  }

  if (filters.search?.trim()) {
    conditions.push(
      or(
        ilike(kategoriKas.namaKategori, `%${filters.search.trim()}%`),
      ),
    )
  }

  const rows = await db
    .select()
    .from(kategoriKas)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(kategoriKas.createdAt), desc(kategoriKas.id))

  return rows.map(mapKategoriRow)
}

export async function getKategoriById(id: number) {
  const [row] = await db.select().from(kategoriKas).where(eq(kategoriKas.id, id)).limit(1)
  return row ? mapKategoriRow(row) : null
}

export async function isKategoriUsedInTransaksi(kategoriId: number, tx: DbLike = db) {
  const [row] = await tx.select({ total: count() }).from(transaksi).where(eq(transaksi.kategoriId, kategoriId))
  return (row?.total ?? 0) > 0
}
