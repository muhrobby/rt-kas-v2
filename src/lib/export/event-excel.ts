import ExcelJS from "exceljs"

import { formatRupiah } from "@/lib/format/currency"
import type { LaporanFinalEvent } from "@/lib/services/laporan-event-service"
import { defaultAppSettings } from "@/lib/constants/app-settings"
import { formatRtRwLabel } from "@/lib/branding/format-branding"
import type { PdfBranding } from "@/lib/branding/format-branding"

const SUMBER_LABEL: Record<string, string> = {
  MANDIRI_WARGA: "Sukarela Warga",
  TALANGAN_KAS: "Talangan Kas RT",
  URUNAN_PENGURUS: "Urunan Pengurus",
  SUMBANGAN_TAMBAHAN_WARGA: "Sumbangan Tambahan",
}

const COLOR_HEADER = "FF1F2937"
const COLOR_ALT_ROW = "FFF8FAFC"
const COLOR_TOTAL = "FFDBEAFE"

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

export async function generateEventExcel(
  report: LaporanFinalEvent,
  branding?: PdfBranding,
): Promise<Buffer> {
  const b = branding ?? defaultBranding
  const wb = new ExcelJS.Workbook()
  wb.creator = b.organizationName || b.appName
  wb.created = new Date()
  wb.title = `Laporan Event - ${report.event.nama}`

  // ─── Sheet 1: RINGKASAN ────────────────────────────────────────
  const ws1 = wb.addWorksheet("Ringkasan", {
    pageSetup: { paperSize: 9, orientation: "portrait", margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 } },
    views: [{ showGridLines: false }],
  })
  ws1.columns = [{ width: 4 }, { width: 30 }, { width: 50 }, { width: 4 }]

  // Branding header
  let row = ws1.addRow([])
  row.height = 8
  ws1.mergeCells(`B${ws1.rowCount}:C${ws1.rowCount}`)

  row = ws1.addRow(["", (b.organizationName || b.appName).toUpperCase()])
  row.getCell(2).font = { name: "Calibri", size: 9, bold: true, color: { argb: "FF6B7280" } }
  ws1.mergeCells(`B${ws1.rowCount}:C${ws1.rowCount}`)

  row = ws1.addRow(["", "LAPORAN FINAL EVENT"])
  row.getCell(2).font = { name: "Calibri", size: 18, bold: true, color: { argb: COLOR_HEADER } }
  row.height = 26
  ws1.mergeCells(`B${ws1.rowCount}:C${ws1.rowCount}`)

  row = ws1.addRow(["", report.event.nama])
  row.getCell(2).font = { name: "Calibri", size: 13, color: { argb: "FF374151" } }
  ws1.mergeCells(`B${ws1.rowCount}:C${ws1.rowCount}`)

  row = ws1.addRow(["", b.rtRwLabel + (b.address ? ` · ${b.address}` : "")])
  row.getCell(2).font = { name: "Calibri", size: 9, color: { argb: "FF6B7280" } }
  ws1.mergeCells(`B${ws1.rowCount}:C${ws1.rowCount}`)

  ws1.addRow([])

  // Section: Info Event
  row = ws1.addRow(["", "INFORMASI EVENT"])
  row.getCell(2).font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF6B7280" } }
  ws1.mergeCells(`B${ws1.rowCount}:C${ws1.rowCount}`)

  const closedAt = report.event.closedAt
    ? new Date(report.event.closedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
    : "—"

  const infoRows = [
    ["Tanggal Pelaksanaan", report.event.tanggalPelaksanaan],
    ["Status", report.event.status],
    ["Ditutup Pada", closedAt],
    ["Dibuat Oleh", report.event.createdByName],
  ]
  if (report.event.deskripsi) infoRows.push(["Deskripsi", report.event.deskripsi])

  infoRows.forEach(([label, value]) => {
    const r = ws1.addRow(["", label, value])
    r.getCell(2).font = { name: "Calibri", size: 10, color: { argb: "FF6B7280" } }
    r.getCell(3).font = { name: "Calibri", size: 10, color: { argb: COLOR_HEADER } }
    r.getCell(3).alignment = { wrapText: true, vertical: "top" }
  })

  ws1.addRow([])

  // Section: Ringkasan Keuangan
  row = ws1.addRow(["", "RINGKASAN KEUANGAN"])
  row.getCell(2).font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF6B7280" } }
  ws1.mergeCells(`B${ws1.rowCount}:C${ws1.rowCount}`)

  const saldoAkhir = report.totalSumbangan - report.totalPengeluaranApproved
  const moneyRows: [string, number, string][] = [
    ["Total Sumbangan", report.totalSumbangan, "FF166534"],
    ["Total Pengeluaran Disetujui", report.totalPengeluaranApproved, "FFB91C1C"],
    ["Saldo Akhir", saldoAkhir, saldoAkhir >= 0 ? "FF166534" : "FFB91C1C"],
  ]
  if (report.sisaDanaTransferred != null) {
    moneyRows.push(["Ditransfer ke Kas RT", report.sisaDanaTransferred, "FF1E40AF"])
  }

  moneyRows.forEach(([label, value, color]) => {
    const r = ws1.addRow(["", label, formatRupiah(value as number)])
    r.getCell(2).font = { name: "Calibri", size: 10, color: { argb: "FF6B7280" } }
    r.getCell(3).font = { name: "Calibri", size: 11, bold: true, color: { argb: color as string } }
    r.getCell(3).alignment = { horizontal: "right" }
  })

  // ─── Sheet 2: SUMBANGAN ────────────────────────────────────────
  const ws2 = wb.addWorksheet("Sumbangan", {
    pageSetup: { paperSize: 9, orientation: "landscape", margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 } },
    views: [{ showGridLines: false }],
  })
  ws2.columns = [
    { header: "No", key: "no", width: 5 },
    { header: "Tanggal", key: "tanggal", width: 14 },
    { header: "Warga / Sumber", key: "warga", width: 30 },
    { header: "Sumber Dana", key: "sumber", width: 22 },
    { header: "Nominal (Rp)", key: "nominal", width: 18, style: { numFmt: "#,##0" } },
    { header: "Keterangan", key: "keterangan", width: 35 },
  ]
  styleHeader(ws2.getRow(1))

  report.sumbangan.forEach((s, i) => {
    const r = ws2.addRow({
      no: i + 1,
      tanggal: s.tanggal,
      warga: s.wargaNama ?? "Pengurus",
      sumber: SUMBER_LABEL[s.sumber] ?? s.sumber,
      nominal: s.nominal,
      keterangan: s.keterangan ?? "",
    })
    if (i % 2 === 1) {
      r.eachCell((cell) => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_ALT_ROW } } })
    }
    r.getCell("no").alignment = { horizontal: "center" }
    r.getCell("nominal").alignment = { horizontal: "right" }
  })

  // Total row
  if (report.sumbangan.length > 0) {
    const totalRow = ws2.addRow({ warga: "TOTAL", nominal: report.totalSumbangan })
    totalRow.eachCell((cell) => {
      cell.font = { bold: true }
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_TOTAL } }
      cell.border = { top: { style: "thin", color: { argb: "FF94A3B8" } } }
    })
    totalRow.getCell("nominal").alignment = { horizontal: "right" }
  }

  // ─── Sheet 3: PENGELUARAN ──────────────────────────────────────
  const ws3 = wb.addWorksheet("Pengeluaran", {
    pageSetup: { paperSize: 9, orientation: "landscape", margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 } },
    views: [{ showGridLines: false }],
  })
  ws3.columns = [
    { header: "No", key: "no", width: 5 },
    { header: "Tanggal", key: "tanggal", width: 14 },
    { header: "Deskripsi", key: "deskripsi", width: 40 },
    { header: "Pencatat", key: "pencatat", width: 22 },
    { header: "Disetujui Oleh", key: "approved", width: 22 },
    { header: "Nominal (Rp)", key: "nominal", width: 18, style: { numFmt: "#,##0" } },
  ]
  styleHeader(ws3.getRow(1))

  report.pengeluaranApproved.forEach((p, i) => {
    const r = ws3.addRow({
      no: i + 1,
      tanggal: p.tanggal,
      deskripsi: p.deskripsi,
      pencatat: p.recordedByName,
      approved: p.approvedByName ?? "—",
      nominal: p.nominal,
    })
    if (i % 2 === 1) {
      r.eachCell((cell) => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_ALT_ROW } } })
    }
    r.getCell("no").alignment = { horizontal: "center" }
    r.getCell("nominal").alignment = { horizontal: "right" }
  })

  if (report.pengeluaranApproved.length > 0) {
    const totalRow = ws3.addRow({ deskripsi: "TOTAL", nominal: report.totalPengeluaranApproved })
    totalRow.eachCell((cell) => {
      cell.font = { bold: true }
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_TOTAL } }
      cell.border = { top: { style: "thin", color: { argb: "FF94A3B8" } } }
    })
    totalRow.getCell("nominal").alignment = { horizontal: "right" }
  }

  const buffer = await wb.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

function styleHeader(row: ExcelJS.Row) {
  row.height = 22
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_HEADER } }
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true }
    cell.border = { bottom: { style: "thin", color: { argb: "FF374151" } } }
  })
}
