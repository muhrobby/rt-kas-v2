"use client"

import { useState, useTransition } from "react"

import { AppButton, AppPill, KanvasIcons, useToast } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"
import { createSumbanganAction, createBulkSumbanganMandiriAction } from "@/lib/actions/sumbangan-event"
import { SUMBER_LABEL } from "@/features/event-acara/lib/sumber-sumbangan-options"
import { SumbanganFormDialog } from "./sumbangan-form-dialog"

import type { StatusEvent } from "@/lib/constants/event-status"
import type { SumberSumbangan } from "@/lib/validations/sumbangan-event"
import type { SumbanganListItem } from "@/lib/services/sumbangan-event-service"

interface SumbanganTabProps {
  eventId: number
  eventStatus: StatusEvent
  sumbanganList: SumbanganListItem[]
  totalSumbangan: number
  canWrite: boolean
}

export function SumbanganTab({
  eventId,
  eventStatus,
  sumbanganList,
  totalSumbangan,
  canWrite,
}: SumbanganTabProps) {
  const { pushToast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [serverError, setServerError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [submitting, startSubmit] = useTransition()

  // Bulk state: array of {wargaId, nominal}
  const [bulkRows, setBulkRows] = useState<{ wargaId: string; nominal: string }[]>([
    { wargaId: "", nominal: "" },
  ])

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
        setFormOpen(false)
        pushToast("Sumbangan berhasil dicatat.", "ok")
      } else {
        setServerError(result.error)
        if (result.fieldErrors) setFieldErrors(result.fieldErrors)
      }
    })
  }

  const handleBulkSubmit = async () => {
    const items = bulkRows
      .filter((r) => r.wargaId && r.nominal)
      .map((r) => ({ wargaId: Number(r.wargaId), nominal: Number(r.nominal) }))

    if (items.length === 0) return

    startSubmit(async () => {
      setServerError("")
      const result = await createBulkSumbanganMandiriAction({ eventId, items })
      if (result.ok) {
        setBulkOpen(false)
        setBulkRows([{ wargaId: "", nominal: "" }])
        pushToast(`${result.data.count} sumbangan berhasil dicatat.`, "ok")
      } else {
        setServerError(result.error)
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <AppPill tone="neutral">{formatRupiah(totalSumbangan)} Total</AppPill>
        {canWrite && (
          <div className="flex flex-wrap gap-2">
            <AppButton variant="primary" leading={<KanvasIcons.plus size={13} />} onClick={() => { setServerError(""); setFieldErrors({}); setFormOpen(true) }}>
              Catat Sumbangan
            </AppButton>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-kanvas-line">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-kanvas-line bg-kanvas-paper-2 text-[11px] text-kanvas-ink-3">
              <th className="px-3 py-2.5 font-medium">Tanggal</th>
              <th className="px-3 py-2.5 font-medium">Warga</th>
              <th className="px-3 py-2.5 font-medium text-right">Nominal</th>
              <th className="px-3 py-2.5 font-medium">Sumber</th>
              <th className="px-3 py-2.5 font-medium">Pencatat</th>
              <th className="px-3 py-2.5 font-medium">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {sumbanganList.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-[12px] text-kanvas-ink-4">Belum ada sumbangan.</td></tr>
            )}
            {sumbanganList.map((s) => (
              <tr key={s.id} className="border-b border-kanvas-line-2 last:border-b-0">
                <td className="px-3 py-2.5 text-[12px] text-kanvas-ink-3">{s.tanggal}</td>
                <td className="px-3 py-2.5 text-kanvas-ink">
                  {s.wargaNama ?? <span className="text-kanvas-ink-4 italic">Pengurus</span>}
                  {s.wargaBlok && <span className="ml-1 text-[11px] text-kanvas-ink-4">{s.wargaBlok}</span>}
                </td>
                <td className="px-3 py-2.5 text-right font-semibold text-kanvas-ink">{formatRupiah(s.nominal)}</td>
                <td className="px-3 py-2.5">
                  <AppPill tone={s.sumber === "TALANGAN_KAS" ? "warn" : "neutral"}>
                    {SUMBER_LABEL[s.sumber as SumberSumbangan] ?? s.sumber}
                  </AppPill>
                </td>
                <td className="px-3 py-2.5 text-[12px] text-kanvas-ink-3">{s.recordedByName}</td>
                <td className="px-3 py-2.5 text-[12px] text-kanvas-ink-3">{s.keterangan ?? "—"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-kanvas-line bg-kanvas-paper-2">
              <td colSpan={2} className="px-3 py-2.5 text-[12px] font-semibold text-kanvas-ink-2">Total</td>
              <td className="px-3 py-2.5 text-right font-semibold text-kanvas-ink">{formatRupiah(totalSumbangan)}</td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Single form dialog */}
      <SumbanganFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        eventId={eventId}
        eventStatus={eventStatus}
        onSubmit={handleSubmit}
        serverError={serverError}
        fieldErrors={fieldErrors}
        submitting={submitting}
      />

      {/* Bulk dialog */}
      {bulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="p-5">
              <h2 className="mb-4 text-lg font-semibold text-kanvas-ink">Catat Bulk Sumbangan Mandiri</h2>
              {serverError && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}
              <div className="max-h-80 overflow-y-auto space-y-2">
                {bulkRows.map((row, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      className="flex-1 rounded-lg border border-kanvas-line px-3 py-2 text-sm"
                      placeholder="ID Warga"
                      type="number"
                      value={row.wargaId}
                      onChange={(e) => {
                        const next = [...bulkRows]
                        next[i] = { ...next[i], wargaId: e.target.value }
                        setBulkRows(next)
                      }}
                    />
                    <input
                      className="w-32 rounded-lg border border-kanvas-line px-3 py-2 text-sm"
                      placeholder="Nominal"
                      type="number"
                      value={row.nominal}
                      onChange={(e) => {
                        const next = [...bulkRows]
                        next[i] = { ...next[i], nominal: e.target.value }
                        setBulkRows(next)
                      }}
                    />
                    <button
                      type="button"
                      className="text-kanvas-ink-4 hover:text-red-600"
                      onClick={() => setBulkRows(bulkRows.filter((_, j) => j !== i))}
                    >
                      <KanvasIcons.x size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  className="text-sm text-kanvas-terra hover:underline disabled:opacity-40"
                  disabled={bulkRows.length >= 50}
                  onClick={() => setBulkRows([...bulkRows, { wargaId: "", nominal: "" }])}
                >
                  + Tambah Baris ({bulkRows.length}/50)
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-kanvas-line px-5 py-3">
              <AppButton type="button" variant="ghost" onClick={() => { setBulkOpen(false); setServerError("") }}>Batal</AppButton>
              <AppButton type="button" onClick={handleBulkSubmit} disabled={submitting}>
                {submitting ? "Menyimpan..." : "Simpan Semua"}
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
