"use client"

import { AppButton, AppPill, KanvasIcons } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"

interface KasMasukToolbarProps {
  totalTransaksi: number
  totalNominal: number
  onOpenForm: () => void
}

export function KasMasukToolbar({ totalTransaksi, totalNominal, onOpenForm }: KasMasukToolbarProps) {
  return (
    <section className="flex flex-col gap-2.5 rounded-xl border border-[var(--kanvas-line)] bg-white p-3.5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <AppPill tone="ok">{totalTransaksi} transaksi</AppPill>
        <AppPill tone="neutral">Total {formatRupiah(totalNominal)}</AppPill>
      </div>

      <AppButton variant="primary" leading={<KanvasIcons.plus size={13} />} onClick={onOpenForm}>
        Input Pembayaran
      </AppButton>
    </section>
  )
}
