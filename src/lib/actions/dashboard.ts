"use server"

import { getAdminDashboardData } from "@/features/admin-dashboard/lib/dashboard-data"
import { requireAdmin } from "@/lib/auth/permissions"

export async function getDashboardSummaryAction() {
  await requireAdmin()
  return getAdminDashboardData()
}
