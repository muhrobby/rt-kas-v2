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
  onYearChange: (value: number) => void
  onStartMonthChange: (value: number) => void
  onEndMonthChange: (value: number) => void
}

export function LaporanFilters({
  year,
  startMonth,
  endMonth,
  onYearChange,
  onStartMonthChange,
  onEndMonthChange,
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
    <section className="grid grid-cols-1 gap-2.5 rounded-xl border border-[var(--kanvas-line)] bg-white p-3.5 sm:grid-cols-2 lg:grid-cols-3">
      <label className="block">
        <p className="mb-1 text-[11px] font-semibold tracking-[0.6px] text-[var(--kanvas-ink-4)] uppercase">Tahun</p>
        <AppCombobox
          value={String(year)}
          onChange={(val) => onYearChange(Number(val))}
          options={yearOptions}
          placeholder="Pilih tahun..."
        />
      </label>

      <label className="block">
        <p className="mb-1 text-[11px] font-semibold tracking-[0.6px] text-[var(--kanvas-ink-4)] uppercase">Bulan Mulai</p>
        <AppCombobox
          value={String(startMonth)}
          onChange={(val) => onStartMonthChange(Number(val))}
          options={monthOptions}
          placeholder="Pilih bulan..."
        />
      </label>

      <label className="block">
        <p className="mb-1 text-[11px] font-semibold tracking-[0.6px] text-[var(--kanvas-ink-4)] uppercase">Bulan Akhir</p>
        <AppCombobox
          value={String(endMonth)}
          onChange={(val) => onEndMonthChange(Number(val))}
          options={monthOptions}
          placeholder="Pilih bulan..."
        />
      </label>
    </section>
  )
}
