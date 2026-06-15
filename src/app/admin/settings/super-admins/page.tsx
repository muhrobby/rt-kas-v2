import { redirect } from "next/navigation"

import { requirePermission } from "@/lib/auth/permissions"
import { getAdminRoleFresh } from "@/lib/auth/session"
import { listSuperAdminsAction, listPengurusAction } from "@/lib/actions/super-admin"
import { SuperAdminManager } from "@/features/super-admin/components/super-admin-manager"

export default async function AdminSettingsSuperAdminsPage() {
  const user = await requirePermission("super_admin.manage")
  const adminRole = await getAdminRoleFresh(user.id)
  if (adminRole !== "super_admin") {
    redirect("/unauthorized")
  }

  const [superAdmins, allPengurus] = await Promise.all([
    listSuperAdminsAction(),
    listPengurusAction(),
  ])

  const candidates = allPengurus.filter(
    (p) => !superAdmins.some((sa) => sa.id === p.userId),
  )

  return (
    <main className="space-y-4 p-6 md:p-7">
      <section>
        <h1 className="text-[24px] text-kanvas-ink">Manajemen Super Admin</h1>
        <p className="mt-0.5 text-[12px] text-kanvas-ink-3">
          Promosikan atau demosikan super admin. Super admin terakhir tidak dapat didemosikan.
        </p>
      </section>
      <SuperAdminManager superAdmins={superAdmins} candidates={candidates} />
    </main>
  )
}
