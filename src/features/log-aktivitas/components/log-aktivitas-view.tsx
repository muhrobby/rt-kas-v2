"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { ExportButtons } from "@/components/shared/export-buttons"
import { paginateItems } from "@/lib/pagination"
import { getLogAktivitasAction, getLogFiltersAction } from "@/lib/actions/log-aktivitas"
import type { LogAktivitas } from "@/types/rt-kas"

import { LogFilters } from "@/features/log-aktivitas/components/log-filters"
import { LogTable } from "@/features/log-aktivitas/components/log-table"
import type { LogFilterState } from "@/features/log-aktivitas/lib/log-filters"

const PAGE_SIZE = 10

const initialFilters: LogFilterState = {
  modul: "semua",
  aksi: "semua",
  petugas: "semua",
  tanggal: "",
  query: "",
}

export function LogAktivitasView() {
  const [filters, setFilters] = useState<LogFilterState>(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [logData, setLogData] = useState<{ data: LogAktivitas[]; total: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modulOptions, setModulOptions] = useState<string[]>([])
  const [aksiOptions, setAksiOptions] = useState<string[]>([])
  const [petugasOptions, setPetugasOptions] = useState<{ id: string; nama: string }[]>([])

  // Fetch filter options once on mount
  useEffect(() => {
    getLogFiltersAction().then((result) => {
      if (result.ok) {
        setModulOptions(result.data.modul)
        setAksiOptions(result.data.aksi)
        setPetugasOptions(result.data.petugas)
      }
    })
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadLogAktivitas = async () => {
      try {
        const result = await getLogAktivitasAction({
          modul: filters.modul === "semua" ? undefined : filters.modul,
          aksi: filters.aksi === "semua" ? undefined : filters.aksi,
          petugas: filters.petugas === "semua" ? undefined : filters.petugas,
          tanggal: filters.tanggal || undefined,
          query: filters.query || undefined,
          limit: 1000,
          offset: 0,
        })

        if (cancelled) return

        if (result.ok) {
          setLogData(result.data)
          setError(null)
        } else {
          setError(result.error ?? "Gagal memuat log aktivitas")
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

    void loadLogAktivitas()

    return () => {
      cancelled = true
    }
  }, [filters])

  const filteredRows = useMemo(() => {
    if (!logData?.data) return []
    let rows = logData.data

    const query = filters.query.trim().toLowerCase()
    if (query) {
      rows = rows.filter(
        (item) =>
          item.detail.toLowerCase().includes(query) ||
          item.petugas.toLowerCase().includes(query),
      )
    }

    return rows
  }, [logData, filters.query])

  const paginatedRows = useMemo(() => {
    const result = paginateItems(filteredRows, currentPage, PAGE_SIZE)
    if (result.totalPages > 0 && currentPage > result.totalPages) {
      return paginateItems(filteredRows, 1, PAGE_SIZE)
    }
    return result
  }, [filteredRows, currentPage])

  const handleExportExcel = useCallback(() => {
    const params = new URLSearchParams()
    if (filters.modul !== "semua") params.append("modul", filters.modul)
    if (filters.aksi !== "semua") params.append("aksi", filters.aksi)
    if (filters.petugas !== "semua") params.append("petugas", filters.petugas)
    if (filters.tanggal) params.append("tanggal", filters.tanggal)
    if (filters.query) params.append("query", filters.query)
    window.open(`/api/export/log-aktivitas?${params.toString()}`, "_blank")
  }, [filters])

  return (
    <main className="space-y-3.5 p-6 md:p-7">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] text-kanvas-ink-3">Riwayat aktivitas pengurus dan transaksi</p>
        <ExportButtons contextLabel="log aktivitas" onExportExcel={handleExportExcel} hidePdf />
      </div>

      <LogFilters
        filters={filters}
        modulOptions={modulOptions}
        aksiOptions={aksiOptions}
        petugasOptions={petugasOptions}
        onChange={(patch) => {
          setFilters((state) => ({ ...state, ...patch }))
          setCurrentPage(1)
        }}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-[13px] text-kanvas-ink-4">Memuat...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-[13px] text-kanvas-danger">{error}</p>
        </div>
      ) : (
        <LogTable
          rows={paginatedRows.items}
          pagination={{
            page: paginatedRows.page,
            totalPages: paginatedRows.totalPages,
            totalItems: paginatedRows.totalItems,
            startItem: paginatedRows.startItem,
            endItem: paginatedRows.endItem,
            onPageChange: setCurrentPage,
          }}
        />
      )}
    </main>
  )
}
