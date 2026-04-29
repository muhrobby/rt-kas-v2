"use client"

import { AppInput } from "@/components/kanvas"

interface TunggakanFiltersProps {
  kategori: string
  periodeStart: string
  periodeEnd: string
  kategoriOptions: string[]
  onKategoriChange: (value: string) => void
  onPeriodeStartChange: (value: string) => void
  onPeriodeEndChange: (value: string) => void
}

export function TunggakanFilters({
  kategori,
  periodeStart,
  periodeEnd,
  kategoriOptions,
  onKategoriChange,
  onPeriodeStartChange,
  onPeriodeEndChange,
}: TunggakanFiltersProps) {
  return (
    <section className="grid grid-cols-1 gap-2.5 rounded-xl border border-[var(--kanvas-line)] bg-white p-3.5 lg:grid-cols-3">
      <label className="block">
        <p className="mb-1 text-[11px] font-semibold tracking-[0.6px] text-[var(--kanvas-ink-4)] uppercase">Kategori</p>
        <select
          value={kategori}
          onChange={(event) => onKategoriChange(event.target.value)}
          className="h-[42px] w-full rounded-lg border border-[var(--kanvas-line)] bg-white px-3 text-[13px] text-[var(--kanvas-ink)] outline-none"
        >
          <option value="semua">Semua kategori</option>
          {kategoriOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <p className="mb-1 text-[11px] font-semibold tracking-[0.6px] text-[var(--kanvas-ink-4)] uppercase">Periode Mulai</p>
        <AppInput type="month" value={periodeStart} onChange={onPeriodeStartChange} />
      </label>

      <label className="block">
        <p className="mb-1 text-[11px] font-semibold tracking-[0.6px] text-[var(--kanvas-ink-4)] uppercase">Periode Akhir</p>
        <AppInput type="month" value={periodeEnd} onChange={onPeriodeEndChange} />
      </label>
    </section>
  )
}
