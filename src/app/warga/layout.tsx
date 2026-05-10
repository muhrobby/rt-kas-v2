import type { PropsWithChildren } from "react"

import { WargaShell } from "@/components/layout/warga-shell"
import { getAppBranding } from "@/lib/branding/format-branding"
import { getMyDashboardAction } from "@/lib/actions/warga-portal"
import { getAppSettings } from "@/lib/services/app-settings-service"

export default async function WargaLayout({ children }: PropsWithChildren) {
  const [data, settings] = await Promise.all([getMyDashboardAction(), getAppSettings()])
  const branding = getAppBranding(settings)

  return (
    <WargaShell branding={branding} profile={data.profile}>
      {children}
    </WargaShell>
  )
}
