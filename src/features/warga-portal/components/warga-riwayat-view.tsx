"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { AppButton, AppCard, AppPill, KanvasIcons } from "@/components/kanvas"
import type { PdfBranding } from "@/lib/branding/format-branding"
import { formatRupiah } from "@/lib/format/currency"
import { getMyKuitansiAction } from "@/lib/actions/warga-portal"
import { generateKuitansiPDF } from "@/lib/export/pdf"
import { BULAN } from "@/lib/constants/months"
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
  branding?: PdfBranding
}

interface WargaRiwayatViewProps {
  periods: WargaHistoryPeriod[]
  error?: string | null
  filterBulan?: number
  filterTahun?: number
}

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 2019 }, (_, i) => CURRENT_YEAR - i)

export function WargaRiwayatView({ periods, error, filterBulan, filterTahun }: WargaRiwayatViewProps) {
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]?.periode ?? "")
  const [selectedReceipt, setSelectedReceipt] = useState<KuitansiSelection | null>(null)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [receiptError, setReceiptError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Toolbar filter state (controlled, not yet applied)
  const [toolbarBulan, setToolbarBulan] = useState<string>(filterBulan ? String(filterBulan) : "")
  const [toolbarTahun, setToolbarTahun] = useState<string>(filterTahun ? String(filterTahun) : "")

  const canSubmit = toolbarBulan !== "" && toolbarTahun !== ""

  const handleFilter = () => {
    if (!canSubmit) return
    router.push(`/warga/riwayat?bulan=${toolbarBulan}&tahun=${toolbarTahun}`)
  }

  const handleReset = () => {
    setToolbarBulan("")
    setToolbarTahun("")
    router.push("/warga/riwayat")
  }

  const activePeriod = useMemo(
    () => periods.find((period) => period.periode === selectedPeriod) ?? periods[0],
    [periods, selectedPeriod],
  )

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const activePill = container.querySelector<HTMLElement>("[data-active-pill]")
    activePill?.scrollIntoView({ inline: "center", block: "nearest" })
  }, [selectedPeriod])

  return (
    <main className="space-y-3.5 p-4 md:p-6">
      <section>
        <h1 className="text-[24px] text-kanvas-ink">Riwayat Pembayaran</h1>
        <p className="text-[12px] text-kanvas-ink-3">Pilih periode untuk melihat status pembayaran iuran.</p>
      </section>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-kanvas-line bg-white p-3">
        <div>
          <p className="mb-1 text-[11px] font-semibold tracking-[0.5px] text-kanvas-ink-4 uppercase">Bulan</p>
          <select
            value={toolbarBulan}
            onChange={(e) => setToolbarBulan(e.target.value)}
            className="h-[38px] rounded-lg border border-kanvas-line bg-white px-2.5 text-[13px] text-kanvas-ink"
          >
            <option value="">Pilih bulan</option>
            {BULAN.map((nama, i) => (
              <option key={i + 1} value={String(i + 1)}>{nama}</option>
            ))}
          </select>
        </div>
        <div>
          <p className="mb-1 text-[11px] font-semibold tracking-[0.5px] text-kanvas-ink-4 uppercase">Tahun</p>
          <select
            value={toolbarTahun}
            onChange={(e) => setToolbarTahun(e.target.value)}
            className="h-[38px] rounded-lg border border-kanvas-line bg-white px-2.5 text-[13px] text-kanvas-ink"
          >
            <option value="">Pilih tahun</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        </div>
        <AppButton variant="primary" size="sm" onClick={handleFilter} disabled={!canSubmit}>
          Lihat
        </AppButton>
        {(filterBulan || filterTahun) ? (
          <AppButton variant="ghost" size="sm" onClick={handleReset}>
            Reset
          </AppButton>
        ) : null}
      </div>

      <div ref={scrollContainerRef} className="flex gap-1.5 overflow-x-auto pb-2">
        {periods.map((period) => {
          const active = selectedPeriod === period.periode
          return (
            <button
              key={period.periode}
              type="button"
              onClick={() => setSelectedPeriod(period.periode)}
              {...(active ? { "data-active-pill": "" } : {})}
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
          <AppCard className="border-dashed p-3 text-[12px] text-kanvas-danger">
            {error}
          </AppCard>
        ) : null}
        {activePeriod?.items.map((item, index) => (
          <AppCard key={item.transaksiId ?? `${activePeriod.periode}-${item.kategori}-${item.nominal}-${index}`} className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-semibold text-kanvas-ink">{item.kategori}</p>
                <p className="text-[11px] text-kanvas-ink-4">
                  {item.status === "lunas"
                    ? `Dibayar ${item.tanggalBayar}${item.periodeLabel ? ` · ${item.periodeLabel}` : ""}`
                    : item.status === "belum-tempo"
                      ? `Belum jatuh tempo${item.periodeLabel ? ` · ${item.periodeLabel}` : ""}`
                      : `Belum dibayar${item.periodeLabel ? ` · ${item.periodeLabel}` : ""}`}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[13px] font-semibold text-kanvas-ink">{formatRupiah(item.nominal)}</p>
                <div className="mt-1">
                  {item.status === "lunas" ? <AppPill tone="ok">Lunas</AppPill> : item.status === "belum-tempo" ? <AppPill tone="terra">Belum Tempo</AppPill> : <AppPill tone="warn">Belum</AppPill>}
                </div>
              </div>
            </div>

            {item.status === "lunas" && item.refKuitansi && item.transaksiId ? (
              <div className="mt-2.5 flex items-center justify-between border-t border-kanvas-line-2 pt-2.5">
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

      {receiptError ? (
        <AppCard className="border-dashed p-3 text-[12px] text-kanvas-danger">
          {receiptError}
        </AppCard>
      ) : null}

      <KuitansiDialog open={receiptOpen} data={selectedReceipt} onClose={() => setReceiptOpen(false)} onDownloadPdf={generateKuitansiPDF} />
    </main>
  )
}
