import type { PropsWithChildren } from "react"

import { headers } from "next/headers"
import { WargaShell } from "@/components/layout/warga-shell"
import { getAppBranding } from "@/lib/branding/format-branding"
import { getMyProfileAction } from "@/lib/actions/warga-portal"
import { getAppSettings } from "@/lib/services/app-settings-service"
import { getEnabledFlagsByScope } from "@/lib/services/feature-flag-service"
import { wargaNavItems } from "@/lib/constants/nav"

export default async function WargaLayout({ children }: PropsWithChildren) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") ?? ""

  if (pathname === "/warga/change-password") {
    return <>{children}</>
  }

  const [profile, settings, enabledFlags] = await Promise.all([
    getMyProfileAction(),
    getAppSettings(),
    getEnabledFlagsByScope("warga"),
  ])
  const branding = getAppBranding(settings)

  const filteredNavItems = wargaNavItems.filter((item) => {
    if (item.featureKey && !enabledFlags.has(item.featureKey)) return false
    return true
  })

  return (
    <WargaShell branding={branding} profile={profile} navItems={filteredNavItems}>
      {children}
    </WargaShell>
  )
}
