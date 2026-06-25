"use client"

import { useState } from "react"
import Link from "next/link"

import { AppButton, AppCard, AppPill, KanvasIcons } from "@/components/kanvas"
import type { StatusEvent } from "@/lib/constants/event-status"
import type { Permission } from "@/lib/constants/admin-roles"
import type { SaldoEventResult } from "@/lib/services/saldo-event-service"
import type { SumbanganListItem } from "@/lib/services/sumbangan-event-service"
import type { PengeluaranListItem } from "@/lib/services/pengeluaran-event-service"
import type { PanitiaListItem } from "@/lib/services/event-panitia-service"
import type { LaporanFinalEvent } from "@/lib/services/laporan-event-service"

import { SaldoSummaryCard } from "./saldo-summary-card"
import { EventStatusActions } from "./event-status-actions"
import { SumbanganTab } from "./sumbangan-tab"
import { PengeluaranTab } from "./pengeluaran-tab"
import { PanitiaTab } from "./panitia-tab"
import { ApprovalTab } from "./approval-tab"
import { TutupDefisitSection } from "./tutup-defisit-section"
import { TaruhDiKasButton } from "./taruh-di-kas-button"
import { CloseEventDialog } from "./close-event-dialog"
import { LaporanFinalView } from "./laporan-final-view"
import { CancelEventDialog } from "./cancel-event-dialog"

const STATUS_TONE: Record<string, "neutral" | "ok" | "warn" | "danger" | "terra"> = {
  DRAFT: "neutral",
  AKTIF: "ok",
  BALANCING: "warn",
  SELESAI: "terra",
  DIBATALKAN: "danger",
}

type TabKey = "sumbangan" | "pengeluaran" | "panitia" | "approval" | "laporan"

interface EventDetailViewProps {
  event: {
    id: number
    nama: string
    tanggalPelaksanaan: string
    deskripsi: string | null
    status: string
  }
  saldo: SaldoEventResult
  sumbanganList: SumbanganListItem[]
  pengeluaranList: PengeluaranListItem[]
  panitiaList: PanitiaListItem[]
  permissions: Permission[]
  laporanData?: LaporanFinalEvent
  activeEvents?: { id: number; nama: string }[]
}

export function EventDetailView({
  event,
  saldo,
  sumbanganList,
  pengeluaranList,
  panitiaList,
  permissions,
  laporanData,
  activeEvents = [],
}: EventDetailViewProps) {
  const status = event.status as StatusEvent
  const canWrite = permissions.includes("event.write")
  const canManage = permissions.includes("event.panitia.manage")
  const canApprove = permissions.includes("event.approve")
  const canClose = permissions.includes("event.close")
  const canTransfer = permissions.includes("event.transfer")
  const canCancel = permissions.includes("event.cancel")
  const showApproval = status === "BALANCING" && canApprove
  const showLaporan = status === "SELESAI"
  const showCancel = (status === "DRAFT" || status === "AKTIF") && canCancel

  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  const tabs: { key: TabKey; label: string; visible: boolean }[] = [
    { key: "sumbangan", label: "Sumbangan", visible: true },
    { key: "pengeluaran", label: "Pengeluaran", visible: true },
    { key: "panitia", label: "Panitia", visible: true },
    { key: "approval", label: "Approval", visible: showApproval },
    { key: "laporan", label: "Laporan", visible: showLaporan },
  ]

  const visibleTabs = tabs.filter((t) => t.visible)
  const defaultTab: TabKey = showLaporan ? "laporan" : visibleTabs[0]?.key ?? "sumbangan"
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab)

  const pendingList = pengeluaranList.filter((p) => p.status === "PENDING")

  return (
    <main className="space-y-3.5 p-4 md:p-6 lg:p-7">
      <Link href="/admin/event">
        <AppButton variant="ghost" size="sm" leading={<KanvasIcons.chevronL size={13} />}>
          Kembali
        </AppButton>
      </Link>

      {/* Header */}
      <AppCard className="p-3.5">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[20px] font-semibold text-kanvas-ink">{event.nama}</h1>
              <AppPill tone={STATUS_TONE[event.status] ?? "neutral"}>{event.status}</AppPill>
            </div>
            <p className="mt-1 text-[12px] text-kanvas-ink-3">
              Tanggal pelaksanaan: <span className="text-kanvas-ink-2">{event.tanggalPelaksanaan}</span>
            </p>
            {event.deskripsi && (
              <p className="mt-1 text-[12px] text-kanvas-ink-3">{event.deskripsi}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <EventStatusActions
              eventId={event.id}
              currentStatus={status}
              permissions={permissions}
            />
            {status === "BALANCING" && canTransfer && (
              <TaruhDiKasButton
                eventId={event.id}
                saldo={saldo.saldo}
                pendingCount={pendingList.length}
              />
            )}
            {status === "BALANCING" && canClose && (
              <AppButton
                variant="outline"
                size="sm"
                leading={<KanvasIcons.check size={13} />}
                onClick={() => setCloseDialogOpen(true)}
              >
                Tutup Event
              </AppButton>
            )}
            {showCancel && (
              <AppButton
                variant="danger"
                size="sm"
                leading={<KanvasIcons.x size={13} />}
                onClick={() => setCancelDialogOpen(true)}
              >
                Batalkan
              </AppButton>
            )}
          </div>
        </div>
      </AppCard>

      {/* Saldo Summary */}
      <SaldoSummaryCard saldo={saldo} />

      {/* Tutup Defisit — only when BALANCING + saldo < 0 + canWrite */}
      {status === "BALANCING" && saldo.saldo < 0 && canWrite && (
        <TutupDefisitSection
          eventId={event.id}
          eventStatus={status}
          defisit={Math.abs(saldo.saldo)}
        />
      )}

      {/* Tabs */}
      <AppCard className="overflow-hidden p-0">
        <nav className="flex overflow-x-auto border-b border-kanvas-line">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-[13px] font-medium transition border-b-2 ${
                activeTab === tab.key
                  ? "border-kanvas-terra text-kanvas-terra"
                  : "border-transparent text-kanvas-ink-3 hover:text-kanvas-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-3.5">
          {activeTab === "sumbangan" && (
            <SumbanganTab
              eventId={event.id}
              eventStatus={status}
              sumbanganList={sumbanganList}
              totalSumbangan={saldo.totalSumbangan}
              canWrite={canWrite}
            />
          )}
          {activeTab === "pengeluaran" && (
            <PengeluaranTab
              eventId={event.id}
              eventStatus={status}
              pengeluaranList={pengeluaranList}
              totalApproved={saldo.totalApproved}
              totalPending={saldo.totalPending}
              canWrite={canWrite}
            />
          )}
          {activeTab === "panitia" && (
            <PanitiaTab
              eventId={event.id}
              panitiaList={panitiaList}
              canManage={canManage}
            />
          )}
          {activeTab === "approval" && showApproval && (
            <ApprovalTab
              eventId={event.id}
              pendingList={pendingList}
              totalSumbangan={saldo.totalSumbangan}
              totalApproved={saldo.totalApproved}
            />
          )}
          {activeTab === "laporan" && showLaporan && laporanData && (
            <LaporanFinalView eventId={event.id} report={laporanData} />
          )}
          {activeTab === "laporan" && showLaporan && !laporanData && (
            <p className="py-8 text-center text-[12px] text-kanvas-ink-4">Data laporan tidak tersedia.</p>
          )}
        </div>
      </AppCard>

      {/* Close Event Dialog */}
      {closeDialogOpen && (
        <CloseEventDialog
          eventId={event.id}
          saldo={saldo.saldo}
          pendingCount={pendingList.length}
          totalSumbangan={saldo.totalSumbangan}
          totalApproved={saldo.totalApproved}
          onClose={() => setCloseDialogOpen(false)}
        />
      )}

      {/* Cancel Event Dialog */}
      {cancelDialogOpen && (
        <CancelEventDialog
          eventId={event.id}
          eventNama={event.nama}
          hasSumbangan={sumbanganList.length > 0}
          pendingCount={pendingList.length}
          activeEvents={activeEvents}
          onClose={() => setCancelDialogOpen(false)}
        />
      )}
    </main>
  )
}
