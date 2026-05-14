"use client"

import { AppButton, AppCombobox, AppPill, KanvasIcons } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"

interface WargaOption {
  id: string
  label: string
}

interface KasMasukToolbarProps {
  totalTransaksi: number
  totalNominal: number
  onOpenForm: () => void
  // Filter props
  wargaOptions: WargaOption[]
  filterWargaId: string
  filterTahun: string
  onFilterWargaChange: (id: string) => void
  onFilterTahunChange: (tahun: string) => void
  onResetFilter: () => void
}

const currentYear = new Date().getFullYear()
const tahunOptions = Array.from({ length: currentYear - 2019 }, (_, i) => {
  const y = String(currentYear - i)
  return { id: y, label: y }
})

export function KasMasukToolbar({
  totalTransaksi,
  totalNominal,
  onOpenForm,
  wargaOptions,
  filterWargaId,
  filterTahun,
  onFilterWargaChange,
  onFilterTahunChange,
  onResetFilter,
}: KasMasukToolbarProps) {
  const hasFilter = filterWargaId !== "" || filterTahun !== ""

  return (
    <section className="space-y-2.5 rounded-xl border border-kanvas-line bg-white p-3.5">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <AppPill tone="ok">{totalTransaksi} transaksi</AppPill>
          <AppPill tone="neutral">Total {formatRupiah(totalNominal)}</AppPill>
        </div>
        <AppButton variant="primary" leading={<KanvasIcons.plus size={13} />} onClick={onOpenForm}>
          Input Pembayaran
        </AppButton>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-kanvas-line-2 pt-2.5">
        <div className="w-full sm:w-56">
          <AppCombobox
            options={[{ id: "", label: "Semua warga" }, ...wargaOptions]}
            value={filterWargaId}
            onChange={onFilterWargaChange}
            placeholder="Filter warga..."
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
