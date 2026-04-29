import type { AksiAktivitas } from "./rt-kas"

export type PdfLogRow = {
  tanggalWaktu: string
  petugas: string
  modul: string
  aksi: AksiAktivitas
  detail: string
}

export type PdfLogData = {
  rows: PdfLogRow[]
  totalItems: number
  filters: PdfLogFilters
  generatedAt: string
}

export type PdfLogFilters = {
  modul?: string
  aksi?: string
  petugas?: string
  tanggal?: string
  query?: string
}

export type PdfLogExportParams = {
  data: PdfLogData
  contextLabel: string
}
