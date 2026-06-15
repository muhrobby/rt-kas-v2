import { requireFeatureEnabled } from "@/lib/auth/permissions"
import { TunggakanView } from "@/features/tunggakan/components/tunggakan-view"

export default async function AdminTunggakanPage() {
  await requireFeatureEnabled("admin.tunggakan")
  return <TunggakanView />
}
