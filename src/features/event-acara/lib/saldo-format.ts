import { formatRupiah } from "@/lib/format/currency"

export function formatSaldoIndicator(indikator: "OK" | "MINUS"): { color: string; label: string } {
  if (indikator === "MINUS") {
    return { color: "text-red-700 bg-red-50 border-red-200", label: "MINUS" }
  }
  return { color: "text-green-700 bg-green-50 border-green-200", label: "OK" }
}

export function describeProyeksi(saldo: number, proyeksi: number): string | null {
  if (saldo < 0) {
    return `Event minus ${formatRupiah(Math.abs(saldo))}. Tutup defisit lewat Talangan/Urunan/Sumbangan tambahan.`
  }
  if (proyeksi < 0) {
    return `Jika semua pengeluaran pending disetujui, saldo akan minus ${formatRupiah(Math.abs(proyeksi))}.`
  }
  return null
}
