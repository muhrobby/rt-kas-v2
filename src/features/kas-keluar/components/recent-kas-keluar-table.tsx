"use client"

import { AppCard } from "@/components/kanvas"
import { PaginationControls } from "@/components/shared/pagination-controls"
import { formatRupiah } from "@/lib/format/currency"
import type { TransaksiKas } from "@/types/rt-kas"
import type { TransaksiKeluarUi } from "@/features/kas-keluar/lib/kas-keluar-actions-client"

interface RecentKasKeluarTableProps {
  transactions: (TransaksiKas | TransaksiKeluarUi)[]
  pagination?: {
    page: number
    totalPages: number
    totalItems: number
    startItem: number
    endItem: number
    onPageChange: (page: number) => void
  }
}

export function RecentKasKeluarTable({ transactions, pagination }: RecentKasKeluarTableProps) {
  return (
    <AppCard className="overflow-hidden p-0">
      <div className="lg:hidden">
        {transactions.length > 0 ? (
          transactions.map((trx) => (
            <div key={trx.id} className="border-b border-kanvas-line-2 px-4 py-3 last:border-b-0">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13px] font-semibold text-kanvas-ink">{trx.kategoriNama}</p>
                <p className="text-right text-[13px] font-semibold text-kanvas-ink">{formatRupiah(trx.nominal)}</p>
              </div>

              <div className="mt-2 space-y-1 text-[12px] text-kanvas-ink-3">
                <p>
                  <span className="font-semibold text-kanvas-ink-2">Tanggal:</span> {trx.tanggal}
                </p>
                <p>
                  <span className="font-semibold text-kanvas-ink-2">Periode:</span> {trx.periodeLabel ?? trx.tanggal}
                </p>
                <p className="break-words">
                  <span className="font-semibold text-kanvas-ink-2">Catatan:</span> {trx.catatan ?? "-"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-10 text-center text-[13px] text-kanvas-ink-4">Belum ada transaksi kas keluar</div>
        )}
      </div>

      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[100px_1.4fr_1fr_1fr_1.2fr] border-b border-kanvas-line bg-kanvas-paper px-4 py-2.5 text-[10px] font-bold tracking-[0.7px] text-kanvas-ink-3 uppercase">
              <div>Tanggal</div>
              <div>Kategori</div>
              <div>Periode</div>
              <div className="text-right">Nominal</div>
              <div>Catatan</div>
            </div>

            <div>
              {transactions.length > 0 ? (
                transactions.map((trx) => (
                  <div
                    key={trx.id}
                    className="grid grid-cols-[100px_1.4fr_1fr_1fr_1.2fr] items-center border-b border-kanvas-line-2 px-4 py-2.5 text-[13px] text-kanvas-ink-2"
                  >
                    <p className="text-[12px] text-kanvas-ink-3">{trx.tanggal}</p>
                    <p className="font-semibold text-kanvas-ink">{trx.kategoriNama}</p>
                    <p className="text-[12px] text-kanvas-ink-3">{trx.periodeLabel ?? trx.tanggal}</p>
                    <p className="text-right font-semibold text-kanvas-ink">{formatRupiah(trx.nominal)}</p>
                    <p className="text-[12px] text-kanvas-ink-3">{trx.catatan ?? "-"}</p>
                  </div>
                ))
              ) : (
                <div className="px-4 py-10 text-center text-[13px] text-kanvas-ink-4">Belum ada transaksi kas keluar</div>
              )}
            </div>
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
          itemLabel="transaksi"
        />
      ) : null}
    </AppCard>
  )
}
