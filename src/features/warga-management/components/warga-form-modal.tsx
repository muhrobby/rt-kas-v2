"use client"

import { useEffect, useRef, useState } from "react"

import { AppButton, AppField, AppInput, AppModal, KanvasIcons } from "@/components/kanvas"
import { normalizePhone } from "@/lib/format/phone"
import { createPemilikHunianAction, listPemilikHunianAction } from "@/lib/actions/pemilik-hunian"

import type { WargaFormMode, WargaFormValues } from "@/features/warga-management/types"

interface PemilikHunianOption {
  id: number
  nama: string
}

interface WargaFormModalProps {
  open: boolean
  mode: WargaFormMode
  initialValues: WargaFormValues
  onClose: () => void
  onSubmit: (values: WargaFormValues) => Promise<void> | void
  serverError?: string
  fieldErrors?: Partial<Record<keyof WargaFormValues, string[]>>
}

function getAutoDate(): string {
  const d = new Date()
  d.setMonth(d.getMonth() + 3)
  return d.toISOString().slice(0, 10)
}

export function WargaFormModal({ open, mode, initialValues, onClose, onSubmit, serverError, fieldErrors }: WargaFormModalProps) {
  const [values, setValues] = useState<WargaFormValues>(initialValues)
  const [errors, setErrors] = useState({ nama: "", blok: "", telp: "", pindah: "", jumlahAnggota: "", pemilikHunianId: "" })
  const [submitting, setSubmitting] = useState(false)
  const [pemilikList, setPemilikList] = useState<PemilikHunianOption[]>([])
  const [subModalOpen, setSubModalOpen] = useState(false)
  const [newPemilikNama, setNewPemilikNama] = useState("")
  const [newPemilikTelp, setNewPemilikTelp] = useState("")
  const [subModalError, setSubModalError] = useState("")
  const [subModalSubmitting, setSubModalSubmitting] = useState(false)
  const subModalLock = useRef(false)

  const title = mode === "add" ? "Tambah Warga Baru" : "Edit Data Warga"
  const isNonTetap = values.statusHunian === "kontrak" || values.statusHunian === "kos"

  // Load pemilik hunian list when modal opens
  useEffect(() => {
    if (open) {
      listPemilikHunianAction().then((res) => {
        if (res.ok) setPemilikList(res.data.map((d) => ({ id: d.id, nama: d.nama })))
      })
    }
  }, [open])

  // Reset form when initialValues change
  useEffect(() => {
    if (open) setValues(initialValues)
  }, [open, initialValues])

  const updateField = <K extends keyof WargaFormValues>(key: K, value: WargaFormValues[K]) => {
    setValues((state) => {
      const next = { ...state, [key]: value }
      if (key === "statusHunian") {
        if (value === "tetap") {
          next.pindah = ""
          next.pemilikHunianId = null
        } else if (state.statusHunian === "tetap") {
          // Switching from tetap to kontrak/kos → auto-fill date
          next.pindah = getAutoDate()
        }
      }
      return next
    })
  }

  const validate = () => {
    const nextErrors = {
      nama: values.nama.trim() ? "" : "Nama wajib diisi.",
      blok: values.blok.trim() ? "" : "Blok wajib diisi.",
      telp: values.telp.trim() ? "" : "Nomor telepon wajib diisi.",
      pindah: isNonTetap && !values.pindah ? "Batas domisili wajib diisi." : "",
      jumlahAnggota: values.jumlahAnggota >= 1 ? "" : "Jumlah anggota minimal 1.",
      pemilikHunianId: isNonTetap && !values.pemilikHunianId ? "Pemilik hunian wajib dipilih." : "",
    }
    setErrors(nextErrors)
    return Object.values(nextErrors).every((e) => !e)
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubModalSubmit = async () => {
    if (subModalLock.current) return
    if (!newPemilikNama.trim()) {
      setSubModalError("Nama pemilik wajib diisi.")
      return
    }
    subModalLock.current = true
    setSubModalSubmitting(true)
    setSubModalError("")
    const res = await createPemilikHunianAction({ nama: newPemilikNama.trim(), noTelp: newPemilikTelp.trim() || undefined })
    setSubModalSubmitting(false)
    if (!res.ok) {
      subModalLock.current = false
      setSubModalError(res.error)
      return
    }
    // Add to list and auto-select
    setPemilikList((prev) => [...prev, { id: res.data.id, nama: res.data.nama }])
    setValues((prev) => ({ ...prev, pemilikHunianId: res.data.id }))
    setSubModalOpen(false)
    setNewPemilikNama("")
    setNewPemilikTelp("")
    subModalLock.current = false
  }

  return (
    <>
      <AppModal open={open} onClose={onClose} width={560}>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
          <div className="p-4 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.7px] text-kanvas-ink-4 uppercase">Data Warga</p>
                <h2 className="mt-1 text-2xl text-kanvas-ink">{title}</h2>
              </div>
              <button type="button" onClick={onClose} className="rounded p-1 text-kanvas-ink-3" aria-label="Tutup modal warga">
                <KanvasIcons.x size={18} />
              </button>
            </div>

            <AppField label="Nama Kepala Keluarga">
              <AppInput value={values.nama} onChange={(value) => updateField("nama", value)} placeholder="Mis. Bambang Sutrisno" />
              {(errors.nama || fieldErrors?.nama?.[0]) && <p className="mt-1 text-[11px] text-kanvas-danger">{errors.nama || fieldErrors?.nama?.[0]}</p>}
            </AppField>

            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3">
              <AppField label="Blok Rumah">
                <AppInput value={values.blok} onChange={(value) => updateField("blok", value)} placeholder="Mis. C-04" />
                {(errors.blok || fieldErrors?.blok?.[0]) && <p className="mt-1 text-[11px] text-kanvas-danger">{errors.blok || fieldErrors?.blok?.[0]}</p>}
              </AppField>

              <AppField label="No. Telepon" hint={
                values.telp
                  ? <span>Preview: <span className="font-mono">{normalizePhone(values.telp)}</span></span>
                  : "Dipakai sebagai username login"
              }>
                <AppInput value={values.telp} onChange={(value) => updateField("telp", value)} placeholder="08xx-xxxx-xxxx" />
                {(errors.telp || fieldErrors?.telp?.[0]) && <p className="mt-1 text-[11px] text-kanvas-danger">{errors.telp || fieldErrors?.telp?.[0]}</p>}
              </AppField>
            </div>

            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3">
              <AppField label="Status Hunian">
                <div className="inline-flex w-full rounded-lg border border-kanvas-line bg-white p-0.5">
                  {([
                    { value: "tetap", label: "Tetap" },
                    { value: "kontrak", label: "Kontrak" },
                    { value: "kos", label: "Kos" },
                  ] as const).map((option) => {
                    const active = values.statusHunian === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateField("statusHunian", option.value)}
                        className="flex-1 rounded-md px-3 py-2 text-xs font-semibold"
                        style={{
                          background: active ? "var(--kanvas-terra)" : "transparent",
                          color: active ? "#ffffff" : "var(--kanvas-ink-2)",
                        }}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </AppField>

              <AppField label="Jumlah Anggota">
                <AppInput
                  type="number"
                  min={1}
                  value={String(values.jumlahAnggota)}
                  onChange={(value) => updateField("jumlahAnggota", Number(value || 0))}
                  placeholder="Jumlah anggota"
                />
                {errors.jumlahAnggota && <p className="mt-1 text-[11px] text-kanvas-danger">{errors.jumlahAnggota}</p>}
              </AppField>
            </div>

            {isNonTetap && (
              <AppField label="Pemilik Kontrakan/Kos">
                <div className="flex gap-2">
                  <select
                    className="flex-1 rounded-lg border border-kanvas-line bg-white px-3 py-2 text-sm text-kanvas-ink outline-none focus:border-kanvas-terra"
                    value={values.pemilikHunianId ?? ""}
                    onChange={(e) => updateField("pemilikHunianId", e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">— Pilih pemilik —</option>
                    {pemilikList.map((p) => (
                      <option key={p.id} value={p.id}>{p.nama}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setSubModalOpen(true)}
                    className="shrink-0 rounded-lg border border-kanvas-line bg-white px-3 py-2 text-xs font-semibold text-kanvas-terra hover:bg-kanvas-paper"
                  >
                    + Baru
                  </button>
                </div>
                {(errors.pemilikHunianId || fieldErrors?.pemilikHunianId?.[0]) && (
                  <p className="mt-1 text-[11px] text-kanvas-danger">{errors.pemilikHunianId || fieldErrors?.pemilikHunianId?.[0]}</p>
                )}
              </AppField>
            )}

            <AppField
              label="Batas Domisili"
              hint={isNonTetap ? "Wajib untuk status kontrak/kos" : "Tidak wajib untuk status tetap"}
              optional={!isNonTetap}
            >
              <AppInput
                type="date"
                value={values.pindah}
                onChange={(value) => updateField("pindah", value)}
                disabled={!isNonTetap}
              />
              {(errors.pindah || fieldErrors?.pindah?.[0]) && <p className="mt-1 text-[11px] text-kanvas-danger">{errors.pindah || fieldErrors?.pindah?.[0]}</p>}
            </AppField>

            {serverError ? (
              <div className="mt-2 rounded-lg border border-kanvas-danger-soft bg-kanvas-danger-soft p-2.5 text-[11.5px] text-kanvas-danger">{serverError}</div>
            ) : (
              <div className="mt-2 rounded-lg border border-kanvas-line bg-kanvas-paper p-2.5 text-[11.5px] text-kanvas-ink-3">
                Akun login warga akan dibuat otomatis dengan username nomor telepon.
              </div>
            )}

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <AppButton type="button" variant="outline" onClick={onClose}>Batal</AppButton>
              <AppButton type="submit" variant="primary" leading={<KanvasIcons.check size={13} />} disabled={submitting}>
                {submitting ? "Menyimpan..." : mode === "add" ? "Simpan Warga" : "Simpan Perubahan"}
              </AppButton>
            </div>
          </div>
        </form>
      </AppModal>

      {/* Sub-modal: Tambah Pemilik Hunian Baru */}
      <AppModal open={subModalOpen} onClose={() => setSubModalOpen(false)} width={400}>
        <div className="p-4 sm:p-6">
          <h3 className="mb-3 text-lg font-semibold text-kanvas-ink">Tambah Pemilik Baru</h3>
          <AppField label="Nama Pemilik">
            <AppInput value={newPemilikNama} onChange={setNewPemilikNama} placeholder="Nama pemilik kontrakan/kos" />
          </AppField>
          <AppField label="No. Telepon" optional>
            <AppInput value={newPemilikTelp} onChange={setNewPemilikTelp} placeholder="08xx (opsional)" />
          </AppField>
          {subModalError && <p className="mt-1 text-[11px] text-kanvas-danger">{subModalError}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <AppButton type="button" variant="outline" onClick={() => setSubModalOpen(false)}>Batal</AppButton>
            <AppButton type="button" variant="primary" onClick={handleSubModalSubmit} disabled={subModalSubmitting}>
              {subModalSubmitting ? "Menyimpan..." : "Simpan"}
            </AppButton>
          </div>
        </div>
      </AppModal>
    </>
  )
}
