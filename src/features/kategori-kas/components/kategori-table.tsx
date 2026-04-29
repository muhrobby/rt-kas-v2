"use client"

import { AppCard, AppPill, KanvasIcons } from "@/components/kanvas"
import { PaginationControls } from "@/components/shared/pagination-controls"
import { formatRupiah } from "@/lib/format/currency"
import type { KategoriKas } from "@/types/rt-kas"

interface KategoriTableProps {
  kategori: KategoriKas[]
  onEdit: (item: KategoriKas) => void
  onDelete: (item: KategoriKas) => void
  pagination?: {
    page: number
    totalPages: number
    totalItems: number
    startItem: number
    endItem: number
    onPageChange: (page: number) => void
  }
}

function toneForArus(arus: KategoriKas["jenisArus"]) {
  return arus === "masuk" ? "terra" : "plum"
}

function labelTipe(tipe: KategoriKas["tipeTagihan"]) {
  return tipe === "bulanan" ? "Bulanan" : "Sekali"
}

export function KategoriTable({ kategori, onEdit, onDelete, pagination }: KategoriTableProps) {
  return (
    <AppCard className="overflow-hidden p-0">
      <div className="lg:hidden">
        {kategori.length > 0 ? (
          kategori.map((item) => (
            <div key={item.id} className="border-b border-[var(--kanvas-line-2)] px-4 py-3 last:border-b-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--kanvas-ink)]">{item.nama}</p>
                  <p className="text-[10.5px] text-[var(--kanvas-ink-4)]">{item.id}</p>
                </div>
                <p className="text-right text-[13px] font-semibold text-[var(--kanvas-ink)]">{formatRupiah(item.nominalDefault)}</p>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <AppPill tone={toneForArus(item.jenisArus)}>{item.jenisArus === "masuk" ? "Masuk" : "Keluar"}</AppPill>
                <AppPill tone="neutral">{labelTipe(item.tipeTagihan)}</AppPill>
                <p className="text-[11px] text-[var(--kanvas-ink-4)]">Dibuat {item.createdAt ?? "22 Apr 2026"}</p>
              </div>

              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  className="inline-flex items-center gap-1 rounded-md border border-[var(--kanvas-line)] bg-white px-2.5 py-1.5 text-xs font-semibold text-[var(--kanvas-ink-2)]"
                  aria-label={`Edit ${item.nama}`}
                >
                  <KanvasIcons.edit size={12} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item)}
                  className="inline-flex items-center gap-1 rounded-md border border-[var(--kanvas-danger-soft)] bg-[var(--kanvas-info-soft)] px-2.5 py-1.5 text-xs font-semibold text-[var(--kanvas-danger)]"
                  aria-label={`Hapus ${item.nama}`}
                >
                  <KanvasIcons.trash size={12} />
                  Hapus
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-10 text-center text-[13px] text-[var(--kanvas-ink-4)]">Tidak ada kategori ditemukan</div>
        )}
      </div>

      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            <div className="grid grid-cols-[1.6fr_0.8fr_0.75fr_1fr_0.9fr_90px] border-b border-[var(--kanvas-line)] bg-[var(--kanvas-paper)] px-4 py-2.5 text-[10px] font-bold tracking-[0.7px] text-[var(--kanvas-ink-3)] uppercase">
              <div>Nama Kategori</div>
              <div>Arus</div>
              <div>Tipe</div>
              <div>Nominal Default</div>
              <div>Dibuat</div>
              <div className="text-right">Aksi</div>
            </div>

            <div>
              {kategori.length > 0 ? (
                kategori.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1.6fr_0.8fr_0.75fr_1fr_0.9fr_90px] items-center border-b border-[var(--kanvas-line-2)] px-4 py-2.5 text-[13px] text-[var(--kanvas-ink-2)]"
                  >
                    <div>
                      <p className="font-semibold text-[var(--kanvas-ink)]">{item.nama}</p>
                      <p className="text-[10.5px] text-[var(--kanvas-ink-4)]">{item.id}</p>
                    </div>

                    <div>
                      <AppPill tone={toneForArus(item.jenisArus)}>{item.jenisArus === "masuk" ? "Masuk" : "Keluar"}</AppPill>
                    </div>

                    <div>
                      <AppPill tone="neutral">{labelTipe(item.tipeTagihan)}</AppPill>
                    </div>

                    <p className="font-medium text-[var(--kanvas-ink)]">{formatRupiah(item.nominalDefault)}</p>

                    <p className="text-[12px] text-[var(--kanvas-ink-3)]">{item.createdAt ?? "22 Apr 2026"}</p>

                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="rounded-md p-1.5 text-[var(--kanvas-ink-3)] hover:bg-[var(--kanvas-paper)]"
                        aria-label={`Edit ${item.nama}`}
                      >
                        <KanvasIcons.edit size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="rounded-md p-1.5 text-[var(--kanvas-ink-3)] hover:bg-[var(--kanvas-paper)]"
                        aria-label={`Hapus ${item.nama}`}
                      >
                        <KanvasIcons.trash size={13} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-10 text-center text-[13px] text-[var(--kanvas-ink-4)]">Tidak ada kategori ditemukan</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {pagination ? (
        <PaginationControls
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          startItem={pagination.startItem}
          endItem={pagination.endItem}
          onPageChange={pagination.onPageChange}
          itemLabel="kategori"
        />
      ) : null}
    </AppCard>
  )
}
