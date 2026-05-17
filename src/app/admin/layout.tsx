import type { PropsWithChildren } from "react"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getAdminRoleFresh, getCurrentUser } from "@/lib/auth/session"
import { hasAdminPermission } from "@/lib/auth/permissions"
import { db } from "@/lib/db"
import { warga } from "@/lib/db/schema"
import { AdminShell } from "@/components/layout/admin-shell"
import { getAppBranding } from "@/lib/branding/format-branding"
import { getAppSettings } from "@/lib/services/app-settings-service"
import { getSaldoSummary } from "@/lib/services/saldo-service"
import { getTunggakan } from "@/lib/services/tunggakan-service"
import { adminNavItems } from "@/lib/constants/nav"
import { ADMIN_ROLE_LABELS } from "@/lib/constants/admin-roles"
import { eq } from "drizzle-orm"

export default async function AdminLayout({ children }: PropsWithChildren) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") ?? ""

  if (pathname === "/admin/change-password") {
    return <>{children}</>
  }

  const now = new Date()
  const bulan = now.getMonth() + 1
  const tahun = now.getFullYear()

  const [currentUser, settings, saldoData, tunggakanData] = await Promise.all([
    getCurrentUser(),
    getAppSettings(),
    getSaldoSummary().catch(() => null),
    getTunggakan({ bulanMulai: bulan, tahunMulai: tahun, bulanSelesai: bulan, tahunSelesai: tahun }).catch(() => null),
  ])
  const branding = getAppBranding(settings)
  const freshAdminRole = currentUser?.role === "admin" ? await getAdminRoleFresh(currentUser.id) : null
  const userForPermission = currentUser ? { ...currentUser, adminRole: freshAdminRole } : null

  let wargaData = null
  if (currentUser?.wargaId) {
    const [wargaRow] = await db
      .select()
      .from(warga)
      .where(eq(warga.id, currentUser.wargaId))
      .limit(1)
    wargaData = wargaRow
  }

  // Filter nav items berdasarkan permission admin (server-side, UX only)
  const filteredNavItems = userForPermission
    ? adminNavItems.filter((item) => hasAdminPermission(userForPermission, item.permission))
    : []

  const currentNavItem = adminNavItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
  if (currentNavItem && userForPermission && !hasAdminPermission(userForPermission, currentNavItem.permission)) {
    redirect("/unauthorized")
  }

  const userDisplay = {
    name: wargaData?.namaKepalaKeluarga ?? currentUser?.name ?? "User",
    initials: getInitials(wargaData?.namaKepalaKeluarga ?? currentUser?.name ?? "U"),
    role: freshAdminRole ? ADMIN_ROLE_LABELS[freshAdminRole] : (wargaData?.rolePengurus ?? currentUser?.role ?? "Admin"),
    wargaId: currentUser?.wargaId ?? null,
  }

  return (
    <AdminShell
      branding={branding}
      user={userDisplay}
      saldoKas={saldoData?.saldoKas ?? null}
      tunggakanCount={tunggakanData?.totalWarga ?? null}
      navItems={filteredNavItems}
    >
      {children}
    </AdminShell>
  )
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
