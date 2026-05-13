"use client"

import { AppCombobox, AppInput } from "@/components/kanvas"
import type { AppComboboxOption } from "@/components/kanvas/app-combobox"

interface TunggakanFiltersProps {
  kategoriId: string
  periodeStart: string
  periodeEnd: string
  kategoriOptions: AppComboboxOption[]
  onKategoriChange: (value: string) => void
  onPeriodeStartChange: (value: string) => void
  onPeriodeEndChange: (value: string) => void
}

export function TunggakanFilters({
  kategoriId,
  periodeStart,
  periodeEnd,
  kategoriOptions,
  onKategoriChange,
  onPeriodeStartChange,
  onPeriodeEndChange,
}: TunggakanFiltersProps) {
  return (
    <section className="grid grid-cols-1 gap-2.5 rounded-xl border border-kanvas-line bg-white p-3.5 lg:grid-cols-3">
      <div>
        <p className="mb-1 text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Kategori</p>
        <AppCombobox
          value={kategoriId}
          onChange={onKategoriChange}
          options={kategoriOptions}
          placeholder="Semua kategori"
        />
      </div>

      <label className="block">
        <p className="mb-1 text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Periode Mulai</p>
        <AppInput type="month" value={periodeStart} onChange={onPeriodeStartChange} max={periodeEnd || undefined} />
      </label>

      <label className="block">
        <p className="mb-1 text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Periode Akhir</p>
        <AppInput type="month" value={periodeEnd} onChange={onPeriodeEndChange} min={periodeStart || undefined} />
      </label>
    </section>
  )
}
