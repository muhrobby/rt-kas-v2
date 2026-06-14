import Link from "next/link"

import { AppButton, AppCard, AppPill, KanvasIcons } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"
import type { WargaEventDetail } from "@/lib/services/warga-event-service"

const STATUS_TONE: Record<string, "neutral" | "ok" | "warn" | "terra"> = {
  AKTIF: "ok",
  BALANCING: "warn",
  SELESAI: "terra",
}

interface WargaEventDetailViewProps {
  detail: WargaEventDetail
}

export function WargaEventDetailView({ detail }: WargaEventDetailViewProps) {
  const { event, saldoForWarga, pengeluaranList, sisaDanaTransferred } = detail

  return (
    <main className="space-y-3.5 p-4 md:p-6">
      <Link href="/warga/event">
        <AppButton variant="ghost" size="sm" leading={<KanvasIcons.chevronL size={13} />}>
          Kembali
        </AppButton>
      </Link>

      {/* Header */}
      <AppCard className="p-3.5">
        <div className="flex flex-wrap items-start gap-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-[20px] font-semibold text-kanvas-ink">{event.nama}</h1>
            <p className="mt-0.5 text-[12px] text-kanvas-ink-3">Tanggal: {event.tanggalPelaksanaan}</p>
            {event.deskripsi && (
              <p className="mt-1.5 text-[13px] text-kanvas-ink-2">{event.deskripsi}</p>
            )}
          </div>
          <AppPill tone={STATUS_TONE[event.status] ?? "neutral"}>{event.status}</AppPill>
        </div>

        {event.status === "SELESAI" && event.closedAt && (
          <p className="mt-2 text-[11px] text-kanvas-ink-4">
            Acara telah selesai pada {new Date(event.closedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}.
          </p>
        )}
      </AppCard>

      {/* Saldo ringkasan */}
      <section className="grid grid-cols-2 gap-2">
        <AppCard className="p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.6px] text-kanvas-ink-4">Total Sumbangan</p>
          <p className="mt-1.5 text-[20px] font-semibold text-kanvas-success">
            {formatRupiah(saldoForWarga.totalSumbangan)}
          </p>
        </AppCard>
        <AppCard className="p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.6px] text-kanvas-ink-4">Total Pengeluaran</p>
          <p className="mt-1.5 text-[20px] font-semibold text-kanvas-danger">
            {formatRupiah(saldoForWarga.totalPengeluaranApproved)}
          </p>
        </AppCard>
      </section>

      {/* Transfer ke kas RT */}
      {sisaDanaTransferred != null && (
        <AppCard className="p-3.5">
          <p className="text-[12px] text-kanvas-ink-3">
            Sisa dana <span className="font-semibold text-kanvas-ink">{formatRupiah(sisaDanaTransferred)}</span> telah dipindahkan ke Kas RT.
          </p>
        </AppCard>
      )}

      {/* Rincian pengeluaran */}
      {pengeluaranList.length > 0 && (
        <div>
          <p className="mb-2 text-[13px] font-semibold text-kanvas-ink">
            Rincian Pengeluaran ({pengeluaranList.length})
          </p>
          <AppCard className="overflow-x-auto p-0">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-kanvas-line bg-kanvas-paper-2 text-[11px] text-kanvas-ink-3">
                  <th className="px-3 py-2.5 font-medium">Tanggal</th>
                  <th className="px-3 py-2.5 font-medium">Deskripsi</th>
                  <th className="px-3 py-2.5 font-medium text-right">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {pengeluaranList.map((p, i) => (
                  <tr key={i} className="border-b border-kanvas-line-2 last:border-b-0">
                    <td className="px-3 py-2.5 text-[12px] text-kanvas-ink-3 whitespace-nowrap">{p.tanggal}</td>
                    <td className="px-3 py-2.5 text-kanvas-ink">{p.deskripsi}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-kanvas-ink">{formatRupiah(p.nominal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-kanvas-line bg-kanvas-paper-2">
                  <td colSpan={2} className="px-3 py-2.5 text-[12px] font-semibold text-kanvas-ink-2">Total</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-kanvas-ink">
                    {formatRupiah(saldoForWarga.totalPengeluaranApproved)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </AppCard>
        </div>
      )}

      <AppCard className="p-3.5">
        <p className="text-[12px] text-kanvas-ink-3">
          Data transparansi acara RT. Rincian sumbangan per warga tidak dipublikasikan.
        </p>
      </AppCard>
    </main>
  )
}
