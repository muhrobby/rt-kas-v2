import { WargaRiwayatView } from "@/features/warga-portal/components/warga-riwayat-view"
import { getMyRiwayatAction } from "@/lib/actions/warga-portal"

interface Props {
  searchParams: Promise<{ bulan?: string; tahun?: string }>
}

export default async function WargaRiwayatPage({ searchParams }: Props) {
  const params = await searchParams
  const bulan = params.bulan ? Number(params.bulan) : undefined
  const tahun = params.tahun ? Number(params.tahun) : undefined

  const filter = bulan && tahun ? { bulan, tahun } : undefined
  const result = await getMyRiwayatAction(filter)

  return (
    <WargaRiwayatView
      periods={result.ok ? result.data : []}
      error={result.ok ? null : result.error}
      filterBulan={bulan}
      filterTahun={tahun}
    />
  )
}
