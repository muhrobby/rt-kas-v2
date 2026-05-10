"use server"

import { requireAdmin } from "@/lib/auth/permissions"
import { getCurrentUser } from "@/lib/auth/session"
import { getAppSettings, updateAppSettings } from "@/lib/services/app-settings-service"
import { formatAppSettingsForView } from "@/lib/branding/format-branding"
import { appSettingsInputSchema, type AppSettingsInput } from "@/lib/validations/app-settings"
import { writeAuditLog } from "@/lib/services/audit-log-service"
import { ZodError } from "zod"
import { revalidatePath } from "next/cache"

type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false
      error: string
      fieldErrors?: Record<string, string[]>
    }

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    const flattened = error.flatten().fieldErrors as Record<string, string[] | undefined>
    return {
      ok: false,
      error: "Input tidak valid.",
      fieldErrors: flattened as Record<string, string[]>,
    }
  }
  return {
    ok: false,
    error: "Terjadi kesalahan server. Coba lagi.",
  }
}

export async function getAppSettingsAction() {
  const settings = await getAppSettings()
  return { ok: true as const, data: formatAppSettingsForView(settings) }
}

export async function updateAppSettingsAction(input: AppSettingsInput): Promise<ActionResult<ReturnType<typeof formatAppSettingsForView>>> {
  await requireAdmin()

  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return {
      ok: false,
      error: "Sesi tidak valid. Silakan login kembali.",
    }
  }

  try {
    const parsed = appSettingsInputSchema.parse(input)
    const updated = await updateAppSettings(parsed)

    try {
      await writeAuditLog({
        userId: currentUser.id,
        modul: "Pengaturan",
        aksi: "edit",
        keterangan: "Mengubah pengaturan branding aplikasi",
      })
    } catch (logError) {
      console.error("Failed to write audit log for settings update:", logError)
    }

    revalidatePath("/admin/settings")

    return { ok: true, data: formatAppSettingsForView(updated) }
  } catch (error) {
    return toActionError(error)
  }
}
