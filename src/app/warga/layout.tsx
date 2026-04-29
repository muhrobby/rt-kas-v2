import type { PropsWithChildren } from "react"

import { WargaShell } from "@/components/layout/warga-shell"
import { getMyDashboardAction } from "@/lib/actions/warga-portal"

export default async function WargaLayout({ children }: PropsWithChildren) {
  const data = await getMyDashboardAction()
  return <WargaShell profile={data.profile}>{children}</WargaShell>
}
