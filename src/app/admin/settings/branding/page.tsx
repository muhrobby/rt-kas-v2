import { redirect } from "next/navigation"

import { requirePermission } from "@/lib/auth/permissions"
import { getAdminRoleFresh } from "@/lib/auth/session"
import { SettingsView } from "@/features/admin-settings/components/settings-view"

export default async function AdminSettingsBrandingPage() {
  const user = await requirePermission("settings.read")
  const adminRole = await getAdminRoleFresh(user.id)
  if (adminRole !== "super_admin") {
    redirect("/unauthorized")
  }

  return <SettingsView />
}
