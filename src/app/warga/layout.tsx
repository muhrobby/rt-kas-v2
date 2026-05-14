import type { PropsWithChildren } from "react"

import { headers } from "next/headers"
import { WargaShell } from "@/components/layout/warga-shell"
import { getAppBranding } from "@/lib/branding/format-branding"
import { getMyProfileAction } from "@/lib/actions/warga-portal"
import { getAppSettings } from "@/lib/services/app-settings-service"

export default async function WargaLayout({ children }: PropsWithChildren) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") ?? ""

  if (pathname === "/warga/change-password") {
    return <>{children}</>
  }

  const [profile, settings] = await Promise.all([getMyProfileAction(), getAppSettings()])
  const branding = getAppBranding(settings)

  return (
    <WargaShell branding={branding} profile={profile}>
      {children}
    </WargaShell>
  )
}
