import { notFound } from "next/navigation"

import { requireWarga } from "@/lib/auth/permissions"
import { getEventDetailForWarga } from "@/lib/services/warga-event-service"
import { WargaEventDetailView } from "@/features/warga-event/components/warga-event-detail-view"

export default async function WargaEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireWarga()
  const { id: idStr } = await params
  const id = Number(idStr)
  if (!id || isNaN(id)) notFound()

  const detail = await getEventDetailForWarga(id)
  if (!detail) notFound()

  return <WargaEventDetailView detail={detail} />
}
