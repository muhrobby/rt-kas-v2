import Link from "next/link"

import { AppCard, AppPill } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"
import type { WargaEventListItem } from "@/lib/services/warga-event-service"

const STATUS_TONE: Record<string, "neutral" | "ok" | "warn" | "terra"> = {
  AKTIF: "ok",
  BALANCING: "warn",
  SELESAI: "terra",
}

interface WargaEventListViewProps {
  events: WargaEventListItem[]
}

export function WargaEventListView({ events }: WargaEventListViewProps) {
  return (
    <main className="space-y-3.5 p-4 md:p-6">
      <section>
        <h1 className="text-[24px] text-kanvas-ink">Acara RT</h1>
        <p className="text-[12px] text-kanvas-ink-3">Daftar acara dan kegiatan RT yang sedang atau telah berlangsung.</p>
      </section>

      {events.length === 0 ? (
        <AppCard className="p-6 text-center text-[13px] text-kanvas-ink-4">
          Belum ada acara yang tersedia.
        </AppCard>
      ) : (
        <div className="space-y-2">
          {events.map((e) => (
            <Link key={e.id} href={`/warga/event/${e.id}`}>
              <AppCard className="p-3.5 transition hover:shadow-md cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[14px] text-kanvas-ink truncate">{e.nama}</p>
                    <p className="text-[11px] text-kanvas-ink-3 mt-0.5">{e.tanggalPelaksanaan}</p>
                  </div>
                  <AppPill tone={STATUS_TONE[e.status] ?? "neutral"}>{e.status}</AppPill>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-3 border-t border-kanvas-line pt-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-kanvas-ink-4">Total Sumbangan</p>
                    <p className="text-[13px] font-semibold text-kanvas-ink">{formatRupiah(e.totalSumbangan)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-kanvas-ink-4">Total Pengeluaran</p>
                    <p className="text-[13px] font-semibold text-kanvas-ink">{formatRupiah(e.totalPengeluaranApproved)}</p>
                  </div>
                </div>
              </AppCard>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
