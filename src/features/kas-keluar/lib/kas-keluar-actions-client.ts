import { createKasKeluarAction, listKategoriKeluarAction, listTransaksiKeluarAction } from "@/lib/actions/kas-keluar"
import type { CreateKasKeluarInput } from "@/lib/validations/transaksi"

export interface KategoriKeluarOptionUi {
  id: string
  label: string
  sub: string
  nominal: number
}

export interface TransaksiKeluarUi {
  id: string
  tanggal: string
  jenisArus: "keluar"
  kategoriId: string
  kategoriNama: string | null
  nominal: number
  keterangan: string | null
  catatan?: string | null
  periodeLabel?: string
}

export async function fetchKategoriKeluarOptions(): Promise<KategoriKeluarOptionUi[]> {
  const result = await listKategoriKeluarAction()
  if (!result.ok) return []
  return result.data.map((k) => ({
    id: String(k.id),
    label: k.nama,
    sub: k.tipeTagihan === "bulanan" ? "Bulanan" : "Sekali",
    nominal: k.nominalDefault,
  }))
}

export async function fetchTransaksiKeluar(): Promise<TransaksiKeluarUi[]> {
  const result = await listTransaksiKeluarAction()
  if (!result.ok) return []
  return result.data.map((row) => ({
    id: String(row.id),
    tanggal: new Date(row.tanggal).toISOString().slice(0, 10),
    jenisArus: "keluar" as const,
    kategoriId: String(row.kategoriId),
    kategoriNama: row.kategoriNama,
    nominal: row.nominal,
    keterangan: row.keterangan,
    catatan: row.keterangan ?? undefined,
    periodeLabel: new Date(row.tanggal).toISOString().slice(0, 10),
  }))
}

export async function createKasKeluarFromForm(input: CreateKasKeluarInput) {
  return createKasKeluarAction(input)
}
