export function formatRupiah(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return "-"
  }

  const absolute = Math.round(Math.abs(value)).toLocaleString("id-ID")
  return `${value < 0 ? "-Rp" : "Rp"} ${absolute}`
}
