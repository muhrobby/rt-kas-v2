"use client"

import { useState, useTransition } from "react"

import { AppButton, useToast } from "@/components/kanvas"
import { submitTransitionStatus } from "@/features/event-acara/lib/event-actions-client"
import { ALLOWED_TRANSITIONS, type StatusEvent } from "@/lib/constants/event-status"
import type { Permission } from "@/lib/constants/admin-roles"

const TRANSITION_LABELS: Partial<Record<StatusEvent, string>> = {
  AKTIF: "Aktifkan",
  BALANCING: "Mulai Balancing",
}

// Which permission is needed for each target status
const TRANSITION_PERMISSION: Partial<Record<StatusEvent, Permission>> = {
  AKTIF: "event.write",
  BALANCING: "event.write",
}

interface EventStatusActionsProps {
  eventId: number
  currentStatus: StatusEvent
  permissions: Permission[]
}

export function EventStatusActions({
  eventId,
  currentStatus,
  permissions,
}: EventStatusActionsProps) {
  const { pushToast } = useToast()
  const [submitting, startSubmit] = useTransition()
  const [confirmTarget, setConfirmTarget] = useState<StatusEvent | null>(null)

  // Only show transitions handled here (AKTIF, BALANCING). Close/Cancel have their own dialogs.
  const targets = ALLOWED_TRANSITIONS[currentStatus].filter(
    (t) => t !== "SELESAI" && t !== "DIBATALKAN",
  )

  const hasPermission = (target: StatusEvent) => {
    const needed = TRANSITION_PERMISSION[target]
    return !needed || permissions.includes(needed)
  }

  const handleConfirm = () => {
    if (!confirmTarget) return
    startSubmit(async () => {
      const result = await submitTransitionStatus({ id: eventId, target: confirmTarget })
      if (result.ok) {
        pushToast(`Status diubah ke ${confirmTarget}.`, "ok")
      } else {
        pushToast(result.error, "error")
      }
      setConfirmTarget(null)
    })
  }

  if (targets.length === 0) return null

  return (
    <>
      <div className="flex gap-2">
        {targets.map((target) => (
          <AppButton
            key={target}
            variant="primary"
            disabled={!hasPermission(target) || submitting}
            onClick={() => setConfirmTarget(target)}
          >
            {TRANSITION_LABELS[target] ?? target}
          </AppButton>
        ))}
      </div>

      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xs rounded-xl bg-white shadow-xl p-5">
            <h3 className="mb-2 text-base font-semibold text-kanvas-ink">Ubah Status?</h3>
            <p className="mb-4 text-sm text-kanvas-ink-2">
              Status akan diubah ke <strong>{confirmTarget}</strong>.
            </p>
            <div className="flex justify-end gap-2">
              <AppButton variant="ghost" onClick={() => setConfirmTarget(null)}>Batal</AppButton>
              <AppButton onClick={handleConfirm} disabled={submitting}>
                {submitting ? "Memproses..." : "Konfirmasi"}
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
