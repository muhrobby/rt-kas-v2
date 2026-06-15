"use client"

import { useState, useTransition } from "react"

import { AppCard, useToast } from "@/components/kanvas"
import {
  promoteSuperAdminAction,
  demoteSuperAdminAction,
} from "@/lib/actions/super-admin"

interface SuperAdminItem {
  id: string
  name: string
  username: string | null
}

interface CandidateItem {
  userId: string
  name: string
  adminRoleLabel: string
}

interface SuperAdminManagerProps {
  superAdmins: SuperAdminItem[]
  candidates: CandidateItem[]
}

export function SuperAdminManager({ superAdmins: initialSuperAdmins, candidates: initialCandidates }: SuperAdminManagerProps) {
  const { pushToast } = useToast()
  const [pending, startTransition] = useTransition()
  const [superAdmins, setSuperAdmins] = useState(initialSuperAdmins)
  const [candidates, setCandidates] = useState(initialCandidates)
  const [selectedUserId, setSelectedUserId] = useState("")

  function handlePromote() {
    if (!selectedUserId) return
    startTransition(async () => {
      const result = await promoteSuperAdminAction({ userId: selectedUserId })
      if (!result.ok) {
        pushToast(result.error || "Gagal mempromosikan super admin")
        return
      }
      const promoted = candidates.find((c) => c.userId === selectedUserId)
      if (promoted) {
        setSuperAdmins((prev) => [...prev, { id: promoted.userId, name: promoted.name, username: null }])
        setCandidates((prev) => prev.filter((c) => c.userId !== selectedUserId))
      }
      setSelectedUserId("")
      pushToast("Super admin berhasil dipromosikan")
    })
  }

  function handleDemote(userId: string, name: string) {
    startTransition(async () => {
      const result = await demoteSuperAdminAction({ userId, nextAdminRole: "ketua_rt" })
      if (!result.ok) {
        pushToast(result.error || "Gagal mendemosikan super admin")
        return
      }
      setSuperAdmins((prev) => prev.filter((sa) => sa.id !== userId))
      setCandidates((prev) => [...prev, { userId, name, adminRoleLabel: "Ketua RT" }])
      pushToast("Super admin berhasil didemosikan")
    })
  }

  return (
    <div className="space-y-5">
      <AppCard className="p-4">
        <h2 className="text-[13px] font-semibold text-kanvas-ink">Super Admin Saat Ini</h2>
        {superAdmins.length === 0 ? (
          <p className="mt-2 text-[12px] text-kanvas-ink-3">Belum ada super admin.</p>
        ) : (
          <div className="mt-2 space-y-1.5">
            {superAdmins.map((sa) => (
              <div
                key={sa.id}
                className="flex items-center justify-between rounded-lg border border-kanvas-line bg-kanvas-paper-2 px-3 py-2"
              >
                <p className="text-[13px] font-medium text-kanvas-ink">{sa.name}</p>
                <button
                  type="button"
                  disabled={pending || superAdmins.length <= 1}
                  onClick={() => handleDemote(sa.id, sa.name)}
                  className="rounded-lg border border-kanvas-line bg-white px-2.5 py-1 text-[11px] font-semibold text-kanvas-ink-3 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Demosikan
                </button>
              </div>
            ))}
          </div>
        )}
      </AppCard>

      <AppCard className="p-4">
        <h2 className="text-[13px] font-semibold text-kanvas-ink">Promosikan Pengurus</h2>
        {candidates.length === 0 ? (
          <p className="mt-2 text-[12px] text-kanvas-ink-3">Semua pengurus sudah menjadi super admin.</p>
        ) : (
          <div className="mt-2 flex items-end gap-2">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex-1 rounded-lg border border-kanvas-line bg-white px-3 py-2 text-[13px] text-kanvas-ink"
            >
              <option value="">Pilih pengurus...</option>
              {candidates.map((c) => (
                <option key={c.userId} value={c.userId}>
                  {c.name} ({c.adminRoleLabel})
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={pending || !selectedUserId}
              onClick={handlePromote}
              className="rounded-lg border border-kanvas-line bg-white px-4 py-2 text-[12px] font-semibold text-kanvas-ink-2 hover:bg-kanvas-paper-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Promosikan
            </button>
          </div>
        )}
      </AppCard>
    </div>
  )
}
