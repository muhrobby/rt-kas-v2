import * as XLSX from "xlsx"

export function createExcelWorkbook(data: object[], sheetName = "Sheet1"): Buffer {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
  return buffer
}

type LaporanTotals = {
  totalPemasukan: number
  totalPengeluaran: number
  saldoPeriode: number
}

export function createLaporanExcel(
  rows: {
    bulan: string
    tahun: number
    bulanNum: number
    pemasukan: number
    pengeluaran: number
    saldo: number
  }[],
  totals: LaporanTotals,
): Buffer {
  const formattedRows = rows.map((row) => ({
    Bulan: `${row.bulan} ${row.tahun}`,
    "Pemasukan (Rp)": row.pemasukan,
    "Pengeluaran (Rp)": row.pengeluaran,
    "Saldo (Rp)": row.saldo,
  }))

  const summaryRow = {
    Bulan: "TOTAL",
    "Pemasukan (Rp)": totals.totalPemasukan,
    "Pengeluaran (Rp)": totals.totalPengeluaran,
    "Saldo (Rp)": totals.saldoPeriode,
  }

  const dataWithSummary = [...formattedRows, summaryRow]

  const worksheet = XLSX.utils.json_to_sheet(dataWithSummary)

  const cols = ["A", "B", "C", "D"]
  const currencyFmt = '#.##0,00'

  for (const col of cols.slice(1)) {
    for (let i = 2; i <= formattedRows.length + 2; i++) {
      const cell = worksheet[`${col}${i}`]
      if (cell) {
        cell.z = currencyFmt
      }
    }
  }

  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1")
  for (let col = 0; col <= range.e.c; col++) {
    const colLetter = XLSX.utils.encode_col(col)
    let maxWidth = 12
    for (let row = 0; row <= range.e.r; row++) {
      const cell = worksheet[colLetter + (row + 1)]
      if (cell && cell.v) {
        const cellWidth = String(cell.v).length
        if (cellWidth > maxWidth) maxWidth = cellWidth
      }
    }
    worksheet["!cols"] = worksheet["!cols"] || []
    worksheet["!cols"][col] = { wch: maxWidth + 2 }
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Kas")
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
}

export function createLogAktivitasExcel(
  logs: {
    tanggalWaktu: string
    petugas: string
    modul: string
    aksi: string
    detail: string
  }[],
): Buffer {
  const formattedLogs = logs.map((log) => ({
    "Tanggal & Waktu": new Date(log.tanggalWaktu),
    Petugas: log.petugas,
    Modul: log.modul,
    Aksi: log.aksi,
    Detail: log.detail,
  }))

  const worksheet = XLSX.utils.json_to_sheet(formattedLogs)

  for (let i = 2; i <= logs.length + 1; i++) {
    const cell = worksheet[`A${i}`]
    if (cell) {
      cell.t = "d"
      cell.z = "dd/mm/yyyy hh:mm:ss"
    }
  }

  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1")
  for (let col = 0; col <= range.e.c; col++) {
    const colLetter = XLSX.utils.encode_col(col)
    let maxWidth = 12
    for (let row = 0; row <= range.e.r; row++) {
      const cell = worksheet[colLetter + (row + 1)]
      if (cell && cell.v) {
        const cellWidth = String(cell.v).length
        if (cellWidth > maxWidth) maxWidth = cellWidth
      }
    }
    worksheet["!cols"] = worksheet["!cols"] || []
    worksheet["!cols"][col] = { wch: maxWidth + 2 }
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Log Aktivitas")
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
}
