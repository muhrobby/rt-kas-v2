import { redirect } from "next/navigation"

import { requirePermission } from "@/lib/auth/permissions"
import { getAdminRoleFresh } from "@/lib/auth/session"
import { getFeatureFlagRows } from "@/features/feature-flags/lib/feature-flags-data"
import { FeatureFlagToggleList } from "@/features/feature-flags/components/feature-flag-toggle-list"

export default async function AdminSettingsFeatureFlagsPage() {
  const user = await requirePermission("feature_flags.write")
  const adminRole = await getAdminRoleFresh(user.id)
  if (adminRole !== "super_admin") {
    redirect("/unauthorized")
  }

  const flags = await getFeatureFlagRows()

  return (
    <main className="space-y-3.5 p-6 md:p-7">
      <section>
        <h1 className="text-[24px] text-kanvas-ink">Feature Flags</h1>
        <p className="mt-0.5 text-[12px] text-kanvas-ink-3">
          Aktifkan atau nonaktifkan menu di area admin dan portal warga.
        </p>
      </section>
      <FeatureFlagToggleList flags={flags} />
    </main>
  )
}
