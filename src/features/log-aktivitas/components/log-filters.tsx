"use client"

import { AppInput } from "@/components/kanvas"

import type { LogFilterState } from "@/features/log-aktivitas/lib/log-filters"

interface LogFiltersProps {
  filters: LogFilterState
  modulOptions: string[]
  aksiOptions: string[]
  petugasOptions: string[]
  onChange: (patch: Partial<LogFilterState>) => void
}

export function LogFilters({ filters, modulOptions, aksiOptions, petugasOptions, onChange }: LogFiltersProps) {
  return (
    <section className="grid grid-cols-1 gap-2.5 rounded-xl border border-kanvas-line bg-white p-3.5 lg:grid-cols-5">
      <label>
        <p className="mb-1 text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Modul</p>
        <select
          value={filters.modul}
          onChange={(event) => onChange({ modul: event.target.value })}
          className="h-[42px] w-full rounded-lg border border-kanvas-line bg-white px-3 text-[13px] text-kanvas-ink"
        >
          <option value="semua">Semua</option>
          {modulOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        <p className="mb-1 text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Aksi</p>
        <select
          value={filters.aksi}
          onChange={(event) => onChange({ aksi: event.target.value })}
          className="h-[42px] w-full rounded-lg border border-kanvas-line bg-white px-3 text-[13px] text-kanvas-ink"
        >
          <option value="semua">Semua</option>
          {aksiOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        <p className="mb-1 text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Petugas</p>
        <select
          value={filters.petugas}
          onChange={(event) => onChange({ petugas: event.target.value })}
          className="h-[42px] w-full rounded-lg border border-kanvas-line bg-white px-3 text-[13px] text-kanvas-ink"
        >
          <option value="semua">Semua</option>
          {petugasOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

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
