import { requireFeatureEnabled } from "@/lib/auth/permissions"
import { AdminLaporanView } from "@/features/admin-laporan/components/admin-laporan-view"

export default async function AdminLaporanPage() {
  await requireFeatureEnabled("admin.laporan")
  return <AdminLaporanView />
}
