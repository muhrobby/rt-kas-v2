"use client"

import { useMemo, useState } from "react"

import { AppButton, AppCombobox, AppField, AppInput, AppModal, KanvasIcons } from "@/components/kanvas"
import { BULAN_SINGKAT } from "@/lib/constants/months"
import { formatRupiah } from "@/lib/format/currency"

import { MonthPaymentSelector } from "@/features/kas-masuk/components/month-payment-selector"
import { filterSelectableMonths } from "@/features/kas-masuk/lib/month-eligibility"
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
  notEligibleMonths?: number[]
  loadingPaidMonths?: boolean
  firstBillMonth?: number
  firstBillYear?: number
  onYearChange?: (year: number) => void
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
  notEligibleMonths = [],
  loadingPaidMonths = false,
  firstBillMonth,
  firstBillYear,
  onYearChange,
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

  const updateYear = (year: number) => {
    updateValue("tahun", year)
    onYearChange?.(year)
  }

  const selectedMonths = filterSelectableMonths(values.bulan, {
    categoryType: selectedKategori?.tipeTagihan,
    year: values.tahun,
    paidMonths,
    notEligibleMonths,
    firstBillMonth,
    firstBillYear,
  })

  const toggleMonth = (month: number) => {
    setValues((state) => {
      const selectableMonths = filterSelectableMonths(state.bulan, {
        categoryType: selectedKategori?.tipeTagihan,
        year: state.tahun,
        paidMonths,
        notEligibleMonths,
        firstBillMonth,
        firstBillYear,
      })

      if (selectedKategori?.tipeTagihan === "sekali") {
        return { ...state, bulan: selectableMonths.includes(month) ? [] : [month] }
      }

      const exists = selectableMonths.includes(month)
      const bulan = exists ? selectableMonths.filter((m) => m !== month) : [...selectableMonths, month].sort((a, b) => a - b)
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
    if ((selectedKategori?.tipeTagihan === "bulanan" || selectedKategori?.tipeTagihan === "sekali") && selectedMonths.length === 0) {
      return false
    }
    return !nextErrors.wargaId && !nextErrors.kategoriId && !nextErrors.nominal
  }

  const handleSubmit = async () => {
    if (!validate()) return
    await onSubmit({ ...values, wargaId, kategoriId, bulan: selectedMonths })
  }

  return (
    <AppModal open={open} onClose={onClose} width={600}>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
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
                if (next && values.nominal === 0) {
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

          {selectedKategori?.tipeTagihan === "bulanan" || selectedKategori?.tipeTagihan === "sekali" ? (
            <>
              <AppField label="Tahun">
                <AppInput
                  type="number"
                  min={2020}
                  max={new Date().getFullYear() + 1}
                  value={String(values.tahun)}
                  onChange={(value) => {
                    const currentYear = new Date().getFullYear()
                    const parsed = Number(value)
                    const num = Number.isFinite(parsed) ? parsed : currentYear
                    const maxYear = currentYear + 1
                    updateYear(Math.min(Math.max(num, 2020), maxYear))
                  }}
                />
              </AppField>

              <AppField label={`Pilih Bulan Pembayaran${selectedMonths.length > 0 ? ` (${selectedMonths.length} bulan dipilih)` : ""}`} hint={selectedKategori?.tipeTagihan === "sekali" ? "Pilih satu bulan periode kategori ini berlaku. Bulan tercoret = sudah dibayar." : "Bulan tercoret = sudah dibayar. Bulan tersamarkan = belum eligible."}>
                {loadingPaidMonths ? (
                  <p className="text-[11px] text-kanvas-ink-3">Memuat...</p>
                ) : (
                  <MonthPaymentSelector
                    paidMonths={paidMonths}
                    notEligibleMonths={notEligibleMonths}
                    selectedMonths={selectedMonths}
                    onToggle={toggleMonth}
                    firstBillMonth={firstBillMonth ?? 1}
                    firstBillYear={firstBillYear ?? 2000}
                    tahun={values.tahun}
                    disableEligibilityCheck={selectedKategori?.tipeTagihan === "sekali"}
                  />
                )}
              </AppField>
              {selectedKategori?.tipeTagihan === "bulanan" && firstBillMonth != null && firstBillYear != null && values.tahun < firstBillYear ? (
                <p className="mt-1 text-[11px] text-kanvas-ink-3">
                  Tagihan warga ini belum dimulai.
                </p>
              ) : null}
              {selectedKategori?.tipeTagihan === "bulanan" && firstBillMonth != null && firstBillYear != null && values.tahun === firstBillYear && firstBillMonth > 1 ? (
                <p className="mt-1 text-[11px] text-kanvas-ink-3">
                  Tagihan warga ini mulai {BULAN_SINGKAT[firstBillMonth - 1]} {firstBillYear}.
                </p>
              ) : null}
              {(selectedKategori?.tipeTagihan === "bulanan" || selectedKategori?.tipeTagihan === "sekali") && selectedMonths.length === 0 ? (
                <p className="-mt-1 text-[11px] text-kanvas-danger">Pilih minimal 1 bulan.</p>
              ) : null}
            </>
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
            <AppButton type="button" variant="outline" onClick={onClose}>
              Batal
            </AppButton>
            <AppButton
              type="submit"
              variant="primary"
              leading={<KanvasIcons.check size={13} />}
              disabled={submitting}
            >
              {submitting ? "Menyimpan..." : "Simpan Pembayaran"}
            </AppButton>
          </div>
        </div>
      </form>
    </AppModal>
  )
}
