import { formatRupiah } from "@/lib/format/currency"

export interface BarsInOutItem {
  bulan: string
  pemasukan: number
  pengeluaran: number
}

interface BarsInOutChartProps {
  data: BarsInOutItem[]
  max?: number
  height?: number
  barWidth?: number
  gap?: number
}

export function BarsInOutChart({
  data,
  max,
  height = 140,
  barWidth = 22,
  gap = 10,
}: BarsInOutChartProps) {
  const maxValue = max ?? Math.max(...data.flatMap((entry) => [entry.pemasukan, entry.pengeluaran]), 1) * 1.1

  return (
    <div>
      <div className="flex items-end border-b border-[var(--kanvas-line)] px-1" style={{ gap, height }}>
        {data.map((entry) => (
          <div key={entry.bulan} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-full items-end gap-1">
              <div
                title={`Pemasukan ${formatRupiah(entry.pemasukan)}`}
                className="rounded-t-[3px] bg-[var(--kanvas-terra)]"
                style={{ width: barWidth, minHeight: 2, height: `${(entry.pemasukan / maxValue) * 100}%` }}
              />
              <div
                title={`Pengeluaran ${formatRupiah(entry.pengeluaran)}`}
                className="rounded-t-[3px] bg-[var(--kanvas-ink-3)] opacity-85"
                style={{ width: barWidth, minHeight: 2, height: `${(entry.pengeluaran / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex px-1 pt-1.5" style={{ gap }}>
        {data.map((entry) => (
          <div key={`axis-${entry.bulan}`} className="flex-1 text-center text-[10px] font-medium tracking-[0.4px] text-[var(--kanvas-ink-4)] uppercase">
            {entry.bulan}
          </div>
        ))}
      </div>
    </div>
  )
}
