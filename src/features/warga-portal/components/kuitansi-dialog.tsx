"use client"

import { AppButton, AppModal, KanvasIcons, useToast } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"

interface KuitansiData {
  refKuitansi: string
  kategori: string
  tanggalBayar: string
  nominal: number
  wargaNama: string
  blok?: string
  petugas?: string | null
}

interface KuitansiDialogProps {
  open: boolean
  data: KuitansiData | null
  onClose: () => void
  onDownloadPdf?: (data: KuitansiData) => void
}

export function KuitansiDialog({ open, data, onClose, onDownloadPdf }: KuitansiDialogProps) {
  const { pushToast } = useToast()

  return (
    <AppModal open={open} onClose={onClose} width={460}>
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.6px] text-[var(--kanvas-ink-4)] uppercase">e-Kuitansi</p>
            <h2 className="mt-1 text-[22px] text-[var(--kanvas-ink)]">RT 04 / RW 09</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-[var(--kanvas-ink-3)]" aria-label="Tutup kuitansi">
            <KanvasIcons.x size={18} />
          </button>
        </div>

        <div className="rounded-lg border border-dashed border-[var(--kanvas-line)] bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-[0.6px] text-[var(--kanvas-ink-4)] uppercase">Nomor</p>
            <p className="text-[12px] font-semibold text-[var(--kanvas-ink)]">{data?.refKuitansi ?? "-"}</p>
          </div>
          <div className="grid grid-cols-[110px_1fr] gap-y-2 text-[12px] text-[var(--kanvas-ink-3)]">
            <span>Diterima dari</span><span className="font-semibold text-[var(--kanvas-ink)]">{data?.wargaNama ?? "-"}</span>
            <span>Blok</span><span>{data?.blok ?? "-"}</span>
            <span>Untuk</span><span className="font-semibold text-[var(--kanvas-ink)]">{data?.kategori ?? "-"}</span>
            <span>Tanggal Bayar</span><span>{data?.tanggalBayar ?? "-"}</span>
            <span>Petugas</span><span>{data?.petugas ?? "-"}</span>
          </div>
          <div className="mt-4 border-t border-[var(--kanvas-line-2)] pt-3">
            <p className="text-[11px] font-semibold tracking-[0.6px] text-[var(--kanvas-ink-4)] uppercase">Jumlah</p>
            <p className="mt-1 text-[28px] leading-none text-[var(--kanvas-ink)]">{formatRupiah(data?.nominal ?? 0)}</p>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <AppButton variant="outline" onClick={onClose}>
            Tutup
          </AppButton>
          <AppButton
            variant="primary"
            leading={<KanvasIcons.download size={13} />}
            onClick={() => {
              if (!data) return
              if (onDownloadPdf) {
                onDownloadPdf(data)
                pushToast("PDF kuitansi berhasil diunduh", "ok")
                return
              }
              pushToast("Download PDF akan aktif setelah backend/export selesai", "warn")
            }}
          >
            Download PDF
          </AppButton>
        </div>
      </div>
    </AppModal>
  )
}
