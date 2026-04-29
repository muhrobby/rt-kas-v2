"use client"

import { AppCard, AppButton, KanvasIcons } from "@/components/kanvas"
import { PaginationControls } from "@/components/shared/pagination-controls"
import { formatRupiah } from "@/lib/format/currency"
import type { TransaksiKas } from "@/types/rt-kas"
import type { TransaksiUi } from "@/features/kas-masuk/lib/kas-masuk-actions-client"

interface RecentKasMasukTableProps {
  transactions: (TransaksiKas | TransaksiUi)[]
  onOpenKuitansi?: (transaksiId: number) => void
  pagination?: {
    page: number
    totalPages: number
    totalItems: number
    startItem: number
    endItem: number
    onPageChange: (page: number) => void
  }
}

export function RecentKasMasukTable({ transactions, onOpenKuitansi, pagination }: RecentKasMasukTableProps) {
  return (
    <AppCard className="overflow-hidden p-0">
      <div className="lg:hidden">
        {transactions.length > 0 ? (
          transactions.map((trx) => (
            <div key={trx.id} className="border-b border-kanvas-line-2 px-4 py-3 last:border-b-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-kanvas-ink">{trx.wargaNama ?? "-"}</p>
                  <p className="text-[10.5px] text-kanvas-ink-4">{trx.blok ?? "-"}</p>
                </div>
                <p className="text-right text-[13px] font-semibold text-kanvas-ink">{formatRupiah(trx.nominal)}</p>
              </div>

              <div className="mt-2 space-y-1 text-[12px] text-kanvas-ink-3">
                <p>
                  <span className="font-semibold text-kanvas-ink-2">Kategori:</span> {trx.kategoriNama}
                </p>
                <p>
                  <span className="font-semibold text-kanvas-ink-2">Tanggal:</span> {trx.tanggal}
                </p>
                <p>
                  <span className="font-semibold text-kanvas-ink-2">Periode:</span> {trx.periodeLabel ?? "-"}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <AppButton
                  variant="outline"
                  size="sm"
                  leading={<KanvasIcons.receipt size={12} />}
                  onClick={() => onOpenKuitansi?.(Number(trx.id))}
                >
                  Kuitansi
                </AppButton>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-10 text-center text-[13px] text-kanvas-ink-4">Belum ada transaksi kas masuk</div>
        )}
      </div>

      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[90px_1.4fr_1.3fr_1fr_1fr_110px] border-b border-kanvas-line bg-kanvas-paper px-4 py-2.5 text-[10px] font-bold tracking-[0.7px] text-kanvas-ink-3 uppercase">
              <div>Tgl</div>
              <div>Warga</div>
              <div>Kategori</div>
              <div>Periode</div>
              <div className="text-right">Nominal</div>
              <div className="text-right">Aksi</div>
            </div>

            <div>
              {transactions.length > 0 ? (
                transactions.map((trx) => (
                  <div
                    key={trx.id}
                    className="grid grid-cols-[90px_1.4fr_1.3fr_1fr_1fr_110px] items-center border-b border-kanvas-line-2 px-4 py-2.5 text-[13px] text-kanvas-ink-2"
                  >
                    <p className="text-[12px] text-kanvas-ink-3">{trx.tanggal}</p>

                    <div>
                      <p className="font-semibold text-kanvas-ink">{trx.wargaNama ?? "-"}</p>
                      <p className="text-[10.5px] text-kanvas-ink-4">{trx.blok ?? "-"}</p>
                    </div>

                    <p>{trx.kategoriNama}</p>
                    <p className="text-[12px] text-kanvas-ink-3">{trx.periodeLabel ?? "-"}</p>
                    <p className="text-right font-semibold text-kanvas-ink">{formatRupiah(trx.nominal)}</p>

                    <div className="flex justify-end">
                      <AppButton
                        variant="outline"
                        size="sm"
                        leading={<KanvasIcons.receipt size={12} />}
                        onClick={() => onOpenKuitansi?.(Number(trx.id))}
                      >
                        Kuitansi
                      </AppButton>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-10 text-center text-[13px] text-kanvas-ink-4">Belum ada transaksi kas masuk</div>
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
