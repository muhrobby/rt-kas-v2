"use client"

import type { PropsWithChildren } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

import { AppPill, KanvasIcons } from "@/components/kanvas"
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
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const me = profile
  const initials = me.nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
      })
    } finally {
      router.replace("/login")
      router.refresh()
      setLoggingOut(false)
    }
  }

  return (
    <div className="min-h-svh bg-[var(--kanvas-paper)]">
      <header className="sticky top-0 z-30 border-b border-[var(--kanvas-line)] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[1100px] items-center justify-between px-4 py-2.5 md:px-6 md:py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.7px] text-[var(--kanvas-ink-4)] uppercase">Portal Warga RT 04</p>
            <p className="truncate text-[17px] text-[var(--kanvas-ink)]">{titleByPath[pathname] ?? "Portal Warga"}</p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[var(--kanvas-line)] bg-[var(--kanvas-paper-2)] px-2 py-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--kanvas-ink)] text-[11px] font-bold text-[var(--kanvas-paper-2)]">
              {initials || "W"}
            </div>
            <div className="pr-0.5 leading-tight">
              <p className="max-w-[92px] truncate text-[11px] font-semibold text-[var(--kanvas-ink)] sm:max-w-none sm:text-[12px]">{me.nama}</p>
              <p className="text-[10px] text-[var(--kanvas-ink-4)] sm:text-[10.5px]">Blok {me.blok}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded p-1 text-[var(--kanvas-ink-3)] disabled:cursor-not-allowed disabled:opacity-50"
              title="Keluar"
              aria-label="Keluar"
            >
              <KanvasIcons.logout size={14} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1100px] md:min-h-[calc(100svh-61px)]">
        <aside className="hidden w-[188px] shrink-0 border-r border-[var(--kanvas-line)] bg-white p-3 md:block">
          <div className="mb-3 rounded-lg border border-[var(--kanvas-line)] bg-[var(--kanvas-paper-2)] p-2.5">
            <p className="text-[12px] font-semibold text-[var(--kanvas-ink)]">{me.nama}</p>
            <p className="mt-0.5 text-[10.5px] text-[var(--kanvas-ink-4)]">Blok {me.blok}</p>
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
