"use client"

import { AppCombobox, AppInput } from "@/components/kanvas"
import type { AppComboboxOption } from "@/components/kanvas"

import type { LogFilterState } from "@/features/log-aktivitas/lib/log-filters"

interface LogFiltersProps {
  filters: LogFilterState
  modulOptions: string[]
  aksiOptions: string[]
  petugasOptions: { id: string; nama: string }[]
  onChange: (patch: Partial<LogFilterState>) => void
}

export function LogFilters({ filters, modulOptions, aksiOptions, petugasOptions, onChange }: LogFiltersProps) {
  const modulComboOptions: AppComboboxOption[] = [
    { id: "semua", label: "Semua" },
    ...modulOptions.map((m) => ({ id: m, label: m })),
  ]

  const aksiComboOptions: AppComboboxOption[] = [
    { id: "semua", label: "Semua" },
    ...aksiOptions.map((a) => ({ id: a, label: a })),
  ]

  const petugasComboOptions: AppComboboxOption[] = [
    { id: "semua", label: "Semua" },
    ...petugasOptions.map((p) => ({ id: p.id, label: p.nama })),
  ]

  return (
    <section className="grid grid-cols-1 gap-2.5 rounded-xl border border-kanvas-line bg-white p-3.5 lg:grid-cols-5">
      <div>
        <p className="mb-1 text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Modul</p>
        <AppCombobox value={filters.modul} onChange={(value) => onChange({ modul: value })} options={modulComboOptions} placeholder="Semua" />
      </div>

      <div>
        <p className="mb-1 text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Aksi</p>
        <AppCombobox value={filters.aksi} onChange={(value) => onChange({ aksi: value })} options={aksiComboOptions} placeholder="Semua" />
      </div>

      <div>
        <p className="mb-1 text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Petugas</p>
        <AppCombobox value={filters.petugas} onChange={(value) => onChange({ petugas: value })} options={petugasComboOptions} placeholder="Semua" />
      </div>

      <label>
        <p className="mb-1 text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Tanggal</p>
        <AppInput type="date" value={filters.tanggal} onChange={(value) => onChange({ tanggal: value })} />
      </label>

      <label>
        <p className="mb-1 text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Cari Detail</p>
        <AppInput value={filters.query} onChange={(value) => onChange({ query: value })} placeholder="Cari detail/petugas" />
      </label>
    </section>
  )
}
