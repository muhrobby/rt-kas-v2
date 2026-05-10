import ExcelJS from "exceljs"

function sanitizeSheetName(name: string): string {
  return name.replace(/[\\\/\?\*\[\]]/g, "").slice(0, 31)
}

function escapeFormula(value: unknown): unknown {
  if (typeof value === "string" && /^[=+\-@]/.test(value)) {
    return `'${value}`
  }
  return value
}

export async function createExcelWorkbook(data: object[], sheetName = "Sheet1"): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(sanitizeSheetName(sheetName))

  if (data.length > 0) {
    const headers = Object.keys(data[0])
    worksheet.addRow(headers)

    data.forEach((item) => {
      const row = Object.values(item).map(escapeFormula)
      worksheet.addRow(row)
    })
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

type LaporanTotals = {
  totalPemasukan: number
  totalPengeluaran: number
  saldoPeriode: number
}

export async function createLaporanExcel(
  rows: {
    bulan: string
    tahun: number
    pemasukan: number
    pengeluaran: number
    saldo: number
  }[],
  totals: LaporanTotals,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Laporan Kas")

  worksheet.columns = [
    { header: "Bulan", key: "bulan", width: 20 },
    { header: "Pemasukan (Rp)", key: "pemasukan", width: 20, style: { numFmt: "#,##0.00" } },
    { header: "Pengeluaran (Rp)", key: "pengeluaran", width: 20, style: { numFmt: "#,##0.00" } },
    { header: "Saldo (Rp)", key: "saldo", width: 20, style: { numFmt: "#,##0.00" } },
  ]

  rows.forEach((row) => {
    worksheet.addRow({
      bulan: `${row.bulan} ${row.tahun}`,
      pemasukan: row.pemasukan,
      pengeluaran: row.pengeluaran,
      saldo: row.saldo,
    })
  })

  worksheet.addRow({
    bulan: "TOTAL",
    pemasukan: totals.totalPemasukan,
    pengeluaran: totals.totalPengeluaran,
    saldo: totals.saldoPeriode,
  })

  // Styling header
  worksheet.getRow(1).font = { bold: true }
  worksheet.getRow(rows.length + 2).font = { bold: true }

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

export async function createLogAktivitasExcel(
  logs: {
    tanggalWaktu: string
    petugas: string
    modul: string
    aksi: string
    detail: string
  }[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Log Aktivitas")

  worksheet.columns = [
    { header: "Tanggal & Waktu", key: "tanggal", width: 25, style: { numFmt: "dd/mm/yyyy hh:mm:ss" } },
    { header: "Petugas", key: "petugas", width: 20 },
    { header: "Modul", key: "modul", width: 20 },
    { header: "Aksi", key: "aksi", width: 15 },
    { header: "Detail", key: "detail", width: 50 },
  ]

  logs.forEach((log) => {
    worksheet.addRow({
      tanggal: new Date(log.tanggalWaktu),
      petugas: escapeFormula(log.petugas),
      modul: escapeFormula(log.modul),
      aksi: escapeFormula(log.aksi),
      detail: escapeFormula(log.detail),
    })
  })

  worksheet.getRow(1).font = { bold: true }

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
