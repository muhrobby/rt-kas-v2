"use client"

import { useState } from "react"

import { BarsInOutChart, AppCard, AppPill } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"
import type { WargaLaporanTransparansi } from "@/lib/services/warga-portal-service"

import { PengeluaranDrilldownDialog } from "@/features/warga-portal/components/pengeluaran-drilldown-dialog"

interface WargaLaporanViewProps {
  data: WargaLaporanTransparansi
}

export function WargaLaporanView({ data }: WargaLaporanViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(data.cashflowDenganSaldo[0]?.bulan ?? "Jan")
  const [drilldownOpen, setDrilldownOpen] = useState(false)
  const ytdDelta = data.summary.selisihYtd
  const ytdLabel = `${ytdDelta >= 0 ? "+" : ""}${formatRupiah(ytdDelta)}`

  return (
    <main className="space-y-3.5 p-4 md:p-6">
        <section>
          <h1 className="text-[24px] text-kanvas-ink">Transparansi Kas</h1>
          <p className="text-[12px] text-kanvas-ink-3">Rekap kas RT {data.tahun}, terbuka untuk seluruh warga.</p>
        </section>

      <section className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <AppCard className="p-3">
          <p className="text-[10px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Saldo Kas</p>
          <p className="mt-1 text-[22px] text-kanvas-ink">{formatRupiah(data.summary.saldoKas)}</p>
        </AppCard>
        <AppCard className="p-3">
          <p className="text-[10px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Selisih YTD</p>
          <p className="mt-1 text-[22px] text-kanvas-info">{ytdLabel}</p>
        </AppCard>
      </section>

      <AppCard className="p-3.5">
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-[16px] text-kanvas-ink">Pemasukan vs Pengeluaran</p>
          <span className="text-[11px] text-kanvas-ink-3">Jan - Des {data.tahun}</span>
        </div>
        <BarsInOutChart data={data.monthlyCashflow} height={122} barWidth={20} gap={16} />
      </AppCard>

      <section>
        <h2 className="mb-2 text-[16px] text-kanvas-ink">Ringkasan Bulanan</h2>
        <div className="space-y-2">
          {data.cashflowDenganSaldo.map((row) => (
            <AppCard key={`row-${row.bulan}`} className="p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[13px] font-semibold text-kanvas-ink">{row.bulan} {data.tahun}</p>
                  <p className="text-[11px] text-kanvas-ink-4">Saldo {formatRupiah(row.saldo ?? 0)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <AppPill tone="ok">+{formatRupiah(row.pemasukan).replace("Rp ", "")}</AppPill>
                  <AppPill tone="danger">-{formatRupiah(row.pengeluaran).replace("Rp ", "")}</AppPill>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMonth(row.bulan)
                      setDrilldownOpen(true)
                    }}
                    className="text-[11px] font-semibold text-kanvas-terra"
                  >
                    Rincian
                  </button>
                </div>
              </div>
            </AppCard>
          ))}
        </div>
      </section>

      <PengeluaranDrilldownDialog
        open={drilldownOpen}
        monthLabel={`${selectedMonth} ${data.tahun}`}
        rows={data.breakdownPengeluaran[selectedMonth] ?? []}
        onClose={() => setDrilldownOpen(false)}
      />
    </main>
  )
}
