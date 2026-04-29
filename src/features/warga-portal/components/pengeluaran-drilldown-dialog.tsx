"use client"

import { AppButton, AppModal, KanvasIcons } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"
import type { ExpenseBreakdownItem } from "@/types/rt-kas"

interface PengeluaranDrilldownDialogProps {
  open: boolean
  monthLabel: string
  rows: ExpenseBreakdownItem[]
  onClose: () => void
}

export function PengeluaranDrilldownDialog({ open, monthLabel, rows, onClose }: PengeluaranDrilldownDialogProps) {
  const total = rows.reduce((sum, row) => sum + row.nominal, 0)

  return (
    <AppModal open={open} onClose={onClose} width={500}>
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.6px] text-[var(--kanvas-ink-4)] uppercase">Rincian Pengeluaran</p>
            <h2 className="mt-1 text-[22px] text-[var(--kanvas-ink)]">{monthLabel}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-[var(--kanvas-ink-3)]" aria-label="Tutup rincian pengeluaran">
            <KanvasIcons.x size={18} />
          </button>
        </div>

        <div className="space-y-2">
          {rows.length > 0 ? rows.map((row) => (
            <div key={`${monthLabel}-${row.kategori}`} className="flex flex-col gap-1 rounded-lg border border-[var(--kanvas-line)] bg-[var(--kanvas-paper-2)] px-3 py-2.5 text-[12px] sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[var(--kanvas-ink-3)]">{row.kategori}</span>
              <span className="font-semibold text-[var(--kanvas-ink)]">{formatRupiah(row.nominal)}</span>
            </div>
          )) : (
            <div className="rounded-lg border border-dashed border-[var(--kanvas-line)] bg-[var(--kanvas-paper-2)] px-3 py-2.5 text-[12px] text-[var(--kanvas-ink-3)]">
              Tidak ada pengeluaran pada bulan ini.
            </div>
          )}
        </div>

        <div className="mt-3.5 flex items-center justify-between rounded-lg border border-[var(--kanvas-line)] bg-white px-3 py-2.5">
          <p className="text-[11px] font-semibold tracking-[0.6px] text-[var(--kanvas-ink-4)] uppercase">Total Pengeluaran</p>
          <p className="text-[14px] font-semibold text-[var(--kanvas-ink)]">{formatRupiah(total)}</p>
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <AppButton variant="outline" onClick={onClose}>
            Tutup
          </AppButton>
        </div>
      </div>
    </AppModal>
  )
}
