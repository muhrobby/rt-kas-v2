"use client"

import { useEffect, useState } from "react"

import { AdminReminders } from "@/features/admin-dashboard/components/admin-reminders"
import { CashflowCard } from "@/features/admin-dashboard/components/cashflow-card"
import { DashboardMetrics } from "@/features/admin-dashboard/components/dashboard-metrics"
import { RecentActivityCard } from "@/features/admin-dashboard/components/recent-activity-card"
import { getDashboardSummaryAction } from "@/lib/actions/dashboard"

export function AdminDashboardView() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getDashboardSummaryAction>> | null>(null)

  useEffect(() => {
    getDashboardSummaryAction().then(setData)
  }, [])

  if (!data) {
    return (
      <main className="space-y-3.5 p-6 md:p-7">
        <p className="text-[12px] text-[var(--kanvas-ink-3)]">Memuat data...</p>
      </main>
    )
  }

  return (
    <main className="space-y-3.5 p-6 md:p-7">
      <DashboardMetrics
        saldoKas={data.saldoKas}
        pemasukanBulanIni={data.pemasukanBulanIni}
        pengeluaranBulanIni={data.pengeluaranBulanIni}
        totalWargaAktif={data.totalWargaAktif}
      />

      <section className="grid grid-cols-1 gap-3.5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <CashflowCard
            cashflowBulanan={data.cashflowBulanan}
            cashflowDenganSaldo={data.cashflowDenganSaldo}
          />
        </div>
        <RecentActivityCard logTerbaru={data.logTerbaru} />
      </section>

      <AdminReminders />
    </main>
  )
}
