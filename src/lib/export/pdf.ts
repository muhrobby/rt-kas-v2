import jsPDF from "jspdf"
import { formatRupiah } from "@/lib/format/currency"
import type { MonthlyCashflowRow } from "@/lib/services/laporan-service"

interface PdfLaporanData {
  rows: MonthlyCashflowRow[]
  totalPemasukan: number
  totalPengeluaran: number
  saldoPeriode: number
  saldoAwal: number
  periodeLabel: string
}

interface PdfKuitansiData {
  refKuitansi: string
  kategori: string
  tanggalBayar: string
  nominal: number
  wargaNama: string
  blok?: string
  petugas?: string | null
}

export function generateLaporanPDF(data: PdfLaporanData): void {
  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("Laporan Keuangan Kas RT", 105, 20, { align: "center" })

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text(data.periodeLabel, 105, 28, { align: "center" })

  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("Saldo Awal:", 14, 42)
  doc.setFont("helvetica", "normal")
  doc.text(formatRupiah(data.saldoAwal), 50, 42)

  doc.setFont("helvetica", "bold")
  doc.text("Total Pemasukan:", 14, 49)
  doc.setFont("helvetica", "normal")
  doc.text(formatRupiah(data.totalPemasukan), 50, 49)

  doc.setFont("helvetica", "bold")
  doc.text("Total Pengeluaran:", 14, 56)
  doc.setFont("helvetica", "normal")
  doc.text(formatRupiah(data.totalPengeluaran), 50, 56)

  doc.setFont("helvetica", "bold")
  doc.text("Saldo Periode:", 14, 63)
  doc.setFont("helvetica", "normal")
  doc.text(formatRupiah(data.saldoPeriode), 50, 63)

  const tableData = data.rows.map((row) => [
    `${row.bulan} ${row.tahun}`,
    formatRupiah(row.pemasukan),
    formatRupiah(row.pengeluaran),
    formatRupiah(row.saldo),
  ])

  const totalPengeluaran = data.totalPengeluaran
  const totalPemasukan = data.totalPemasukan
  const saldoPeriode = data.saldoPeriode

  // Simple table using doc.text since jspdf-autotable has types issues
  let yPos = 72
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text("Bulan", 14, yPos)
  doc.text("Pemasukan", 80, yPos, { align: "right" })
  doc.text("Pengeluaran", 130, yPos, { align: "right" })
  doc.text("Saldo", 190, yPos, { align: "right" })

  yPos += 6
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)

  for (const row of tableData) {
    doc.text(row[0] as string, 14, yPos)
    doc.text(row[1] as string, 80, yPos, { align: "right" })
    doc.text(row[2] as string, 130, yPos, { align: "right" })
    doc.text(row[3] as string, 190, yPos, { align: "right" })
    yPos += 6
  }

  yPos += 4
  doc.setFont("helvetica", "bold")
  doc.text("TOTAL", 14, yPos)
  doc.text(formatRupiah(totalPemasukan), 80, yPos, { align: "right" })
  doc.text(formatRupiah(totalPengeluaran), 130, yPos, { align: "right" })
  doc.text(formatRupiah(saldoPeriode), 190, yPos, { align: "right" })

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Halaman ${i} dari ${pageCount}`, 105, 290, { align: "center" })
    doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`, 14, 290)
  }

  doc.save(`laporan-kas-${data.periodeLabel.replace(/\s+/g, "-").toLowerCase()}.pdf`)
}

export function generateKuitansiPDF(data: PdfKuitansiData): void {
  const doc = new jsPDF()

  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text("e-Kuitansi Pembayaran Kas", 105, 20, { align: "center" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.text("RT 04 / RW 09", 105, 28, { align: "center" })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text("Nomor", 14, 42)
  doc.setFont("helvetica", "normal")
  doc.text(data.refKuitansi, 45, 42)

  let y = 52
  const row = (label: string, value: string) => {
    doc.setFont("helvetica", "bold")
    doc.text(label, 14, y)
    doc.setFont("helvetica", "normal")
    doc.text(value || "-", 55, y)
    y += 8
  }

  row("Diterima dari", data.wargaNama)
  row("Blok", data.blok ?? "-")
  row("Untuk", data.kategori)
  row("Tanggal Bayar", data.tanggalBayar)
  row("Petugas", data.petugas ?? "-")

  y += 4
  doc.setDrawColor(210, 210, 210)
  doc.line(14, y, 196, y)
  y += 10

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Jumlah", 14, y)
  doc.setFontSize(22)
  doc.text(formatRupiah(data.nominal), 196, y, { align: "right" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(120)
  doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")}`, 14, 286)

  doc.save(`kuitansi-${data.refKuitansi.toLowerCase()}.pdf`)
}
