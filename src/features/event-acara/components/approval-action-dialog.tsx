"use client"

import { useState, useTransition } from "react"

import { AppButton, useToast } from "@/components/kanvas"
import { rejectPengeluaranAction } from "@/lib/actions/pengeluaran-event-approval"

interface ApprovalRejectDialogProps {
  pengeluaranId: number
  deskripsi: string
  onClose: () => void
}

export function ApprovalRejectDialog({ pengeluaranId, deskripsi, onClose }: ApprovalRejectDialogProps) {
  const { pushToast } = useToast()
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const [submitting, startSubmit] = useTransition()

  const handleSubmit = () => {
    startSubmit(async () => {
      setError("")
      const result = await rejectPengeluaranAction({ id: pengeluaranId, reason })
      if (result.ok) {
        pushToast("Pengeluaran ditolak.", "ok")
        onClose()
      } else {
        setError(result.fieldErrors?.reason?.[0] ?? result.error)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-xl p-5">
        <h3 className="mb-2 text-base font-semibold text-kanvas-ink">Tolak Pengeluaran</h3>
        <p className="mb-3 text-sm text-kanvas-ink-2">&ldquo;{deskripsi}&rdquo;</p>
        {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-kanvas-ink-2">Alasan penolakan *</label>
          <textarea
            className="w-full rounded-lg border border-kanvas-line px-3 py-2 text-sm"
            rows={3}
            placeholder="Minimal 5 karakter"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <AppButton variant="ghost" onClick={onClose}>Batal</AppButton>
          <AppButton onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Menolak..." : "Tolak"}
          </AppButton>
        </div>
      </div>
    </div>
  )
}
