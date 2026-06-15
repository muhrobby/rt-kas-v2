"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { AppPill, KanvasIcons } from "@/components/kanvas"
import { adminNavItems, type AdminNavItem } from "@/lib/constants/nav"
import { formatRupiah } from "@/lib/format/currency"
import type { AppBranding } from "@/lib/branding/format-branding"

const iconMap = {
  home: KanvasIcons.home,
  users: KanvasIcons.users,
  doc: KanvasIcons.doc,
  in: KanvasIcons.in,
  out: KanvasIcons.out,
  alert: KanvasIcons.alert,
  log: KanvasIcons.log,
  gear: KanvasIcons.gear,
  shield: KanvasIcons.shield,
  calendar: KanvasIcons.calendar,
  eye: KanvasIcons.eye,
  more: KanvasIcons.more,
} as const

interface AdminSidebarProps {
  branding: AppBranding
  saldoKas: number | null
  tunggakanCount: number | null
  navItems?: AdminNavItem[]
  isSuperAdmin?: boolean
}

export function AdminSidebar({ branding, saldoKas, tunggakanCount, navItems, isSuperAdmin }: AdminSidebarProps) {
  const pathname = usePathname()
  const brandInitial = branding.appName.trim().charAt(0).toUpperCase() || "K"
  const items = navItems ?? adminNavItems

  return (
    <aside className="sticky top-0 flex h-svh w-[220px] shrink-0 flex-col border-r border-kanvas-line bg-kanvas-paper-2 px-3.5 py-5 xl:w-[232px]">
      <div className="mb-5 flex items-center gap-2.5 px-1.5">
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-kanvas-ink text-xl leading-none text-kanvas-paper-2">
          {brandInitial}
        </div>
        <div className="leading-none">
          <p className="text-lg text-kanvas-ink">{branding.appName}</p>
          <p className="mt-1 text-[10px] font-semibold tracking-[1.5px] text-kanvas-ink-4 uppercase">{branding.rtRwLabel}</p>
          {isSuperAdmin ? (
            <p className="mt-0.5 text-[10px] text-kanvas-terra-2">Mode konfigurasi</p>
          ) : null}
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {items.map((item) => {
          const Icon = iconMap[item.icon]
          const active = pathname === item.href
          return (
            <Link
              key={item.id}
              href={item.href}
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

      <div className="rounded-[10px] border border-kanvas-line bg-white p-3 text-[11.5px] text-kanvas-ink-3">
        <p className="text-xs font-semibold text-kanvas-ink-2">Saldo Kas</p>
        <p className="mt-1 text-lg font-semibold text-kanvas-ink">
          {saldoKas !== null ? formatRupiah(saldoKas) : "—"}
        </p>
        <p className="mt-1 text-[10.5px] text-kanvas-ink-4">per {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</p>
      </div>
    </aside>
  )
}
