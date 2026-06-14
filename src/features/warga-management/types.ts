import type { StatusHunian, Warga } from "@/types/rt-kas"

export type WargaStatusFilter = "semua" | StatusHunian | "pindah"

export type WargaFormMode = "add" | "edit"

export interface WargaFilters {
  query: string
  status: WargaStatusFilter
}

export interface WargaFormValues {
  nama: string
  blok: string
  telp: string
  statusHunian: StatusHunian
  jumlahAnggota: number
  pindah: string
  pemilikHunianId: number | null
}

export interface WargaTableProps {
  warga: Warga[]
  onEdit: (warga: Warga) => void
  onDelete: (warga: Warga) => void
  onTogglePengurus: (warga: Warga) => void
  onResetPassword: (warga: Warga) => void
  onPindah: (warga: Warga) => void
  updatingPengurusId?: string | null
  pagination?: {
    page: number
    totalPages: number
    totalItems: number
    startItem: number
    endItem: number
    onPageChange: (page: number) => void
  }
}
