import {
  createKategoriAction,
  deleteKategoriAction,
  listKategoriAction,
  updateKategoriAction,
} from "@/lib/actions/kategori"
import type { CreateKategoriInput, UpdateKategoriInput } from "@/lib/validations/kategori"

type KategoriRow = {
  id: number
  nama: string
  jenisArus: "masuk" | "keluar"
  tipeTagihan: "bulanan" | "sekali"
  nominalDefault: number
  createdAt: Date
}

function toUiKategori(row: KategoriRow) {
  return {
    id: String(row.id),
    nama: row.nama,
    jenisArus: row.jenisArus,
    tipeTagihan: row.tipeTagihan,
    nominalDefault: row.nominalDefault,
    createdAt: row.createdAt?.toISOString?.()?.slice(0, 10) ?? "",
  }
}

export async function fetchKategoriList(input?: {
  search?: string
  jenisArus?: "semua" | "masuk" | "keluar"
  tipeTagihan?: "semua" | "bulanan" | "sekali"
}) {
  const result = await listKategoriAction(input ?? {})
  return result.data.map((row) => toUiKategori(row as KategoriRow))
}

export async function createKategoriFromForm(input: CreateKategoriInput) {
  return createKategoriAction(input)
}

export async function updateKategoriFromForm(id: number, input: UpdateKategoriInput) {
  return updateKategoriAction(id, input)
}

export async function deleteKategoriById(id: number) {
  return deleteKategoriAction(id)
}
