"use client"

import { useState } from "react"

import { AppButton, AppModal, KanvasIcons, useToast } from "@/components/kanvas"

interface TemporaryPasswordDialogProps {
  open: boolean
  wargaNama: string
  wargaTelp: string
  password?: string
  onClose: () => void
}

export function TemporaryPasswordDialog({ open, wargaNama, wargaTelp, password, onClose }: TemporaryPasswordDialogProps) {
  const { pushToast } = useToast()
  const [visible, setVisible] = useState(false)

  const handleCopy = () => {
    if (!password) return
    navigator.clipboard.writeText(password).then(() => {
      pushToast("Password berhasil disalin")
    })
  }

  const maskedPassword = password ? "•".repeat(password.length) : "..."
  const displayPassword = visible ? (password || "...") : maskedPassword

  return (
    <AppModal open={open} onClose={onClose} width={480}>
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.7px] text-kanvas-ink-4 uppercase">Kredensial Warga</p>
            <h2 className="mt-1 text-2xl text-kanvas-ink">Akun Berhasil Dibuat</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-kanvas-ink-3" aria-label="Tutup modal">
            <KanvasIcons.x size={18} />
          </button>
        </div>

        <div className="mb-4 text-[13px] leading-relaxed text-kanvas-ink-2">
          <p>
            Akun untuk warga <strong>{wargaNama}</strong> telah berhasil dibuat. 
            Silakan berikan informasi login berikut kepada warga yang bersangkutan:
          </p>
        </div>

        <div className="mb-4 space-y-3 rounded-lg border border-kanvas-line bg-kanvas-paper p-4">
          <div>
            <p className="mb-1 text-[11px] font-medium text-kanvas-ink-3 uppercase tracking-wider">No. Telepon (Username)</p>
            <p className="text-base font-mono font-medium text-kanvas-ink">{wargaTelp}</p>
          </div>
          <div>
            <p className="mb-1 text-[11px] font-medium text-kanvas-ink-3 uppercase tracking-wider">Password Sementara</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-lg font-mono font-bold tracking-widest text-kanvas-ink">{displayPassword}</p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setVisible((v) => !v)}
                  className="flex items-center gap-1.5 rounded-md border border-kanvas-line bg-white px-2.5 py-1.5 text-[11px] font-medium text-kanvas-ink-2 hover:bg-kanvas-paper-2"
                  aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {visible ? <KanvasIcons.eyeOff size={12} /> : <KanvasIcons.eye size={12} />}
                </button>
                {password && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-md border border-kanvas-line bg-white px-2.5 py-1.5 text-[11px] font-medium text-kanvas-ink-2 hover:bg-kanvas-paper-2"
                  >
                    <KanvasIcons.copy size={12} />
                    Salin
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="mb-5 text-[11.5px] text-kanvas-danger">
          ⚠ Jangan ditampilkan ke orang lain selain warga bersangkutan.
        </p>

        <div className="mb-2 rounded-lg border border-kanvas-warning-soft bg-kanvas-warning-soft p-3 text-[11.5px] leading-relaxed text-kanvas-warning">
          <strong className="mb-1 block font-semibold">Penting</strong>
          Password ini hanya ditampilkan <strong>satu kali ini saja</strong> dan tidak disimpan dalam bentuk teks biasa di sistem.
        </div>

        <div className="mt-4 flex justify-end">
          <AppButton variant="primary" onClick={onClose}>
            Saya Sudah Mencatatnya
          </AppButton>
        </div>
      </div>
    </AppModal>
  )
}