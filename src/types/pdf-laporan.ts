export type PdfLaporanRow = {
  bulan: string
  tahun?: number
  bulanNum?: number
  pemasukan: number
  pengeluaran: number
  saldo: number
}

export type PdfLaporanData = {
  rows: PdfLaporanRow[]
  totalPemasukan: number
  totalPengeluaran: number
  saldoPeriode: number
  saldoAwal: number
  periodeLabel: string
  generatedAt: string
}

export type PdfExportParams = {
  data: PdfLaporanData
  contextLabel: string
}
