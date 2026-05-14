import { AdminDashboardView } from "@/features/admin-dashboard/components/admin-dashboard-view"
import { getAdminDashboardData } from "@/features/admin-dashboard/lib/dashboard-data"
import { requireAdmin } from "@/lib/auth/permissions"

export default async function AdminDashboardPage() {
  await requireAdmin()
  const initialData = await loadInitialDashboardData()

  const now = new Date()
  const formattedDate = `${now.getDate()} ${now.toLocaleString("id-ID", { month: "short" })} ${now.getFullYear()}`

  return <AdminDashboardView initialData={initialData} formattedDate={formattedDate} />
}

async function loadInitialDashboardData() {
  try {
    return await getAdminDashboardData()
  } catch {
    return null
  }
}
