"use client"

import { useState } from "react"

import { AppCard, AppButton, AppPill, AppModal, KanvasIcons } from "@/components/kanvas"
import { ADMIN_ROLES, ADMIN_ROLE_LABELS } from "@/lib/constants/admin-roles"
import type { AdminRole } from "@/lib/constants/admin-roles"
import type { PengurusItem } from "@/features/pengurus-management/types"
import { assignAdminRoleAction } from "@/lib/actions/admin-role"

interface PengurusListProps {
  initialData: PengurusItem[]
  initialError?: string
}

export function PengurusList({ initialData, initialError }: PengurusListProps) {
  const [data, setData] = useState(initialData)
  const [error] = useState(initialError ?? "")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<PengurusItem | null>(null)
  const [selectedRole, setSelectedRole] = useState<AdminRole>("bendahara")
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState("")

  function handleOpenAssign(item: PengurusItem) {
    setSelectedUser(item)
    setSelectedRole(item.adminRole ?? "bendahara")
    setActionError("")
    setDialogOpen(true)
  }

  async function handleAssign() {
    if (!selectedUser) return
    setSubmitting(true)
    setActionError("")

    try {
      const result = await assignAdminRoleAction({
        userId: selectedUser.userId,
        adminRole: selectedRole,
      })

      if (!result.ok) {
        setActionError(result.error)
        setSubmitting(false)
        return
      }

      // Update local state
      setData((prev) =>
        prev.map((item) =>
          item.userId === selectedUser.userId
            ? { ...item, adminRole: selectedRole, adminRoleLabel: ADMIN_ROLE_LABELS[selectedRole] }
            : item,
        ),
      )
      setDialogOpen(false)
    } catch {
      setActionError("Terjadi kesalahan. Coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  if (error) {
    return (
      <AppCard className="p-6">
        <p className="text-sm text-kanvas-ink-3">{error}</p>
      </AppCard>
    )
  }

  if (data.length === 0) {
    return (
      <AppCard className="p-6">
        <p className="text-center text-sm text-kanvas-ink-3">Belum ada pengurus terdaftar.</p>
      </AppCard>
    )
  }

  return (
    <>
      <AppCard className="overflow-hidden p-0">
        {/* Header - desktop only */}
        <div className="hidden border-b border-kanvas-line px-4 py-2.5 lg:grid lg:grid-cols-[1fr_120px_140px_140px_100px]">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-kanvas-ink-4">Nama</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-kanvas-ink-4">Blok</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-kanvas-ink-4">No. Telp</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-kanvas-ink-4">Sub-Role</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-kanvas-ink-4">Aksi</span>
        </div>

        {data.map((item) => (
          <div key={item.userId} className="border-b border-kanvas-line last:border-b-0">
            {/* Desktop row */}
            <div className="hidden items-center px-4 py-3 lg:grid lg:grid-cols-[1fr_120px_140px_140px_100px]">
              <span className="text-sm font-medium text-kanvas-ink">{item.name}</span>
              <span className="text-sm text-kanvas-ink-2">{item.blokRumah}</span>
              <span className="text-sm text-kanvas-ink-2">{item.noTelp}</span>
              <span>
                <AppPill tone={item.adminRole === "ketua_rt" ? "terra" : "olive"}>
                  {item.adminRoleLabel}
                </AppPill>
              </span>
              <span>
                <button
                  type="button"
                  onClick={() => handleOpenAssign(item)}
                  className="rounded p-1.5 text-kanvas-ink-3 transition hover:bg-kanvas-paper-2 hover:text-kanvas-ink"
                  aria-label={`Ubah sub-role ${item.name}`}
                >
                  <KanvasIcons.edit size={15} />
                </button>
              </span>
            </div>

            {/* Mobile row */}
            <div className="flex flex-col gap-1.5 px-4 py-3 lg:hidden">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-kanvas-ink">{item.name}</span>
                <AppPill tone={item.adminRole === "ketua_rt" ? "terra" : "olive"}>
                  {item.adminRoleLabel}
                </AppPill>
              </div>
              <div className="flex items-center gap-3 text-xs text-kanvas-ink-3">
                <span>{item.blokRumah}</span>
                <span>{item.noTelp}</span>
              </div>
              <div className="mt-1">
                <AppButton variant="outline" size="sm" onClick={() => handleOpenAssign(item)}>
                  Ubah Sub-Role
                </AppButton>
              </div>
            </div>
          </div>
        ))}
      </AppCard>

      {/* Assign Role Dialog */}
      <AppModal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Ubah Sub-Role Admin"
        width={420}
      >
        {selectedUser && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm text-kanvas-ink-2">
                Mengubah sub-role untuk <span className="font-semibold text-kanvas-ink">{selectedUser.name}</span>
              </p>
              <p className="mt-0.5 text-xs text-kanvas-ink-4">
                Sub-role saat ini: {selectedUser.adminRoleLabel}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-kanvas-ink-4">
                Sub-Role Baru
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as AdminRole)}
                className="rounded-lg border border-kanvas-line bg-white px-3 py-2 text-sm text-kanvas-ink outline-none focus:border-kanvas-terra"
              >
                {ADMIN_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ADMIN_ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>

            {actionError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{actionError}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <AppButton variant="outline" size="sm" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Batal
              </AppButton>
              <AppButton variant="primary" size="sm" onClick={handleAssign} disabled={submitting}>
                {submitting ? "Menyimpan..." : "Simpan"}
              </AppButton>
            </div>
          </div>
        )}
      </AppModal>
    </>
  )
}
