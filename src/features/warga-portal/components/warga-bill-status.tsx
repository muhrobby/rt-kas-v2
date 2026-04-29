import { AppCard, AppPill, KanvasIcons } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"
import type { WargaPaymentStatus } from "@/types/rt-kas"

interface WargaBillStatusProps {
  items: WargaPaymentStatus[]
}

export function WargaBillStatus({ items }: WargaBillStatusProps) {
  return (
    <section className="space-y-2">
      {items.map((item) => (
        <AppCard key={`${item.kategori}-${item.nominal}`} className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[13px] font-semibold text-[var(--kanvas-ink)]">{item.kategori}</p>
              <p className="text-[11px] text-[var(--kanvas-ink-4)]">
                {item.tipeTagihan === "bulanan" ? "Iuran bulanan" : `Sekali bayar${item.jatuhTempoLabel ? ` · tempo ${item.jatuhTempoLabel}` : ""}`}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[13px] font-semibold text-[var(--kanvas-ink)]">{formatRupiah(item.nominal)}</p>
              <div className="mt-1">
                {item.status === "lunas" ? (
                  <AppPill tone="ok">
                    <KanvasIcons.check size={10} />Lunas
                  </AppPill>
                ) : item.status === "belum" ? (
                  <AppPill tone="warn">Belum bayar</AppPill>
                ) : (
                  <AppPill tone="neutral">Belum jatuh tempo</AppPill>
                )}
              </div>
            </div>
          </div>
        </AppCard>
      ))}
    </section>
  )
}
