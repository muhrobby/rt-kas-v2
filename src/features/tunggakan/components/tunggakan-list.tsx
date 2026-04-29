"use client"

import { AppButton, AppCard, AppPill } from "@/components/kanvas"
import { PaginationControls } from "@/components/shared/pagination-controls"
import { formatRupiah } from "@/lib/format/currency"
import type { TunggakanWarga } from "@/types/rt-kas"

import { calculateTotalByWarga } from "@/features/tunggakan/lib/tunggakan-calculations"

interface TunggakanListProps {
  data: TunggakanWarga[]
  onOpenDetail: (item: TunggakanWarga) => void
  pagination?: {
    page: number
    totalPages: number
    totalItems: number
    startItem: number
    endItem: number
    onPageChange: (page: number) => void
  }
}

export function TunggakanList({ data, onOpenDetail, pagination }: TunggakanListProps) {
  return (
    <AppCard className="overflow-hidden p-0">
      <div className="lg:hidden">
        {data.length > 0 ? (
          data.map((warga) => {
            const total = calculateTotalByWarga(warga)
            const itemCount = warga.items.length
            return (
              <div key={`${warga.warga}-${warga.blok}`} className="border-b border-[var(--kanvas-line-2)] px-4 py-3 last:border-b-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[var(--kanvas-ink)]">{warga.warga}</p>
                    <p className="text-[11px] text-[var(--kanvas-ink-4)]">Blok {warga.blok}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <AppPill tone="warn">{itemCount} tunggakan</AppPill>
                    <p className="text-[13px] font-semibold text-[var(--kanvas-ink)]">{formatRupiah(total)}</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <AppButton variant="outline" size="sm" onClick={() => onOpenDetail(warga)}>
                    Detail
                  </AppButton>
                </div>
              </div>
            )
          })
        ) : (
          <div className="px-4 py-10 text-center text-[13px] text-[var(--kanvas-ink-4)]">Tidak ada tunggakan untuk filter ini</div>
        )}
      </div>

      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-[1fr_120px_130px_90px] border-b border-[var(--kanvas-line)] bg-[var(--kanvas-paper)] px-4 py-2.5 text-[10px] font-bold tracking-[0.7px] text-[var(--kanvas-ink-3)] uppercase">
              <div>Nama Warga</div>
              <div className="text-center">Jumlah</div>
              <div className="text-right">Total Tunggakan</div>
              <div className="text-right">Aksi</div>
            </div>

            <div>
              {data.length > 0 ? (
                data.map((warga) => {
                  const total = calculateTotalByWarga(warga)
                  const itemCount = warga.items.length
                  return (
                    <div
                      key={`${warga.warga}-${warga.blok}`}
                      className="grid grid-cols-[1fr_120px_130px_90px] items-center border-b border-[var(--kanvas-line-2)] px-4 py-2.5 text-[13px] text-[var(--kanvas-ink-2)]"
                    >
                      <div>
                        <p className="font-semibold text-[var(--kanvas-ink)]">{warga.warga}</p>
                        <p className="text-[11px] text-[var(--kanvas-ink-4)]">Blok {warga.blok}</p>
                      </div>

                      <div className="flex justify-center">
                        <AppPill tone="warn">{itemCount}</AppPill>
                      </div>

                      <p className="text-right font-semibold text-[var(--kanvas-ink)]">{formatRupiah(total)}</p>

                      <div className="flex justify-end">
                        <AppButton variant="outline" size="sm" onClick={() => onOpenDetail(warga)}>
                          Detail
                        </AppButton>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="px-4 py-10 text-center text-[13px] text-[var(--kanvas-ink-4)]">Tidak ada tunggakan untuk filter ini</div>
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
          itemLabel="warga"
        />
      ) : null}
    </AppCard>
  )
}