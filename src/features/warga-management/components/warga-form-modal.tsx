"use client"

import { useState } from "react"

import { AppButton, AppField, AppInput, AppModal, KanvasIcons } from "@/components/kanvas"

import type { WargaFormMode, WargaFormValues } from "@/features/warga-management/types"

interface WargaFormModalProps {
  open: boolean
  mode: WargaFormMode
  initialValues: WargaFormValues
  onClose: () => void
  onSubmit: (values: WargaFormValues) => Promise<void> | void
  serverError?: string
  fieldErrors?: Partial<Record<keyof WargaFormValues, string[]>>
}

const emptyErrorState = {
  nama: "",
  blok: "",
  telp: "",
  pindah: "",
}

export function WargaFormModal({ open, mode, initialValues, onClose, onSubmit, serverError, fieldErrors }: WargaFormModalProps) {
  const [values, setValues] = useState<WargaFormValues>(initialValues)
  const [errors, setErrors] = useState(emptyErrorState)
  const [submitting, setSubmitting] = useState(false)
  const title = mode === "add" ? "Tambah Warga Baru" : "Edit Data Warga"

  const updateField = <K extends keyof WargaFormValues>(key: K, value: WargaFormValues[K]) => {
    setValues((state) => ({ ...state, [key]: value }))
  }

  const validate = () => {
    const nextErrors = {
      nama: values.nama.trim() ? "" : "Nama wajib diisi.",
      blok: values.blok.trim() ? "" : "Blok wajib diisi.",
      telp: values.telp.trim() ? "" : "Nomor telepon wajib diisi.",
      pindah: values.statusHunian === "kontrak" && !values.pindah ? "Batas domisili wajib diisi untuk kontrak." : "",
    }

    setErrors(nextErrors)
    return !nextErrors.nama && !nextErrors.blok && !nextErrors.telp && !nextErrors.pindah
  }

  const handleSubmit = async () => {
    if (!validate()) {
      return
    }
    setSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppModal open={open} onClose={onClose} width={560}>
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.7px] text-kanvas-ink-4 uppercase">Data Warga</p>
            <h2 className="mt-1 text-2xl text-kanvas-ink">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-kanvas-ink-3" aria-label="Tutup modal warga">
            <KanvasIcons.x size={18} />
          </button>
        </div>

        <AppField label="Nama Kepala Keluarga">
          <AppInput value={values.nama} onChange={(value) => updateField("nama", value)} placeholder="Mis. Bambang Sutrisno" />
           {errors.nama || fieldErrors?.nama?.[0] ? <p className="mt-1 text-[11px] text-kanvas-danger">{errors.nama || fieldErrors?.nama?.[0]}</p> : null}
        </AppField>

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3">
          <AppField label="Blok Rumah">
            <AppInput value={values.blok} onChange={(value) => updateField("blok", value)} placeholder="Mis. C-04" />
            {errors.blok || fieldErrors?.blok?.[0] ? <p className="mt-1 text-[11px] text-kanvas-danger">{errors.blok || fieldErrors?.blok?.[0]}</p> : null}
          </AppField>

          <AppField label="No. Telepon" hint="Dipakai sebagai username login">
            <AppInput value={values.telp} onChange={(value) => updateField("telp", value)} placeholder="08xx-xxxx-xxxx" />
            {errors.telp || fieldErrors?.telp?.[0] ? <p className="mt-1 text-[11px] text-kanvas-danger">{errors.telp || fieldErrors?.telp?.[0]}</p> : null}
          </AppField>
        </div>

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3">
          <AppField label="Status Hunian">
            <div className="inline-flex w-full rounded-lg border border-kanvas-line bg-white p-0.5">
              {[
                { value: "tetap", label: "Tetap" },
                { value: "kontrak", label: "Kontrak" },
              ].map((option) => {
                const active = values.statusHunian === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField("statusHunian", option.value as WargaFormValues["statusHunian"])}
                    className="flex-1 rounded-md px-3 py-2 text-xs font-semibold"
                    style={{
                      background: active ? "var(--kanvas-terra)" : "transparent",
                      color: active ? "#ffffff" : "var(--kanvas-ink-2)",
                    }}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </AppField>

          <AppField label="Jumlah Anggota">
            <AppInput
              type="number"
              min={1}
              value={String(values.jumlahAnggota)}
              onChange={(value) => updateField("jumlahAnggota", Number(value || 0))}
              placeholder="Jumlah anggota"
            />
          </AppField>
        </div>

        <AppField
          label="Batas Domisili"
          hint={values.statusHunian === "kontrak" ? "Wajib untuk status kontrak" : "Tidak wajib untuk status tetap"}
          optional={values.statusHunian === "tetap"}
        >
          <AppInput
            type="date"
            value={values.pindah}
            onChange={(value) => updateField("pindah", value)}
            disabled={values.statusHunian === "tetap"}
          />
          {errors.pindah || fieldErrors?.pindah?.[0] ? <p className="mt-1 text-[11px] text-kanvas-danger">{errors.pindah || fieldErrors?.pindah?.[0]}</p> : null}
        </AppField>

        {serverError ? (
          <div className="mt-2 rounded-lg border border-kanvas-danger-soft bg-kanvas-danger-soft p-2.5 text-[11.5px] text-kanvas-danger">{serverError}</div>
        ) : (
          <div className="mt-2 rounded-lg border border-kanvas-line bg-kanvas-paper p-2.5 text-[11.5px] text-kanvas-ink-3">
            Akun login warga akan dibuat otomatis dengan username nomor telepon.
          </div>
        )}

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <AppButton variant="outline" onClick={onClose}>
            Batal
          </AppButton>
          <AppButton variant="primary" onClick={handleSubmit} leading={<KanvasIcons.check size={13} />} disabled={submitting}>
            {submitting ? "Menyimpan..." : mode === "add" ? "Simpan Warga" : "Simpan Perubahan"}
          </AppButton>
        </div>
      </div>
    </AppModal>
  )
}
