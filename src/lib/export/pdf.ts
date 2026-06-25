import { jsPDF } from "jspdf"
import { defaultAppSettings } from "@/lib/constants/app-settings"
import { formatRupiah } from "@/lib/format/currency"
import { formatRtRwLabel } from "@/lib/branding/format-branding"
import type { MonthlyCashflowRow } from "@/lib/services/laporan-service"
import type { PdfBranding } from "@/lib/branding/format-branding"

type RGB = [number, number, number]

const PAGE_WIDTH = 210
const PAGE_MARGIN_X = 14
const PAGE_BOTTOM_SAFE = 274
const REPORT_COLORS = {
  ink: [31, 41, 55] as RGB,
  muted: [100, 116, 139] as RGB,
  line: [226, 232, 240] as RGB,
  panel: [248, 250, 252] as RGB,
  warning: [245, 158, 11] as RGB,
  success: [22, 101, 52] as RGB,
  successSoft: [220, 252, 231] as RGB,
  danger: [185, 28, 28] as RGB,
  dangerSoft: [254, 226, 226] as RGB,
}

const defaultPdfBranding: PdfBranding = {
  appName: defaultAppSettings.appName,
  organizationName: defaultAppSettings.organizationName,
  rtRwLabel: formatRtRwLabel(defaultAppSettings.rtNumber, defaultAppSettings.rwNumber),
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

function getMonthLabel(row: MonthlyCashflowRow): string {
  return `${row.bulan} ${row.tahun}`
}

function getGeneratedAtLabel(): string {
  return new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function setText(doc: jsPDF, color: RGB, size: number, style: "normal" | "bold" = "normal") {
  doc.setTextColor(...color)
  doc.setFontSize(size)
  doc.setFont("helvetica", style)
}

function drawAmount(doc: jsPDF, value: number, x: number, y: number, color: RGB = REPORT_COLORS.ink) {
  setText(doc, color, 8.5, "bold")
  doc.text(formatRupiah(value), x, y, { align: "right" })
}

function drawSectionTitle(doc: jsPDF, title: string, subtitle: string, y: number, primaryColor: RGB) {
  doc.setFillColor(...primaryColor)
  doc.roundedRect(PAGE_MARGIN_X, y - 4, 2.5, 10, 1.2, 1.2, "F")
  setText(doc, REPORT_COLORS.ink, 11, "bold")
  doc.text(title, PAGE_MARGIN_X + 6, y)
  setText(doc, REPORT_COLORS.muted, 8, "normal")
  doc.text(subtitle, PAGE_MARGIN_X + 6, y + 5)
}

function drawMetricCard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  label: string,
  value: number,
  accentColor: RGB,
) {
  doc.setFillColor(...REPORT_COLORS.panel)
  doc.setDrawColor(...REPORT_COLORS.line)
  doc.roundedRect(x, y, width, 22, 2.5, 2.5, "FD")
  doc.setFillColor(...accentColor)
  doc.roundedRect(x + 3, y + 3, 2, 16, 1, 1, "F")

  setText(doc, REPORT_COLORS.muted, 6.8, "bold")
  doc.text(label.toUpperCase(), x + 8, y + 7)
  setText(doc, REPORT_COLORS.ink, 9.2, "bold")
  doc.text(formatRupiah(value), x + width - 4, y + 16, { align: "right" })
}

function drawReportFooter(doc: jsPDF, branding: PdfBranding) {
  const pageCount = doc.getNumberOfPages()
  const generatedAt = getGeneratedAtLabel()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setDrawColor(...REPORT_COLORS.line)
    doc.line(PAGE_MARGIN_X, 282, PAGE_WIDTH - PAGE_MARGIN_X, 282)

    setText(doc, REPORT_COLORS.muted, 7, "normal")
    doc.text(`Dicetak: ${generatedAt}`, PAGE_MARGIN_X, 288)
    doc.text(`Halaman ${i} dari ${pageCount}`, PAGE_WIDTH / 2, 288, { align: "center" })
    if (branding.receiptFooter) {
      doc.text(branding.receiptFooter, PAGE_WIDTH - PAGE_MARGIN_X, 288, { align: "right" })
    }
  }
}

export function generateLaporanPDFBytes(data: PdfLaporanData): ArrayBuffer {
  const doc = new jsPDF()
  const branding = getBranding(data.branding)
  const primaryColor = hexToRgb(branding.primaryColor)
  const saldoAkhir = data.saldoAwal + data.saldoPeriode
  let y = 14

  const addPageIfNeeded = (height: number) => {
    if (y + height <= PAGE_BOTTOM_SAFE) return
    doc.addPage()
    y = 18
  }

  doc.setFillColor(...REPORT_COLORS.panel)
  doc.rect(0, 0, PAGE_WIDTH, 45, "F")
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, PAGE_WIDTH, 3, "F")

  setText(doc, REPORT_COLORS.muted, 7.5, "bold")
  doc.text((branding.organizationName || branding.appName).toUpperCase(), PAGE_MARGIN_X, y)
  setText(doc, REPORT_COLORS.ink, 17, "bold")
  doc.text("Laporan Kas & Iuran RT", PAGE_MARGIN_X, y + 9)
  setText(doc, REPORT_COLORS.muted, 9, "normal")
  doc.text(data.periodeLabel, PAGE_MARGIN_X, y + 16)

  setText(doc, primaryColor, 10, "bold")
  doc.text(branding.rtRwLabel, PAGE_WIDTH - PAGE_MARGIN_X, y + 2, { align: "right" })
  const contactLine = getContactLine(branding)
  if (contactLine) {
    const contactLines = doc.splitTextToSize(contactLine, 82)
    setText(doc, REPORT_COLORS.muted, 7.5, "normal")
    doc.text(contactLines, PAGE_WIDTH - PAGE_MARGIN_X, y + 9, { align: "right" })
  }

  y = 54
  const cardWidth = (PAGE_WIDTH - PAGE_MARGIN_X * 2 - 9) / 4
  drawMetricCard(doc, PAGE_MARGIN_X, y, cardWidth, "Saldo Awal", data.saldoAwal, primaryColor)
  drawMetricCard(doc, PAGE_MARGIN_X + cardWidth + 3, y, cardWidth, "Pemasukan", data.totalPemasukan, REPORT_COLORS.success)
  drawMetricCard(doc, PAGE_MARGIN_X + (cardWidth + 3) * 2, y, cardWidth, "Pengeluaran", data.totalPengeluaran, REPORT_COLORS.danger)
  drawMetricCard(doc, PAGE_MARGIN_X + (cardWidth + 3) * 3, y, cardWidth, "Saldo Akhir", saldoAkhir, REPORT_COLORS.warning)

  y += 34
  drawSectionTitle(doc, "Rincian Pengeluaran", "Detail penggunaan dana ditampilkan lebih dulu sebelum total pengeluaran.", y, primaryColor)
  y += 12

  doc.setFillColor(...primaryColor)
  doc.roundedRect(PAGE_MARGIN_X, y, PAGE_WIDTH - PAGE_MARGIN_X * 2, 8, 2, 2, "F")
  setText(doc, [255, 255, 255], 7.5, "bold")
  doc.text("URAIAN", PAGE_MARGIN_X + 4, y + 5.2)
  doc.text("BULAN", 136, y + 5.2)
  doc.text("NOMINAL", PAGE_WIDTH - PAGE_MARGIN_X - 4, y + 5.2, { align: "right" })
  y += 10

  let hasExpenseDetails = false
  data.rows.forEach((row) => {
    const details = row.rincianPengeluaran ?? []
    if (details.length === 0) return
    hasExpenseDetails = true

    addPageIfNeeded(12)
    doc.setFillColor(...REPORT_COLORS.panel)
    doc.setDrawColor(...REPORT_COLORS.line)
    doc.roundedRect(PAGE_MARGIN_X, y, PAGE_WIDTH - PAGE_MARGIN_X * 2, 8, 1.5, 1.5, "FD")
    setText(doc, REPORT_COLORS.ink, 8.5, "bold")
    doc.text(getMonthLabel(row), PAGE_MARGIN_X + 4, y + 5.2)
    drawAmount(doc, row.pengeluaran, PAGE_WIDTH - PAGE_MARGIN_X - 4, y + 5.2, REPORT_COLORS.danger)
    y += 9

    details.forEach((item, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${item.kategoriNama}`, 112)
      const rowHeight = Math.max(7, lines.length * 4.2 + 3)
      addPageIfNeeded(rowHeight + 2)
      if (index % 2 === 1) {
        doc.setFillColor(252, 252, 253)
        doc.rect(PAGE_MARGIN_X, y - 1, PAGE_WIDTH - PAGE_MARGIN_X * 2, rowHeight, "F")
      }
      setText(doc, REPORT_COLORS.ink, 8.4, "bold")
      doc.text(lines, PAGE_MARGIN_X + 6, y + 4)
      setText(doc, REPORT_COLORS.muted, 8, "normal")
      doc.text(getMonthLabel(row), 136, y + 4)
      drawAmount(doc, item.nominal, PAGE_WIDTH - PAGE_MARGIN_X - 4, y + 4, REPORT_COLORS.danger)
      y += rowHeight

      // Sub-items: individual transactions with keterangan
      const subItems = item.items ?? []
      subItems.forEach((sub) => {
        addPageIfNeeded(6)
        const ketText = `  · ${sub.tanggal}  ${sub.keterangan ?? '—'}`
        const ketLines = doc.splitTextToSize(ketText, 110)
        const subH = Math.max(5.5, ketLines.length * 4 + 2)
        setText(doc, REPORT_COLORS.muted, 7.5, "normal")
        doc.text(ketLines, PAGE_MARGIN_X + 10, y + 3.5)
        setText(doc, REPORT_COLORS.muted, 7.5, "normal")
        drawAmount(doc, sub.nominal, PAGE_WIDTH - PAGE_MARGIN_X - 4, y + 3.5, REPORT_COLORS.muted)
        y += subH
      })
    })

    doc.setDrawColor(...REPORT_COLORS.line)
    doc.line(PAGE_MARGIN_X + 6, y, PAGE_WIDTH - PAGE_MARGIN_X - 4, y)
    y += 5
    setText(doc, REPORT_COLORS.ink, 8.5, "bold")
    doc.text(`Subtotal Pengeluaran ${getMonthLabel(row)}`, PAGE_MARGIN_X + 6, y)
    drawAmount(doc, row.pengeluaran, PAGE_WIDTH - PAGE_MARGIN_X - 4, y, REPORT_COLORS.danger)
    y += 8
  })

  if (!hasExpenseDetails) {
    addPageIfNeeded(12)
    doc.setFillColor(...REPORT_COLORS.panel)
    doc.setDrawColor(...REPORT_COLORS.line)
    doc.roundedRect(PAGE_MARGIN_X, y, PAGE_WIDTH - PAGE_MARGIN_X * 2, 12, 2, 2, "FD")
    setText(doc, REPORT_COLORS.muted, 8.5, "normal")
    doc.text("Tidak ada pengeluaran pada periode ini.", PAGE_MARGIN_X + 5, y + 7.5)
    y += 16
  }

  addPageIfNeeded(18)
  doc.setFillColor(...REPORT_COLORS.dangerSoft)
  doc.setDrawColor(...REPORT_COLORS.danger)
  doc.roundedRect(PAGE_MARGIN_X, y, PAGE_WIDTH - PAGE_MARGIN_X * 2, 13, 2, 2, "FD")
  setText(doc, REPORT_COLORS.danger, 10, "bold")
  doc.text("Total Pengeluaran", PAGE_MARGIN_X + 5, y + 8.5)
  doc.text(formatRupiah(data.totalPengeluaran), PAGE_WIDTH - PAGE_MARGIN_X - 5, y + 8.5, { align: "right" })

  y += 27
  addPageIfNeeded(34)
  drawSectionTitle(doc, "Rekap Bulanan & Saldo", "Ringkasan arus kas per bulan setelah seluruh rincian dicatat.", y, primaryColor)
  y += 12

  doc.setFillColor(...REPORT_COLORS.ink)
  doc.roundedRect(PAGE_MARGIN_X, y, PAGE_WIDTH - PAGE_MARGIN_X * 2, 8, 2, 2, "F")
  setText(doc, [255, 255, 255], 7.5, "bold")
  doc.text("BULAN", PAGE_MARGIN_X + 4, y + 5.2)
  doc.text("PEMASUKAN", 92, y + 5.2, { align: "right" })
  doc.text("PENGELUARAN", 142, y + 5.2, { align: "right" })
  doc.text("SALDO", PAGE_WIDTH - PAGE_MARGIN_X - 4, y + 5.2, { align: "right" })
  y += 10

  data.rows.forEach((row, index) => {
    addPageIfNeeded(8)
    if (index % 2 === 1) {
      doc.setFillColor(252, 252, 253)
      doc.rect(PAGE_MARGIN_X, y - 1.5, PAGE_WIDTH - PAGE_MARGIN_X * 2, 7.5, "F")
    }
    setText(doc, REPORT_COLORS.ink, 8.3, "normal")
    doc.text(getMonthLabel(row), PAGE_MARGIN_X + 4, y + 3.5)
    doc.text(formatRupiah(row.pemasukan), 92, y + 3.5, { align: "right" })
    doc.text(formatRupiah(row.pengeluaran), 142, y + 3.5, { align: "right" })
    setText(doc, REPORT_COLORS.ink, 8.3, "bold")
    doc.text(formatRupiah(row.saldo), PAGE_WIDTH - PAGE_MARGIN_X - 4, y + 3.5, { align: "right" })
    y += 7.5
  })

  addPageIfNeeded(18)
  doc.setFillColor(...REPORT_COLORS.panel)
  doc.setDrawColor(...REPORT_COLORS.line)
  doc.roundedRect(PAGE_MARGIN_X, y + 1, PAGE_WIDTH - PAGE_MARGIN_X * 2, 12, 2, 2, "FD")
  setText(doc, REPORT_COLORS.ink, 8.5, "bold")
  doc.text("Total Periode", PAGE_MARGIN_X + 4, y + 8.5)
  doc.text(formatRupiah(data.totalPemasukan), 92, y + 8.5, { align: "right" })
  doc.text(formatRupiah(data.totalPengeluaran), 142, y + 8.5, { align: "right" })
  doc.text(formatRupiah(saldoAkhir), PAGE_WIDTH - PAGE_MARGIN_X - 4, y + 8.5, { align: "right" })

  y += 24
  addPageIfNeeded(24)
  doc.setFillColor(...REPORT_COLORS.successSoft)
  doc.setDrawColor(...REPORT_COLORS.success)
  doc.roundedRect(PAGE_MARGIN_X, y, PAGE_WIDTH - PAGE_MARGIN_X * 2, 18, 2.5, 2.5, "FD")
  setText(doc, REPORT_COLORS.success, 9, "bold")
  doc.text("SALDO AKHIR KAS", PAGE_MARGIN_X + 6, y + 7)
  setText(doc, REPORT_COLORS.success, 17, "bold")
  doc.text(formatRupiah(saldoAkhir), PAGE_WIDTH - PAGE_MARGIN_X - 6, y + 12.5, { align: "right" })

  drawReportFooter(doc, branding)

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
