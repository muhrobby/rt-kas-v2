"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { formatRupiah } from "@/lib/format/currency"
import type { MonthlyCashflow } from "@/types/rt-kas"

interface BarsInOutChartProps {
  data: MonthlyCashflow[]
  height?: number
}

function formatYAxis(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(".0", "")}jt`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`
  return String(value)
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-kanvas-line bg-white px-3 py-2 shadow-md text-[12px]">
      <p className="mb-1.5 font-semibold text-kanvas-ink">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {formatRupiah(entry.value)}
        </p>
      ))}
    </div>
  )
}

export function BarsInOutChart({ data, height = 220 }: BarsInOutChartProps) {
  const hasData = data.some((d) => d.pemasukan > 0 || d.pengeluaran > 0)

  if (!hasData) {
    return (
      <div className="flex items-center justify-center border border-dashed border-kanvas-line rounded-lg" style={{ height }}>
        <p className="text-[12px] text-kanvas-ink-4">Belum ada transaksi pada periode ini</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--kanvas-line)" />
        <XAxis
          dataKey="bulan"
          tick={{ fontSize: 11, fill: "var(--kanvas-ink-4)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatYAxis}
          tick={{ fontSize: 11, fill: "var(--kanvas-ink-4)" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--kanvas-paper-2)" }} />
        <Bar dataKey="pemasukan" name="Pemasukan" fill="var(--kanvas-terra)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="pengeluaran" name="Pengeluaran" fill="var(--kanvas-ink-3)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
