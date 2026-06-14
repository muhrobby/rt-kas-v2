import { AppCard } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"
import type { SaldoEventResult } from "@/lib/services/saldo-event-service"
import { describeProyeksi } from "@/features/event-acara/lib/saldo-format"

interface SaldoSummaryCardProps {
  saldo: SaldoEventResult
}

export function SaldoSummaryCard({ saldo }: SaldoSummaryCardProps) {
  const warning = describeProyeksi(saldo.saldo, saldo.proyeksi)
  const isMinus = saldo.saldo < 0
  const isProyeksiMinus = saldo.saldo >= 0 && saldo.proyeksi < 0

  return (
    <div className="space-y-2.5">
      <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatBox label="Sumbangan" value={saldo.totalSumbangan} tone="neutral" />
        <StatBox label="Approved" value={saldo.totalApproved} tone="success" />
        <StatBox label="Pending" value={saldo.totalPending} tone="neutral" />
        <StatBox
          label="Saldo"
          value={saldo.saldo}
          tone={isMinus ? "danger" : "success"}
        />
      </section>

      {isMinus && warning && (
        <AppCard className="border-red-200 bg-red-50 p-3 text-[12px] text-red-700">
          {warning}
        </AppCard>
      )}

      {isProyeksiMinus && warning && (
        <AppCard className="border-yellow-200 bg-yellow-50 p-3 text-[12px] text-yellow-800">
          {warning}
        </AppCard>
      )}
    </div>
  )
}

function StatBox({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "neutral" | "success" | "danger"
}) {
  const valueColor =
    tone === "danger"
      ? "text-kanvas-danger"
      : tone === "success"
        ? "text-kanvas-success"
        : "text-kanvas-ink"

  return (
    <AppCard className="p-3">
      <p className="text-[10px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">{label}</p>
      <p className={`mt-1 text-[18px] font-semibold ${valueColor}`}>{formatRupiah(value)}</p>
    </AppCard>
  )
}
