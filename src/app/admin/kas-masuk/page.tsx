import { requireFeatureEnabled } from "@/lib/auth/permissions"
import { KasMasukView } from "@/features/kas-masuk/components/kas-masuk-view"

export default async function AdminKasMasukPage() {
  await requireFeatureEnabled("admin.kas-masuk")
  return <KasMasukView />
}
