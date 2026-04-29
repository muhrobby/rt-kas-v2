"use client"

import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { KanvasIcons } from "@/components/kanvas"
import { PageHeader } from "@/components/layout/page-header"

interface AdminTopbarProps {
  onOpenSidebar?: () => void
}

const titlesByPath: Record<string, { subtitle: string; title: string }> = {
  "/admin/dashboard": { subtitle: "RT 04 / RW 09 · Apr 2026", title: "Beranda Pengurus" },
  "/admin/warga": { subtitle: "Total warga aktif", title: "Manajemen Warga" },
  "/admin/kategori": { subtitle: "Master data iuran", title: "Kategori Kas" },
  "/admin/kas-masuk": { subtitle: "Apr 2026", title: "Kas Masuk" },
  "/admin/kas-keluar": { subtitle: "Apr 2026", title: "Kas Keluar" },
  "/admin/tunggakan": { subtitle: "Rekap iuran", title: "Tunggakan" },
  "/admin/laporan": { subtitle: "Periode 2026", title: "Laporan Keuangan" },
  "/admin/log-aktivitas": { subtitle: "Audit trail", title: "Log Aktivitas" },
}

export function AdminTopbar({ onOpenSidebar }: AdminTopbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const heading = titlesByPath[pathname] ?? titlesByPath["/admin/dashboard"]

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
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--kanvas-line)] bg-[var(--kanvas-paper-2)] px-4 py-3 sm:items-center sm:px-6 sm:py-3.5 lg:px-7">
      <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:items-center">
        <button
          type="button"
          aria-label="Buka menu admin"
          onClick={onOpenSidebar}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--kanvas-line)] bg-white text-[var(--kanvas-ink-2)] lg:hidden"
        >
          <KanvasIcons.menu size={15} />
        </button>

        <PageHeader subtitle={heading.subtitle} title={heading.title} />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          aria-label="Notifikasi"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--kanvas-line)] bg-white text-[var(--kanvas-ink-2)]"
        >
          <KanvasIcons.bell size={15} />
          <span className="absolute top-[9px] right-[10px] h-1.5 w-1.5 rounded-full bg-[var(--kanvas-terra)]" />
        </button>

        <div className="flex items-center gap-2 rounded-full border border-[var(--kanvas-line)] bg-white py-1 pr-2 pl-1 sm:pr-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--kanvas-ink)] text-[11px] font-bold text-[var(--kanvas-paper-2)]">
            BS
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-[12.5px] font-semibold text-[var(--kanvas-ink)]">Budi Santoso</p>
            <p className="text-[10.5px] text-[var(--kanvas-ink-4)]">Ketua RT</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-1 text-[var(--kanvas-ink-3)] disabled:cursor-not-allowed disabled:opacity-50"
            title="Keluar"
            aria-label="Keluar"
          >
            <KanvasIcons.logout size={14} />
          </button>
        </div>
      </div>
    </header>
  )
}
