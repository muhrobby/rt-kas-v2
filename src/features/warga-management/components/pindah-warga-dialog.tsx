"use client"

import { useState } from "react"

import { AppButton, AppField, AppInput, AppModal } from "@/components/kanvas"

interface PindahWargaDialogProps {
  open: boolean
  wargaNama: string
  onClose: () => void
  onConfirm: (tglPindah: string) => Promise<void>
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function PindahWargaDialog({ open, wargaNama, onClose, onConfirm }: PindahWargaDialogProps) {
  const [tglPindah, setTglPindah] = useState(todayStr())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleConfirm = async () => {
    if (!tglPindah) {
      setError("Tanggal pindah wajib diisi.")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      await onConfirm(tglPindah)
    } catch {
      setError("Gagal menyimpan data pindah.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppModal open={open} onClose={onClose} width={400}>
      <div className="p-4 sm:p-6">
        <h3 className="mb-1 text-lg font-semibold text-kanvas-ink">Tandai Warga Pindah</h3>
        <p className="mb-4 text-[13px] text-kanvas-ink-3">
          Warga <span className="font-semibold">{wargaNama}</span> akan ditandai pindah dan dikeluarkan dari perhitungan aktif.
        </p>
        <AppField label="Tanggal Pindah">
          <AppInput type="date" value={tglPindah} onChange={setTglPindah} />
        </AppField>
        {error && <p className="mt-1 text-[11px] text-kanvas-danger">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <AppButton type="button" variant="outline" onClick={onClose} disabled={submitting}>Batal</AppButton>
          <AppButton type="button" variant="primary" onClick={handleConfirm} disabled={submitting}>
            {submitting ? "Menyimpan..." : "Konfirmasi Pindah"}
          </AppButton>
        </div>
      </div>
    </AppModal>
  )
}
