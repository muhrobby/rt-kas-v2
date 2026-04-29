"use client"

import { useMemo, useState } from "react"

import { AppButton, AppCard, AppModal, KanvasIcons } from "@/components/kanvas"
import { PaginationControls } from "@/components/shared/pagination-controls"
import { formatRupiah } from "@/lib/format/currency"
import type { TunggakanWarga } from "@/types/rt-kas"
import { paginateItems } from "@/lib/pagination"

import { calculateTotalByWarga } from "@/features/tunggakan/lib/tunggakan-calculations"

interface TunggakanDetailDialogProps {
  open: boolean
  data: TunggakanWarga | null
  onClose: () => void
}

const ITEMS_PER_PAGE = 5

export function TunggakanDetailDialog({ open, data, onClose }: TunggakanDetailDialogProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const paginatedData = useMemo(() => {
    if (!data?.items) {
      return paginateItems([], 1, ITEMS_PER_PAGE)
    }
    const result = paginateItems(data.items, currentPage, ITEMS_PER_PAGE)
    if (result.totalPages > 0 && currentPage > result.totalPages) {
      return paginateItems(data.items, 1, ITEMS_PER_PAGE)
    }
    return result
  }, [data, currentPage])

  const totalNominal = data ? calculateTotalByWarga(data) : 0

  return (
    <AppModal open={open} onClose={onClose} width={560}>
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.7px] text-kanvas-ink-4 uppercase">Detail Tunggakan</p>
            <h2 className="mt-1 text-2xl text-kanvas-ink">{data?.warga ?? "-"}</h2>
            <p className="text-[12px] text-kanvas-ink-4">Blok {data?.blok ?? "-"}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-kanvas-ink-3" aria-label="Tutup dialog detail tunggakan">
            <KanvasIcons.x size={18} />
          </button>
        </div>

        <AppCard className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[400px] lg:min-w-full">
              <div className="grid grid-cols-[1fr_100px_130px] border-b border-kanvas-line bg-kanvas-paper px-4 py-2 text-[10px] font-bold tracking-[0.7px] text-kanvas-ink-3 uppercase">
                <div>Kategori</div>
                <div className="text-center">Periode</div>
                <div className="text-right">Nominal</div>
              </div>

              <div>
                {paginatedData.items.map((item, index) => (
                  <div
                    key={`${item.kategori}-${item.periode}-${index}`}
                    className="grid grid-cols-[1fr_100px_130px] items-center border-b border-kanvas-line-2 px-4 py-2.5 text-[13px] text-kanvas-ink-2 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-kanvas-ink">{item.kategori}</p>
                    </div>
                    <p className="text-center text-[12px] text-kanvas-ink-3">{item.periode}</p>
                    <p className="text-right font-semibold text-kanvas-ink">{formatRupiah(item.nominal)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <PaginationControls
            page={paginatedData.page}
            totalPages={paginatedData.totalPages}
            totalItems={paginatedData.totalItems}
            startItem={paginatedData.startItem}
            endItem={paginatedData.endItem}
            onPageChange={(page) => setCurrentPage(page)}
            itemLabel="item"
          />
        </AppCard>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-kanvas-line bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="text-[12px] font-bold tracking-[0.5px] text-kanvas-ink-3 uppercase">Total Tunggakan</p>
            <span className="text-[11px] text-kanvas-ink-4">({data?.items.length ?? 0} item)</span>
          </div>
          <p className="text-[15px] font-bold text-kanvas-ink">{formatRupiah(totalNominal)}</p>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <AppButton variant="outline" onClick={onClose}>
            Tutup
          </AppButton>
          <AppButton variant="primary" leading={<KanvasIcons.whatsapp size={13} />}>
            WhatsApp Tagihan
          </AppButton>
        </div>
      </div>
    </AppModal>
  )
}