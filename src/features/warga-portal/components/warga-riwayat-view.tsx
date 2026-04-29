"use client"

import { useMemo, useState, useTransition } from "react"

import { AppButton, AppCard, AppPill, KanvasIcons } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"
import { getMyKuitansiAction } from "@/lib/actions/warga-portal"
import type { WargaHistoryPeriod } from "@/types/rt-kas"

import { KuitansiDialog } from "@/features/warga-portal/components/kuitansi-dialog"

interface KuitansiSelection {
  refKuitansi: string
  kategori: string
  tanggalBayar: string
  nominal: number
  wargaNama: string
  blok?: string
  petugas?: string | null
}

interface WargaRiwayatViewProps {
  periods: WargaHistoryPeriod[]
  error?: string | null
}

export function WargaRiwayatView({ periods, error }: WargaRiwayatViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]?.periode ?? "")
  const [selectedReceipt, setSelectedReceipt] = useState<KuitansiSelection | null>(null)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [receiptError, setReceiptError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const activePeriod = useMemo(
    () => periods.find((period) => period.periode === selectedPeriod) ?? periods[0],
    [periods, selectedPeriod],
  )

  return (
    <main className="space-y-3.5 p-4 md:p-6">
      <section>
        <h1 className="text-[24px] text-[var(--kanvas-ink)]">Riwayat Pembayaran</h1>
        <p className="text-[12px] text-[var(--kanvas-ink-3)]">Pilih periode untuk melihat status pembayaran iuran.</p>
      </section>

      <div className="flex gap-1.5 overflow-x-auto pb-2">
        {periods.map((period) => {
          const active = selectedPeriod === period.periode
          return (
            <button
              key={period.periode}
              type="button"
              onClick={() => setSelectedPeriod(period.periode)}
              className="shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap"
              style={{
                borderColor: active ? "var(--kanvas-terra)" : "var(--kanvas-line)",
                background: active ? "var(--kanvas-terra)" : "#ffffff",
                color: active ? "#ffffff" : "var(--kanvas-ink-2)",
              }}
            >
              {period.periode}
            </button>
          )
        })}
      </div>

      <section className="space-y-2">
        {error ? (
          <AppCard className="border-dashed p-3 text-[12px] text-destructive">
            {error}
          </AppCard>
        ) : null}
        {activePeriod?.items.map((item) => (
          <AppCard key={`${activePeriod.periode}-${item.kategori}`} className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-semibold text-[var(--kanvas-ink)]">{item.kategori}</p>
                <p className="text-[11px] text-[var(--kanvas-ink-4)]">
                  {item.status === "lunas" ? `Dibayar ${item.tanggalBayar}` : item.status === "belum-tempo" ? "Belum jatuh tempo" : "Belum dibayar"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[13px] font-semibold text-[var(--kanvas-ink)]">{formatRupiah(item.nominal)}</p>
                <div className="mt-1">
                  {item.status === "lunas" ? <AppPill tone="ok">Lunas</AppPill> : item.status === "belum-tempo" ? <AppPill tone="neutral">Belum Tempo</AppPill> : <AppPill tone="warn">Belum</AppPill>}
                </div>
              </div>
            </div>

            {item.status === "lunas" && item.refKuitansi && item.transaksiId ? (
              <div className="mt-2.5 flex items-center justify-between border-t border-[var(--kanvas-line-2)] pt-2.5">
                <p className="truncate text-[11px] text-[var(--kanvas-ink-4)]">{item.refKuitansi}</p>
                <AppButton
                  variant="outline"
                  size="sm"
                  leading={<KanvasIcons.receipt size={12} />}
                  disabled={isPending}
                  onClick={() => {
                    setReceiptError(null)
                    startTransition(async () => {
                      const result = await getMyKuitansiAction(item.transaksiId ?? 0)
                      if (!result.ok) {
                        setReceiptError(result.error)
                        return
                      }
                      setSelectedReceipt({
                        refKuitansi: result.data.nomorKuitansi,
                        kategori: result.data.kategori,
                        tanggalBayar: result.data.tanggal,
                        nominal: result.data.nominal,
                        wargaNama: result.data.warga,
                        blok: result.data.blok,
                        petugas: result.data.petugas,
                      })
                      setReceiptOpen(true)
                    })
                  }}
                >
                  e-Kuitansi
                </AppButton>
              </div>
            ) : null}
          </AppCard>
        ))}
      </section>

      {receiptError ? (
        <AppCard className="border-dashed p-3 text-[12px] text-destructive">
          {receiptError}
        </AppCard>
      ) : null}

      <KuitansiDialog open={receiptOpen} data={selectedReceipt} onClose={() => setReceiptOpen(false)} />
    </main>
  )
}
