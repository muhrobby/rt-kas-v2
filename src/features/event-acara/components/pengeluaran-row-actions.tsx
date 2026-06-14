"use client"

import { useState, useTransition } from "react"

import { AppButton, KanvasIcons, useToast } from "@/components/kanvas"
import { updatePengeluaranAction, deletePengeluaranAction } from "@/lib/actions/pengeluaran-event"
import type { PengeluaranListItem } from "@/lib/services/pengeluaran-event-service"

interface PengeluaranRowActionsProps {
  item: PengeluaranListItem
  eventId: number
}

export function PengeluaranRowActions({ item }: PengeluaranRowActionsProps) {
  const { pushToast } = useToast()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [submitting, startSubmit] = useTransition()

  // Edit state
  const [deskripsi, setDeskripsi] = useState(item.deskripsi)
  const [nominal, setNominal] = useState(String(item.nominal))
  const [tanggal, setTanggal] = useState(item.tanggal)
  const [error, setError] = useState("")

  const handleEdit = () => {
    startSubmit(async () => {
      setError("")
      const result = await updatePengeluaranAction({
        id: item.id,
        deskripsi,
        nominal: Number(nominal),
        tanggal,
      })
      if (result.ok) {
        setEditOpen(false)
        pushToast("Pengeluaran berhasil diupdate.", "ok")
      } else {
        setError(result.error)
      }
    })
  }

  const handleDelete = () => {
    startSubmit(async () => {
      const result = await deletePengeluaranAction({ id: item.id })
      if (result.ok) {
        pushToast("Pengeluaran berhasil dihapus.", "ok")
      } else {
        pushToast(result.error, "error")
      }
      setDeleteConfirm(false)
    })
  }

  return (
    <div className="flex gap-1">
      <button
        type="button"
        onClick={() => setEditOpen(true)}
        className="rounded p-1 text-kanvas-ink-4 hover:bg-kanvas-paper-2 hover:text-kanvas-ink"
        title="Edit"
      >
        <KanvasIcons.edit size={14} />
      </button>
      <button
        type="button"
        onClick={() => setDeleteConfirm(true)}
        className="rounded p-1 text-kanvas-ink-4 hover:bg-red-50 hover:text-red-600"
        title="Hapus"
      >
        <KanvasIcons.trash size={14} />
      </button>

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(29,22,18,0.45)] backdrop-blur-[2px] p-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-xl p-5">
            <h3 className="mb-4 text-base font-semibold text-kanvas-ink">Edit Pengeluaran</h3>
            {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-kanvas-ink-2">Deskripsi</label>
                <input
                  className="w-full rounded-lg border border-kanvas-line px-3 py-2 text-sm"
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-kanvas-ink-2">Nominal</label>
                <input
                  className="w-full rounded-lg border border-kanvas-line px-3 py-2 text-sm"
                  type="number"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-kanvas-ink-2">Tanggal</label>
                <input
                  className="w-full rounded-lg border border-kanvas-line px-3 py-2 text-sm"
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <AppButton variant="ghost" onClick={() => setEditOpen(false)}>Batal</AppButton>
              <AppButton onClick={handleEdit} disabled={submitting}>
                {submitting ? "Menyimpan..." : "Simpan"}
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(29,22,18,0.45)] backdrop-blur-[2px] p-4">
          <div className="w-full max-w-xs rounded-xl bg-white shadow-xl p-5">
            <h3 className="mb-2 text-base font-semibold text-kanvas-ink">Hapus Pengeluaran?</h3>
            <p className="mb-4 text-sm text-kanvas-ink-2">
              &ldquo;{item.deskripsi}&rdquo; akan dihapus permanen.
            </p>
            <div className="flex justify-end gap-2">
              <AppButton variant="ghost" onClick={() => setDeleteConfirm(false)}>Batal</AppButton>
              <AppButton onClick={handleDelete} disabled={submitting}>
                {submitting ? "Menghapus..." : "Hapus"}
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
