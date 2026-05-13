"use client"

import { useState } from "react"

import { AppButton, AppField, AppInput, AppModal, KanvasIcons } from "@/components/kanvas"
import type { Warga } from "@/types/rt-kas"

interface TogglePengurusDialogProps {
  open: boolean
  warga: Warga | null
  onClose: () => void
  onConfirm: (warga: Warga, role: string) => Promise<void> | void
  submitting?: boolean
}

export function TogglePengurusDialog({ open, warga, onClose, onConfirm, submitting = false }: TogglePengurusDialogProps) {
  // Initial role derived from prop. Parent re-mounts via key prop on warga.id change,
  // so this initializer runs fresh per target — no setState in effect needed.
  const [role, setRole] = useState<string>(warga?.rolePengurus ?? "")

  if (!warga) return null

  const turningOn = !warga.isPengurus

  return (
    <AppModal open={open} onClose={onClose} width={480}>
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.7px] text-kanvas-ink-4 uppercase">Status Pengurus</p>
            <h2 className="mt-1 text-xl text-kanvas-ink">
              {turningOn ? "Jadikan Pengurus" : "Non-aktifkan Pengurus"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-kanvas-ink-3" aria-label="Tutup dialog">
            <KanvasIcons.x size={18} />
          </button>
        </div>

        <p className="mb-4 text-[13px] text-kanvas-ink-2">
          {turningOn
            ? <><span className="font-semibold">{warga.nama}</span> akan dijadikan pengurus RT.</>
            : <>Status pengurus <span className="font-semibold">{warga.nama}</span> akan dinonaktifkan.</>
          }
        </p>

        {turningOn ? (
          <AppField label="Role Pengurus">
            <AppInput
              value={role}
              onChange={setRole}
              placeholder="Mis. Ketua, Sekretaris, Bendahara"
            />
          </AppField>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <AppButton variant="outline" onClick={onClose} disabled={submitting}>
            Batal
          </AppButton>
          <AppButton variant="primary" onClick={() => onConfirm(warga, role)} disabled={submitting}>
            {submitting ? "Menyimpan..." : "Simpan"}
          </AppButton>
        </div>
      </div>
    </AppModal>
  )
}
