"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"

import { AppCard, KanvasIcons, useToast } from "@/components/kanvas"
import { getAppSettingsAction, updateAppSettingsAction } from "@/lib/actions/app-settings"
import { SettingsForm, type SettingsFormValues, mapSettingsToFormValues } from "@/features/admin-settings/components/settings-form"
import { SettingsPreviewCard } from "@/features/admin-settings/components/settings-preview-card"

export function SettingsView() {
  const { pushToast } = useToast()
  const [settings, setSettings] = useState<Awaited<ReturnType<typeof getAppSettingsAction>>["data"] | null>(null)
  const [serverError, setServerError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isLoading, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const result = await getAppSettingsAction()
      if (result.ok) {
        setSettings(result.data)
      }
    })
  }, [])

  const handleSubmit = async (values: SettingsFormValues) => {
    setServerError("")
    setFieldErrors({})

    const result = await updateAppSettingsAction(values)

    if (!result.ok) {
      setServerError(result.error)
      setFieldErrors(result.fieldErrors ?? {})
      return
    }

    setSettings(result.data)
    pushToast("Pengaturan berhasil disimpan")
  }

  return (
    <main className="space-y-3.5 p-6 md:p-7">
      <AppCard className="flex items-center justify-between p-4">
        <div>
          <p className="text-[13px] font-semibold text-kanvas-ink">Keamanan Akun</p>
          <p className="mt-0.5 text-[12px] text-kanvas-ink-3">Ubah password akun admin Anda</p>
        </div>
        <Link
          href="/admin/change-password"
          className="inline-flex items-center gap-1.5 rounded-lg border border-kanvas-line bg-white px-3 py-2 text-[12px] font-semibold text-kanvas-ink-2 hover:bg-kanvas-paper-2"
        >
          <KanvasIcons.shield size={14} />
          Ganti Password
        </Link>
      </AppCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div className="lg:col-span-1 xl:col-span-2">
          {settings ? (
            <SettingsForm
              initialValues={mapSettingsToFormValues(settings)}
              onSubmit={handleSubmit}
              serverError={serverError}
              fieldErrors={fieldErrors}
              submitting={isLoading}
            />
          ) : (
            <p className="text-[12px] text-kanvas-ink-3">Memuat pengaturan...</p>
          )}
        </div>

        <div>
          {settings && <SettingsPreviewCard settings={settings} />}
        </div>
      </div>
    </main>
  )
}
