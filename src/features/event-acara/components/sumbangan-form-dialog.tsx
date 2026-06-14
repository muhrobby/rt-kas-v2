"use client"

import { useEffect, useState, useTransition } from "react"

import { AppButton, AppCombobox, AppField, AppInput, AppModal } from "@/components/kanvas"
import type { AppComboboxOption } from "@/components/kanvas"
import { listWargaAction } from "@/lib/actions/warga"
import { SUMBER_LABEL, allowedSumberByStatus } from "@/features/event-acara/lib/sumber-sumbangan-options"

import type { StatusEvent } from "@/lib/constants/event-status"
import type { SumberSumbangan } from "@/lib/validations/sumbangan-event"

interface SumbanganFormValues {
  wargaId: number | null
  nominal: number
  sumber: SumberSumbangan
  tanggal: string
  keterangan: string
}

interface SumbanganFormDialogProps {
  open: boolean
  onClose: () => void
  eventId: number
  eventStatus: StatusEvent
  initialSumber?: SumberSumbangan
  initialNominal?: number
  onSubmit: (values: SumbanganFormValues) => Promise<void>
  serverError?: string
  fieldErrors?: Record<string, string[]>
  submitting?: boolean
}

export function SumbanganFormDialog({
  open,
  onClose,
  eventStatus,
  initialSumber,
  initialNominal,
  onSubmit,
  serverError,
  fieldErrors,
  submitting = false,
}: SumbanganFormDialogProps) {
  const today = new Date().toISOString().slice(0, 10)
  const allowedSumber = allowedSumberByStatus(eventStatus)


  const [values, setValues] = useState<SumbanganFormValues>({
    wargaId: null,
    nominal: initialNominal ?? 0,
    sumber: initialSumber ?? allowedSumber[0] ?? "MANDIRI_WARGA",
    tanggal: today,
    keterangan: "",
  })
  const [wargaOptions, setWargaOptions] = useState<AppComboboxOption[]>([])
  const [, startFetch] = useTransition()

  useEffect(() => {
    if (!open) return
    const allowed = allowedSumberByStatus(eventStatus)
    startFetch(async () => {
      // Reset form + fetch warga options when dialog opens
      setValues({
        wargaId: null,
        nominal: initialNominal ?? 0,
        sumber: initialSumber ?? allowed[0] ?? "MANDIRI_WARGA",
        tanggal: today,
        keterangan: "",
      })
      const result = await listWargaAction({})
      setWargaOptions(
        result.data.map((w) => ({
          id: String(w.id),
          label: w.nama,
          subLabel: w.blok,
        })),
      )
    })
  }, [open, initialSumber, initialNominal, today, eventStatus])


  const needsWarga = values.sumber !== "URUNAN_PENGURUS" && values.sumber !== "TALANGAN_KAS"

  return (
    <AppModal open={open} onClose={onClose} width={480}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(values) }}>
        <div className="space-y-4 p-5">
          <h2 className="text-lg font-semibold text-kanvas-ink">Catat Sumbangan</h2>

          {serverError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>
          )}

          <AppField label="Sumber">
            <select
              className="w-full rounded-lg border border-kanvas-line bg-white px-3 py-2 text-sm text-kanvas-ink"
              value={values.sumber}
              onChange={(e) => setValues((v) => ({ ...v, sumber: e.target.value as SumberSumbangan, wargaId: null }))}
            >
              {allowedSumber.map((s) => (
                <option key={s} value={s}>{SUMBER_LABEL[s]}</option>
              ))}
            </select>
          </AppField>

          {needsWarga && (
            <AppField label="Warga" hint={fieldErrors?.wargaId?.[0] ? <span className="text-red-600">{fieldErrors.wargaId[0]}</span> : undefined}>
              <AppCombobox
                value={values.wargaId ? String(values.wargaId) : ""}
                onChange={(val) => setValues((v) => ({ ...v, wargaId: Number(val) || null }))}
                options={wargaOptions}
                placeholder="Cari nama warga..."
              />
            </AppField>
          )}

          <AppField label="Nominal (Rp)" hint={fieldErrors?.nominal?.[0] ? <span className="text-red-600">{fieldErrors.nominal[0]}</span> : undefined}>
            <AppInput
              type="number"
              value={String(values.nominal)}
              onChange={(val) => setValues((v) => ({ ...v, nominal: Number(val) || 0 }))}
              min="0"
            />
          </AppField>

          <AppField label="Tanggal">
            <AppInput
              type="date"
              value={values.tanggal}
              onChange={(val) => setValues((v) => ({ ...v, tanggal: val }))}
            />
          </AppField>

          <AppField label="Keterangan" optional>
            <AppInput
              value={values.keterangan}
              onChange={(val) => setValues((v) => ({ ...v, keterangan: val }))}
              placeholder="Opsional..."
            />
          </AppField>
        </div>

        <div className="flex justify-end gap-2 border-t border-kanvas-line px-5 py-3">
          <AppButton type="button" variant="ghost" onClick={onClose} disabled={submitting}>Batal</AppButton>
          <AppButton type="submit" disabled={submitting}>
            {submitting ? "Menyimpan..." : "Catat Sumbangan"}
          </AppButton>
        </div>
      </form>
    </AppModal>
  )
}
