import { requireFeatureEnabled } from "@/lib/auth/permissions"
import { KategoriKasView } from "@/features/kategori-kas/components/kategori-kas-view"

export default async function AdminKategoriPage() {
  await requireFeatureEnabled("admin.kategori")
  return <KategoriKasView />
}
