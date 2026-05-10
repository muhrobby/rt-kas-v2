"use client"

import { useState } from "react"
import type { PropsWithChildren } from "react"

import { AdminMobileSidebar } from "@/components/layout/admin-mobile-sidebar"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { AdminTopbar } from "@/components/layout/admin-topbar"
import type { AppBranding } from "@/lib/branding/format-branding"

export interface AdminShellUser {
  name: string
  initials: string
  role: string
  wargaId: number | null
}

interface AdminShellProps extends PropsWithChildren {
  branding: AppBranding
  user?: AdminShellUser
}

export function AdminShell({ branding, children, user }: AdminShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-svh min-w-0 bg-kanvas-paper">
      <AdminMobileSidebar branding={branding} open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div className="hidden lg:flex">
        <AdminSidebar branding={branding} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar branding={branding} user={user} onOpenSidebar={() => setMobileSidebarOpen(true)} />
        <div className="flex-1 overflow-auto overflow-x-hidden">{children}</div>
      </div>
    </div>
  )
}
