import type { Warga } from "@/types/rt-kas"

import type { WargaFilters } from "@/features/warga-management/types"

export function filterWarga(wargaList: Warga[], filters: WargaFilters): Warga[] {
  const search = filters.query.trim().toLowerCase()

  return wargaList.filter((warga) => {
    const matchesStatus = filters.status === "semua" || warga.statusHunian === filters.status
    if (!matchesStatus) {
      return false
    }

    if (!search) {
      return true
    }

    return (
      warga.nama.toLowerCase().includes(search) ||
      warga.blok.toLowerCase().includes(search) ||
      warga.telp.toLowerCase().includes(search)
    )
  })
}
