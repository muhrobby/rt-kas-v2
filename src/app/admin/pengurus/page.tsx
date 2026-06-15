import { requirePermission, requireFeatureEnabled } from "@/lib/auth/permissions"
import { listPengurusAction } from "@/lib/actions/admin-role"
import { PengurusList } from "@/features/pengurus-management/components/pengurus-list"
import type { PengurusItem } from "@/features/pengurus-management/types"

export default async function AdminPengurusPage() {
  // Page-level guard: hanya ketua_rt yang bisa akses halaman ini
  await requirePermission("pengurus.manage")
  await requireFeatureEnabled("admin.pengurus")

  let initialData: PengurusItem[] = []
  let initialError = ""

  try {
    const result = await listPengurusAction()
    if (result.ok) {
      initialData = result.data.map((row) => ({
        userId: row.userId,
        name: row.name,
        blokRumah: row.blokRumah,
        noTelp: row.noTelp,
        adminRole: row.adminRole,
        adminRoleLabel: row.adminRoleLabel,
      }))
    } else {
      initialError = result.error
    }
  } catch {
    initialError = "Gagal memuat data pengurus. Coba muat ulang halaman."
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 lg:px-6">
      <div className="mb-5">
        <p className="text-xs font-semibold tracking-[1.4px] text-kanvas-ink-4 uppercase">Manajemen</p>
        <h1 className="mt-1 text-2xl text-kanvas-ink">Pengurus RT</h1>
        <p className="mt-1 text-sm text-kanvas-ink-3">
          Kelola sub-role admin pengurus RT. Perubahan sub-role langsung mempengaruhi akses menu dan fitur.
        </p>
      </div>

      <PengurusList initialData={initialData} initialError={initialError} />
    </div>
  )
}
