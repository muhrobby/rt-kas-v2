"use client"

import { AppButton, AppInput, KanvasIcons } from "@/components/kanvas"

import type { WargaStatusFilter } from "@/features/warga-management/types"

interface WargaToolbarProps {
  query: string
  status: WargaStatusFilter
  onQueryChange: (value: string) => void
  onStatusChange: (value: WargaStatusFilter) => void
  onAdd: () => void
}

const statusOptions: Array<{ id: WargaStatusFilter; label: string }> = [
  { id: "semua", label: "Semua" },
  { id: "tetap", label: "Tetap" },
  { id: "kontrak", label: "Kontrak" },
]

export function WargaToolbar({ query, status, onQueryChange, onStatusChange, onAdd }: WargaToolbarProps) {
  return (
    <section className="rounded-xl border border-kanvas-line bg-white p-3.5">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <AppInput
          value={query}
          onChange={onQueryChange}
          leading={<KanvasIcons.search size={14} />}
          placeholder="Cari nama, blok, atau no. telepon..."
          className="flex-1"
        />

        <div className="inline-flex w-full rounded-lg border border-kanvas-line bg-kanvas-paper p-0.5 lg:w-auto">
          {statusOptions.map((option) => {
            const active = status === option.id
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onStatusChange(option.id)}
                className="rounded-md px-3 py-1.5 text-xs font-semibold transition"
                style={{
                  background: active ? "#ffffff" : "transparent",
                  color: active ? "var(--kanvas-terra)" : "var(--kanvas-ink-3)",
                  boxShadow: active ? "0 1px 2px rgba(31,59,99,0.12)" : "none",
                }}
              >
                {option.label}
              </button>
            )
          })}
        </div>

        <AppButton variant="primary" leading={<KanvasIcons.plus size={13} />} onClick={onAdd}>
          Tambah Warga
        </AppButton>
      </div>
    </section>
  )
}
