"use client"

import { useState, useTransition } from "react"

import { AppButton, AppPill, KanvasIcons, useToast } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"
import { approvePengeluaranAction } from "@/lib/actions/pengeluaran-event-approval"
import type { PengeluaranListItem } from "@/lib/services/pengeluaran-event-service"

import { ApprovalRejectDialog } from "./approval-action-dialog"

interface ApprovalTabProps {
  eventId: number
  pendingList: PengeluaranListItem[]
  totalSumbangan: number
  totalApproved: number
}

export function ApprovalTab({
  pendingList,
  totalSumbangan,
  totalApproved,
}: ApprovalTabProps) {
  const { pushToast } = useToast()
  const [rejectTarget, setRejectTarget] = useState<PengeluaranListItem | null>(null)
  const [submitting, startSubmit] = useTransition()

  const saldoSisa = totalSumbangan - totalApproved

  const handleApprove = (item: PengeluaranListItem) => {
    startSubmit(async () => {
      const result = await approvePengeluaranAction({ id: item.id })
      if (result.ok) {
        pushToast(`"${item.deskripsi}" disetujui.`, "ok")
      } else {
        pushToast(result.error, "error")
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-kanvas-line bg-kanvas-paper-2 px-3 py-2.5 text-[12px] text-kanvas-ink-3">
        Saldo tersedia: <span className="font-semibold text-kanvas-ink">{formatRupiah(saldoSisa)}</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-kanvas-line">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-kanvas-line bg-kanvas-paper-2 text-[11px] text-kanvas-ink-3">
              <th className="px-3 py-2.5 font-medium">Tanggal</th>
              <th className="px-3 py-2.5 font-medium">Deskripsi</th>
              <th className="px-3 py-2.5 font-medium text-right">Nominal</th>
              <th className="px-3 py-2.5 font-medium">Pencatat</th>
              <th className="px-3 py-2.5 font-medium">Proyeksi</th>
              <th className="px-3 py-2.5 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pendingList.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-[12px] text-kanvas-ink-4">
                  Tidak ada pengeluaran pending.
                </td>
              </tr>
            )}
            {pendingList.map((item) => {
              const wouldBeMinus = saldoSisa - item.nominal < 0
              return (
                <tr key={item.id} className="border-b border-kanvas-line-2 last:border-b-0">
                  <td className="px-3 py-2.5 text-[12px] text-kanvas-ink-3">{item.tanggal}</td>
                  <td className="px-3 py-2.5 text-kanvas-ink">{item.deskripsi}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-kanvas-ink">{formatRupiah(item.nominal)}</td>
                  <td className="px-3 py-2.5 text-[12px] text-kanvas-ink-3">{item.recordedByName}</td>
                  <td className="px-3 py-2.5">
                    {wouldBeMinus ? (
                      <AppPill tone="warn">Akan minus</AppPill>
                    ) : (
                      <AppPill tone="ok">OK</AppPill>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1.5">
                      <AppButton
                        variant="outline"
                        size="sm"
                        leading={<KanvasIcons.check size={12} />}
                        onClick={() => handleApprove(item)}
                        disabled={submitting}
                      >
                        Setujui
                      </AppButton>
                      <AppButton
                        variant="outline"
                        size="sm"
                        leading={<KanvasIcons.x size={12} />}
                        onClick={() => setRejectTarget(item)}
                      >
                        Tolak
                      </AppButton>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {rejectTarget && (
        <ApprovalRejectDialog
          pengeluaranId={rejectTarget.id}
          deskripsi={rejectTarget.deskripsi}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </div>
  )
}
