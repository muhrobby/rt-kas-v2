import type { AppComboboxOption } from "@/components/kanvas"
import type { KategoriKas } from "@/types/rt-kas"

export interface KategoriKeluarOption extends AppComboboxOption {
  sub: string
  nominal: number
}

export function getKategoriKeluarOptions(kategori: KategoriKas[]): KategoriKeluarOption[] {
  return kategori
    .filter((item) => item.jenisArus === "keluar")
    .map((item) => ({
      id: item.id,
      label: item.nama,
      sub: item.tipeTagihan === "bulanan" ? "Bulanan" : "Sekali",
      subLabel: item.tipeTagihan === "bulanan" ? "Bulanan" : "Sekali",
      nominal: item.nominalDefault,
    }))
}
