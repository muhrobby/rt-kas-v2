import { AppCard, AppPill, KanvasIcons } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"
import type { WargaPaymentStatus } from "@/types/rt-kas"

interface WargaBillStatusProps {
  items: WargaPaymentStatus[]
}

export function WargaBillStatus({ items }: WargaBillStatusProps) {
  return (
    <section className="space-y-2">
      {items.map((item, index) => (
        <AppCard key={item.transaksiId || `${item.kategori}-${item.nominal}-${index}`} className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[13px] font-semibold text-kanvas-ink">{item.kategori}</p>
              <p className="text-[11px] text-kanvas-ink-4">
                {item.tipeTagihan === "bulanan"
                  ? `Iuran bulanan${item.periodeLabel ? ` · ${item.periodeLabel}` : ""}`
                  : `Sekali bayar${item.periodeLabel ? ` · ${item.periodeLabel}` : ""}`}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[13px] font-semibold text-kanvas-ink">{formatRupiah(item.nominal)}</p>
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
