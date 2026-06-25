"use client"

import { useState, useTransition } from "react"
import Link from "next/link"

import { AppButton, AppCard, AppPill, KanvasIcons, useToast } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"
import { deleteEventAction } from "@/lib/actions/event"

import { submitCreateEvent, submitUpdateEvent } from "@/features/event-acara/lib/event-actions-client"
import { EventFormModal, type EventFormValues } from "./event-form-modal"

import type { EventListItem } from "@/lib/services/event-service"

const STATUS_TONE: Record<string, "neutral" | "ok" | "warn" | "danger" | "terra"> = {
  DRAFT: "neutral",
  AKTIF: "ok",
  BALANCING: "warn",
  SELESAI: "terra",
  DIBATALKAN: "danger",
}

interface EventListViewProps {
  events: EventListItem[]
  canWrite: boolean
}

export function EventListView({ events, canWrite }: EventListViewProps) {
  const { pushToast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [editEvent, setEditEvent] = useState<EventListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EventListItem | null>(null)
  const [serverError, setServerError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [submitting, startSubmit] = useTransition()
  const [deleting, startDelete] = useTransition()

  const [filterStatus, setFilterStatus] = useState("")
  const [search, setSearch] = useState("")

  const filtered = events.filter((e) => {
    if (filterStatus && e.status !== filterStatus) return false
    if (search && !e.nama.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleCreate = async (values: EventFormValues) => {
    startSubmit(async () => {
      setServerError(""); setFieldErrors({})
      const result = await submitCreateEvent(values)
      if (result.ok) { setFormOpen(false); pushToast("Event berhasil dibuat.", "ok") }
      else { setServerError(result.error); if (result.fieldErrors) setFieldErrors(result.fieldErrors) }
    })
  }

  const handleEdit = async (values: EventFormValues) => {
    if (!editEvent) return
    startSubmit(async () => {
      setServerError(""); setFieldErrors({})
      const result = await submitUpdateEvent({ id: editEvent.id, ...values })
      if (result.ok) { setEditEvent(null); pushToast("Event berhasil diperbarui.", "ok") }
      else { setServerError(result.error); if (result.fieldErrors) setFieldErrors(result.fieldErrors) }
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    startDelete(async () => {
      const result = await deleteEventAction({ id: deleteTarget.id })
      if (result.ok) { pushToast("Event berhasil dihapus.", "ok") }
      else { pushToast(result.error, "error") }
      setDeleteTarget(null)
    })
  }

  const openEdit = (e: EventListItem) => { setServerError(""); setFieldErrors({}); setEditEvent(e) }

  return (
    <div className="space-y-3.5">
      {/* Toolbar */}
      <section className="space-y-2.5 rounded-xl border border-kanvas-line bg-white p-3.5">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <KanvasIcons.search className="absolute left-3 top-1/2 -translate-y-1/2 text-kanvas-ink-4" size={13} />
              <input
                className="w-full rounded-lg border border-kanvas-line bg-white py-1.5 pl-9 pr-3 text-[13px] text-kanvas-ink placeholder:text-kanvas-ink-4 focus:border-kanvas-terra focus:outline-none"
                placeholder="Cari nama event..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="rounded-lg border border-kanvas-line bg-white px-3 py-1.5 text-[13px] text-kanvas-ink"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="DRAFT">Draft</option>
              <option value="AKTIF">Aktif</option>
              <option value="BALANCING">Balancing</option>
              <option value="SELESAI">Selesai</option>
              <option value="DIBATALKAN">Dibatalkan</option>
            </select>
          </div>
          {canWrite && (
            <AppButton variant="primary" leading={<KanvasIcons.plus size={13} />} onClick={() => { setServerError(""); setFieldErrors({}); setFormOpen(true) }}>
              Buat Event
            </AppButton>
          )}
        </div>
      </section>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-2">
        {filtered.length === 0 && (
          <AppCard className="p-4 text-center text-[12px] text-kanvas-ink-4">Belum ada event.</AppCard>
        )}
        {filtered.map((e) => (
          <AppCard key={e.id} className="p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-[14px] text-kanvas-ink truncate">{e.nama}</p>
                <p className="text-[11px] text-kanvas-ink-3 mt-0.5">{e.tanggalPelaksanaan}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <AppPill tone={STATUS_TONE[e.status] ?? "neutral"}>{e.status}</AppPill>
                  <span className="text-[11px] text-kanvas-ink-3">Saldo {formatRupiah(e.saldo)}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 border-t border-kanvas-line pt-2.5">
              <AppButton variant="outline" size="sm" leading={<KanvasIcons.arrowR size={12} />}>
                <Link href={`/admin/event/${e.id}`}>Detail</Link>
              </AppButton>
              {canWrite && (e.status === "DRAFT" || e.status === "AKTIF") && (
                <AppButton variant="outline" size="sm" leading={<KanvasIcons.edit size={12} />} onClick={() => openEdit(e)}>
                  Edit
                </AppButton>
              )}
              {canWrite && e.status === "DRAFT" && (
                <AppButton variant="danger" size="sm" leading={<KanvasIcons.trash size={12} />} onClick={() => setDeleteTarget(e)}>
                  Hapus
                </AppButton>
              )}
            </div>
          </AppCard>
        ))}
      </div>

      {/* Desktop table */}
      <AppCard className="hidden overflow-hidden p-0 lg:block">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-kanvas-line bg-kanvas-paper-2 text-[11px] text-kanvas-ink-3">
              <th className="px-3 py-2.5 font-medium">Nama</th>
              <th className="px-3 py-2.5 font-medium">Tanggal</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-3 py-2.5 font-medium text-right">Saldo</th>
              <th className="px-3 py-2.5 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-[12px] text-kanvas-ink-4">
                  Belum ada event.
                </td>
              </tr>
            )}
            {filtered.map((e) => (
              <tr key={e.id} className="border-b border-kanvas-line-2 last:border-b-0 hover:bg-kanvas-paper-2/50">
                <td className="px-3 py-2.5 font-semibold text-kanvas-ink">{e.nama}</td>
                <td className="px-3 py-2.5 text-[12px] text-kanvas-ink-3">{e.tanggalPelaksanaan}</td>
                <td className="px-3 py-2.5">
                  <AppPill tone={STATUS_TONE[e.status] ?? "neutral"}>{e.status}</AppPill>
                </td>
                <td className="px-3 py-2.5 text-right font-semibold text-kanvas-ink">
                  {formatRupiah(e.saldo)}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <AppButton variant="outline" size="sm" leading={<KanvasIcons.arrowR size={12} />}>
                      <Link href={`/admin/event/${e.id}`}>Detail</Link>
                    </AppButton>
                    {canWrite && (e.status === "DRAFT" || e.status === "AKTIF") && (
                      <AppButton variant="outline" size="sm" leading={<KanvasIcons.edit size={12} />} onClick={() => openEdit(e)}>
                        Edit
                      </AppButton>
                    )}
                    {canWrite && e.status === "DRAFT" && (
                      <AppButton variant="danger" size="sm" leading={<KanvasIcons.trash size={12} />} onClick={() => setDeleteTarget(e)}>
                        Hapus
                      </AppButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AppCard>

      {/* Modals */}
      <EventFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        serverError={serverError}
        fieldErrors={fieldErrors}
        submitting={submitting}
        mode="create"
      />

      {editEvent && (
        <EventFormModal
          open={!!editEvent}
          onClose={() => setEditEvent(null)}
          onSubmit={handleEdit}
          initialValues={{ nama: editEvent.nama, tanggalPelaksanaan: editEvent.tanggalPelaksanaan, deskripsi: "" }}
          serverError={serverError}
          fieldErrors={fieldErrors}
          submitting={submitting}
          mode="edit"
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <AppCard className="w-full max-w-xs p-5">
            <h3 className="mb-1 text-[15px] font-semibold text-kanvas-ink">Hapus Event?</h3>
            <p className="mb-4 text-[13px] text-kanvas-ink-3">
              <span className="font-medium text-kanvas-ink">&ldquo;{deleteTarget.nama}&rdquo;</span> akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <AppButton variant="ghost" onClick={() => setDeleteTarget(null)}>Batal</AppButton>
              <AppButton variant="danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Menghapus..." : "Hapus"}
              </AppButton>
            </div>
          </AppCard>
        </div>
      )}
    </div>
  )
}
