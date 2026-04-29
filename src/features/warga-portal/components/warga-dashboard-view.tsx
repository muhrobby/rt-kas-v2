import Link from "next/link"

import { AppCard, AppPill, KanvasIcons } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"
import type { WargaDashboardData } from "@/lib/services/warga-portal-service"

import { WargaBillStatus } from "@/features/warga-portal/components/warga-bill-status"

interface WargaDashboardViewProps {
  data: WargaDashboardData
}

export function WargaDashboardView({ data }: WargaDashboardViewProps) {
  const me = data.profile
  const lunasCount = data.billStatusCurrent.filter((item) => item.status === "lunas").length

  return (
    <main className="space-y-3.5 p-4 md:p-6">
      <section className="relative overflow-hidden rounded-[14px] bg-[linear-gradient(140deg,var(--kanvas-terra)_0%,var(--kanvas-terra-2)_100%)] p-4 text-[var(--kanvas-paper-2)]">
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10" />
        <p className="text-[11px] font-semibold tracking-[0.8px] uppercase opacity-80">Selamat datang,</p>
        <h1 className="mt-1 break-words text-[24px] leading-tight sm:text-[26px]">{me.nama}</h1>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <AppPill tone="neutral" soft={false} style={{ background: "rgba(255,255,255,0.2)", color: "var(--kanvas-paper-2)" }}>
            Blok {me.blok}
          </AppPill>
          <AppPill tone="neutral" soft={false} style={{ background: "rgba(255,255,255,0.2)", color: "var(--kanvas-paper-2)" }}>
            {me.statusHunian === "tetap" ? "Tetap" : "Kontrak"}
          </AppPill>
        </div>
      </section>

      <AppCard className="p-3.5">
        <div className="flex flex-wrap items-start justify-between gap-2.5">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.6px] text-[var(--kanvas-ink-4)] uppercase">Saldo Kas RT</p>
            <p className="mt-1 text-2xl text-[var(--kanvas-ink)]">{formatRupiah(data.saldoKas)}</p>
          </div>
          <Link href="/warga/laporan" className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[var(--kanvas-line)] bg-white px-3 py-1.5 text-[12px] font-semibold text-[var(--kanvas-ink-2)]">
            Transparansi
            <KanvasIcons.arrowR size={12} />
          </Link>
        </div>
      </AppCard>

      <section>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5">
          <h2 className="text-[18px] text-[var(--kanvas-ink)]">Tagihan Bulan Ini</h2>
          <p className="text-[11px] text-[var(--kanvas-ink-3)]">{lunasCount}/{data.billStatusCurrent.length} lunas</p>
        </div>
        <WargaBillStatus items={data.billStatusCurrent} />
      </section>

      <AppCard className="flex items-start gap-2 border-dashed bg-[var(--kanvas-paper-2)] p-3.5">
        <KanvasIcons.alert size={16} />
        <p className="text-[12px] leading-relaxed text-[var(--kanvas-ink-3)]">
          {data.contractWarning.show
            ? data.contractWarning.message
            : "Hubungi Bendahara untuk pembayaran tunai atau transfer. Bukti bayar akan muncul di menu Riwayat."}
        </p>
      </AppCard>

      <Link href="/warga/riwayat" className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--kanvas-terra)]">
        Lihat riwayat pembayaran
        <KanvasIcons.arrowR size={12} />
      </Link>
    </main>
  )
}
