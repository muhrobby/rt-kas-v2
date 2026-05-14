"use client"

import { BarsInOutChart, AppCard } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"

interface CashflowEntry {
  bulan: string
  tahun: number
  bulanNum: number
  pemasukan: number
  pengeluaran: number
}

interface CashflowSaldoEntry {
  bulan: string
  pemasukan: number
  pengeluaran: number
  saldo: number
}

interface CashflowCardProps {
  cashflowBulanan: CashflowEntry[]
  cashflowDenganSaldo: CashflowSaldoEntry[]
}

export function CashflowCard({ cashflowBulanan, cashflowDenganSaldo }: CashflowCardProps) {
  return (
    <AppCard className="p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2.5">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Arus Kas</p>
          <p className="mt-0.5 text-xl text-kanvas-ink">Pemasukan vs Pengeluaran</p>
        </div>
        <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[11.5px] text-kanvas-ink-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-kanvas-terra" />
            Pemasukan
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-kanvas-ink-3" />
            Pengeluaran
          </span>
        </div>
      </div>

      <BarsInOutChart
        data={cashflowBulanan.map((entry) => ({
          bulan: entry.bulan,
          pemasukan: entry.pemasukan,
          pengeluaran: entry.pengeluaran,
        }))}
        height={220}
      />

      {/* Saldo bulanan: scroll horizontal agar tidak overflow di mobile */}
      <div className="mt-4 border-t border-kanvas-line-2 pt-3">
        <div className="overflow-x-auto">
          <div className="flex min-w-max gap-x-4 pb-1">
            {cashflowDenganSaldo.map((entry) => (
              <div key={`saldo-${entry.bulan}`} className="min-w-[64px] text-center">
                <p className="text-[10px] font-semibold tracking-[0.5px] text-kanvas-ink-4 uppercase">Saldo {entry.bulan}</p>
                <p className="mt-0.5 text-[13px] font-semibold text-kanvas-ink">{formatRupiah(entry.saldo ?? 0)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppCard>
  )
}
