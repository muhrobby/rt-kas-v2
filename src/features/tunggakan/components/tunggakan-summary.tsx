import { AppCard, AppPill } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"

interface TunggakanSummaryProps {
  totalNominal: number
  jumlahWarga: number
  periodeLabel: string
}

export function TunggakanSummary({ totalNominal, jumlahWarga, periodeLabel }: TunggakanSummaryProps) {
  return (
    <section className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
      <AppCard className="p-4">
        <p className="text-[11px] font-semibold tracking-[0.6px] text-[var(--kanvas-ink-4)] uppercase">Total Tunggakan</p>
        <p className="mt-1 text-2xl font-semibold text-[var(--kanvas-ink)]">{formatRupiah(totalNominal)}</p>
      </AppCard>

      <AppCard className="p-4">
        <p className="text-[11px] font-semibold tracking-[0.6px] text-[var(--kanvas-ink-4)] uppercase">Warga Menunggak</p>
        <p className="mt-1 text-2xl font-semibold text-[var(--kanvas-ink)]">{jumlahWarga}</p>
      </AppCard>

      <AppCard className="p-4">
        <p className="text-[11px] font-semibold tracking-[0.6px] text-[var(--kanvas-ink-4)] uppercase">Periode Aktif</p>
        <div className="mt-1">
          <AppPill tone="neutral">{periodeLabel}</AppPill>
        </div>
      </AppCard>
    </section>
  )
}
