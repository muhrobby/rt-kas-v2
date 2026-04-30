"use client"

import { useState } from "react"

import { AppButton, AppField, AppInput, AppModal, KanvasIcons } from "@/components/kanvas"
import type { JenisArus, KategoriKas, TipeTagihan } from "@/types/rt-kas"

export interface KategoriFormValues {
  nama: string
  jenisArus: JenisArus
  tipeTagihan: TipeTagihan
  nominalDefault: number
}

interface KategoriFormModalProps {
  open: boolean
  mode: "add" | "edit"
  initialValues: KategoriFormValues
  onClose: () => void
  onSubmit: (values: KategoriFormValues) => Promise<void>
  serverError?: string
  fieldErrors?: Partial<Record<keyof KategoriFormValues, string[]>>
}

export function mapKategoriToFormValues(item: KategoriKas): KategoriFormValues {
  return {
    nama: item.nama,
    jenisArus: item.jenisArus,
    tipeTagihan: item.tipeTagihan,
    nominalDefault: item.nominalDefault,
  }
}

const emptyErrors = {
  nama: "",
  nominalDefault: "",
}

export function KategoriFormModal({
  open,
  mode,
  initialValues,
  onClose,
  onSubmit,
  serverError,
  fieldErrors,
}: KategoriFormModalProps) {
  const [values, setValues] = useState<KategoriFormValues>(initialValues)
  const [errors, setErrors] = useState(emptyErrors)
  const [submitting, setSubmitting] = useState(false)

  const updateField = <K extends keyof KategoriFormValues>(key: K, value: KategoriFormValues[K]) => {
    setValues((state) => ({ ...state, [key]: value }))
  }

  const validate = () => {
    const nextErrors = {
      nama: values.nama.trim() ? "" : "Nama kategori wajib diisi.",
      nominalDefault: values.nominalDefault >= 0 ? "" : "Nominal default tidak boleh negatif.",
    }
    setErrors(nextErrors)
    return !nextErrors.nama && !nextErrors.nominalDefault
  }

  const handleSubmit = async () => {
    if (!validate()) return
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
            <p className="text-[11px] font-semibold tracking-[0.7px] text-kanvas-ink-4 uppercase">Kategori Kas</p>
            <h2 className="mt-1 text-2xl text-kanvas-ink">
              {mode === "add" ? "Tambah Kategori" : "Edit Kategori"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-kanvas-ink-3"
            aria-label="Tutup modal kategori"
          >
            <KanvasIcons.x size={18} />
          </button>
        </div>

        <AppField label="Nama Kategori">
          <AppInput
            value={values.nama}
            onChange={(value) => updateField("nama", value)}
            placeholder="Mis. Iuran Lingkungan"
          />
          {errors.nama || fieldErrors?.nama?.[0] ? (
            <p className="mt-1 text-[11px] text-kanvas-danger">
              {errors.nama || fieldErrors?.nama?.[0]}
            </p>
          ) : null}
        </AppField>

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3">
          <AppField label="Jenis Arus">
            <div className="inline-flex w-full rounded-lg border border-kanvas-line bg-white p-0.5">
              {[
                { id: "masuk", label: "Masuk" },
                { id: "keluar", label: "Keluar" },
              ].map((option) => {
                const active = values.jenisArus === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateField("jenisArus", option.id as JenisArus)}
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

          <AppField label="Tipe Tagihan">
            <div className="inline-flex w-full rounded-lg border border-kanvas-line bg-white p-0.5">
              {[
                { id: "bulanan", label: "Bulanan" },
                { id: "sekali", label: "Sekali" },
              ].map((option) => {
                const active = values.tipeTagihan === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateField("tipeTagihan", option.id as TipeTagihan)}
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
        </div>

        <AppField label="Nominal Default">
          <AppInput
            type="number"
            min={0}
            value={String(values.nominalDefault)}
            onChange={(value) => updateField("nominalDefault", Number(value || 0))}
            placeholder="0"
          />
          {errors.nominalDefault || fieldErrors?.nominalDefault?.[0] ? (
            <p className="mt-1 text-[11px] text-kanvas-danger">
              {errors.nominalDefault || fieldErrors?.nominalDefault?.[0]}
            </p>
          ) : null}
        </AppField>

        {serverError ? (
          <div className="mt-2 rounded-lg border border-kanvas-danger-soft bg-kanvas-danger-soft p-2.5 text-[11.5px] text-kanvas-danger">
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
            {submitting ? "Menyimpan..." : mode === "add" ? "Simpan Kategori" : "Simpan Perubahan"}
          </AppButton>
        </div>
      </div>
    </AppModal>
  )
}
