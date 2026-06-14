"use client"

import { useState, useTransition } from "react"

import { AppButton, AppCard, KanvasIcons, useToast } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"
import { createSumbanganAction } from "@/lib/actions/sumbangan-event"
import type { StatusEvent } from "@/lib/constants/event-status"
import type { SumberSumbangan } from "@/lib/validations/sumbangan-event"

import { SumbanganFormDialog } from "./sumbangan-form-dialog"

interface TutupDefisitSectionProps {
  eventId: number
  eventStatus: StatusEvent
  defisit: number // abs(saldo) saat saldo < 0
}

export function TutupDefisitSection({ eventId, eventStatus, defisit }: TutupDefisitSectionProps) {
  const { pushToast } = useToast()
  const [activeSumber, setActiveSumber] = useState<SumberSumbangan | null>(null)
  const [serverError, setServerError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [submitting, startSubmit] = useTransition()

  const handleSubmit = async (values: {
    wargaId: number | null
    nominal: number
    sumber: SumberSumbangan
    tanggal: string
    keterangan: string
  }) => {
    startSubmit(async () => {
      setServerError("")
      setFieldErrors({})
      const result = await createSumbanganAction({
        eventId,
        wargaId: values.wargaId,
        nominal: values.nominal,
        sumber: values.sumber,
        tanggal: values.tanggal,
        keterangan: values.keterangan || undefined,
      })
      if (result.ok) {
        setActiveSumber(null)
        pushToast("Defisit berhasil ditutup.", "ok")
      } else {
        setServerError(result.error)
        if (result.fieldErrors) setFieldErrors(result.fieldErrors)
      }
    })
  }

  const shortcuts: { sumber: SumberSumbangan; label: string; icon: keyof typeof KanvasIcons }[] = [
    { sumber: "TALANGAN_KAS", label: "Talangan Kas RT", icon: "wallet" },
    { sumber: "URUNAN_PENGURUS", label: "Urunan Pengurus", icon: "users" },
    { sumber: "SUMBANGAN_TAMBAHAN_WARGA", label: "Sumbangan Tambahan", icon: "plus" },
  ]

  return (
    <>
      <AppCard className="border-red-200 bg-red-50 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold text-red-700">
              Tutup Defisit {formatRupiah(defisit)}
            </p>
            <p className="text-[11px] text-red-600 mt-0.5">
              Pilih sumber dana untuk menutup kekurangan saldo event.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {shortcuts.map(({ sumber, label, icon }) => {
              const Icon = KanvasIcons[icon]
              return (
                <AppButton
                  key={sumber}
                  variant="outline"
                  size="sm"
                  leading={<Icon size={12} />}
                  onClick={() => { setServerError(""); setFieldErrors({}); setActiveSumber(sumber) }}
                >
                  {label}
                </AppButton>
              )
            })}
          </div>
        </div>
      </AppCard>

      {activeSumber && (
        <SumbanganFormDialog
          open={!!activeSumber}
          onClose={() => setActiveSumber(null)}
          eventId={eventId}
          eventStatus={eventStatus}
          initialSumber={activeSumber}
          initialNominal={defisit}
          onSubmit={handleSubmit}
          serverError={serverError}
          fieldErrors={fieldErrors}
          submitting={submitting}
        />
      )}
    </>
  )
}
