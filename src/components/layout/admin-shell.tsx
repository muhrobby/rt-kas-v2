"use client"

import { useState } from "react"
import type { PropsWithChildren } from "react"

import { AdminMobileSidebar } from "@/components/layout/admin-mobile-sidebar"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { AdminTopbar } from "@/components/layout/admin-topbar"

export interface AdminShellUser {
  name: string
  initials: string
  role: string
  wargaId: number | null
}

interface AdminShellProps extends PropsWithChildren {
  user?: AdminShellUser
}

export function AdminShell({ children, user }: AdminShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-svh min-w-0 bg-kanvas-paper">
      <AdminMobileSidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div className="hidden lg:flex">
        <AdminSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar user={user} onOpenSidebar={() => setMobileSidebarOpen(true)} />
        <div className="flex-1 overflow-auto overflow-x-hidden">{children}</div>
      </div>
    </div>
  )
}
