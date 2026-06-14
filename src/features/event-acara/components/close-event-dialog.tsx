"use client"

import { useTransition } from "react"

import { AppButton, AppCard, useToast } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"
import { closeEventAction } from "@/lib/actions/event"

interface CloseEventDialogProps {
  eventId: number
  saldo: number
  pendingCount: number
  totalSumbangan: number
  totalApproved: number
  onClose: () => void
}

export function CloseEventDialog({
  eventId,
  saldo,
  pendingCount,
  totalSumbangan,
  totalApproved,
  onClose,
}: CloseEventDialogProps) {
  const { pushToast } = useToast()
  const [submitting, startSubmit] = useTransition()

  const canClose = saldo === 0 && pendingCount === 0
  const reasons: string[] = []
  if (saldo !== 0) reasons.push(`Saldo masih ${formatRupiah(Math.abs(saldo))}`)
  if (pendingCount > 0) reasons.push(`${pendingCount} pengeluaran masih pending`)

  const handleConfirm = () => {
    startSubmit(async () => {
      const result = await closeEventAction({ id: eventId })
      if (result.ok) {
        pushToast("Event berhasil ditutup.", "ok")
        onClose()
      } else {
        pushToast(result.error, "error")
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <AppCard className="w-full max-w-sm p-5">
        <h3 className="mb-3 text-[15px] font-semibold text-kanvas-ink">Tutup Event?</h3>

        {/* Ringkasan */}
        <div className="mb-4 space-y-1.5 rounded-lg border border-kanvas-line bg-kanvas-paper-2 p-3 text-[12px]">
          <div className="flex justify-between">
            <span className="text-kanvas-ink-3">Total Sumbangan</span>
            <span className="font-semibold text-kanvas-ink">{formatRupiah(totalSumbangan)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-kanvas-ink-3">Total Pengeluaran</span>
            <span className="font-semibold text-kanvas-ink">{formatRupiah(totalApproved)}</span>
          </div>
          <div className="flex justify-between border-t border-kanvas-line pt-1.5">
            <span className="font-semibold text-kanvas-ink-2">Saldo Akhir</span>
            <span className={`font-semibold ${saldo === 0 ? "text-kanvas-success" : "text-kanvas-danger"}`}>
              {formatRupiah(saldo)}
            </span>
          </div>
        </div>

        {!canClose && (
          <AppCard className="mb-4 border-red-200 bg-red-50 p-3 text-[12px] text-red-700">
            Tidak bisa tutup event:
            <ul className="mt-1 list-disc pl-4">
              {reasons.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </AppCard>
        )}

        {canClose && (
          <p className="mb-4 text-[12px] text-kanvas-ink-3">
            Event akan ditutup dan statusnya tidak bisa diubah lagi.
          </p>
        )}

        <div className="flex justify-end gap-2">
          <AppButton variant="ghost" onClick={onClose}>Batal</AppButton>
          <AppButton onClick={handleConfirm} disabled={!canClose || submitting}>
            {submitting ? "Menutup..." : "Tutup Event"}
          </AppButton>
        </div>
      </AppCard>
    </div>
  )
}
