import { AppCard, AppPill } from "@/components/kanvas"
import { PaginationControls } from "@/components/shared/pagination-controls"
import type { LogAktivitas } from "@/types/rt-kas"

interface LogTableProps {
  rows: LogAktivitas[]
  pagination?: {
    page: number
    totalPages: number
    totalItems: number
    startItem: number
    endItem: number
    onPageChange: (page: number) => void
  }
}

function toneByModul(modul: string): "terra" | "plum" | "olive" {
  if (modul === "Kas Masuk") {
    return "terra"
  }
  if (modul === "Kas Keluar") {
    return "plum"
  }
  return "olive"
}

export function LogTable({ rows, pagination }: LogTableProps) {
  return (
    <AppCard className="overflow-hidden p-0">
      <div className="lg:hidden">
        {rows.length > 0 ? (
          rows.map((row) => (
            <div key={`${row.tanggalWaktu}-${row.detail}`} className="border-b border-kanvas-line-2 px-4 py-3 last:border-b-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13px] font-semibold text-kanvas-ink">{row.petugas}</p>
                <AppPill tone={toneByModul(row.modul)}>{row.modul}</AppPill>
                <p className="text-[11px] font-semibold uppercase text-kanvas-ink-3">{row.aksi}</p>
              </div>
              <p className="mt-1 break-words text-[12px] text-kanvas-ink-3">{row.detail}</p>
              <p className="mt-1 text-[11px] text-kanvas-ink-4">{row.tanggalWaktu}</p>
            </div>
          ))
        ) : (
          <div className="px-4 py-10 text-center text-[13px] text-kanvas-ink-4">Tidak ada log untuk filter ini</div>
        )}
      </div>

      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            <div className="grid grid-cols-[150px_1fr_0.8fr_0.6fr_2fr] border-b border-kanvas-line bg-kanvas-paper px-4 py-2.5 text-[10px] font-bold tracking-[0.7px] text-kanvas-ink-3 uppercase">
              <div>Waktu</div>
              <div>Petugas</div>
              <div>Modul</div>
              <div>Aksi</div>
              <div>Detail</div>
            </div>

            <div>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <div
                    key={`${row.tanggalWaktu}-${row.detail}`}
                    className="grid grid-cols-[150px_1fr_0.8fr_0.6fr_2fr] items-center border-b border-kanvas-line-2 px-4 py-2.5 text-[13px] text-kanvas-ink-2"
                  >
                    <p className="text-[12px] text-kanvas-ink-3">{row.tanggalWaktu}</p>
                    <p className="font-semibold text-kanvas-ink">{row.petugas}</p>
                    <div>
                      <AppPill tone={toneByModul(row.modul)}>{row.modul}</AppPill>
                    </div>
                    <p className="uppercase">{row.aksi}</p>
                    <p className="text-[12px] text-kanvas-ink-3">{row.detail}</p>
                  </div>
                ))
              ) : (
                <div className="px-4 py-10 text-center text-[13px] text-kanvas-ink-4">Tidak ada log untuk filter ini</div>
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
          itemLabel="log"
        />
      ) : null}
    </AppCard>
  )
}
