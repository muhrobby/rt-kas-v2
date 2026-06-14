"use client"

import { useState, useTransition } from "react"

import { AppButton, AppCard, KanvasIcons, useToast } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"
import { taruhDiKasAction } from "@/lib/actions/transfer-kas-event"

interface TaruhDiKasButtonProps {
  eventId: number
  saldo: number
  pendingCount: number
  /** status must be BALANCING, passed from parent */
  disabled?: boolean
}

export function TaruhDiKasButton({ eventId, saldo, pendingCount }: TaruhDiKasButtonProps) {
  const { pushToast } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, startSubmit] = useTransition()

  const canTransfer = saldo > 0 && pendingCount === 0
  const disabledReason = !canTransfer
    ? saldo <= 0
      ? "Tidak ada sisa dana"
      : `Masih ada ${pendingCount} pengeluaran pending`
    : null

  const handleConfirm = () => {
    startSubmit(async () => {
      const result = await taruhDiKasAction({ eventId })
      if (result.ok) {
        pushToast(`Rp ${result.data.nominal.toLocaleString("id-ID")} berhasil dipindah ke Kas RT.`, "ok")
        setConfirmOpen(false)
      } else {
        pushToast(result.error, "error")
        setConfirmOpen(false)
      }
    })
  }

  return (
    <>
      <div title={disabledReason ?? undefined}>
        <AppButton
          variant="outline"
          size="sm"
          leading={<KanvasIcons.wallet size={13} />}
          disabled={!canTransfer || submitting}
          onClick={() => setConfirmOpen(true)}
        >
          Taruh di Kas
        </AppButton>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <AppCard className="w-full max-w-sm p-5">
            <h3 className="mb-2 text-[15px] font-semibold text-kanvas-ink">Taruh Sisa Dana di Kas RT?</h3>
            <p className="mb-1 text-[13px] text-kanvas-ink-3">
              Sisa dana sebesar{" "}
              <span className="font-semibold text-kanvas-success">{formatRupiah(saldo)}</span>{" "}
              akan dicatat sebagai pemasukan Kas RT.
            </p>
            <p className="mb-4 text-[12px] text-kanvas-ink-4">
              Saldo event akan menjadi Rp 0. Status event tetap BALANCING.
            </p>
            <div className="flex justify-end gap-2">
              <AppButton variant="ghost" onClick={() => setConfirmOpen(false)}>Batal</AppButton>
              <AppButton onClick={handleConfirm} disabled={submitting}>
                {submitting ? "Memproses..." : "Ya, Taruh di Kas"}
              </AppButton>
            </div>
          </AppCard>
        </div>
      )}
    </>
  )
}
