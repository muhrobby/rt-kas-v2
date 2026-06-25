"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"

import { AppButton, AppCard, AppPill, KanvasIcons } from "@/components/kanvas"
import type { PdfBranding } from "@/lib/branding/format-branding"
import { formatRupiah } from "@/lib/format/currency"
import { getMyKuitansiAction } from "@/lib/actions/warga-portal"
import { generateKuitansiPDF } from "@/lib/export/pdf"
import type { WargaHistoryPeriod } from "@/types/rt-kas"

import { KuitansiDialog } from "@/features/warga-portal/components/kuitansi-dialog"
import { getWargaRiwayatEmptyStateMessage } from "@/features/warga-portal/lib/portal-empty-state"

interface KuitansiSelection {
  refKuitansi: string
  kategori: string
  tanggalBayar: string
  nominal: number
  wargaNama: string
  blok?: string
  petugas?: string | null
  branding?: PdfBranding
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
    () => periods.find((p) => p.periode === selectedPeriod) ?? periods[0],
    [periods, selectedPeriod],
  )

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const activePill = container.querySelector<HTMLElement>("[data-active-pill]")
    activePill?.scrollIntoView({ inline: "center", block: "nearest" })
  }, [selectedPeriod])

  const emptyStateMessage = activePeriod
    ? getWargaRiwayatEmptyStateMessage(activePeriod.items.length, activePeriod.periode)
    : null

  // Summary counts for active period
  const lunas = activePeriod?.items.filter((i) => i.status === "lunas").length ?? 0
  const belum = activePeriod?.items.filter((i) => i.status === "belum").length ?? 0

  return (
    <main className="space-y-3.5 p-4 md:p-6">
      <section>
        <h1 className="text-[24px] text-kanvas-ink">Riwayat Pembayaran</h1>
        <p className="text-[12px] text-kanvas-ink-3">Pilih bulan untuk melihat status iuran.</p>
      </section>

      {/* Period pills — horizontal scroll */}
      <div
        ref={scrollContainerRef}
        className="flex gap-1.5 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {periods.map((period) => {
          const active = selectedPeriod === period.periode
          const hasUnpaid = period.items.some((i) => i.status === "belum")
          return (
            <button
              key={period.periode}
              type="button"
              onClick={() => setSelectedPeriod(period.periode)}
              {...(active ? { "data-active-pill": "" } : {})}
              className="relative shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold whitespace-nowrap transition"
              style={{
                borderColor: active ? "var(--kanvas-terra)" : "var(--kanvas-line)",
                background: active ? "var(--kanvas-terra)" : "#ffffff",
                color: active ? "#ffffff" : "var(--kanvas-ink-2)",
              }}
            >
              {period.periode}
              {/* Red dot for periods with unpaid items */}
              {!active && hasUnpaid && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-kanvas-danger" />
              )}
            </button>
          )
        })}
      </div>

      {/* Active period header */}
      {activePeriod && (
        <div className="flex items-center justify-between rounded-xl border border-kanvas-line bg-white px-4 py-3">
          <div>
            <p className="text-[13px] font-semibold text-kanvas-ink">{activePeriod.periode}</p>
            <p className="text-[11px] text-kanvas-ink-4">{activePeriod.items.length} tagihan</p>
          </div>
          <div className="flex gap-2">
            {lunas > 0 && <AppPill tone="ok">{lunas} Lunas</AppPill>}
            {belum > 0 && <AppPill tone="warn">{belum} Belum</AppPill>}
            {activePeriod.items.length === 0 && <AppPill tone="neutral">Tidak ada tagihan</AppPill>}
          </div>
        </div>
      )}

      {/* Items */}
      <section className="space-y-2">
        {error && (
          <AppCard className="border-dashed p-3 text-[12px] text-kanvas-danger">{error}</AppCard>
        )}
        {emptyStateMessage && (
          <AppCard className="border-dashed p-3 text-[12px] text-kanvas-ink-3">{emptyStateMessage}</AppCard>
        )}
        {activePeriod?.items.map((item, index) => (
          <AppCard
            key={item.transaksiId ?? `${activePeriod.periode}-${item.kategori}-${index}`}
            className="p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-kanvas-ink">{item.kategori}</p>
                <p className="text-[11px] text-kanvas-ink-4 mt-0.5">
                  {item.status === "lunas"
                    ? `Dibayar ${item.tanggalBayar}${item.periodeLabel ? ` · ${item.periodeLabel}` : ""}`
                    : item.status === "belum-tempo"
                      ? `Belum jatuh tempo${item.periodeLabel ? ` · ${item.periodeLabel}` : ""}`
                      : `Belum dibayar${item.periodeLabel ? ` · ${item.periodeLabel}` : ""}`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[13px] font-semibold text-kanvas-ink">{formatRupiah(item.nominal)}</p>
                <div className="mt-1">
                  {item.status === "lunas" ? (
                    <AppPill tone="ok">Lunas</AppPill>
                  ) : item.status === "belum-tempo" ? (
                    <AppPill tone="terra">Belum Tempo</AppPill>
                  ) : (
                    <AppPill tone="warn">Belum Bayar</AppPill>
                  )}
                </div>
              </div>
            </div>

            {item.status === "lunas" && item.refKuitansi && item.transaksiId ? (
              <div className="mt-2.5 flex items-center justify-between border-t border-kanvas-line-2 pt-2">
                <p className="truncate text-[11px] text-kanvas-ink-4">{item.refKuitansi}</p>
                <AppButton
                  variant="outline"
                  size="sm"
                  leading={<KanvasIcons.receipt size={12} />}
                  disabled={isPending}
                  onClick={() => {
                    setReceiptError(null)
                    startTransition(async () => {
                      const result = await getMyKuitansiAction(item.transaksiId ?? 0)
                      if (!result.ok) { setReceiptError(result.error); return }
                      setSelectedReceipt({
                        refKuitansi: result.data.nomorKuitansi,
                        kategori: result.data.kategori,
                        tanggalBayar: result.data.tanggal,
                        nominal: result.data.nominal,
                        wargaNama: result.data.warga,
                        blok: result.data.blok,
                        petugas: result.data.petugas,
                        branding: result.data.branding,
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

      {receiptError && (
        <AppCard className="border-dashed p-3 text-[12px] text-kanvas-danger">{receiptError}</AppCard>
      )}

      <KuitansiDialog
        open={receiptOpen}
        data={selectedReceipt}
        onClose={() => setReceiptOpen(false)}
        onDownloadPdf={generateKuitansiPDF}
      />
    </main>
  )
}
