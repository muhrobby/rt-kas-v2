"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

import { AppButton, AppCard, AppPill, KanvasIcons } from "@/components/kanvas"
import { PaginationControls } from "@/components/shared/pagination-controls"
import { paginateItems } from "@/lib/pagination"

const STATUS_TONE: Record<string, "ok" | "warn" | "terra" | "neutral"> = {
  AKTIF: "ok",
  BALANCING: "warn",
  SELESAI: "terra",
  DRAFT: "neutral",
  DIBATALKAN: "neutral",
}

export type PanitiaEventRow = {
  id: number
  nama: string
  tanggalPelaksanaan: string
  status: string
}

interface PanitiaEventListViewProps {
  rows: PanitiaEventRow[]
}

const PAGE_SIZE = 8

export function PanitiaEventListView({ rows }: PanitiaEventListViewProps) {
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterStatus && r.status !== filterStatus) return false
      if (search && !r.nama.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [rows, search, filterStatus])

  const paginated = paginateItems(filtered, page, PAGE_SIZE)

  return (
    <main className="space-y-3.5 p-4 md:p-6">
      <section>
        <h1 className="text-[22px] md:text-[24px] text-kanvas-ink">Event Saya</h1>
        <p className="text-[12px] text-kanvas-ink-3">Daftar event di mana Anda ditunjuk sebagai panitia.</p>
      </section>

      {/* Toolbar */}
      <section className="space-y-2.5 rounded-xl border border-kanvas-line bg-white p-3.5">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <KanvasIcons.search className="absolute left-3 top-1/2 -translate-y-1/2 text-kanvas-ink-4" size={13} />
            <input
              className="w-full rounded-lg border border-kanvas-line bg-white py-1.5 pl-9 pr-3 text-[13px] text-kanvas-ink placeholder:text-kanvas-ink-4 focus:border-kanvas-terra focus:outline-none"
              placeholder="Cari nama event..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select
            className="rounded-lg border border-kanvas-line bg-white px-3 py-1.5 text-[13px] text-kanvas-ink"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
          >
            <option value="">Semua Status</option>
            <option value="DRAFT">Draft</option>
            <option value="AKTIF">Aktif</option>
            <option value="BALANCING">Balancing</option>
            <option value="SELESAI">Selesai</option>
            <option value="DIBATALKAN">Dibatalkan</option>
          </select>
        </div>
      </section>

      {/* Mobile cards */}
      <div className="space-y-2 lg:hidden">
        {paginated.items.length === 0 && (
          <AppCard className="p-6 text-center text-[13px] text-kanvas-ink-4">
            {rows.length === 0 ? "Belum ada event yang ditugaskan kepada Anda." : "Tidak ada event sesuai filter."}
          </AppCard>
        )}
        {paginated.items.map((e) => (
          <AppCard key={e.id} className="p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-[14px] text-kanvas-ink truncate">{e.nama}</p>
                <p className="text-[11px] text-kanvas-ink-3 mt-0.5">{e.tanggalPelaksanaan}</p>
              </div>
              <AppPill tone={STATUS_TONE[e.status] ?? "neutral"}>{e.status}</AppPill>
            </div>
            <div className="mt-3 border-t border-kanvas-line pt-2.5">
              <Link href={`/panitia/event/${e.id}`}>
                <AppButton variant="outline" size="sm" leading={<KanvasIcons.arrowR size={12} />}>
                  Lihat Detail
                </AppButton>
              </Link>
            </div>
          </AppCard>
        ))}
      </div>

      {/* Desktop table */}
      <AppCard className="hidden overflow-hidden p-0 lg:block">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-kanvas-line bg-kanvas-paper-2 text-[11px] text-kanvas-ink-3">
              <th className="px-3 py-2.5 font-medium">Nama Event</th>
              <th className="px-3 py-2.5 font-medium">Tanggal</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-3 py-2.5 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginated.items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-[12px] text-kanvas-ink-4">
                  {rows.length === 0 ? "Belum ada event yang ditugaskan kepada Anda." : "Tidak ada event sesuai filter."}
                </td>
              </tr>
            )}
            {paginated.items.map((e) => (
              <tr key={e.id} className="border-b border-kanvas-line-2 last:border-b-0 hover:bg-kanvas-paper-2/50">
                <td className="px-3 py-2.5 font-semibold text-kanvas-ink">{e.nama}</td>
                <td className="px-3 py-2.5 text-[12px] text-kanvas-ink-3">{e.tanggalPelaksanaan}</td>
                <td className="px-3 py-2.5">
                  <AppPill tone={STATUS_TONE[e.status] ?? "neutral"}>{e.status}</AppPill>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex justify-end">
                    <Link href={`/panitia/event/${e.id}`}>
                      <AppButton variant="outline" size="sm" leading={<KanvasIcons.arrowR size={12} />}>
                        Detail
                      </AppButton>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AppCard>

      {paginated.totalPages > 1 && (
        <PaginationControls
          page={paginated.page}
          totalPages={paginated.totalPages}
          totalItems={paginated.totalItems}
          startItem={paginated.startItem}
          endItem={paginated.endItem}
          onPageChange={setPage}
          itemLabel="event"
        />
      )}
    </main>
  )
}
