import type { AppComboboxOption } from "@/components/kanvas"
import type { KategoriKas, Warga } from "@/types/rt-kas"

export interface WargaOption extends AppComboboxOption {
  sub: string
}

export interface KategoriMasukOption extends AppComboboxOption {
  sub: string
  nominal: number
  tipeTagihan: KategoriKas["tipeTagihan"]
}

export function getWargaOptions(warga: Warga[]): WargaOption[] {
  return warga.map((item) => ({
    id: item.id,
    label: `${item.nama} · ${item.blok}`,
    sub: item.telp,
    subLabel: item.telp,
  }))
}

export function getKategoriMasukOptions(kategori: KategoriKas[]): KategoriMasukOption[] {
  return kategori
    .filter((item) => item.jenisArus === "masuk")
    .map((item) => ({
      id: item.id,
      label: item.nama,
      sub: item.tipeTagihan === "bulanan" ? "Bulanan" : "Sekali bayar",
      subLabel: item.tipeTagihan === "bulanan" ? "Bulanan" : "Sekali bayar",
      nominal: item.nominalDefault,
      tipeTagihan: item.tipeTagihan,
    }))
}
