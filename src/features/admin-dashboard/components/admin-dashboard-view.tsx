"use client"

import { AdminReminders } from "@/features/admin-dashboard/components/admin-reminders"
import { CashflowCard } from "@/features/admin-dashboard/components/cashflow-card"
import { DashboardMetrics } from "@/features/admin-dashboard/components/dashboard-metrics"
import { RecentActivityCard } from "@/features/admin-dashboard/components/recent-activity-card"
import type { DashboardSummary } from "@/features/admin-dashboard/lib/dashboard-data"

interface AdminDashboardViewProps {
  initialData: DashboardSummary | null
}

export function AdminDashboardView({ initialData: data }: AdminDashboardViewProps) {
  if (!data) {
    return (
      <main className="space-y-3.5 p-4 md:p-6 lg:p-7">
        <section className="rounded-xl border border-kanvas-line bg-white p-5">
          <p className="text-sm font-semibold text-kanvas-ink">Dashboard belum bisa dimuat</p>
          <p className="mt-1 text-[12px] text-kanvas-ink-3">
            Terjadi kendala saat mengambil ringkasan kas. Silakan muat ulang halaman atau coba beberapa saat lagi.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="space-y-3.5 p-4 md:p-6 lg:p-7">
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

      <AdminReminders reminders={data.reminders} />
    </main>
  )
}
