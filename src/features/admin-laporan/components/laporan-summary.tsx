import { AppCard } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"

interface LaporanSummaryProps {
  totalMasuk: number
  totalKeluar: number
  saldoPeriode: number
}

export function LaporanSummary({ totalMasuk, totalKeluar, saldoPeriode }: LaporanSummaryProps) {
  return (
    <section className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
      <AppCard className="p-4">
        <p className="text-[11px] font-semibold tracking-[0.6px] text-[var(--kanvas-ink-4)] uppercase">Total Masuk</p>
        <p className="mt-1 text-2xl font-semibold text-[var(--kanvas-ink)]">{formatRupiah(totalMasuk)}</p>
      </AppCard>
      <AppCard className="p-4">
        <p className="text-[11px] font-semibold tracking-[0.6px] text-[var(--kanvas-ink-4)] uppercase">Total Keluar</p>
        <p className="mt-1 text-2xl font-semibold text-[var(--kanvas-ink)]">{formatRupiah(totalKeluar)}</p>
      </AppCard>
      <AppCard className="p-4">
        <p className="text-[11px] font-semibold tracking-[0.6px] text-[var(--kanvas-ink-4)] uppercase">Saldo Periode</p>
        <p className="mt-1 text-2xl font-semibold text-[var(--kanvas-ink)]">{formatRupiah(saldoPeriode)}</p>
      </AppCard>
    </section>
  )
}
