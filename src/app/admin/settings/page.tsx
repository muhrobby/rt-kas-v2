import { redirect } from "next/navigation"

import { requirePermission } from "@/lib/auth/permissions"
import { getAdminRoleFresh } from "@/lib/auth/session"

export default async function AdminSettingsPage() {
  const user = await requirePermission("settings.read")
  const adminRole = await getAdminRoleFresh(user.id)
  if (adminRole !== "super_admin") {
    redirect("/unauthorized")
  }

  redirect("/admin/settings/branding")
}
