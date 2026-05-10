import { AdminDashboardView } from "@/features/admin-dashboard/components/admin-dashboard-view"
import { getAdminDashboardData } from "@/features/admin-dashboard/lib/dashboard-data"
import { requireAdmin } from "@/lib/auth/permissions"

export default async function AdminDashboardPage() {
  await requireAdmin()
  const initialData = await loadInitialDashboardData()

  return <AdminDashboardView initialData={initialData} />
}

async function loadInitialDashboardData() {
  try {
    return await getAdminDashboardData()
  } catch {
    return null
  }
}
