import type { JenisArus, KategoriKas, TipeTagihan } from "@/types/rt-kas"

export type KategoriArusFilter = "semua" | JenisArus
export type KategoriTipeFilter = "semua" | TipeTagihan

export interface KategoriFilters {
  query: string
  arus: KategoriArusFilter
  tipe: KategoriTipeFilter
}

export function filterKategori(kategoriList: KategoriKas[], filters: KategoriFilters): KategoriKas[] {
  const search = filters.query.trim().toLowerCase()

  return kategoriList.filter((kategori) => {
    const matchesArus = filters.arus === "semua" || kategori.jenisArus === filters.arus
    const matchesTipe = filters.tipe === "semua" || kategori.tipeTagihan === filters.tipe
    const matchesQuery = !search || kategori.nama.toLowerCase().includes(search)

    return matchesArus && matchesTipe && matchesQuery
  })
}
