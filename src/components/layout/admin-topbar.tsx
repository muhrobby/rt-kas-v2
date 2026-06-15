"use client"

import { usePathname } from "next/navigation"

import { KanvasIcons, AppPill } from "@/components/kanvas"
import { LogoutButton } from "@/components/auth/logout-button"
import { PageHeader } from "@/components/layout/page-header"
import type { AdminShellUser } from "@/components/layout/admin-shell"
import type { AppBranding } from "@/lib/branding/format-branding"

interface AdminTopbarProps {
  branding: AppBranding
  user?: AdminShellUser
  onOpenSidebar?: () => void
}

const titlesByPath: Record<string, { subtitle: string; title: string }> = {
  "/admin/dashboard": { subtitle: "", title: "Beranda Pengurus" },
  "/admin/warga": { subtitle: "Total warga aktif", title: "Manajemen Warga" },
  "/admin/kategori": { subtitle: "Master data iuran", title: "Kategori Kas" },
  "/admin/kas-masuk": { subtitle: ``, title: "Kas Masuk" },
  "/admin/kas-keluar": { subtitle: "", title: "Kas Keluar" },
  "/admin/tunggakan": { subtitle: "Rekap iuran", title: "Tunggakan" },
  "/admin/laporan": { subtitle: "", title: "Laporan Keuangan" },
  "/admin/log-aktivitas": { subtitle: "Audit trail", title: "Log Aktivitas" },
  "/admin/settings": { subtitle: "Branding aplikasi", title: "Pengaturan" },
  "/admin/change-password": { subtitle: "Keamanan akun", title: "Ganti Password" },
}

export function AdminTopbar({ branding, user, onOpenSidebar }: AdminTopbarProps) {
  const pathname = usePathname()
  const heading = titlesByPath[pathname] ?? titlesByPath["/admin/dashboard"]
  const subtitle = heading.subtitle || branding.rtRwLabel

  return (
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-kanvas-line bg-kanvas-paper-2 px-4 py-3 sm:items-center sm:px-6 sm:py-3.5 lg:px-7">
      <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:items-center">
        <button
          type="button"
          aria-label="Buka menu admin"
          onClick={onOpenSidebar}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-kanvas-line bg-white text-kanvas-ink-2 lg:hidden"
        >
          <KanvasIcons.menu size={15} />
        </button>

        <PageHeader subtitle={subtitle} title={heading.title} />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border border-kanvas-line bg-white py-1 pr-2 pl-1 sm:pr-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-kanvas-ink text-[11px] font-bold text-kanvas-paper-2">
            {user?.initials ?? "U"}
          </div>
          <div className="hidden leading-tight sm:block">
            <div className="flex items-center gap-1.5">
              <p className="text-[12.5px] font-semibold text-kanvas-ink">{user?.name ?? "User"}</p>
              {user?.isSuperAdmin ? (
                <AppPill tone="terra" style={{ fontSize: 9, padding: "1px 5px" }}>
                  Super Admin
                </AppPill>
              ) : null}
            </div>
            <p className="text-[10.5px] text-kanvas-ink-4">{user?.role ?? "Admin"}</p>
          </div>
          <LogoutButton
            className="p-1 text-kanvas-ink-3 disabled:cursor-not-allowed disabled:opacity-50"
            iconOnly
            ariaLabel="Keluar"
          />
        </div>
      </div>
    </header>
  )
}
