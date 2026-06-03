export function getWargaDashboardEmptyStateMessage(itemsCount: number): string | null {
  if (itemsCount > 0) return null
  return "Belum ada tagihan yang berlaku untuk bulan ini."
}

export function getWargaRiwayatEmptyStateMessage(itemsCount: number, periodeLabel: string): string | null {
  if (itemsCount > 0) return null
  return `Belum ada tagihan yang berlaku untuk periode ${periodeLabel}.`
}
