"use client"

import { useState, useTransition } from "react"

import { AppButton, KanvasIcons, useToast } from "@/components/kanvas"
import { bulkCreatePengeluaranAction } from "@/lib/actions/pengeluaran-event"

interface BulkRow {
  deskripsi: string
  nominal: string
  tanggal: string
}

const emptyRow = (): BulkRow => ({
  deskripsi: "",
  nominal: "",
  tanggal: new Date().toISOString().slice(0, 10),
})

interface PengeluaranBulkFormProps {
  eventId: number
  onClose: () => void
}

export function PengeluaranBulkForm({ eventId, onClose }: PengeluaranBulkFormProps) {
  const { pushToast } = useToast()
  const [rows, setRows] = useState<BulkRow[]>([emptyRow()])
  const [serverError, setServerError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [submitting, startSubmit] = useTransition()

  const updateRow = (i: number, field: keyof BulkRow, value: string) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))
  }

  const removeRow = (i: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = () => {
    const items = rows.map((r) => ({
      deskripsi: r.deskripsi,
      nominal: Number(r.nominal),
      tanggal: r.tanggal,
    }))

    startSubmit(async () => {
      setServerError("")
      setFieldErrors({})
      const result = await bulkCreatePengeluaranAction({ eventId, items })
      if (result.ok) {
        pushToast(`${result.data.count} pengeluaran berhasil dicatat.`, "ok")
        onClose()
      } else {
        setServerError(result.error)
        if (result.fieldErrors) setFieldErrors(result.fieldErrors)
      }
    })
  }

  const getItemError = (index: number, field: string): string | undefined => {
    const key = `items.${index}.${field}`
    // Zod nested arrays flatten as items[idx].field or items.idx.field
    return fieldErrors[key]?.[0]
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(29,22,18,0.45)] backdrop-blur-[2px] p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="p-5">
          <h2 className="mb-4 text-lg font-semibold text-kanvas-ink">Catat Pengeluaran Event</h2>

          {serverError && (
            <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>
          )}

          <div className="max-h-96 overflow-y-auto space-y-2">
            {rows.map((row, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-start rounded-lg border border-kanvas-line p-2">
                <div className="flex-1 space-y-1">
                  <input
                    className="w-full rounded-lg border border-kanvas-line px-3 py-2 text-sm"
                    placeholder="Deskripsi"
                    value={row.deskripsi}
                    onChange={(e) => updateRow(i, "deskripsi", e.target.value)}
                  />
                  {getItemError(i, "deskripsi") && (
                    <p className="text-xs text-red-600">{getItemError(i, "deskripsi")}</p>
                  )}
                </div>
                <div className="w-full sm:w-32 space-y-1">
                  <input
                    className="w-full rounded-lg border border-kanvas-line px-3 py-2 text-sm"
                    placeholder="Nominal"
                    type="number"
                    value={row.nominal}
                    onChange={(e) => updateRow(i, "nominal", e.target.value)}
                  />
                  {getItemError(i, "nominal") && (
                    <p className="text-xs text-red-600">{getItemError(i, "nominal")}</p>
                  )}
                </div>
                <div className="w-full sm:w-36 space-y-1">
                  <input
                    className="w-full rounded-lg border border-kanvas-line px-3 py-2 text-sm"
                    type="date"
                    value={row.tanggal}
                    onChange={(e) => updateRow(i, "tanggal", e.target.value)}
                  />
                  {getItemError(i, "tanggal") && (
                    <p className="text-xs text-red-600">{getItemError(i, "tanggal")}</p>
                  )}
                </div>
                <button
                  type="button"
                  className="self-end sm:self-start sm:mt-2 text-kanvas-ink-4 hover:text-red-600"
                  onClick={() => removeRow(i)}
                  disabled={rows.length <= 1}
                >
                  <KanvasIcons.x size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              className="text-sm text-kanvas-terra hover:underline disabled:opacity-40"
              disabled={rows.length >= 50}
              onClick={() => setRows([...rows, emptyRow()])}
            >
              + Tambah Baris ({rows.length}/50)
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-kanvas-line px-5 py-3">
          <AppButton type="button" variant="ghost" onClick={onClose}>
            Batal
          </AppButton>
          <AppButton type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Menyimpan..." : "Simpan Semua"}
          </AppButton>
        </div>
      </div>
    </div>
  )
}
