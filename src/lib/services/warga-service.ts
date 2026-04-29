import "server-only"

import { and, count, desc, eq, ilike, or } from "drizzle-orm"

import { db, type DbLike } from "@/lib/db"
import { transaksi, warga } from "@/lib/db/schema"

type ListWargaFilters = {
  search?: string
  status?: "semua" | "tetap" | "kontrak"
}

function mapWargaRow(row: typeof warga.$inferSelect) {
  return {
    id: row.id,
    nama: row.namaKepalaKeluarga,
    blok: row.blokRumah,
    telp: row.noTelp,
    statusHunian: row.statusHunian,
    jumlahAnggota: row.jumlahAnggota,
    tglBatasDomisili: row.tglBatasDomisili,
    tglPindah: row.tglPindah,
    isPengurus: row.isPengurus,
    rolePengurus: row.rolePengurus,
    createdAt: row.createdAt,
  }
}

export async function listWarga(filters: ListWargaFilters = {}) {
  const whereClause = and(
    filters.status && filters.status !== "semua" ? eq(warga.statusHunian, filters.status) : undefined,
    filters.search?.trim()
      ? or(
          ilike(warga.namaKepalaKeluarga, `%${filters.search.trim()}%`),
          ilike(warga.blokRumah, `%${filters.search.trim()}%`),
          ilike(warga.noTelp, `%${filters.search.trim()}%`),
        )
      : undefined,
  )

  const rows = await db.select().from(warga).where(whereClause).orderBy(desc(warga.createdAt), desc(warga.id))
  return rows.map(mapWargaRow)
}

export async function getWargaById(id: number) {
  const [row] = await db.select().from(warga).where(eq(warga.id, id)).limit(1)
  return row ? mapWargaRow(row) : null
}

export async function hasWargaTransaksi(wargaId: number, tx: DbLike = db) {
  const [row] = await tx.select({ total: count() }).from(transaksi).where(eq(transaksi.wargaId, wargaId))
  return (row?.total ?? 0) > 0
}
