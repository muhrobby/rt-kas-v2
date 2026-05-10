import jsPDF from "jspdf"
import { defaultAppSettings } from "@/lib/constants/app-settings"
import { formatRupiah } from "@/lib/format/currency"
import type { MonthlyCashflowRow } from "@/lib/services/laporan-service"
import type { PdfBranding } from "@/lib/branding/format-branding"

type RGB = [number, number, number]

const defaultPdfBranding: PdfBranding = {
  appName: defaultAppSettings.appName,
  organizationName: defaultAppSettings.organizationName,
  rtRwLabel: defaultAppSettings.organizationName,
  address: defaultAppSettings.address,
  phone: defaultAppSettings.phone,
  email: defaultAppSettings.email,
  primaryColor: defaultAppSettings.primaryColor,
  secondaryColor: defaultAppSettings.secondaryColor,
  accentColor: defaultAppSettings.accentColor,
  receiptTitle: defaultAppSettings.receiptTitle,
  receiptFooter: defaultAppSettings.receiptFooter,
}

interface PdfLaporanData {
  rows: MonthlyCashflowRow[]
  totalPemasukan: number
  totalPengeluaran: number
  saldoPeriode: number
  saldoAwal: number
  periodeLabel: string
  branding?: PdfBranding
}

interface PdfKuitansiData {
  refKuitansi: string
  kategori: string
  tanggalBayar: string
  nominal: number
  wargaNama: string
  blok?: string
  petugas?: string | null
  branding?: PdfBranding
}

function getBranding(branding?: PdfBranding): PdfBranding {
  return branding ?? defaultPdfBranding
}

function hexToRgb(hex: string): RGB {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    return [45, 107, 180]
  }

  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

function safeFilenamePart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "export"
}

function getContactLine(branding: PdfBranding): string | null {
  return [branding.address, branding.phone, branding.email].filter(Boolean).join(" | ") || null
}

export function generateLaporanPDFBytes(data: PdfLaporanData): ArrayBuffer {
  const doc = new jsPDF()
  const branding = getBranding(data.branding)
  const primaryColor = hexToRgb(branding.primaryColor)

  doc.setTextColor(...primaryColor)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(`Laporan Keuangan ${branding.appName}`, 105, 20, { align: "center" })

  doc.setTextColor(40)
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text(branding.rtRwLabel, 105, 28, { align: "center" })

  doc.setFontSize(9)
  doc.text(data.periodeLabel, 105, 35, { align: "center" })
  const contactLine = getContactLine(branding)
  if (contactLine) {
    doc.setFontSize(8)
    doc.setTextColor(90)
    doc.text(contactLine, 105, 41, { align: "center" })
  }

  doc.setTextColor(40)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("Saldo Awal:", 14, 52)
  doc.setFont("helvetica", "normal")
  doc.text(formatRupiah(data.saldoAwal), 50, 52)

  doc.setFont("helvetica", "bold")
  doc.text("Total Pemasukan:", 14, 59)
  doc.setFont("helvetica", "normal")
  doc.text(formatRupiah(data.totalPemasukan), 50, 59)

  doc.setFont("helvetica", "bold")
  doc.text("Total Pengeluaran:", 14, 66)
  doc.setFont("helvetica", "normal")
  doc.text(formatRupiah(data.totalPengeluaran), 50, 66)

  doc.setFont("helvetica", "bold")
  doc.text("Saldo Periode:", 14, 73)
  doc.setFont("helvetica", "normal")
  doc.text(formatRupiah(data.saldoPeriode), 50, 73)

  const tableData = data.rows.map((row) => [
    `${row.bulan} ${row.tahun}`,
    formatRupiah(row.pemasukan),
    formatRupiah(row.pengeluaran),
    formatRupiah(row.saldo),
  ])

  const totalPengeluaran = data.totalPengeluaran
  const totalPemasukan = data.totalPemasukan
  const saldoPeriode = data.saldoPeriode

  let yPos = 84
  doc.setDrawColor(...primaryColor)
  doc.line(14, yPos - 4, 196, yPos - 4)
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
    if (branding.receiptFooter) {
      doc.text(branding.receiptFooter, 196, 290, { align: "right" })
    }
  }

  return doc.output("arraybuffer") as ArrayBuffer
}

export function generateLaporanPDF(data: PdfLaporanData): void {
  const bytes = generateLaporanPDFBytes(data)
  const blob = new Blob([bytes], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `laporan-kas-${safeFilenamePart(data.periodeLabel)}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function generateKuitansiPDF(data: PdfKuitansiData): void {
  const doc = new jsPDF()
  const branding = getBranding(data.branding)
  const primaryColor = hexToRgb(branding.primaryColor)

  doc.setTextColor(...primaryColor)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text(branding.receiptTitle, 105, 20, { align: "center" })

  doc.setTextColor(40)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.text(branding.rtRwLabel, 105, 28, { align: "center" })

  const contactLine = getContactLine(branding)
  if (contactLine) {
    doc.setFontSize(8)
    doc.setTextColor(90)
    doc.text(contactLine, 105, 35, { align: "center" })
  }

  doc.setTextColor(40)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text("Nomor", 14, 46)
  doc.setFont("helvetica", "normal")
  doc.text(data.refKuitansi, 45, 46)

  let y = 56
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
  doc.setDrawColor(...primaryColor)
  doc.line(14, y, 196, y)
  y += 10

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Jumlah", 14, y)
  doc.setFontSize(22)
  doc.setTextColor(...primaryColor)
  doc.text(formatRupiah(data.nominal), 196, y, { align: "right" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(120)
  doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")}`, 14, 286)
  if (branding.receiptFooter) {
    doc.text(branding.receiptFooter, 196, 286, { align: "right" })
  }

  doc.save(`kuitansi-${safeFilenamePart(data.refKuitansi)}.pdf`)
}
