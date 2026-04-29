import { WargaRiwayatView } from "@/features/warga-portal/components/warga-riwayat-view"
import { getMyRiwayatAction } from "@/lib/actions/warga-portal"

export default async function WargaRiwayatPage() {
  const result = await getMyRiwayatAction()
  return <WargaRiwayatView periods={result.ok ? result.data : []} error={result.ok ? null : result.error} />
}
