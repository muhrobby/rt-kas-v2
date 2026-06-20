import { requireFeatureEnabled } from "@/lib/auth/permissions"
import { listWargaAction } from "@/lib/actions/warga"
import { WargaManagementView } from "@/features/warga-management/components/warga-management-view"
import type { Warga } from "@/types/rt-kas"

function toUiWarga(row: {
  id: number; nama: string; blok: string; telp: string
  statusHunian: "tetap" | "kontrak" | "kos"; jumlahAnggota: number
  tglBatasDomisili: string | null; tglPindah: string | null
  isPengurus: boolean; rolePengurus: string | null; createdAt: Date
  pemilikHunian: { id: number; nama: string; noTelp: string | null } | null
}): Warga {
  return {
    id: String(row.id),
    nama: row.nama,
    blok: row.blok,
    telp: row.telp,
    statusHunian: row.statusHunian,
    domisili: row.createdAt ? new Date(row.createdAt).toISOString().slice(0, 10) : "",
    pindah: row.tglBatasDomisili ?? undefined,
    tglPindah: row.tglPindah ?? undefined,
    isPengurus: row.isPengurus,
    rolePengurus: row.rolePengurus ?? undefined,
    jumlahAnggota: row.jumlahAnggota,
    pemilikHunian: row.pemilikHunian,
  }
}

export default async function AdminWargaPage() {
  await requireFeatureEnabled("admin.warga")

  let initialData: Warga[] = []
  let initialError = ""

  try {
    const result = await listWargaAction({})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData = result.data.map((row) => toUiWarga(row as any))
  } catch {
    initialError = "Gagal memuat data warga. Coba muat ulang halaman."
  }

  return <WargaManagementView initialData={initialData} initialError={initialError} />
}
