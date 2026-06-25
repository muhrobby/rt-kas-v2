import { jsPDF } from "jspdf"

import { defaultAppSettings } from "@/lib/constants/app-settings"
import { formatRupiah } from "@/lib/format/currency"
import { formatRtRwLabel } from "@/lib/branding/format-branding"
import type { PdfBranding } from "@/lib/branding/format-branding"
import type { LaporanFinalEvent } from "@/lib/services/laporan-event-service"

type RGB = [number, number, number]

// A4 landscape: 297 × 210mm
const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const MARGIN = 18
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2 // = 174mm
const PAGE_BOTTOM_SAFE = PAGE_HEIGHT - 18

const COLORS = {
  ink: [33, 41, 54] as RGB,
  inkSoft: [71, 84, 103] as RGB,
  muted: [115, 128, 144] as RGB,
  line: [220, 226, 236] as RGB,
  lineSoft: [240, 244, 250] as RGB,
  panel: [248, 250, 253] as RGB,
  white: [255, 255, 255] as RGB,
  success: [22, 101, 52] as RGB,
  successSoft: [219, 252, 232] as RGB,
  danger: [185, 28, 28] as RGB,
  dangerSoft: [254, 226, 226] as RGB,
  warning: [180, 83, 9] as RGB,
  warningSoft: [254, 235, 200] as RGB,
}

const SUMBER_LABEL: Record<string, string> = {
  MANDIRI_WARGA: "Sukarela Warga",
  TALANGAN_KAS: "Talangan Kas RT",
  URUNAN_PENGURUS: "Urunan Pengurus",
  SUMBANGAN_TAMBAHAN_WARGA: "Sumbangan Tambahan",
}

const defaultBranding: PdfBranding = {
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

function hexToRgb(hex: string): RGB {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return [45, 107, 180]
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

function setText(doc: jsPDF, color: RGB, size: number, weight: "normal" | "bold" = "normal") {
  doc.setTextColor(...color)
  doc.setFontSize(size)
  doc.setFont("helvetica", weight)
}

function fmtDate(d: Date | null | undefined): string {
  if (!d) return "—"
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
}

export function generateEventPDFBytes(report: LaporanFinalEvent, branding?: PdfBranding): ArrayBuffer {
  const b = branding ?? defaultBranding
  const primary = hexToRgb(b.primaryColor)
  const doc = new jsPDF({ unit: "mm", format: "a4" })

  let y = MARGIN

  const ensureSpace = (need: number) => {
    if (y + need > PAGE_BOTTOM_SAFE) {
      doc.addPage()
      drawPageHeader()
      y = MARGIN + 22
    }
  }

  // ── HEADER (page top band) ──────────────────────────────
  const drawPageHeader = () => {
    doc.setFillColor(...primary)
    doc.rect(0, 0, PAGE_WIDTH, 4, "F")
  }

  drawPageHeader()
  y = MARGIN

  // ── BRAND BLOCK ─────────────────────────────────────────
  setText(doc, COLORS.muted, 7, "bold")
  doc.text((b.organizationName || b.appName).toUpperCase(), MARGIN, y)
  setText(doc, COLORS.ink, 18, "bold")
  doc.text("LAPORAN FINAL EVENT", MARGIN, y + 8)
  setText(doc, COLORS.inkSoft, 11, "normal")
  doc.text(report.event.nama, MARGIN, y + 15)

  // RT/RW label right side
  setText(doc, primary, 10, "bold")
  doc.text(b.rtRwLabel, PAGE_WIDTH - MARGIN, y + 4, { align: "right" })
  if (b.address) {
    setText(doc, COLORS.muted, 7.5, "normal")
    const addrLines = doc.splitTextToSize(b.address, 60)
    doc.text(addrLines, PAGE_WIDTH - MARGIN, y + 9, { align: "right" })
  }

  y += 22
  doc.setDrawColor(...COLORS.line)
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y)
  y += 6

  // ── INFO EVENT ──────────────────────────────────────────
  setText(doc, COLORS.muted, 7.5, "bold")
  doc.text("INFORMASI EVENT", MARGIN, y)
  y += 5

  const infoRows: [string, string][] = [
    ["Tanggal Pelaksanaan", report.event.tanggalPelaksanaan],
    ["Status", report.event.status],
    ["Ditutup Pada", fmtDate(report.event.closedAt)],
    ["Dibuat Oleh", report.event.createdByName],
  ]
  if (report.event.deskripsi) {
    infoRows.push(["Deskripsi", report.event.deskripsi])
  }

  infoRows.forEach(([label, value]) => {
    setText(doc, COLORS.muted, 8.5, "normal")
    doc.text(label, MARGIN, y)
    setText(doc, COLORS.ink, 8.5, "normal")
    const valLines = doc.splitTextToSize(value, CONTENT_WIDTH - 50)
    doc.text(valLines, MARGIN + 50, y)
    y += valLines.length > 1 ? 4 + (valLines.length - 1) * 4 : 5.5
  })

  y += 3

  // ── RINGKASAN KEUANGAN (4 kartu) ────────────────────────
  setText(doc, COLORS.muted, 7.5, "bold")
  doc.text("RINGKASAN KEUANGAN", MARGIN, y)
  y += 6

  const saldoAkhir = report.totalSumbangan - report.totalPengeluaranApproved
  const cards = [
    { label: "Total Sumbangan", value: report.totalSumbangan, color: COLORS.success, soft: COLORS.successSoft },
    { label: "Total Pengeluaran", value: report.totalPengeluaranApproved, color: COLORS.danger, soft: COLORS.dangerSoft },
    { label: "Saldo Akhir", value: saldoAkhir, color: saldoAkhir >= 0 ? COLORS.success : COLORS.danger, soft: saldoAkhir >= 0 ? COLORS.successSoft : COLORS.dangerSoft },
    { label: "Ditransfer ke Kas RT", value: report.sisaDanaTransferred ?? 0, color: primary, soft: COLORS.panel },
  ]

  const cardW = (CONTENT_WIDTH - 9) / 4
  const cardH = 22
  cards.forEach((c, i) => {
    const x = MARGIN + i * (cardW + 3)
    doc.setFillColor(...c.soft)
    doc.setDrawColor(...COLORS.lineSoft)
    doc.roundedRect(x, y, cardW, cardH, 2, 2, "FD")
    setText(doc, COLORS.muted, 6.5, "bold")
    doc.text(c.label.toUpperCase(), x + 4, y + 5)
    setText(doc, c.color, 11, "bold")
    doc.text(formatRupiah(c.value), x + 4, y + 14)
  })

  y += cardH + 8

  // ── DAFTAR SUMBANGAN ────────────────────────────────────
  ensureSpace(20)
  setText(doc, COLORS.muted, 7.5, "bold")
  doc.text(`DAFTAR SUMBANGAN (${report.sumbangan.length})`, MARGIN, y)
  y += 5

  // Table header
  doc.setFillColor(...primary)
  doc.rect(MARGIN, y, CONTENT_WIDTH, 7, "F")
  setText(doc, COLORS.white, 7.5, "bold")
  doc.text("TANGGAL", MARGIN + 3, y + 4.8)
  doc.text("WARGA / SUMBER", MARGIN + 30, y + 4.8)
  doc.text("KETERANGAN", MARGIN + 90, y + 4.8)
  doc.text("NOMINAL", PAGE_WIDTH - MARGIN - 3, y + 4.8, { align: "right" })
  y += 7

  if (report.sumbangan.length === 0) {
    setText(doc, COLORS.muted, 8, "normal")
    doc.text("Tidak ada sumbangan tercatat.", MARGIN + 3, y + 5)
    y += 8
  } else {
    report.sumbangan.forEach((s, i) => {
      ensureSpace(7)
      // zebra stripe
      if (i % 2 === 1) {
        doc.setFillColor(...COLORS.panel)
        doc.rect(MARGIN, y, CONTENT_WIDTH, 6.5, "F")
      }
      setText(doc, COLORS.inkSoft, 7.5, "normal")
      doc.text(s.tanggal, MARGIN + 3, y + 4.5)

      setText(doc, COLORS.ink, 7.5, "normal")
      const wargaText = s.wargaNama ?? SUMBER_LABEL[s.sumber] ?? s.sumber
      const wLines = doc.splitTextToSize(wargaText, 55)
      doc.text(wLines[0], MARGIN + 30, y + 4.5)

      setText(doc, COLORS.inkSoft, 7.5, "normal")
      const ketLines = doc.splitTextToSize(s.keterangan ?? "—", 60)
      doc.text(ketLines[0], MARGIN + 90, y + 4.5)

      setText(doc, COLORS.ink, 7.5, "bold")
      doc.text(formatRupiah(s.nominal), PAGE_WIDTH - MARGIN - 3, y + 4.5, { align: "right" })
      y += 6.5
    })
    // Total row
    ensureSpace(8)
    doc.setFillColor(...primary)
    doc.rect(MARGIN, y, CONTENT_WIDTH, 7, "F")
    setText(doc, COLORS.white, 8, "bold")
    doc.text("TOTAL SUMBANGAN", MARGIN + 3, y + 4.8)
    doc.text(formatRupiah(report.totalSumbangan), PAGE_WIDTH - MARGIN - 3, y + 4.8, { align: "right" })
    y += 10
  }

  // ── DAFTAR PENGELUARAN ──────────────────────────────────
  ensureSpace(20)
  setText(doc, COLORS.muted, 7.5, "bold")
  doc.text(`DAFTAR PENGELUARAN (${report.pengeluaranApproved.length})`, MARGIN, y)
  y += 5

  doc.setFillColor(...primary)
  doc.rect(MARGIN, y, CONTENT_WIDTH, 7, "F")
  setText(doc, COLORS.white, 7.5, "bold")
  doc.text("TANGGAL", MARGIN + 3, y + 4.8)
  doc.text("DESKRIPSI", MARGIN + 30, y + 4.8)
  doc.text("DISETUJUI", MARGIN + 110, y + 4.8)
  doc.text("NOMINAL", PAGE_WIDTH - MARGIN - 3, y + 4.8, { align: "right" })
  y += 7

  if (report.pengeluaranApproved.length === 0) {
    setText(doc, COLORS.muted, 8, "normal")
    doc.text("Tidak ada pengeluaran disetujui.", MARGIN + 3, y + 5)
    y += 8
  } else {
    report.pengeluaranApproved.forEach((p, i) => {
      ensureSpace(7)
      if (i % 2 === 1) {
        doc.setFillColor(...COLORS.panel)
        doc.rect(MARGIN, y, CONTENT_WIDTH, 6.5, "F")
      }
      setText(doc, COLORS.inkSoft, 7.5, "normal")
      doc.text(p.tanggal, MARGIN + 3, y + 4.5)

      setText(doc, COLORS.ink, 7.5, "normal")
      const dLines = doc.splitTextToSize(p.deskripsi, 75)
      doc.text(dLines[0], MARGIN + 30, y + 4.5)

      setText(doc, COLORS.inkSoft, 7.5, "normal")
      const aLines = doc.splitTextToSize(p.approvedByName ?? "—", 35)
      doc.text(aLines[0], MARGIN + 110, y + 4.5)

      setText(doc, COLORS.ink, 7.5, "bold")
      doc.text(formatRupiah(p.nominal), PAGE_WIDTH - MARGIN - 3, y + 4.5, { align: "right" })
      y += 6.5
    })
    ensureSpace(8)
    doc.setFillColor(...primary)
    doc.rect(MARGIN, y, CONTENT_WIDTH, 7, "F")
    setText(doc, COLORS.white, 8, "bold")
    doc.text("TOTAL PENGELUARAN", MARGIN + 3, y + 4.8)
    doc.text(formatRupiah(report.totalPengeluaranApproved), PAGE_WIDTH - MARGIN - 3, y + 4.8, { align: "right" })
    y += 10
  }

  // ── FOOTER ──────────────────────────────────────────────
  ensureSpace(20)
  doc.setDrawColor(...COLORS.line)
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y)
  y += 5

  setText(doc, COLORS.muted, 7, "normal")
  const footerLeft = `Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`
  doc.text(footerLeft, MARGIN, y + 3)
  doc.text((b.organizationName || b.appName), PAGE_WIDTH - MARGIN, y + 3, { align: "right" })

  // Page number on every page
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    setText(doc, COLORS.muted, 7, "normal")
    doc.text(`Halaman ${i} dari ${pageCount}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 8, { align: "center" })
  }

  return doc.output("arraybuffer")
}
