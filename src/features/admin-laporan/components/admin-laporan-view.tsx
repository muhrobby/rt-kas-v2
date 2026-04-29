"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { ExportButtons } from "@/components/shared/export-buttons"
import { paginateItems } from "@/lib/pagination"
import { getLaporanAction } from "@/lib/actions/laporan"
import { generateLaporanPDF } from "@/lib/export/pdf"
import type { LaporanResult, MonthlyCashflowRow } from "@/lib/services/laporan-service"

import { LaporanFilters } from "@/features/admin-laporan/components/laporan-filters"
import { LaporanSummary } from "@/features/admin-laporan/components/laporan-summary"
import { LaporanTable } from "@/features/admin-laporan/components/laporan-table"
import { LaporanDetailModal } from "@/features/admin-laporan/components/laporan-detail-modal"

const PAGE_SIZE = 6
const saldoAwal = 12480000

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]

export function AdminLaporanView() {
  const [year, setYear] = useState(2026)
  const [startMonth, setStartMonth] = useState(0)
  const [endMonth, setEndMonth] = useState(3)
  const [currentPage, setCurrentPage] = useState(1)
  const [laporanData, setLaporanData] = useState<LaporanResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailModal, setDetailModal] = useState<{ open: boolean; data: MonthlyCashflowRow | null }>({
    open: false,
    data: null,
  })

  useEffect(() => {
    let cancelled = false

    const loadLaporan = async () => {
      try {
        const result = await getLaporanAction({
          startMonth,
          startYear: year,
          endMonth,
          endYear: year,
          saldoAwal,
        })

        if (cancelled) return

        if (result.ok) {
          setLaporanData(result.data)
          setError(null)
        } else {
          setError(result.error ?? "Gagal memuat laporan")
        }
      } catch {
        if (!cancelled) {
          setError("Terjadi kesalahan server")
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadLaporan()

    return () => {
      cancelled = true
    }
  }, [year, startMonth, endMonth])

  const filteredRows = useMemo(() => {
    if (!laporanData?.rows) return []
    return laporanData.rows
  }, [laporanData])

  const paginatedRows = useMemo(() => {
    const result = paginateItems(filteredRows, currentPage, PAGE_SIZE)
    if (result.totalPages > 0 && currentPage > result.totalPages) {
      return paginateItems(filteredRows, 1, PAGE_SIZE)
    }
    return result
  }, [filteredRows, currentPage])

  const totals = useMemo(() => {
    if (!laporanData) return { totalMasuk: 0, totalKeluar: 0, saldoPeriode: 0 }
    return {
      totalMasuk: laporanData.totalPemasukan,
      totalKeluar: laporanData.totalPengeluaran,
      saldoPeriode: laporanData.saldoPeriode,
    }
  }, [laporanData])

  const handleDetailClick = useCallback((row: MonthlyCashflowRow) => {
    setDetailModal({ open: true, data: row })
  }, [])

  const handleExportExcel = useCallback(() => {
    const params = new URLSearchParams({
      startMonth: String(startMonth),
      startYear: String(year),
      endMonth: String(endMonth),
      endYear: String(year),
      saldoAwal: String(saldoAwal),
    })
    window.open(`/api/export/laporan?${params.toString()}`, "_blank")
  }, [year, startMonth, endMonth])

  const handleExportPDF = useCallback(() => {
    if (!filteredRows.length) return
    generateLaporanPDF({
      rows: filteredRows,
      totalPemasukan: totals.totalMasuk,
      totalPengeluaran: totals.totalKeluar,
      saldoPeriode: totals.saldoPeriode,
      saldoAwal,
      periodeLabel: `${MONTH_NAMES[startMonth]} ${year} - ${MONTH_NAMES[endMonth]} ${year}`,
    })
  }, [filteredRows, totals, startMonth, endMonth, year])

  return (
    <main className="space-y-3.5 p-6 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] text-[var(--kanvas-ink-3)]">Rekap laporan keuangan kas RT</p>
        <ExportButtons contextLabel="laporan" onExportExcel={handleExportExcel} onExportPDF={handleExportPDF} />
      </div>

      <LaporanFilters
        year={year}
        startMonth={startMonth}
        endMonth={endMonth}
        onYearChange={(val) => { setYear(val); setCurrentPage(1) }}
        onStartMonthChange={(value) => { setStartMonth(Math.max(0, Math.min(11, value))); setCurrentPage(1) }}
        onEndMonthChange={(value) => { setEndMonth(Math.max(0, Math.min(11, value))); setCurrentPage(1) }}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-[13px] text-[var(--kanvas-ink-4)]">Memuat...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-[13px] text-red-500">{error}</p>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-[13px] text-[var(--kanvas-ink-4)]">Tidak ada data untuk periode ini</p>
        </div>
      ) : (
        <>
          <LaporanSummary totalMasuk={totals.totalMasuk} totalKeluar={totals.totalKeluar} saldoPeriode={totals.saldoPeriode} />

          <LaporanTable
            rows={paginatedRows.items}
            pagination={{
              page: paginatedRows.page,
              totalPages: paginatedRows.totalPages,
              totalItems: paginatedRows.totalItems,
              startItem: paginatedRows.startItem,
              endItem: paginatedRows.endItem,
              onPageChange: setCurrentPage,
            }}
            onDetailClick={handleDetailClick}
          />
        </>
      )}

      <LaporanDetailModal
        open={detailModal.open}
        onClose={() => setDetailModal({ open: false, data: null })}
        data={detailModal.data}
      />
    </main>
  )
}
