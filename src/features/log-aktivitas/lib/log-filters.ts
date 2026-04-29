import type { LogAktivitas } from "@/types/rt-kas"

export interface LogFilterState {
  modul: string
  aksi: string
  petugas: string
  tanggal: string
  query: string
}

export function filterLogAktivitas(logs: LogAktivitas[], filters: LogFilterState) {
  const query = filters.query.trim().toLowerCase()

  return logs.filter((item) => {
    const modulOk = filters.modul === "semua" || item.modul === filters.modul
    const aksiOk = filters.aksi === "semua" || item.aksi === filters.aksi
    const petugasOk = filters.petugas === "semua" || item.petugas === filters.petugas
    const tanggalOk = !filters.tanggal || item.tanggalWaktu.startsWith(filters.tanggal)
    const queryOk = !query || item.detail.toLowerCase().includes(query) || item.petugas.toLowerCase().includes(query)

    return modulOk && aksiOk && petugasOk && tanggalOk && queryOk
  })
}
