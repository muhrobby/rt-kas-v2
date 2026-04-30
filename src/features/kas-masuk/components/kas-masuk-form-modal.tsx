"use client"

import { useMemo, useState } from "react"

import { AppButton, AppCombobox, AppField, AppInput, AppModal, AppPill, KanvasIcons } from "@/components/kanvas"
import { BULAN_SINGKAT } from "@/lib/constants/months"
import { formatRupiah } from "@/lib/format/currency"

import { MonthPaymentSelector } from "@/features/kas-masuk/components/month-payment-selector"
import type { KategoriOptionUi, WargaOptionUi } from "@/features/kas-masuk/lib/kas-masuk-actions-client"

export interface KasMasukFormValues {
  wargaId: string
  kategoriId: string
  bulan: number[]
  tahun: number
  nominal: number
  catatan: string
}

interface KasMasukFormModalProps {
  open: boolean
  onClose: () => void
  wargaOptions: WargaOptionUi[]
  kategoriOptions: KategoriOptionUi[]
  wargaId: string
  kategoriId: string
  onWargaChange: (id: string) => void
  onKategoriChange: (id: string) => void
  initialValues: KasMasukFormValues
  onSubmit: (values: KasMasukFormValues) => Promise<void>
  serverError?: string
  fieldErrors?: Record<string, string[]>
  submitting?: boolean
  paidMonths?: number[]
  oneTimePaid?: boolean
  loadingPaidMonths?: boolean
}

export function KasMasukFormModal({
  open,
  onClose,
  wargaOptions,
  kategoriOptions,
  wargaId,
  kategoriId,
  onWargaChange,
  onKategoriChange,
  initialValues,
  onSubmit,
  serverError,
  fieldErrors,
  submitting = false,
  paidMonths = [],
  oneTimePaid = false,
  loadingPaidMonths = false,
}: KasMasukFormModalProps) {
  const [values, setValues] = useState<KasMasukFormValues>(initialValues)
  const [errors, setErrors] = useState({ wargaId: "", kategoriId: "", nominal: "" })

  const selectedKategori = useMemo(
    () => kategoriOptions.find((item) => item.id === kategoriId),
    [kategoriOptions, kategoriId],
  )

  const updateValue = <K extends keyof KasMasukFormValues>(key: K, value: KasMasukFormValues[K]) => {
    setValues((state) => ({ ...state, [key]: value }))
  }

  const toggleMonth = (month: number) => {
    setValues((state) => {
      const exists = state.bulan.includes(month)
      const bulan = exists ? state.bulan.filter((m) => m !== month) : [...state.bulan, month].sort((a, b) => a - b)
      return { ...state, bulan }
    })
  }

  const validate = () => {
    const nextErrors = {
      wargaId: wargaId ? "" : "Pilih warga.",
      kategoriId: kategoriId ? "" : "Pilih kategori.",
      nominal: values.nominal > 0 ? "" : "Nominal harus lebih dari 0.",
    }
    setErrors(nextErrors)
    if (selectedKategori?.tipeTagihan === "bulanan" && values.bulan.length === 0) {
      return false
    }
    return !nextErrors.wargaId && !nextErrors.kategoriId && !nextErrors.nominal
  }

  const handleSubmit = async () => {
    if (!validate()) return
    await onSubmit({ ...values, wargaId, kategoriId })
  }

  return (
    <AppModal open={open} onClose={onClose} width={600}>
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.7px] text-kanvas-ink-4 uppercase">Kas Masuk</p>
            <h2 className="mt-1 text-2xl text-kanvas-ink">Input Pembayaran Iuran</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-kanvas-ink-3" aria-label="Tutup modal kas masuk">
            <KanvasIcons.x size={18} />
          </button>
        </div>

        <AppField label="Warga">
          <AppCombobox
            value={wargaId}
            onChange={onWargaChange}
            options={wargaOptions}
            placeholder="Pilih warga..."
            renderItem={(option) => {
              const item = option as WargaOptionUi
              return (
                <div>
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-[11px] text-kanvas-ink-4">{item.sub}</p>
                </div>
              )
            }}
          />
          {errors.wargaId || fieldErrors?.wargaId?.[0] ? (
            <p className="mt-1 text-[11px] text-kanvas-danger">{errors.wargaId || fieldErrors?.wargaId?.[0]}</p>
          ) : null}
        </AppField>

        <AppField label="Kategori Masuk">
          <AppCombobox
            value={kategoriId}
            onChange={(value) => {
              onKategoriChange(value)
              const next = kategoriOptions.find((item) => item.id === value)
              if (next) {
                updateValue("nominal", next.nominal)
              }
            }}
            options={kategoriOptions}
            placeholder="Pilih kategori..."
            renderItem={(option) => {
              const item = option as KategoriOptionUi
              return (
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-[11px] text-kanvas-ink-4">{item.sub}</p>
                  </div>
                  <p className="text-[12px] text-kanvas-ink-3">{formatRupiah(item.nominal)}</p>
                </div>
              )
            }}
          />
          {errors.kategoriId || fieldErrors?.kategoriId?.[0] ? (
            <p className="mt-1 text-[11px] text-kanvas-danger">{errors.kategoriId || fieldErrors?.kategoriId?.[0]}</p>
          ) : null}
        </AppField>

        {selectedKategori?.tipeTagihan === "bulanan" ? (
          <>
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3">
              <AppField label="Tahun">
                <AppInput
                  type="number"
                  min={2020}
                  value={String(values.tahun)}
                  onChange={(value) => updateValue("tahun", Number(value || new Date().getFullYear()))}
                />
              </AppField>
              <AppField label="Bulan Dipilih">
                <div className="rounded-lg border border-kanvas-line bg-white px-3 py-2.5 text-[13px] text-kanvas-ink">
                  {values.bulan.length > 0
                    ? `${values.bulan.map((month) => BULAN_SINGKAT[month - 1]).join(", ")} ${values.tahun}`
                    : "Belum ada bulan dipilih"}
                </div>
              </AppField>
            </div>

            <AppField label="Selector Bulan" hint="Bulan tercoret = sudah dibayar">
              {loadingPaidMonths ? (
                <p className="text-[11px] text-kanvas-ink-3">Memuat...</p>
              ) : (
                <MonthPaymentSelector
                  paidMonths={paidMonths}
                  selectedMonths={values.bulan}
                  onToggle={toggleMonth}
                />
              )}
            </AppField>
            {selectedKategori?.tipeTagihan === "bulanan" && values.bulan.length === 0 ? (
              <p className="-mt-1 text-[11px] text-kanvas-danger">Pilih minimal 1 bulan.</p>
            ) : null}
          </>
        ) : null}

        {selectedKategori?.tipeTagihan === "sekali" ? (
          <div className="mb-3 rounded-lg border border-kanvas-line bg-kanvas-paper p-2.5 text-[12px] text-kanvas-ink-3">
            <div className="mb-1 flex items-center gap-2">
              <AppPill tone={oneTimePaid ? "ok" : "warn"}>{oneTimePaid ? "Sudah dibayar" : "Belum dibayar"}</AppPill>
              <span>Kategori sekali bayar tidak memerlukan pemilihan bulan.</span>
            </div>
          </div>
        ) : null}

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

        </div>

        <AppField label="Catatan" optional>
          <AppInput value={values.catatan} onChange={(value) => updateValue("catatan", value)} placeholder="Mis. transfer BCA" />
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
            {submitting ? "Menyimpan..." : "Simpan Pembayaran"}
          </AppButton>
        </div>
      </div>
    </AppModal>
  )
}
