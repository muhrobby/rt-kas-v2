"use client"

import { useState } from "react"

import { AppButton, AppField, AppInput, AppModal } from "@/components/kanvas"

export interface EventFormValues {
  nama: string
  tanggalPelaksanaan: string
  deskripsi: string
}

interface EventFormModalProps {
  open: boolean
  onClose: () => void
  initialValues?: EventFormValues
  onSubmit: (values: EventFormValues) => Promise<void>
  serverError?: string
  fieldErrors?: Record<string, string[]>
  submitting?: boolean
  mode?: "create" | "edit"
}

export function EventFormModal({
  open,
  onClose,
  initialValues,
  onSubmit,
  serverError,
  fieldErrors,
  submitting = false,
  mode = "create",
}: EventFormModalProps) {
  const [values, setValues] = useState<EventFormValues>(
    initialValues ?? { nama: "", tanggalPelaksanaan: "", deskripsi: "" },
  )

  const updateValue = <K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) => {
    setValues((s) => ({ ...s, [key]: value }))
  }

  const handleSubmit = async () => {
    await onSubmit(values)
  }

  return (
    <AppModal open={open} onClose={onClose} width={480}>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
        <div className="space-y-4 p-5">
          <h2 className="text-lg font-semibold text-kanvas-ink">
            {mode === "create" ? "Buat Event Baru" : "Edit Event"}
          </h2>

          {serverError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>
          )}

          <AppField label="Nama Event" hint={fieldErrors?.nama?.[0] ? <span className="text-red-600">{fieldErrors.nama[0]}</span> : undefined}>
            <AppInput
              value={values.nama}
              onChange={(val) => updateValue("nama", val)}
              placeholder="Contoh: 17 Agustus 2025"
              maxLength={150}
            />
          </AppField>

          <AppField label="Tanggal Pelaksanaan" hint={fieldErrors?.tanggalPelaksanaan?.[0] ? <span className="text-red-600">{fieldErrors.tanggalPelaksanaan[0]}</span> : undefined}>
            <AppInput
              type="date"
              value={values.tanggalPelaksanaan}
              onChange={(val) => updateValue("tanggalPelaksanaan", val)}
            />
          </AppField>

          <AppField label="Deskripsi" optional hint={fieldErrors?.deskripsi?.[0] ? <span className="text-red-600">{fieldErrors.deskripsi[0]}</span> : undefined}>
            <textarea
              className="w-full rounded-lg border border-kanvas-line bg-white px-3 py-2 text-sm text-kanvas-ink placeholder:text-kanvas-ink-4 focus:border-kanvas-terra focus:outline-none"
              rows={3}
              value={values.deskripsi}
              onChange={(e) => updateValue("deskripsi", e.target.value)}
              placeholder="Deskripsi singkat event..."
              maxLength={2000}
            />
          </AppField>
        </div>

        <div className="flex justify-end gap-2 border-t border-kanvas-line px-5 py-3">
          <AppButton type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </AppButton>
          <AppButton type="submit" disabled={submitting}>
            {submitting ? "Menyimpan..." : mode === "create" ? "Buat Event" : "Simpan"}
          </AppButton>
        </div>
      </form>
    </AppModal>
  )
}
