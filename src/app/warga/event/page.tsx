import { requireWarga, requireFeatureEnabled } from "@/lib/auth/permissions"
import { listEventsForWarga } from "@/lib/services/warga-event-service"
import { WargaEventListView } from "@/features/warga-event/components/warga-event-list-view"

export default async function WargaEventPage() {
  await requireWarga()
  await requireFeatureEnabled("warga.event")
  const events = await listEventsForWarga()
  return <WargaEventListView events={events} />
}
