"use client"

import { AppButton, AppModal, KanvasIcons } from "@/components/kanvas"

interface DeleteKategoriDialogProps {
  open: boolean
  kategoriNama?: string
  onClose: () => void
  onConfirm: () => Promise<void>
  serverError?: string
  deleting?: boolean
}

export function DeleteKategoriDialog({
  open,
  kategoriNama,
  onClose,
  onConfirm,
  serverError,
  deleting = false,
}: DeleteKategoriDialogProps) {
  return (
    <AppModal open={open} onClose={onClose} width={460}>
      <div className="p-6">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.7px] text-kanvas-ink-4 uppercase">Konfirmasi</p>
            <h2 className="mt-1 text-xl text-kanvas-ink">Hapus Kategori</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-kanvas-ink-3"
            aria-label="Tutup dialog hapus kategori"
          >
            <KanvasIcons.x size={18} />
          </button>
        </div>

        <p className="text-[13px] text-kanvas-ink-2">
          Anda akan menghapus kategori{" "}
          <span className="font-semibold">{kategoriNama ?? "ini"}</span>.
        </p>
        <p className="mt-2 text-[12px] text-kanvas-ink-3">
          Kategori yang sudah dipakai transaksi tidak bisa dihapus.
        </p>

        {serverError ? (
          <p className="mt-3 text-[12px] text-kanvas-danger">{serverError}</p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <AppButton variant="outline" onClick={onClose}>
            Batal
          </AppButton>
          <AppButton
            variant="danger"
            onClick={onConfirm}
            leading={<KanvasIcons.trash size={12} />}
            disabled={deleting}
          >
            {deleting ? "Menghapus..." : "Ya, Hapus"}
          </AppButton>
        </div>
      </div>
    </AppModal>
  )
}
