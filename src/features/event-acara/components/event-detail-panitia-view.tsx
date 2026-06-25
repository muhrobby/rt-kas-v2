"use client"

import Link from "next/link"

import { AppButton, AppCard, AppPill, KanvasIcons } from "@/components/kanvas"
import type { StatusEvent } from "@/lib/constants/event-status"
import type { SaldoEventResult } from "@/lib/services/saldo-event-service"
import type { PengeluaranListItem } from "@/lib/services/pengeluaran-event-service"

import { SaldoSummaryCard } from "./saldo-summary-card"
import { PengeluaranTab } from "./pengeluaran-tab"

const STATUS_TONE: Record<string, "neutral" | "ok" | "warn" | "terra"> = {
  AKTIF: "ok",
  BALANCING: "warn",
  SELESAI: "terra",
}

interface EventDetailPanitiaViewProps {
  event: { id: number; nama: string; tanggalPelaksanaan: string; status: string }
  saldo: SaldoEventResult
  pengeluaranList: PengeluaranListItem[]
}

export function EventDetailPanitiaView({ event, saldo, pengeluaranList }: EventDetailPanitiaViewProps) {
  const status = event.status as StatusEvent

  return (
    <main className="space-y-3.5 p-4 md:p-6">
      <Link href="/panitia/event">
        <AppButton variant="ghost" size="sm" leading={<KanvasIcons.chevronL size={13} />}>
          Kembali
        </AppButton>
      </Link>

      <AppCard className="p-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[18px] md:text-[20px] font-semibold text-kanvas-ink">{event.nama}</h1>
          <AppPill tone={STATUS_TONE[event.status] ?? "neutral"}>{event.status}</AppPill>
        </div>
        <p className="mt-1 text-[12px] text-kanvas-ink-3">Tanggal: {event.tanggalPelaksanaan}</p>
      </AppCard>

      <SaldoSummaryCard saldo={saldo} />

      <AppCard className="overflow-hidden p-0">
        <div className="border-b border-kanvas-line px-4 py-2.5">
          <span className="text-[13px] font-medium text-kanvas-terra">Pengeluaran</span>
        </div>
        <div className="p-3.5">
          <PengeluaranTab
            eventId={event.id}
            eventStatus={status}
            pengeluaranList={pengeluaranList}
            totalApproved={saldo.totalApproved}
            totalPending={saldo.totalPending}
            canWrite={status === "AKTIF"}
          />
        </div>
      </AppCard>
    </main>
  )
}
