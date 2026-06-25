import { requireFeatureEnabled } from "@/lib/auth/permissions"
import { WargaLaporanView } from "@/features/warga-portal/components/warga-laporan-view"
import { getWargaLaporanAction } from "@/lib/actions/warga-portal"

export default async function WargaLaporanPage() {
  await requireFeatureEnabled("warga.laporan")
  const data = await getWargaLaporanAction()
  return <WargaLaporanView data={data} />
}
