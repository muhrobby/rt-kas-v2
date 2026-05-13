"use client"

import { useEffect, useMemo, useState } from "react"

import { paginateItems } from "@/lib/pagination"
import { getTunggakanAction } from "@/lib/actions/tunggakan"
import { listKategoriAction } from "@/lib/actions/kategori"
import type { TunggakanWarga } from "@/types/rt-kas"
import type { TunggakanSummary as BackendTunggakanSummary } from "@/lib/services/tunggakan-service"

import { TunggakanDetailDialog } from "@/features/tunggakan/components/tunggakan-detail-dialog"
import { TunggakanFilters } from "@/features/tunggakan/components/tunggakan-filters"
import { TunggakanList } from "@/features/tunggakan/components/tunggakan-list"
import { TunggakanSummary } from "@/features/tunggakan/components/tunggakan-summary"

interface KategoriOption {
  id: number
  nama: string
}

function parsePeriode(periode: string): { bulan: number; tahun: number } {
  const [tahun, bulan] = periode.split("-").map(Number)
  return { bulan, tahun }
}

function mapBackendToTunggakanWarga(data: BackendTunggakanSummary["data"][number]): TunggakanWarga {
  return {
    warga: data.nama,
    blok: data.blok,
    items: data.items,
  }
}

export function TunggakanView() {
  const [kategoriId, setKategoriId] = useState("semua")
  const [periodeStart, setPeriodeStart] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
  })
  const [periodeEnd, setPeriodeEnd] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
  })
  const [selectedDetail, setSelectedDetail] = useState<TunggakanWarga | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const [kategoriOptions, setKategoriOptions] = useState<KategoriOption[]>([])
  const [backendData, setBackendData] = useState<BackendTunggakanSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadKategori() {
      const result = await listKategoriAction({ jenisArus: "masuk" })
      if (result.ok) {
        setKategoriOptions(
          result.data
            .filter((k) => k.jenisArus === "masuk")
            .map((k) => ({ id: k.id, nama: k.nama })),
        )
      }
    }
    loadKategori()
  }, [])

  useEffect(() => {
    async function loadTunggakan() {
      setError(null)

      const start = parsePeriode(periodeStart)
      const end = parsePeriode(periodeEnd)

      const filter: {
        bulanMulai: number
        tahunMulai: number
        bulanSelesai: number
        tahunSelesai: number
        kategoriId?: number
      } = {
        bulanMulai: start.bulan,
        tahunMulai: start.tahun,
        bulanSelesai: end.bulan,
        tahunSelesai: end.tahun,
      }

      if (kategoriId !== "semua") {
        filter.kategoriId = Number(kategoriId)
      }

      const result = await getTunggakanAction(filter)

      if (result.ok) {
        setBackendData(result.data)
      } else {
        setError(result.error)
      }
    }

    loadTunggakan()
  }, [kategoriId, periodeStart, periodeEnd, kategoriOptions])

  const tunggakanData: TunggakanWarga[] = useMemo(() => {
    if (!backendData) return []
    return backendData.data.map(mapBackendToTunggakanWarga)
  }, [backendData])

  const filteredData = tunggakanData

  const paginatedData = useMemo(() => {
    const result = paginateItems(filteredData, currentPage, 8)
    if (result.totalPages > 0 && currentPage > result.totalPages) {
      return paginateItems(filteredData, 1, 8)
    }
    return result
  }, [filteredData, currentPage])

  const totalNominal = backendData?.totalNominal ?? 0
  const jumlahWarga = backendData?.totalWarga ?? 0
  const periodeLabel = `${periodeStart} s/d ${periodeEnd}`

  return (
    <main className="space-y-3.5 p-6 md:p-7">
      <TunggakanFilters
        kategoriId={kategoriId}
        periodeStart={periodeStart}
        periodeEnd={periodeEnd}
        kategoriOptions={[
          { id: "semua", label: "Semua kategori" },
          ...kategoriOptions.map((k) => ({ id: String(k.id), label: k.nama })),
        ]}
        onKategoriChange={(val) => { setKategoriId(val); setCurrentPage(1) }}
        onPeriodeStartChange={(val) => { setPeriodeStart(val); setCurrentPage(1) }}
        onPeriodeEndChange={(val) => { setPeriodeEnd(val); setCurrentPage(1) }}
      />

      <TunggakanSummary totalNominal={totalNominal} jumlahWarga={jumlahWarga} periodeLabel={periodeLabel} />

      {error && (
        <div className="rounded-md border border-kanvas-danger-soft bg-kanvas-danger-soft px-4 py-3 text-sm text-kanvas-danger">
          {error}
        </div>
      )}

      <TunggakanList
        data={paginatedData.items}
        onOpenDetail={(item) => {
          setSelectedDetail(item)
          setDetailOpen(true)
        }}
        pagination={{
          page: paginatedData.page,
          totalPages: paginatedData.totalPages,
          totalItems: paginatedData.totalItems,
          startItem: paginatedData.startItem,
          endItem: paginatedData.endItem,
          onPageChange: setCurrentPage,
        }}
      />

      <TunggakanDetailDialog open={detailOpen} data={selectedDetail} onClose={() => setDetailOpen(false)} />
    </main>
  )
}
