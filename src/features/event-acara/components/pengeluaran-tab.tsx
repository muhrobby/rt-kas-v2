"use client"

import { useState } from "react"

import { AppButton, AppPill, KanvasIcons } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"
import type { StatusEvent } from "@/lib/constants/event-status"
import type { PengeluaranListItem } from "@/lib/services/pengeluaran-event-service"

import { PengeluaranBulkForm } from "./pengeluaran-bulk-form"
import { PengeluaranRowActions } from "./pengeluaran-row-actions"

type StatusFilter = "all" | "PENDING" | "APPROVED" | "REJECTED"

interface PengeluaranTabProps {
  eventId: number
  eventStatus: StatusEvent
  pengeluaranList: PengeluaranListItem[]
  totalApproved: number
  totalPending: number
  canWrite: boolean
}

export function PengeluaranTab({
  eventId,
  eventStatus,
  pengeluaranList,
  totalApproved,
  totalPending,
  canWrite,
}: PengeluaranTabProps) {
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [bulkOpen, setBulkOpen] = useState(false)

  const filtered = filter === "all"
    ? pengeluaranList
    : pengeluaranList.filter((p) => p.status === filter)

  const statusTone = (s: string): "ok" | "warn" | "danger" => {
    if (s === "APPROVED") return "ok"
    if (s === "REJECTED") return "danger"
    return "warn"
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <AppPill tone="ok">{formatRupiah(totalApproved)} Approved</AppPill>
          <AppPill tone="warn">{formatRupiah(totalPending)} Pending</AppPill>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-lg border border-kanvas-line bg-white px-3 py-1.5 text-[12px] text-kanvas-ink"
            value={filter}
            onChange={(e) => setFilter(e.target.value as StatusFilter)}
          >
            <option value="all">Semua Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          {canWrite && eventStatus === "AKTIF" && (
            <AppButton variant="primary" leading={<KanvasIcons.plus size={13} />} onClick={() => setBulkOpen(true)}>
              Catat Pengeluaran
            </AppButton>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-kanvas-line">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-kanvas-line bg-kanvas-paper-2 text-[11px] text-kanvas-ink-3">
              <th className="px-3 py-2.5 font-medium">Tanggal</th>
              <th className="px-3 py-2.5 font-medium">Deskripsi</th>
              <th className="px-3 py-2.5 font-medium text-right">Nominal</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-3 py-2.5 font-medium">Pencatat</th>
              <th className="px-3 py-2.5 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-[12px] text-kanvas-ink-4">
                  Belum ada pengeluaran.
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-kanvas-line-2 last:border-b-0">
                <td className="px-3 py-2.5 text-[12px] text-kanvas-ink-3">{p.tanggal}</td>
                <td className="px-3 py-2.5 text-kanvas-ink">
                  {p.deskripsi}
                  {p.rejectedReason && (
                    <p className="mt-0.5 text-[11px] text-kanvas-danger">Alasan: {p.rejectedReason}</p>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right font-semibold text-kanvas-ink">{formatRupiah(p.nominal)}</td>
                <td className="px-3 py-2.5">
                  <AppPill tone={statusTone(p.status)}>{p.status}</AppPill>
                </td>
                <td className="px-3 py-2.5 text-[12px] text-kanvas-ink-3">{p.recordedByName}</td>
                <td className="px-3 py-2.5">
                  {p.status === "PENDING" && canWrite && eventStatus === "AKTIF" && (
                    <PengeluaranRowActions item={p} eventId={eventId} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {bulkOpen && (
        <PengeluaranBulkForm
          eventId={eventId}
          onClose={() => setBulkOpen(false)}
        />
      )}
    </div>
  )
}
