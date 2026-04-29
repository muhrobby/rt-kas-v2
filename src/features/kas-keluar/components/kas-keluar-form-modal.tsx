"use client"

import { useState } from "react"

import { AppButton, AppCombobox, AppField, AppInput, AppModal, KanvasIcons } from "@/components/kanvas"

import type { KategoriKeluarOptionUi } from "@/features/kas-keluar/lib/kas-keluar-actions-client"

export interface KasKeluarFormValues {
  kategoriId: string
  nominal: number
  tanggal: string
  catatan: string
}

interface KasKeluarFormModalProps {
  open: boolean
  onClose: () => void
  kategoriOptions: KategoriKeluarOptionUi[]
  initialValues: KasKeluarFormValues
  onSubmit: (values: KasKeluarFormValues) => Promise<void>
  serverError?: string
  fieldErrors?: Record<string, string[]>
  submitting?: boolean
}

export function KasKeluarFormModal({
  open,
  onClose,
  kategoriOptions,
  initialValues,
  onSubmit,
  serverError,
  fieldErrors,
  submitting = false,
}: KasKeluarFormModalProps) {
  const [values, setValues] = useState<KasKeluarFormValues>(initialValues)
  const [errors, setErrors] = useState({ kategoriId: "", nominal: "", tanggal: "" })

  const updateValue = <K extends keyof KasKeluarFormValues>(key: K, value: KasKeluarFormValues[K]) => {
    setValues((state) => ({ ...state, [key]: value }))
  }

  const validate = () => {
    const nextErrors = {
      kategoriId: values.kategoriId ? "" : "Pilih kategori.",
      nominal: values.nominal > 0 ? "" : "Nominal harus lebih dari 0.",
      tanggal: values.tanggal ? "" : "Tanggal transaksi wajib diisi.",
    }

    setErrors(nextErrors)
    return !nextErrors.kategoriId && !nextErrors.nominal && !nextErrors.tanggal
  }

  const handleSubmit = async () => {
    if (!validate()) return
    await onSubmit(values)
  }

  return (
    <AppModal open={open} onClose={onClose} width={560}>
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.7px] text-kanvas-ink-4 uppercase">Kas Keluar</p>
            <h2 className="mt-1 text-2xl text-kanvas-ink">Input Pengeluaran</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-kanvas-ink-3" aria-label="Tutup modal kas keluar">
            <KanvasIcons.x size={18} />
          </button>
        </div>

        <AppField label="Kategori Pengeluaran">
          <AppCombobox
            value={values.kategoriId}
            onChange={(value) => {
              updateValue("kategoriId", value)
              const next = kategoriOptions.find((item) => item.id === value)
              if (next) {
                updateValue("nominal", next.nominal)
              }
            }}
            options={kategoriOptions}
            placeholder="Pilih kategori..."
            renderItem={(option) => {
              const item = option as KategoriKeluarOptionUi
              return (
                <div>
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-[11px] text-kanvas-ink-4">{item.sub}</p>
                </div>
              )
            }}
          />
          {errors.kategoriId || fieldErrors?.kategoriId?.[0] ? (
            <p className="mt-1 text-[11px] text-kanvas-danger">{errors.kategoriId || fieldErrors?.kategoriId?.[0]}</p>
          ) : null}
        </AppField>

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3">
          <AppField label="Nominal">
            <AppInput
              type="number"
              min={0}
              value={String(values.nominal)}
              onChange={(value) => updateValue("nominal", Number(value || 0))}
            />
            {errors.nominal || fieldErrors?.nominal?.[0] ? (
              <p className="mt-1 text-[11px] text-kanvas-danger">{errors.nominal || fieldErrors?.nominal?.[0]}</p>
            ) : null}
          </AppField>

          <AppField label="Tanggal Transaksi">
            <AppInput
              type="date"
              value={values.tanggal}
              onChange={(value) => updateValue("tanggal", value)}
            />
            {errors.tanggal || fieldErrors?.tanggal?.[0] ? (
              <p className="mt-1 text-[11px] text-kanvas-danger">{errors.tanggal || fieldErrors?.tanggal?.[0]}</p>
            ) : null}
          </AppField>
        </div>

        <AppField label="Catatan" optional>
          <AppInput
            value={values.catatan}
            onChange={(value) => updateValue("catatan", value)}
            placeholder="Mis. transfer honor satpam"
          />
        </AppField>

        {serverError ? (
          <div className="mt-2 rounded-lg border border-kanvas-danger-soft bg-kanvas-info-soft p-2.5 text-[11.5px] text-kanvas-danger">
            {serverError}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <AppButton variant="outline" onClick={onClose}>
            Batal
          </AppButton>
          <AppButton
            variant="primary"
            onClick={handleSubmit}
            leading={<KanvasIcons.check size={13} />}
            disabled={submitting}
          >
            {submitting ? "Menyimpan..." : "Simpan Pengeluaran"}
          </AppButton>
        </div>
      </div>
    </AppModal>
  )
}
