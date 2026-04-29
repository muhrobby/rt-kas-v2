"use client"

import { AppModal } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"
import type { MonthlyCashflowRow } from "@/lib/services/laporan-service"

interface LaporanDetailModalProps {
  open: boolean
  onClose: () => void
  data: MonthlyCashflowRow | null
}

export function LaporanDetailModal({ open, onClose, data }: LaporanDetailModalProps) {
  if (!data) return null

  return (
    <AppModal open={open} onClose={onClose} width={480}>
      <div className="p-5">
        <h2 className="mb-4 text-lg font-semibold text-kanvas-ink">
          Rincian {data.bulan} {data.tahun}
        </h2>

        <div className="space-y-5">
          <div>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.6px] text-kanvas-ink-3">
              Rincian Pemasukan
            </h3>
            {data.rincianPemasukan && data.rincianPemasukan.length > 0 ? (
              <div className="space-y-1.5 rounded-lg border border-kanvas-line bg-white p-3">
                {data.rincianPemasukan.map((item) => (
                  <div key={item.kategoriId} className="flex justify-between text-[13px]">
                    <span className="text-kanvas-ink-2">{item.kategoriNama}</span>
                    <span className="font-medium text-kanvas-ink">{formatRupiah(item.nominal)}</span>
                  </div>
                ))}
                <div className="mt-2 border-t border-kanvas-line pt-2">
                  <div className="flex justify-between text-[13px] font-semibold">
                    <span>Total Pemasukan</span>
                    <span className="text-kanvas-success">{formatRupiah(data.pemasukan)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[12px] text-kanvas-ink-4">Tidak ada rincian pemasukan</p>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.6px] text-kanvas-ink-3">
              Rincian Pengeluaran
            </h3>
            {data.rincianPengeluaran && data.rincianPengeluaran.length > 0 ? (
              <div className="space-y-1.5 rounded-lg border border-kanvas-line bg-white p-3">
                {data.rincianPengeluaran.map((item) => (
                  <div key={item.kategoriId} className="flex justify-between text-[13px]">
                    <span className="text-kanvas-ink-2">{item.kategoriNama}</span>
                    <span className="font-medium text-kanvas-ink">{formatRupiah(item.nominal)}</span>
                  </div>
                ))}
                <div className="mt-2 border-t border-kanvas-line pt-2">
                  <div className="flex justify-between text-[13px] font-semibold">
                    <span>Total Pengeluaran</span>
                    <span className="text-kanvas-error">{formatRupiah(data.pengeluaran)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[12px] text-kanvas-ink-4">Tidak ada rincian pengeluaran</p>
            )}
          </div>

          <div className="rounded-lg border border-kanvas-line bg-kanvas-paper p-3">
            <div className="flex justify-between text-[14px] font-semibold">
              <span>Saldo Akhir Bulan</span>
              <span className="text-kanvas-ink">{formatRupiah(data.saldo)}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-kanvas-ink px-4 py-2 text-[13px] font-medium text-white hover:opacity-90"
          >
            Tutup
          </button>
        </div>
      </div>
    </AppModal>
  )
}
