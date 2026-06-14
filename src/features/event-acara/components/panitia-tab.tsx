"use client"

import { useState, useTransition } from "react"

import { AppButton, KanvasIcons, useToast } from "@/components/kanvas"
import { appointPanitiaAction, removePanitiaAction } from "@/lib/actions/event-panitia"

import { PanitiaFormDialog } from "./panitia-form-dialog"

import type { PanitiaListItem } from "@/lib/services/event-panitia-service"

interface PanitiaTabProps {
  eventId: number
  panitiaList: PanitiaListItem[]
  canManage: boolean
}

export function PanitiaTab({ eventId, panitiaList, canManage }: PanitiaTabProps) {
  const { pushToast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [serverError, setServerError] = useState("")
  const [submitting, startSubmit] = useTransition()

  const handleAppoint = async (userId: string) => {
    startSubmit(async () => {
      setServerError("")
      const result = await appointPanitiaAction({ eventId, userId })
      if (result.ok) {
        setDialogOpen(false)
        pushToast("Panitia berhasil ditunjuk.", "ok")
      } else {
        setServerError(result.error)
      }
    })
  }

  const handleRemove = async (userId: string) => {
    startSubmit(async () => {
      const result = await removePanitiaAction({ eventId, userId })
      if (result.ok) {
        pushToast("Panitia berhasil dicabut.", "ok")
      } else {
        pushToast(result.error, "error")
      }
    })
  }

  const activeList = panitiaList.filter((p) => p.isActive)

  return (
    <div className="space-y-3">
      {canManage && (
        <div className="flex justify-end">
          <AppButton variant="primary" leading={<KanvasIcons.plus size={13} />} onClick={() => { setServerError(""); setDialogOpen(true) }}>
            Tambah Panitia
          </AppButton>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-kanvas-line">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-kanvas-line bg-kanvas-paper-2 text-[11px] text-kanvas-ink-3">
              <th className="px-3 py-2.5 font-medium">Nama</th>
              <th className="px-3 py-2.5 font-medium">Email/Warga</th>
              <th className="px-3 py-2.5 font-medium">Ditunjuk oleh</th>
              <th className="px-3 py-2.5 font-medium">Sejak</th>
              {canManage && <th className="px-3 py-2.5 font-medium">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {activeList.length === 0 && (
              <tr>
                <td colSpan={canManage ? 5 : 4} className="px-3 py-8 text-center text-[12px] text-kanvas-ink-4">
                  Belum ada panitia.
                </td>
              </tr>
            )}
            {activeList.map((p) => (
              <tr key={p.id} className="border-b border-kanvas-line-2 last:border-b-0">
                <td className="px-3 py-2.5 font-semibold text-kanvas-ink">{p.userName}</td>
                <td className="px-3 py-2.5 text-[12px] text-kanvas-ink-3">{p.wargaNama ?? "—"}</td>
                <td className="px-3 py-2.5 text-[12px] text-kanvas-ink-3">{p.appointedByName}</td>
                <td className="px-3 py-2.5 text-[12px] text-kanvas-ink-3">
                  {new Date(p.appointedAt).toLocaleDateString("id-ID")}
                </td>
                {canManage && (
                  <td className="px-3 py-2.5">
                    <button
                      className="text-[12px] text-kanvas-danger hover:underline disabled:opacity-50"
                      onClick={() => handleRemove(p.userId)}
                      disabled={submitting}
                    >
                      Cabut
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PanitiaFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        eventId={eventId}
        onSubmit={handleAppoint}
        serverError={serverError}
        submitting={submitting}
      />
    </div>
  )
}
