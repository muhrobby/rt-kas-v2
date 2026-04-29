import type { TunggakanItem, TunggakanWarga } from "@/types/rt-kas"

export function calculateTunggakanTotal(items: TunggakanItem[]) {
  return items.reduce((sum, item) => sum + item.nominal, 0)
}

export function filterTunggakanByKategori(tunggakan: TunggakanWarga[], kategoriName: string) {
  if (kategoriName === "semua") {
    return tunggakan
  }

  return tunggakan
    .map((warga) => ({
      ...warga,
      items: warga.items.filter((item) => item.kategori === kategoriName),
    }))
    .filter((warga) => warga.items.length > 0)
}

export function countWargaMenunggak(tunggakan: TunggakanWarga[]) {
  return tunggakan.length
}

export function calculateTotalByWarga(warga: TunggakanWarga) {
  return calculateTunggakanTotal(warga.items)
}
