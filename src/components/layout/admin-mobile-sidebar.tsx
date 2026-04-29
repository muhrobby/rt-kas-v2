"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { AppPill, KanvasIcons } from "@/components/kanvas"
import { dashboardData } from "@/features/admin-dashboard/lib/dashboard-data"
import { adminNavItems } from "@/lib/constants/nav"
import { formatRupiah } from "@/lib/format/currency"
import { useTunggakanCount } from "@/hooks/use-tunggakan-count"

interface AdminMobileSidebarProps {
  open: boolean
  onClose: () => void
}

const iconMap = {
  home: KanvasIcons.home,
  users: KanvasIcons.users,
  doc: KanvasIcons.doc,
  in: KanvasIcons.in,
  out: KanvasIcons.out,
  alert: KanvasIcons.alert,
  log: KanvasIcons.log,
} as const

export function AdminMobileSidebar({ open, onClose }: AdminMobileSidebarProps) {
  const pathname = usePathname()
  const tunggakanCount = useTunggakanCount()

  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <button
        type="button"
        aria-label="Tutup menu admin"
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />

      <aside
        className={`absolute inset-y-0 left-0 flex w-[min(86vw,280px)] flex-col border-r border-kanvas-line bg-kanvas-paper-2 px-3.5 py-5 shadow-xl transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-5 flex items-center justify-between gap-2.5 px-1.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-kanvas-ink text-xl leading-none text-kanvas-paper-2">
              K
            </div>
            <div className="leading-none">
              <p className="text-lg text-kanvas-ink">Kanvas RT</p>
              <p className="mt-1 text-[10px] font-semibold tracking-[1.5px] text-kanvas-ink-4 uppercase">Kas RT 04</p>
            </div>
          </div>

          <button type="button" onClick={onClose} aria-label="Tutup menu admin" className="rounded p-1 text-kanvas-ink-3">
            <KanvasIcons.x size={18} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-auto">
          {adminNavItems.map((item) => {
            const Icon = iconMap[item.icon]
            const active = pathname === item.href

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className="relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition"
                style={{
                  background: active ? "var(--kanvas-terra)" : "transparent",
                  color: active ? "#ffffff" : "var(--kanvas-ink-2)",
                }}
              >
                <Icon size={15} />
                <span>{item.label}</span>
                {item.id === "tunggakan" && tunggakanCount !== null ? (
                  <span className="ml-auto">
                    <AppPill tone="terra" style={{ fontSize: 10, padding: "1px 7px" }}>
                      {tunggakanCount}
                    </AppPill>
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>

        <div className="mt-3 rounded-[10px] border border-kanvas-line bg-white p-3 text-[11.5px] text-kanvas-ink-3">
          <p className="text-xs font-semibold text-kanvas-ink-2">Saldo Kas</p>
          <p className="mt-1 text-lg font-semibold text-kanvas-ink">{formatRupiah(dashboardData.saldoKas)}</p>
          <p className="mt-1 text-[10.5px] text-kanvas-ink-4">per 22 Apr 2026</p>
        </div>
      </aside>
    </div>
  )
}
