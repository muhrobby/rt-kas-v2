"use client"

import { useState, useTransition } from "react"

import { AppButton, AppCard, useToast } from "@/components/kanvas"
import { cancelEventAction } from "@/lib/actions/event"
import type { CancelEventInput } from "@/lib/validations/event"

interface ActiveEventOption {
  id: number
  nama: string
}

interface CancelEventDialogProps {
  eventId: number
  eventNama: string
  hasSumbangan: boolean
  pendingCount: number
  activeEvents: ActiveEventOption[]  // events status=AKTIF, excluding this one
  onClose: () => void
}

export function CancelEventDialog({
  eventId,
  eventNama,
  hasSumbangan,
  pendingCount,
  activeEvents,
  onClose,
}: CancelEventDialogProps) {
  const { pushToast } = useToast()
  const [reason, setReason] = useState("")
  const [handling, setHandling] = useState<"REFUND_MANUAL" | "PINDAH_KAS_RT" | "PINDAH_EVENT_LAIN">("REFUND_MANUAL")
  const [eventTujuanId, setEventTujuanId] = useState<string>("")
  const [serverError, setServerError] = useState("")
  const [submitting, startSubmit] = useTransition()

  const handleSubmit = () => {
    setServerError("")

    if (handling === "PINDAH_EVENT_LAIN" && !eventTujuanId) {
      setServerError("Pilih event tujuan.")
      return
    }

    const input: CancelEventInput = {
      id: eventId,
      reason,
      sumbanganHandling: handling,
      eventTujuanId: handling === "PINDAH_EVENT_LAIN" ? Number(eventTujuanId) : undefined,
    }

    startSubmit(async () => {
      const result = await cancelEventAction(input)
      if (result.ok) {
        pushToast(`Event "${eventNama}" berhasil dibatalkan.`, "ok")
        onClose()
      } else {
        setServerError(result.error)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <AppCard className="w-full max-w-md p-5">
        <h3 className="mb-1 text-[15px] font-semibold text-kanvas-ink">Batalkan Event</h3>
        <p className="mb-4 text-[12px] text-kanvas-ink-3">{eventNama}</p>

        {serverError && (
          <AppCard className="mb-3 border-red-200 bg-red-50 p-3 text-[12px] text-red-700">
            {serverError}
          </AppCard>
        )}

        {pendingCount > 0 && (
          <AppCard className="mb-3 border-yellow-200 bg-yellow-50 p-3 text-[12px] text-yellow-800">
            {pendingCount} pengeluaran pending akan otomatis di-reject.
          </AppCard>
        )}

        {/* Reason */}
        <div className="mb-3">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.4px] text-kanvas-ink-2">
            Alasan Pembatalan *
          </label>
          <textarea
            className="w-full rounded-lg border border-kanvas-line px-3 py-2 text-[13px]"
            rows={2}
            placeholder="Minimal 5 karakter"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        {/* Sumbangan handling — only if has sumbangan */}
        {hasSumbangan && (
          <div className="mb-3">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.4px] text-kanvas-ink-2">
              Penanganan Sumbangan
            </label>
            <div className="space-y-2">
              {[
                { value: "REFUND_MANUAL", label: "Refund manual ke warga" },
                { value: "PINDAH_KAS_RT", label: "Masukkan ke Kas RT" },
                { value: "PINDAH_EVENT_LAIN", label: "Alihkan ke event lain" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="handling"
                    value={opt.value}
                    checked={handling === opt.value}
                    onChange={() => setHandling(opt.value as typeof handling)}
                  />
                  <span className="text-[13px] text-kanvas-ink">{opt.label}</span>
                </label>
              ))}
            </div>

            {/* Event tujuan combobox */}
            {handling === "PINDAH_EVENT_LAIN" && (
              <div className="mt-2">
                <select
                  className="w-full rounded-lg border border-kanvas-line px-3 py-2 text-[13px]"
                  value={eventTujuanId}
                  onChange={(e) => setEventTujuanId(e.target.value)}
                >
                  <option value="">-- Pilih event tujuan --</option>
                  {activeEvents.map((e) => (
                    <option key={e.id} value={String(e.id)}>{e.nama}</option>
                  ))}
                </select>
              </div>
            )}

            <AppCard className="mt-2 border-yellow-200 bg-yellow-50 p-2.5 text-[11px] text-yellow-800">
              Sumbangan TALANGAN_KAS akan otomatis di-refund ke Kas RT pada semua skenario.
            </AppCard>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <AppButton variant="ghost" onClick={onClose}>Batal</AppButton>
          <AppButton variant="danger" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Membatalkan..." : "Ya, Batalkan Event"}
          </AppButton>
        </div>
      </AppCard>
    </div>
  )
}
