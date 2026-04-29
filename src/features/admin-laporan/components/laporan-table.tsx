"use client"

import { AppCard, KanvasIcons } from "@/components/kanvas"
import { PaginationControls } from "@/components/shared/pagination-controls"
import { formatRupiah } from "@/lib/format/currency"
import type { MonthlyCashflowRow } from "@/lib/services/laporan-service"

interface LaporanTableProps {
  rows: MonthlyCashflowRow[]
  pagination?: {
    page: number
    totalPages: number
    totalItems: number
    startItem: number
    endItem: number
    onPageChange: (page: number) => void
  }
  onDetailClick?: (row: MonthlyCashflowRow) => void
}

export function LaporanTable({ rows, pagination, onDetailClick }: LaporanTableProps) {
  return (
    <AppCard className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_40px] border-b border-[var(--kanvas-line)] bg-[var(--kanvas-paper)] px-4 py-2.5 text-[10px] font-bold tracking-[0.7px] text-[var(--kanvas-ink-3)] uppercase">
            <div>Bulan</div>
            <div className="text-right">Pemasukan</div>
            <div className="text-right">Pengeluaran</div>
            <div className="text-right">Saldo</div>
            <div className="text-center">Detail</div>
          </div>

          <div>
            {rows.map((row) => (
              <div key={`lap-${row.bulan}-${row.tahun}`} className="grid grid-cols-[1fr_1fr_1fr_1fr_40px] items-center border-b border-[var(--kanvas-line-2)] px-4 py-2.5 text-[13px] text-[var(--kanvas-ink-2)] last:border-b-0">
                <p className="font-semibold text-[var(--kanvas-ink)]">{row.bulan} {row.tahun}</p>
                <p className="text-right">{formatRupiah(row.pemasukan)}</p>
                <p className="text-right">{formatRupiah(row.pengeluaran)}</p>
                <p className="text-right font-semibold text-[var(--kanvas-ink)]">{formatRupiah(row.saldo)}</p>
                <div className="flex justify-center">
                  <button
                    onClick={() => onDetailClick?.(row)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--kanvas-ink-3)] hover:bg-[var(--kanvas-line)] hover:text-[var(--kanvas-ink)]"
                    title="Lihat rincian"
                  >
                    <KanvasIcons.chevronR size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {pagination ? (
        <PaginationControls
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          startItem={pagination.startItem}
          endItem={pagination.endItem}
          onPageChange={pagination.onPageChange}
          itemLabel="bulan"
        />
      ) : null}
    </AppCard>
  )
}
