import { WargaLaporanView } from "@/features/warga-portal/components/warga-laporan-view"
import { getWargaLaporanAction } from "@/lib/actions/warga-portal"

export default async function WargaLaporanPage() {
  const data = await getWargaLaporanAction()
  return <WargaLaporanView data={data} />
}
