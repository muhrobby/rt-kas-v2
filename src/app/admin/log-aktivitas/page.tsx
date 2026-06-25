import { requireFeatureEnabled } from "@/lib/auth/permissions"
import { LogAktivitasView } from "@/features/log-aktivitas/components/log-aktivitas-view"

export default async function AdminLogAktivitasPage() {
  await requireFeatureEnabled("admin.log-aktivitas")
  return <LogAktivitasView />
}
