import { WargaDashboardView } from "@/features/warga-portal/components/warga-dashboard-view"
import { getMyDashboardAction } from "@/lib/actions/warga-portal"

export default async function WargaDashboardPage() {
  const data = await getMyDashboardAction()
  return <WargaDashboardView data={data} />
}
