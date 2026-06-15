"use server"

import { revalidatePath } from "next/cache"

import { requirePermission } from "@/lib/auth/permissions"
import { getAdminRoleFresh } from "@/lib/auth/session"
import { toggleFeatureFlagSchema, type ToggleFeatureFlagInput } from "@/lib/validations/feature-flags"
import { setFlagEnabled } from "@/lib/services/feature-flag-service"
import { writeAuditLog } from "@/lib/services/audit-log-service"

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

export async function toggleFeatureFlagAction(
  input: ToggleFeatureFlagInput,
): Promise<ActionResult<{ key: string; enabled: boolean }>> {
  const parsed = toggleFeatureFlagSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Invalid input" }
  }

  const { key, enabled } = parsed.data

  const user = await requirePermission("feature_flags.write")
  const adminRole = await getAdminRoleFresh(user.id)
  if (adminRole !== "super_admin") {
    return { ok: false, error: "Unauthorized" }
  }

  await setFlagEnabled(key, enabled, user.id)

  await writeAuditLog({
    userId: user.id,
    modul: "Pengaturan",
    aksi: "edit",
    keterangan: `Feature flag ${key}: ${enabled ? "OFF -> ON" : "ON -> OFF"}`,
  })

  revalidatePath("/admin", "layout")
  revalidatePath("/warga", "layout")
  revalidatePath("/admin/settings/feature-flags")
  revalidatePath("/admin/settings")

  return { ok: true, data: { key, enabled } }
}
