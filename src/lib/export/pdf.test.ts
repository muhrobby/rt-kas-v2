import test from "node:test"
import assert from "node:assert/strict"

import { generateLaporanPDFBytes } from "./pdf"

test("generateLaporanPDFBytes renders expense details before the expense total", () => {
  const bytes = generateLaporanPDFBytes({
    rows: [
      {
        bulan: "Jan",
        tahun: 2026,
        bulanNum: 1,
        pemasukan: 1000000,
        pengeluaran: 350000,
        saldo: 650000,
        rincianPemasukan: [{ kategoriId: 1, kategoriNama: "Iuran Warga", nominal: 1000000 }],
        rincianPengeluaran: [
          { kategoriId: 2, kategoriNama: "THR Tukang Sampah", nominal: 200000 },
          { kategoriId: 3, kategoriNama: "Keamanan RW", nominal: 150000 },
        ],
      },
    ],
    totalPemasukan: 1000000,
    totalPengeluaran: 350000,
    saldoPeriode: 650000,
    saldoAwal: 0,
    periodeLabel: "Januari 2026",
  })

  const content = Buffer.from(bytes).toString("latin1")
  const firstExpenseDetail = content.indexOf("THR Tukang Sampah")
  const totalExpense = content.indexOf("Total Pengeluaran")

  assert.notEqual(firstExpenseDetail, -1)
  assert.notEqual(totalExpense, -1)
  assert.ok(firstExpenseDetail < totalExpense)
})
