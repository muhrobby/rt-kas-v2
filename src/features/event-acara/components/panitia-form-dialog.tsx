"use client"

import { useEffect, useState, useTransition } from "react"

import { AppButton, AppCombobox, AppModal } from "@/components/kanvas"
import type { AppComboboxOption } from "@/components/kanvas"
import { listAvailableUsersAction, registerAndAppointPanitiaAction } from "@/lib/actions/event-panitia"

type Mode = "existing" | "new"

interface PanitiaFormDialogProps {
  open: boolean
  onClose: () => void
  eventId: number
  onSubmit: (userId: string) => Promise<void>
  serverError?: string
  submitting?: boolean
}

export function PanitiaFormDialog({
  open,
  onClose,
  eventId,
  onSubmit,
  serverError: externalError,
  submitting = false,
}: PanitiaFormDialogProps) {
  const [mode, setMode] = useState<Mode>("existing")
  const [selectedUserId, setSelectedUserId] = useState("")
  const [options, setOptions] = useState<AppComboboxOption[]>([])
  const [, startFetch] = useTransition()

  // New user fields
  const [nama, setNama] = useState("")
  const [phone, setPhone] = useState("")
  const [regError, setRegError] = useState("")
  const [registering, startRegister] = useTransition()

  useEffect(() => {
    if (!open) return
    startFetch(async () => {
      const users = await listAvailableUsersAction(eventId)
      setOptions(users.map((u) => ({ id: u.id, label: u.name, subLabel: u.email })))
    })
  }, [open, eventId])

  const handleSubmitExisting = async () => {
    if (!selectedUserId) return
    await onSubmit(selectedUserId)
    setSelectedUserId("")
  }

  const handleRegisterNew = () => {
    setRegError("")
    startRegister(async () => {
      const result = await registerAndAppointPanitiaAction({ eventId, nama, phone })
      if (result.ok) {
        setNama("")
        setPhone("")
        onClose()
      } else {
        setRegError(result.error)
      }
    })
  }

  const serverError = externalError || regError

  return (
    <AppModal open={open} onClose={onClose} width={520}>
      <div className="p-5 space-y-4">
        <h2 className="text-lg font-semibold text-kanvas-ink">Tambah Panitia</h2>

        {serverError && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-700">{serverError}</p>
        )}

        {/* Mode toggle */}
        <div className="flex border-b border-kanvas-line">
          <button
            type="button"
            onClick={() => setMode("existing")}
            className={`px-3 py-2 text-[13px] font-medium border-b-2 transition ${
              mode === "existing" ? "border-kanvas-terra text-kanvas-terra" : "border-transparent text-kanvas-ink-3"
            }`}
          >
            Pilih User
          </button>
          <button
            type="button"
            onClick={() => setMode("new")}
            className={`px-3 py-2 text-[13px] font-medium border-b-2 transition ${
              mode === "new" ? "border-kanvas-terra text-kanvas-terra" : "border-transparent text-kanvas-ink-3"
            }`}
          >
            Daftarkan Baru
          </button>
        </div>

        {mode === "existing" && (
          <AppCombobox
            value={selectedUserId}
            onChange={setSelectedUserId}
            options={options}
            placeholder="Cari nama atau email user..."
          />
        )}

        {mode === "new" && (
          <div className="space-y-3">
            <p className="text-[12px] text-kanvas-ink-3">
              Daftarkan panitia baru. Akun akan dibuat otomatis dengan no. telp sebagai username dan password awal.
            </p>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.4px] text-kanvas-ink-2">Nama *</label>
              <input
                className="w-full rounded-lg border border-kanvas-line px-3 py-2 text-[13px] focus:border-kanvas-terra focus:outline-none"
                placeholder="Nama lengkap"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.4px] text-kanvas-ink-2">No. Telepon *</label>
              <input
                className="w-full rounded-lg border border-kanvas-line px-3 py-2 text-[13px] focus:border-kanvas-terra focus:outline-none"
                placeholder="08xxxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="mt-1 text-[11px] text-kanvas-ink-4">Digunakan sebagai username login & password awal.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 border-t border-kanvas-line px-5 py-3">
        <AppButton type="button" variant="ghost" onClick={onClose} disabled={submitting || registering}>
          Batal
        </AppButton>
        {mode === "existing" ? (
          <AppButton
            type="button"
            onClick={handleSubmitExisting}
            disabled={submitting || !selectedUserId}
          >
            {submitting ? "Menyimpan..." : "Tunjuk Panitia"}
          </AppButton>
        ) : (
          <AppButton
            type="button"
            onClick={handleRegisterNew}
            disabled={registering || !nama.trim() || !phone.trim()}
          >
            {registering ? "Mendaftarkan..." : "Daftar & Tunjuk"}
          </AppButton>
        )}
      </div>
    </AppModal>
  )
}
