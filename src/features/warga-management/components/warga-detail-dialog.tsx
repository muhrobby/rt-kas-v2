"use client"

import { useId } from "react"

import { AppModal, KanvasIcons } from "@/components/kanvas"
import type { Warga } from "@/types/rt-kas"

interface WargaDetailDialogProps {
  warga: Warga | null
  open: boolean
  onClose: () => void
}

function formatDate(date: string | undefined | null): string {
  if (!date) return "-"
  const d = new Date(date)
  if (isNaN(d.getTime())) return "-"
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

function statusHunianLabel(status: Warga["statusHunian"]) {
  switch (status) {
    case "tetap": return "Tetap"
    case "kontrak": return "Kontrak"
    case "kos": return "Kos"
  }
}

export function WargaDetailDialog({ warga, open, onClose }: WargaDetailDialogProps) {
  const descId = useId()

  if (!warga) return null

  const sudahPindah = !!warga.tglPindah

  return (
    <AppModal open={open} onClose={onClose} width={480}>
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.7px] text-kanvas-ink-4 uppercase">
              Detail Warga
            </p>
            <h2 className="mt-1 text-xl text-kanvas-ink">{warga.nama}</h2>
            <p id={descId} className="text-[12px] text-kanvas-ink-3">{warga.blok}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-kanvas-ink-3"
            aria-label="Tutup dialog detail warga"
          >
            <KanvasIcons.x size={18} />
          </button>
        </div>

        <div className="space-y-4" role="group" aria-describedby={descId}>
          {/* Profil */}
          <DetailSection title="Profil">
            <DetailField label="Nama Kepala Keluarga" value={warga.nama} />
            <DetailField label="Blok Rumah" value={warga.blok} />
            <DetailField label="Nomor Telepon" value={warga.telp} />
            <DetailField label="Jumlah Anggota" value={warga.jumlahAnggota != null ? String(warga.jumlahAnggota) : "-"} />
          </DetailSection>

          {/* Domisili */}
          <DetailSection title="Domisili">
            <DetailField
              label="Status Hunian"
              value={sudahPindah ? "Pindah" : statusHunianLabel(warga.statusHunian)}
            />
            {!sudahPindah && warga.statusHunian !== "tetap" && (
              <DetailField
                label="Pemilik Hunian"
                value={warga.pemilikHunian?.nama ?? "Belum tercatat"}
              />
            )}
            {!sudahPindah && warga.pemilikHunian?.noTelp && (
              <DetailField label="No. Telepon Pemilik" value={warga.pemilikHunian.noTelp} />
            )}
            {!sudahPindah && warga.pindah && (
              <DetailField label="Batas Domisili" value={formatDate(warga.pindah)} />
            )}
          </DetailSection>

          {/* Status */}
          <DetailSection title="Status">
            <DetailField
              label="Status"
              value={sudahPindah ? `Pindah (${formatDate(warga.tglPindah)})` : "Aktif"}
            />
            <DetailField
              label="Pengurus"
              value={warga.isPengurus ? (warga.rolePengurus ?? "Ya") : "Bukan pengurus"}
            />
          </DetailSection>
        </div>
      </div>
    </AppModal>
  )
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-bold tracking-[0.7px] text-kanvas-ink-4 uppercase">{title}</p>
      <div className="divide-y divide-kanvas-line rounded-lg border border-kanvas-line bg-kanvas-paper">
        {children}
      </div>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="text-[12px] text-kanvas-ink-3">{label}</span>
      <span className="max-w-[55%] break-words text-right text-[13px] font-medium text-kanvas-ink">
        {value}
      </span>
    </div>
  )
}
