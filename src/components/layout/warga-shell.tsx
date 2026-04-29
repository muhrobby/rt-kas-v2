"use client"

import type { PropsWithChildren } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { AppPill, KanvasIcons } from "@/components/kanvas"
import { LogoutButton } from "@/components/auth/logout-button"
import { WargaMobileNav } from "@/components/layout/warga-mobile-nav"
import { wargaNavItems } from "@/lib/constants/nav"

const iconMap = {
  home: KanvasIcons.home,
  receipt: KanvasIcons.receipt,
  doc: KanvasIcons.doc,
} as const

const titleByPath: Record<string, string> = {
  "/warga/dashboard": "Portal Warga",
  "/warga/riwayat": "Riwayat Pembayaran",
  "/warga/laporan": "Transparansi Kas",
}

export interface WargaShellProfile {
  nama: string
  blok: string
  statusHunian: "tetap" | "kontrak"
}

export function WargaShell({ children, profile }: PropsWithChildren<{ profile: WargaShellProfile }>) {
  const pathname = usePathname()
  const me = profile
  const initials = me.nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

  return (
    <div className="min-h-svh bg-kanvas-paper">
      <header className="sticky top-0 z-30 border-b border-kanvas-line bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[1100px] items-center justify-between px-4 py-2.5 md:px-6 md:py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.7px] text-kanvas-ink-4 uppercase">Portal Warga RT 04</p>
            <p className="truncate text-[17px] text-kanvas-ink">{titleByPath[pathname] ?? "Portal Warga"}</p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-kanvas-line bg-kanvas-paper-2 px-2 py-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-kanvas-ink text-[11px] font-bold text-kanvas-paper-2">
              {initials || "W"}
            </div>
            <div className="pr-0.5 leading-tight">
              <p className="max-w-[92px] truncate text-[11px] font-semibold text-kanvas-ink sm:max-w-none sm:text-[12px]">{me.nama}</p>
              <p className="text-[10px] text-kanvas-ink-4 sm:text-[10.5px]">Blok {me.blok}</p>
            </div>
            <LogoutButton
              className="rounded p-1 text-kanvas-ink-3 disabled:cursor-not-allowed disabled:opacity-50"
              iconOnly
              ariaLabel="Keluar"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1100px] md:min-h-[calc(100svh-61px)]">
        <aside className="hidden w-[188px] shrink-0 border-r border-kanvas-line bg-white p-3 md:block">
          <div className="mb-3 rounded-lg border border-kanvas-line bg-kanvas-paper-2 p-2.5">
            <p className="text-[12px] font-semibold text-kanvas-ink">{me.nama}</p>
            <p className="mt-0.5 text-[10.5px] text-kanvas-ink-4">Blok {me.blok}</p>
            <div className="mt-1.5 flex gap-1.5">
              <AppPill tone="neutral">{me.statusHunian === "tetap" ? "Tetap" : "Kontrak"}</AppPill>
            </div>
          </div>

          <nav className="space-y-1">
            {wargaNavItems.map((item) => {
              const Icon = iconMap[item.icon]
              const active = pathname === item.href
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium"
                  style={{
                    background: active ? "var(--kanvas-terra-soft)" : "transparent",
                    color: active ? "var(--kanvas-terra-2)" : "var(--kanvas-ink-2)",
                  }}
                >
                  <Icon size={14} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 pb-[88px] md:pb-0">{children}</div>
      </div>

      <WargaMobileNav />
    </div>
  )
}
