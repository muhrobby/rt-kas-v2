"use client"

import { AppCard, AppPill } from "@/components/kanvas"
import { formatNumber } from "@/lib/format/number"
import { formatRupiah } from "@/lib/format/currency"

function MetricCard({
  label,
  value,
  hint,
  accent,
  trend,
}: {
  label: string
  value: string
  hint: string
  accent: string
  trend?: number
}) {
  return (
    <AppCard className="relative overflow-hidden p-[18px] pb-4">
      <div className="absolute top-0 left-0 h-[3px] w-full" style={{ background: accent }} />
      <p className="text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">{label}</p>
      <p className="mt-1.5 break-words text-2xl leading-tight font-semibold text-kanvas-ink">{value}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11.5px] text-kanvas-ink-3">
        {typeof trend === "number" ? <AppPill tone={trend > 0 ? "ok" : "danger"}>{`${trend > 0 ? "+" : ""}${trend}%`}</AppPill> : null}
        <span>{hint}</span>
      </div>
    </AppCard>
  )
}

interface DashboardMetricsProps {
  saldoKas: number
  pemasukanBulanIni: number
  pengeluaranBulanIni: number
  totalWargaAktif: number
}

const currentDate = new Date()
const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString("id-ID", { month: "short" }) } ${currentDate.getFullYear()}`

export function DashboardMetrics({ saldoKas, pemasukanBulanIni, pengeluaranBulanIni, totalWargaAktif }: DashboardMetricsProps) {
  return (
    <section className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Saldo Kas" value={formatRupiah(saldoKas)} hint={`per ${formattedDate}`} accent="var(--kanvas-terra)" />
      <MetricCard
        label="Pemasukan Bulan Ini"
        value={formatRupiah(pemasukanBulanIni)}
        hint="bulan berjalan"
        accent="var(--kanvas-info)"
      />
      <MetricCard
        label="Pengeluaran Bulan Ini"
        value={formatRupiah(pengeluaranBulanIni)}
        hint="bulan berjalan"
        accent="var(--kanvas-terra-2)"
      />
      <MetricCard label="Warga Aktif" value={formatNumber(totalWargaAktif)} hint="terdaftar" accent="var(--kanvas-ink-3)" />
    </section>
  )
}
