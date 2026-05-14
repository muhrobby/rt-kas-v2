"use client"

import { AppButton, AppCombobox, AppPill, KanvasIcons } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"

interface KategoriOption {
  id: string
  label: string
}

interface KasKeluarToolbarProps {
  totalTransaksi: number
  totalNominal: number
  onOpenForm: () => void
  // Filter props
  kategoriOptions: KategoriOption[]
  filterKategoriId: string
  filterTahun: string
  onFilterKategoriChange: (id: string) => void
  onFilterTahunChange: (tahun: string) => void
  onResetFilter: () => void
}

const currentYear = new Date().getFullYear()
const tahunOptions = Array.from({ length: currentYear - 2019 }, (_, i) => {
  const y = String(currentYear - i)
  return { id: y, label: y }
})

export function KasKeluarToolbar({
  totalTransaksi,
  totalNominal,
  onOpenForm,
  kategoriOptions,
  filterKategoriId,
  filterTahun,
  onFilterKategoriChange,
  onFilterTahunChange,
  onResetFilter,
}: KasKeluarToolbarProps) {
  const hasFilter = filterKategoriId !== "" || filterTahun !== ""

  return (
    <section className="space-y-2.5 rounded-xl border border-kanvas-line bg-white p-3.5">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <AppPill tone="plum">{totalTransaksi} pengeluaran</AppPill>
          <AppPill tone="neutral">Total {formatRupiah(totalNominal)}</AppPill>
        </div>
        <AppButton variant="primary" leading={<KanvasIcons.plus size={13} />} onClick={onOpenForm}>
          Input Pengeluaran
        </AppButton>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-kanvas-line-2 pt-2.5">
        <div className="w-full sm:w-52">
          <AppCombobox
            options={[{ id: "", label: "Semua kategori" }, ...kategoriOptions]}
            value={filterKategoriId}
            onChange={onFilterKategoriChange}
            placeholder="Filter kategori..."
          />
        </div>
        <div className="w-32">
          <AppCombobox
            options={[{ id: "", label: "Semua tahun" }, ...tahunOptions]}
            value={filterTahun}
            onChange={onFilterTahunChange}
            placeholder="Tahun..."
          />
        </div>
        {hasFilter ? (
          <button
            type="button"
            onClick={onResetFilter}
            className="text-[12px] font-semibold text-kanvas-terra"
          >
            Reset
          </button>
        ) : null}
      </div>
    </section>
  )
}
