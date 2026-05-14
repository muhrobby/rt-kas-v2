"use client"

import { useState } from "react"

import { AppButton, AppField, AppInput, KanvasIcons } from "@/components/kanvas"
import type { AppSettingsView } from "@/lib/branding/format-branding"
import type { AppSettingsInput } from "@/lib/validations/app-settings"

export interface SettingsFormValues {
  appName: string
  organizationName: string
  rtNumber: string
  rwNumber: string
  address: string
  phone: string
  email: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  receiptTitle: string
  receiptFooter: string
}

interface SettingsFormProps {
  initialValues: SettingsFormValues
  onSubmit: (values: SettingsFormValues) => Promise<void>
  onValuesChange?: (values: SettingsFormValues) => void
  serverError?: string
  fieldErrors?: Record<string, string[]>
  submitting?: boolean
}

export function mapSettingsToFormValues(
  settings: (AppSettingsInput | AppSettingsView) & { rtRwLabel?: string }
): SettingsFormValues {
  return {
    appName: settings.appName,
    organizationName: settings.organizationName,
    rtNumber: settings.rtNumber,
    rwNumber: settings.rwNumber,
    address: settings.address ?? "",
    phone: settings.phone ?? "",
    email: settings.email ?? "",
    primaryColor: settings.primaryColor,
    secondaryColor: settings.secondaryColor,
    accentColor: settings.accentColor,
    receiptTitle: settings.receiptTitle,
    receiptFooter: settings.receiptFooter ?? "",
  }
}

export function SettingsForm({
  initialValues,
  onSubmit,
  onValuesChange,
  serverError,
  fieldErrors = {},
  submitting = false,
}: SettingsFormProps) {
  const [values, setValues] = useState<SettingsFormValues>(initialValues)
  const [hexErrors, setHexErrors] = useState<Partial<Record<"primaryColor" | "secondaryColor" | "accentColor", string>>>({})

  const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/

  const updateField = <K extends keyof SettingsFormValues>(key: K, value: SettingsFormValues[K]) => {
    setValues((state) => {
      const next = { ...state, [key]: value }
      onValuesChange?.(next)
      return next
    })
  }

  const validateHex = (key: "primaryColor" | "secondaryColor" | "accentColor", value: string) => {
    setHexErrors((prev) => ({
      ...prev,
      [key]: HEX_REGEX.test(value) ? undefined : "Format warna harus #RRGGBB",
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate all hex fields before submit
    const errors = {
      primaryColor: HEX_REGEX.test(values.primaryColor) ? undefined : "Format warna harus #RRGGBB",
      secondaryColor: HEX_REGEX.test(values.secondaryColor) ? undefined : "Format warna harus #RRGGBB",
      accentColor: HEX_REGEX.test(values.accentColor) ? undefined : "Format warna harus #RRGGBB",
    }
    setHexErrors(errors)
    if (Object.values(errors).some(Boolean)) return
    await onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-kanvas-line bg-white p-4 sm:p-6">
      <div className="mb-5">
        <p className="text-[11px] font-semibold tracking-[0.7px] text-kanvas-ink-4 uppercase">Pengaturan</p>
        <h1 className="mt-1 text-2xl text-kanvas-ink">Branding Aplikasi</h1>
        <p className="mt-1 text-[12px] text-kanvas-ink-3">
          Ubah identitas dan tampilan aplikasi RT Kas Anda.
        </p>
      </div>

      <div className="space-y-4">
        <AppField label="Nama Aplikasi">
          <AppInput
            value={values.appName}
            onChange={(value) => updateField("appName", value)}
            placeholder="Mis. RT Kas"
          />
          {fieldErrors.appName?.[0] && (
            <p className="mt-1 text-[11px] text-kanvas-danger">{fieldErrors.appName[0]}</p>
          )}
        </AppField>

        <AppField label="Nama Organisasi">
          <AppInput
            value={values.organizationName}
            onChange={(value) => updateField("organizationName", value)}
            placeholder="Mis. RT 01 / RW 010"
          />
          {fieldErrors.organizationName?.[0] && (
            <p className="mt-1 text-[11px] text-kanvas-danger">{fieldErrors.organizationName[0]}</p>
          )}
        </AppField>

        <div className="grid grid-cols-2 gap-3">
          <AppField label="Nomor RT">
            <AppInput
              value={values.rtNumber}
              onChange={(value) => updateField("rtNumber", value)}
              placeholder="01"
            />
            {fieldErrors.rtNumber?.[0] && (
              <p className="mt-1 text-[11px] text-kanvas-danger">{fieldErrors.rtNumber[0]}</p>
            )}
          </AppField>

          <AppField label="Nomor RW">
            <AppInput
              value={values.rwNumber}
              onChange={(value) => updateField("rwNumber", value)}
              placeholder="010"
            />
            {fieldErrors.rwNumber?.[0] && (
              <p className="mt-1 text-[11px] text-kanvas-danger">{fieldErrors.rwNumber[0]}</p>
            )}
          </AppField>
        </div>

        <AppField label="Alamat">
          <AppInput
            value={values.address}
            onChange={(value) => updateField("address", value)}
            placeholder="Jl. Contoh No. 1, Kelurahan, Kota"
          />
          {fieldErrors.address?.[0] && (
            <p className="mt-1 text-[11px] text-kanvas-danger">{fieldErrors.address[0]}</p>
          )}
        </AppField>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AppField label="Telepon">
            <AppInput
              value={values.phone}
              onChange={(value) => updateField("phone", value)}
              placeholder="0812-3456-7890"
            />
            {fieldErrors.phone?.[0] && (
              <p className="mt-1 text-[11px] text-kanvas-danger">{fieldErrors.phone[0]}</p>
            )}
          </AppField>

          <AppField label="Email">
            <AppInput
              value={values.email}
              onChange={(value) => updateField("email", value)}
              placeholder="rtkas@email.com"
            />
            {fieldErrors.email?.[0] && (
              <p className="mt-1 text-[11px] text-kanvas-danger">{fieldErrors.email[0]}</p>
            )}
          </AppField>
        </div>

        <div className="border-t border-kanvas-line pt-4">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.7px] text-kanvas-ink-4 uppercase">
            Warna Tampilan
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <AppField label="Warna Utama">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={values.primaryColor}
                  onChange={(e) => { updateField("primaryColor", e.target.value); validateHex("primaryColor", e.target.value) }}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-kanvas-line bg-white p-1"
                />
                <AppInput
                  value={values.primaryColor}
                  onChange={(value) => updateField("primaryColor", value)}
                  onBlur={() => validateHex("primaryColor", values.primaryColor)}
                  placeholder="#2d6bb4"
                />
              </div>
              {(hexErrors.primaryColor || fieldErrors.primaryColor?.[0]) && (
                <p className="mt-1 text-[11px] text-kanvas-danger">{hexErrors.primaryColor ?? fieldErrors.primaryColor?.[0]}</p>
              )}
            </AppField>

            <AppField label="Warna Sekunder">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={values.secondaryColor}
                  onChange={(e) => { updateField("secondaryColor", e.target.value); validateHex("secondaryColor", e.target.value) }}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-kanvas-line bg-white p-1"
                />
                <AppInput
                  value={values.secondaryColor}
                  onChange={(value) => updateField("secondaryColor", value)}
                  onBlur={() => validateHex("secondaryColor", values.secondaryColor)}
                  placeholder="#1f4f8a"
                />
              </div>
              {(hexErrors.secondaryColor || fieldErrors.secondaryColor?.[0]) && (
                <p className="mt-1 text-[11px] text-kanvas-danger">{hexErrors.secondaryColor ?? fieldErrors.secondaryColor?.[0]}</p>
              )}
            </AppField>

            <AppField label="Warna Aksen">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={values.accentColor}
                  onChange={(e) => { updateField("accentColor", e.target.value); validateHex("accentColor", e.target.value) }}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-kanvas-line bg-white p-1"
                />
                <AppInput
                  value={values.accentColor}
                  onChange={(value) => updateField("accentColor", value)}
                  onBlur={() => validateHex("accentColor", values.accentColor)}
                  placeholder="#d6e7fb"
                />
              </div>
              {(hexErrors.accentColor || fieldErrors.accentColor?.[0]) && (
                <p className="mt-1 text-[11px] text-kanvas-danger">{hexErrors.accentColor ?? fieldErrors.accentColor?.[0]}</p>
              )}
            </AppField>
          </div>
        </div>

        <div className="border-t border-kanvas-line pt-4">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.7px] text-kanvas-ink-4 uppercase">
            Kuitansi
          </p>
          <AppField label="Judul Kuitansi">
            <AppInput
              value={values.receiptTitle}
              onChange={(value) => updateField("receiptTitle", value)}
              placeholder="Kuitansi Pembayaran"
            />
            {fieldErrors.receiptTitle?.[0] && (
              <p className="mt-1 text-[11px] text-kanvas-danger">{fieldErrors.receiptTitle[0]}</p>
            )}
          </AppField>

          <AppField label="Footer Kuitansi (Opsional)">
            <AppInput
              value={values.receiptFooter}
              onChange={(value) => updateField("receiptFooter", value)}
              placeholder="Terima kasih atas pembayaran Anda"
            />
            {fieldErrors.receiptFooter?.[0] && (
              <p className="mt-1 text-[11px] text-kanvas-danger">{fieldErrors.receiptFooter[0]}</p>
            )}
          </AppField>
        </div>
      </div>

      {serverError && (
        <div className="mt-4 rounded-lg border border-kanvas-danger-soft bg-kanvas-danger-soft p-2.5 text-[11.5px] text-kanvas-danger">
          {serverError}
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <AppButton
          variant="primary"
          type="submit"
          leading={<KanvasIcons.check size={13} />}
          disabled={submitting}
        >
          {submitting ? "Menyimpan..." : "Simpan Pengaturan"}
        </AppButton>
      </div>
    </form>
  )
}
