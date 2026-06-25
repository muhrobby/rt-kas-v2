import { requireFeatureEnabled } from "@/lib/auth/permissions"
import { KasKeluarView } from "@/features/kas-keluar/components/kas-keluar-view"

export default async function AdminKasKeluarPage() {
  await requireFeatureEnabled("admin.kas-keluar")
  return <KasKeluarView />
}
