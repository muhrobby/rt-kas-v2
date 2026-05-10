"use client"

import { useMemo } from "react"

import { AppCombobox } from "@/components/kanvas"

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]

interface LaporanFiltersProps {
  year: number
  startMonth: number
  endMonth: number
  saldoAwal: number
  onYearChange: (value: number) => void
  onStartMonthChange: (value: number) => void
  onEndMonthChange: (value: number) => void
  onSaldoAwalChange: (value: number) => void
}

export function LaporanFilters({
  year,
  startMonth,
  endMonth,
  saldoAwal,
  onYearChange,
  onStartMonthChange,
  onEndMonthChange,
  onSaldoAwalChange,
}: LaporanFiltersProps) {
  const currentYear = new Date().getFullYear()
  const yearOptions = useMemo(() => {
    const years = []
    for (let y = currentYear + 1; y >= 2020; y--) {
      years.push({ id: String(y), label: String(y) })
    }
    return years
  }, [currentYear])

  const monthOptions = useMemo(
    () =>
      MONTH_NAMES.map((name, index) => ({
        id: String(index),
        label: name,
      })),
    [],
  )

  return (
    <section className="grid grid-cols-1 gap-2.5 rounded-xl border border-kanvas-line bg-white p-3.5 sm:grid-cols-2 lg:grid-cols-3">
      <label className="block">
        <p className="mb-1 text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Tahun</p>
        <AppCombobox
          value={String(year)}
          onChange={(val) => onYearChange(Number(val))}
          options={yearOptions}
          placeholder="Pilih tahun..."
        />
      </label>

      <label className="block">
        <p className="mb-1 text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Bulan Mulai</p>
        <AppCombobox
          value={String(startMonth)}
          onChange={(val) => onStartMonthChange(Number(val))}
          options={monthOptions}
          placeholder="Pilih bulan..."
        />
      </label>

      <label className="block">
        <p className="mb-1 text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Bulan Akhir</p>
        <AppCombobox
          value={String(endMonth)}
          onChange={(val) => onEndMonthChange(Number(val))}
          options={monthOptions}
          placeholder="Pilih bulan..."
        />
      </label>

      <label className="block">
        <p className="mb-1 text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Saldo Awal (Rp)</p>
        <input
          type="number"
          min={0}
          value={saldoAwal}
          onChange={(e) => {
            const val = Number(e.target.value)
            onSaldoAwalChange(Number.isFinite(val) && val >= 0 ? Math.floor(val) : 0)
          }}
          className="w-full rounded-lg border border-kanvas-line bg-white px-3 py-2 text-[13px] text-kanvas-ink focus:outline-none focus:ring-1 focus:ring-kanvas-terra"
        />
      </label>
    </section>
  )
}
