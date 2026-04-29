"use client"

import { AppButton, AppCard, AppPill, KanvasIcons } from "@/components/kanvas"
import { PaginationControls } from "@/components/shared/pagination-controls"

import type { Warga } from "@/types/rt-kas"
import type { WargaTableProps } from "@/features/warga-management/types"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
}

function normalizeToWa(phone: string) {
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`
  }
  if (digits.startsWith("62")) {
    return digits
  }
  return `62${digits}`
}

function WargaRow({
  warga,
  onEdit,
  onDelete,
  onTogglePengurus,
  updatingPengurusId,
}: {
  warga: Warga
  onEdit: (warga: Warga) => void
  onDelete: (warga: Warga) => void
  onTogglePengurus: (warga: Warga) => void
  updatingPengurusId?: string | null
}) {
  return (
    <>
      <div className="hidden items-center border-b border-kanvas-line-2 px-4 py-2.5 text-[13px] text-kanvas-ink-2 lg:grid lg:grid-cols-[44px_1.4fr_0.7fr_1.05fr_0.9fr_1fr_0.9fr_112px]">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-kanvas-paper text-[11px] font-bold text-kanvas-ink-2">
          {getInitials(warga.nama)}
        </div>

        <div>
          <p className="font-semibold text-kanvas-ink">{warga.nama}</p>
          <p className="text-[10.5px] text-kanvas-ink-4">{warga.id}</p>
        </div>

        <p className="font-medium">{warga.blok}</p>

        <div className="flex items-center gap-1.5">
          <span>{warga.telp}</span>
          <a
            href={`https://wa.me/${normalizeToWa(warga.telp)}`}
            target="_blank"
            rel="noreferrer"
            className="rounded p-1 text-kanvas-info"
            title="Buka WhatsApp"
            aria-label={`WhatsApp ${warga.nama}`}
          >
            <KanvasIcons.whatsapp size={13} />
          </a>
        </div>

        <div>
          <AppPill tone={warga.statusHunian === "tetap" ? "olive" : "warn"}>{warga.statusHunian === "tetap" ? "Tetap" : "Kontrak"}</AppPill>
        </div>

        <p className="text-[12px] text-kanvas-ink-3">{warga.pindah ? `${warga.domisili} -> ${warga.pindah}` : warga.domisili}</p>

        <div>
          <button
            type="button"
            onClick={() => onTogglePengurus(warga)}
            className="inline-flex items-center gap-1"
            aria-label={`Toggle pengurus ${warga.nama}`}
            disabled={updatingPengurusId === warga.id}
          >
            {updatingPengurusId === warga.id ? (
              <AppPill tone="neutral">...</AppPill>
            ) : warga.isPengurus ? (
              <AppPill tone="terra">{warga.rolePengurus ?? "Pengurus"}</AppPill>
            ) : (
              <AppPill tone="neutral">Bukan pengurus</AppPill>
            )}
          </button>
        </div>

        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => onEdit(warga)}
            className="rounded-md p-1.5 text-kanvas-ink-3 hover:bg-kanvas-paper"
            aria-label={`Edit ${warga.nama}`}
          >
            <KanvasIcons.edit size={13} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(warga)}
            className="rounded-md p-1.5 text-kanvas-ink-3 hover:bg-kanvas-paper"
            aria-label={`Hapus ${warga.nama}`}
          >
            <KanvasIcons.trash size={13} />
          </button>
        </div>
      </div>

      <div className="border-b border-kanvas-line-2 p-3 lg:hidden">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[13px] font-semibold text-kanvas-ink">{warga.nama}</p>
            <p className="text-[10.5px] text-kanvas-ink-4">{warga.id} · {warga.blok}</p>
          </div>
          <AppPill tone={warga.statusHunian === "tetap" ? "olive" : "warn"}>{warga.statusHunian === "tetap" ? "Tetap" : "Kontrak"}</AppPill>
        </div>

        <div className="mt-2 space-y-1 text-[12px] text-kanvas-ink-3">
          <p>{warga.telp}</p>
          <p className="break-words">{warga.pindah ? `${warga.domisili} -> ${warga.pindah}` : warga.domisili}</p>
          <p>{warga.isPengurus ? `Pengurus: ${warga.rolePengurus ?? "Ya"}` : "Bukan pengurus"}</p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={`https://wa.me/${normalizeToWa(warga.telp)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-kanvas-line bg-white px-2.5 py-1.5 text-xs font-semibold text-kanvas-info"
          >
            <KanvasIcons.whatsapp size={12} />
            WhatsApp
          </a>
          <AppButton variant="outline" size="sm" onClick={() => onTogglePengurus(warga)} disabled={updatingPengurusId === warga.id}>
            Toggle Pengurus
          </AppButton>
          <AppButton variant="outline" size="sm" onClick={() => onEdit(warga)} leading={<KanvasIcons.edit size={12} />}>
            Edit
          </AppButton>
          <AppButton variant="danger" size="sm" onClick={() => onDelete(warga)} leading={<KanvasIcons.trash size={12} />}>
            Hapus
          </AppButton>
        </div>
      </div>
    </>
  )
}

export function WargaTable({ warga, onEdit, onDelete, onTogglePengurus, updatingPengurusId, pagination }: WargaTableProps) {
  return (
    <AppCard className="overflow-hidden p-0">
      <div className="hidden grid-cols-[44px_1.4fr_0.7fr_1.05fr_0.9fr_1fr_0.9fr_112px] gap-0 border-b border-kanvas-line bg-kanvas-paper px-4 py-2.5 text-[10px] font-bold tracking-[0.7px] text-kanvas-ink-3 uppercase lg:grid">
        <div />
        <div>Nama</div>
        <div>Blok</div>
        <div>Telepon</div>
        <div>Status</div>
        <div>Domisili/Batas</div>
        <div>Pengurus</div>
        <div className="text-right">Aksi</div>
      </div>

      <div>
        {warga.length > 0 ? (
          warga.map((item) => (
            <WargaRow
              key={item.id}
              warga={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onTogglePengurus={onTogglePengurus}
              updatingPengurusId={updatingPengurusId}
            />
          ))
        ) : (
          <div className="px-4 py-10 text-center text-[13px] text-kanvas-ink-4">Tidak ada warga ditemukan</div>
        )}
      </div>

      {pagination ? (
        <PaginationControls
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          startItem={pagination.startItem}
          endItem={pagination.endItem}
          onPageChange={pagination.onPageChange}
          itemLabel="warga"
        />
      ) : null}
    </AppCard>
  )
}
