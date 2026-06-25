"use client"

import { useState } from "react"

import { AppButton, AppField, AppModal, KanvasIcons } from "@/components/kanvas"
import type { Warga } from "@/types/rt-kas"

const ADMIN_ROLE_OPTIONS = [
  { value: "ketua_rt", label: "Ketua RT" },
  { value: "bendahara", label: "Bendahara" },
  { value: "sekretaris", label: "Sekretaris" },
  { value: "anggota", label: "Anggota Pengurus" },
] as const

interface TogglePengurusDialogProps {
  open: boolean
  warga: Warga | null
  onClose: () => void
  onConfirm: (warga: Warga, adminRole: string) => Promise<void> | void
  submitting?: boolean
}

export function TogglePengurusDialog({ open, warga, onClose, onConfirm, submitting = false }: TogglePengurusDialogProps) {
  const [adminRole, setAdminRole] = useState("")
  const [error, setError] = useState("")

  if (!warga) return null

  const turningOn = !warga.isPengurus

  const handleConfirm = () => {
    if (turningOn && !adminRole) {
      setError("Sub-role wajib dipilih.")
      return
    }
    setError("")
    onConfirm(warga, adminRole)
  }

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
            : <>Status pengurus <span className="font-semibold">{warga.nama}</span> ({warga.rolePengurus}) akan dinonaktifkan.</>
          }
        </p>

        {turningOn && (
          <AppField label="Sub-role Pengurus">
            <select
              className="w-full rounded-lg border border-kanvas-line bg-white px-3 py-2 text-sm text-kanvas-ink outline-none focus:border-kanvas-terra"
              value={adminRole}
              onChange={(e) => { setAdminRole(e.target.value); setError("") }}
            >
              <option value="">— Pilih sub-role —</option>
              {ADMIN_ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {error && <p className="mt-1 text-[11px] text-kanvas-danger">{error}</p>}
          </AppField>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <AppButton variant="outline" onClick={onClose} disabled={submitting}>Batal</AppButton>
          <AppButton variant="primary" onClick={handleConfirm} disabled={submitting}>
            {submitting ? "Menyimpan..." : "Simpan"}
          </AppButton>
        </div>
      </div>
    </AppModal>
  )
}
