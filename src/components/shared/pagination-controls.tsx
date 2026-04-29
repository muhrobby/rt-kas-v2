"use client"

import { KanvasIcons } from "@/components/kanvas"

interface PaginationControlsProps {
  page: number
  totalPages: number
  totalItems: number
  startItem: number
  endItem: number
  onPageChange: (page: number) => void
  itemLabel: string
}

export function PaginationControls({
  page,
  totalPages,
  totalItems,
  startItem,
  endItem,
  onPageChange,
  itemLabel,
}: PaginationControlsProps) {
  if (totalItems === 0) {
    return null
  }

  const canGoPrev = page > 1
  const canGoNext = page < totalPages

  return (
    <div className="flex flex-col gap-2 border-t border-kanvas-line-2 px-4 py-2.5 text-[11.5px] text-kanvas-ink-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="leading-relaxed">
        Menampilkan {startItem}-{endItem} dari {totalItems} {itemLabel}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-1 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={!canGoPrev}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-kanvas-line bg-white text-kanvas-ink-2 transition hover:bg-kanvas-paper disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Halaman sebelumnya"
          >
            <KanvasIcons.chevronL size={12} />
          </button>

          <span className="px-1.5 text-[11.5px]">
            {page} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={!canGoNext}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-kanvas-line bg-white text-kanvas-ink-2 transition hover:bg-kanvas-paper disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Halaman berikutnya"
          >
            <KanvasIcons.chevronR size={12} />
          </button>
        </div>
      )}
    </div>
  )
}
