"use client"

import { AppButton, AppInput, KanvasIcons } from "@/components/kanvas"

import type { KategoriArusFilter, KategoriTipeFilter } from "@/features/kategori-kas/lib/kategori-filters"

interface KategoriToolbarProps {
  query: string
  arus: KategoriArusFilter
  tipe: KategoriTipeFilter
  onQueryChange: (value: string) => void
  onArusChange: (value: KategoriArusFilter) => void
  onTipeChange: (value: KategoriTipeFilter) => void
  onAdd: () => void
}

export function KategoriToolbar({ query, arus, tipe, onQueryChange, onArusChange, onTipeChange, onAdd }: KategoriToolbarProps) {
  return (
    <section className="space-y-2.5 rounded-xl border border-kanvas-line bg-white p-3.5">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <AppInput
          value={query}
          onChange={onQueryChange}
          leading={<KanvasIcons.search size={14} />}
          placeholder="Cari nama kategori..."
          className="flex-1"
        />
        <AppButton variant="primary" leading={<KanvasIcons.plus size={13} />} onClick={onAdd}>
          Tambah Kategori
        </AppButton>
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex rounded-lg border border-kanvas-line bg-kanvas-paper p-0.5">
          {[
            { id: "semua", label: "Semua" },
            { id: "masuk", label: "Masuk" },
            { id: "keluar", label: "Keluar" },
          ].map((option) => {
            const active = arus === option.id
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onArusChange(option.id as KategoriArusFilter)}
                className="rounded-md px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: active ? "#ffffff" : "transparent",
                  color: active ? "var(--kanvas-terra)" : "var(--kanvas-ink-3)",
                }}
              >
                {option.label}
              </button>
            )
          })}
        </div>

        <div className="inline-flex rounded-lg border border-kanvas-line bg-kanvas-paper p-0.5">
          {[
            { id: "semua", label: "Semua Tipe" },
            { id: "bulanan", label: "Bulanan" },
            { id: "sekali", label: "Sekali" },
          ].map((option) => {
            const active = tipe === option.id
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onTipeChange(option.id as KategoriTipeFilter)}
                className="rounded-md px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: active ? "#ffffff" : "transparent",
                  color: active ? "var(--kanvas-terra)" : "var(--kanvas-ink-3)",
                }}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
