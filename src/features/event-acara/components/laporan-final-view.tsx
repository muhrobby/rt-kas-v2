import { AppButton, AppCard, AppPill, KanvasIcons } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"
import type { LaporanFinalEvent } from "@/lib/services/laporan-event-service"

const SUMBER_LABEL: Record<string, string> = {
  MANDIRI_WARGA: "Sukarela",
  TALANGAN_KAS: "Talangan",
  URUNAN_PENGURUS: "Urunan",
  SUMBANGAN_TAMBAHAN_WARGA: "Tambahan",
}

interface LaporanFinalViewProps {
  eventId: number
  report: LaporanFinalEvent
}

export function LaporanFinalView({ eventId, report }: LaporanFinalViewProps) {
  return (
    <div className="space-y-4">
      {/* Export buttons */}
      <div className="flex flex-wrap gap-2 justify-end">
        <AppButton
          variant="outline"
          size="sm"
          leading={<KanvasIcons.download size={13} />}
          onClick={() => window.open(`/api/export/event-laporan?eventId=${eventId}`, "_blank")}
        >
          Export Excel
        </AppButton>
        <AppButton
          variant="outline"
          size="sm"
          leading={<KanvasIcons.download size={13} />}
          onClick={() => window.open(`/api/export/event-laporan-pdf?eventId=${eventId}`, "_blank")}
        >
          Export PDF
        </AppButton>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <AppCard className="p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.6px] text-kanvas-ink-4">Total Sumbangan</p>
          <p className="mt-1 text-[17px] font-semibold text-kanvas-ink">{formatRupiah(report.totalSumbangan)}</p>
        </AppCard>
        <AppCard className="p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.6px] text-kanvas-ink-4">Total Pengeluaran</p>
          <p className="mt-1 text-[17px] font-semibold text-kanvas-ink">{formatRupiah(report.totalPengeluaranApproved)}</p>
        </AppCard>
        <AppCard className="p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.6px] text-kanvas-ink-4">Saldo Akhir</p>
          <p className="mt-1 text-[17px] font-semibold text-kanvas-success">
            {formatRupiah(report.totalSumbangan - report.totalPengeluaranApproved)}
          </p>
        </AppCard>
        {report.sisaDanaTransferred != null && (
          <AppCard className="p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.6px] text-kanvas-ink-4">Ke Kas RT</p>
            <p className="mt-1 text-[17px] font-semibold text-kanvas-terra">{formatRupiah(report.sisaDanaTransferred)}</p>
          </AppCard>
        )}
      </div>

      {/* Sumbangan */}
      <div>
        <p className="mb-2 text-[13px] font-semibold text-kanvas-ink">Sumbangan ({report.sumbangan.length})</p>
        <div className="overflow-x-auto rounded-lg border border-kanvas-line">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-kanvas-line bg-kanvas-paper-2 text-[11px] text-kanvas-ink-3">
                <th className="px-3 py-2 font-medium">Tanggal</th>
                <th className="px-3 py-2 font-medium">Warga</th>
                <th className="px-3 py-2 font-medium text-right">Nominal</th>
                <th className="px-3 py-2 font-medium">Sumber</th>
              </tr>
            </thead>
            <tbody>
              {report.sumbangan.map((s, i) => (
                <tr key={i} className="border-b border-kanvas-line-2 last:border-b-0">
                  <td className="px-3 py-2 text-[12px] text-kanvas-ink-3">{s.tanggal}</td>
                  <td className="px-3 py-2 text-kanvas-ink">{s.wargaNama ?? "Pengurus"}</td>
                  <td className="px-3 py-2 text-right font-semibold text-kanvas-ink">{formatRupiah(s.nominal)}</td>
                  <td className="px-3 py-2">
                    <AppPill tone="neutral">{SUMBER_LABEL[s.sumber] ?? s.sumber}</AppPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pengeluaran */}
      <div>
        <p className="mb-2 text-[13px] font-semibold text-kanvas-ink">Pengeluaran Approved ({report.pengeluaranApproved.length})</p>
        <div className="overflow-x-auto rounded-lg border border-kanvas-line">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-kanvas-line bg-kanvas-paper-2 text-[11px] text-kanvas-ink-3">
                <th className="px-3 py-2 font-medium">Tanggal</th>
                <th className="px-3 py-2 font-medium">Deskripsi</th>
                <th className="px-3 py-2 font-medium text-right">Nominal</th>
                <th className="px-3 py-2 font-medium">Disetujui</th>
              </tr>
            </thead>
            <tbody>
              {report.pengeluaranApproved.map((p, i) => (
                <tr key={i} className="border-b border-kanvas-line-2 last:border-b-0">
                  <td className="px-3 py-2 text-[12px] text-kanvas-ink-3">{p.tanggal}</td>
                  <td className="px-3 py-2 text-kanvas-ink">{p.deskripsi}</td>
                  <td className="px-3 py-2 text-right font-semibold text-kanvas-ink">{formatRupiah(p.nominal)}</td>
                  <td className="px-3 py-2 text-[12px] text-kanvas-ink-3">{p.approvedByName ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
