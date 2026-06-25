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

  const handleDownloadPDF = () => {
    // Build simple HTML content and print-to-PDF via window.print
    const content = `
      <html><head>
      <title>Rincian Pengeluaran ${monthLabel}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; color: #1f2937; }
        h2 { font-size: 18px; margin-bottom: 4px; }
        p.subtitle { color: #6b7280; font-size: 10px; margin-bottom: 16px; }
        .category { margin-bottom: 12px; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }
        .cat-header { background: #f8fafc; padding: 8px 12px; display: flex; justify-content: space-between; font-weight: bold; }
        .item { padding: 5px 12px 5px 20px; display: flex; justify-content: space-between; border-top: 1px solid #f3f4f6; font-size: 11px; color: #374151; }
        .item span.ket { color: #6b7280; }
        .total { margin-top: 16px; padding: 8px 12px; background: #1f2937; color: white; border-radius: 6px; display: flex; justify-content: space-between; font-weight: bold; }
        @media print { body { padding: 10px; } }
      </style>
      </head><body>
      <h2>Rincian Pengeluaran</h2>
      <p class="subtitle">${monthLabel} · Transparansi Kas RT</p>
      ${rows.map(row => `
        <div class="category">
          <div class="cat-header">
            <span>${row.kategori}</span>
            <span>${formatRupiah(row.nominal)}</span>
          </div>
          ${(row.items ?? []).map(item => `
            <div class="item">
              <span class="ket">${item.tanggal} · ${item.keterangan ?? '—'}</span>
              <span>${formatRupiah(item.nominal)}</span>
            </div>
          `).join('')}
        </div>
      `).join('')}
      <div class="total">
        <span>TOTAL PENGELUARAN</span>
        <span>${formatRupiah(total)}</span>
      </div>
      </body></html>
    `
    const win = window.open("", "_blank")
    if (win) {
      win.document.write(content)
      win.document.close()
      win.focus()
      setTimeout(() => win.print(), 300)
    }
  }

  return (
    <AppModal open={open} onClose={onClose} width={560}>
      <div className="p-4 sm:p-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Rincian Pengeluaran</p>
            <h2 className="mt-1 text-[20px] text-kanvas-ink">{monthLabel}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-kanvas-ink-3" aria-label="Tutup">
            <KanvasIcons.x size={18} />
          </button>
        </div>

        <div className="max-h-[55vh] space-y-2 overflow-y-auto">
          {rows.length > 0 ? rows.map((row) => (
            <div key={row.kategori} className="rounded-lg border border-kanvas-line overflow-hidden">
              {/* Kategori header */}
              <div className="flex items-center justify-between bg-kanvas-paper-2 px-3 py-2.5">
                <span className="text-[13px] font-semibold text-kanvas-ink">{row.kategori}</span>
                <span className="text-[13px] font-semibold text-kanvas-danger">{formatRupiah(row.nominal)}</span>
              </div>
              {/* Individual items */}
              {(row.items ?? []).length > 0 && (
                <div className="divide-y divide-kanvas-line-2">
                  {(row.items ?? []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2 text-[12px]">
                      <div className="min-w-0">
                        <span className="text-kanvas-ink-3">{item.tanggal}</span>
                        {item.keterangan && (
                          <span className="ml-2 text-kanvas-ink-2">{item.keterangan}</span>
                        )}
                      </div>
                      <span className="ml-3 font-semibold text-kanvas-ink shrink-0">{formatRupiah(item.nominal)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )) : (
            <div className="rounded-lg border border-dashed border-kanvas-line bg-kanvas-paper-2 px-3 py-4 text-[12px] text-kanvas-ink-3 text-center">
              Tidak ada pengeluaran pada bulan ini.
            </div>
          )}
        </div>

        <div className="mt-3.5 flex items-center justify-between rounded-lg border border-kanvas-line bg-white px-3 py-2.5">
          <p className="text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Total Pengeluaran</p>
          <p className="text-[14px] font-semibold text-kanvas-danger">{formatRupiah(total)}</p>
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {rows.length > 0 && (
            <AppButton variant="outline" size="sm" leading={<KanvasIcons.download size={13} />} onClick={handleDownloadPDF}>
              Download PDF
            </AppButton>
          )}
          <AppButton variant="ghost" onClick={onClose}>
            Tutup
          </AppButton>
        </div>
      </div>
    </AppModal>
  )
}
