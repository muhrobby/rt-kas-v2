"use client"

import { useMemo, useState, useTransition } from "react"

import { useToast } from "@/components/kanvas"
import { paginateItems } from "@/lib/pagination"
import { createWargaFromForm, deleteWargaById, fetchWargaList, updateWargaFromForm, updateWargaPengurusFromTable } from "@/features/warga-management/lib/warga-actions-client"
import { resetWargaPasswordAction, pindahWargaAction } from "@/lib/actions/warga"

import { DeleteWargaDialog } from "@/features/warga-management/components/delete-warga-dialog"
import { PindahWargaDialog } from "@/features/warga-management/components/pindah-warga-dialog"
import { TogglePengurusDialog } from "@/features/warga-management/components/toggle-pengurus-dialog"
import { WargaDetailDialog } from "@/features/warga-management/components/warga-detail-dialog"
import { WargaFormModal } from "@/features/warga-management/components/warga-form-modal"
import { TemporaryPasswordDialog } from "@/features/warga-management/components/temporary-password-dialog"
import { WargaTable } from "@/features/warga-management/components/warga-table"
import { WargaToolbar } from "@/features/warga-management/components/warga-toolbar"
import { filterWarga } from "@/features/warga-management/lib/warga-filters"
import type { WargaFilters, WargaFormMode, WargaFormValues } from "@/features/warga-management/types"
import type { Warga } from "@/types/rt-kas"

const defaultFilters: WargaFilters = {
  query: "",
  status: "semua",
}

const defaultFormValues: WargaFormValues = {
  nama: "",
  blok: "",
  telp: "",
  statusHunian: "tetap",
  jumlahAnggota: 1,
  pindah: "",
  pemilikHunianId: null,
  pemilikHunianOptionValue: null,
}

function mapWargaToFormValues(warga: Warga): WargaFormValues {
  return {
    nama: warga.nama,
    blok: warga.blok,
    telp: warga.telp,
    statusHunian: warga.statusHunian,
    jumlahAnggota: warga.jumlahAnggota ?? 1,
    pindah: warga.pindah ?? "",
    pemilikHunianId: (warga as Warga & { pemilikHunianId?: number | null }).pemilikHunianId ?? null,
    pemilikHunianOptionValue: (warga as Warga & { pemilikHunianId?: number | null }).pemilikHunianId
      ? `pemilik:${(warga as Warga & { pemilikHunianId?: number | null }).pemilikHunianId}`
      : null,
  }
}

interface WargaManagementViewProps {
  initialData: Warga[]
  initialError: string
}

export function WargaManagementView({ initialData, initialError }: WargaManagementViewProps) {
  const { pushToast } = useToast()
  const [filters, setFilters] = useState<WargaFilters>(defaultFilters)
  const [wargaData, setWargaData] = useState<Warga[]>(initialData)
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<WargaFormMode>("add")
  const [selectedWarga, setSelectedWarga] = useState<Warga | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [serverError, setServerError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof WargaFormValues, string[]>>>({})
  const [, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)
  const [updatingPengurusId, setUpdatingPengurusId] = useState<string | null>(null)
  const [togglePengurusTarget, setTogglePengurusTarget] = useState<Warga | null>(null)
  const [isTogglingPengurus, setIsTogglingPengurus] = useState(false)
  const [tempPasswordData, setTempPasswordData] = useState<{ nama: string, telp: string, password?: string } | null>(null)
  const [pindahTarget, setPindahTarget] = useState<Warga | null>(null)
  const [detailTarget, setDetailTarget] = useState<Warga | null>(null)

  const filteredWarga = useMemo(() => filterWarga(wargaData, filters), [wargaData, filters])

  const paginatedWarga = useMemo(() => {
    const result = paginateItems(filteredWarga, currentPage, 10)
    // Clamp page if it exceeds totalPages (handles delete/filter changes)
    if (result.totalPages > 0 && currentPage > result.totalPages) {
      return paginateItems(filteredWarga, 1, 10)
    }
    return result
  }, [filteredWarga, currentPage])

  const formValues = useMemo(() => {
    if (!selectedWarga || formMode === "add") {
      return defaultFormValues
    }
    return mapWargaToFormValues(selectedWarga)
  }, [formMode, selectedWarga])

  const openAddModal = () => {
    setServerError("")
    setFieldErrors({})
    setFormMode("add")
    setSelectedWarga(null)
    setFormOpen(true)
  }

  const openEditModal = (warga: Warga) => {
    setServerError("")
    setFieldErrors({})
    setFormMode("edit")
    setSelectedWarga(warga)
    setFormOpen(true)
  }

  const openDeleteDialog = (warga: Warga) => {
    setServerError("")
    setSelectedWarga(warga)
    setDeleteOpen(true)
  }

  const reloadList = async () => {
    const rows = await fetchWargaList({})
    setWargaData(rows)
  }

  const handleSubmitWarga = async (values: WargaFormValues) => {
    setServerError("")
    setFieldErrors({})

    const payload = {
      nama: values.nama,
      blok: values.blok,
      telp: values.telp,
      statusHunian: values.statusHunian,
      jumlahAnggota: values.jumlahAnggota,
      tglBatasDomisili: values.statusHunian !== "tetap" ? values.pindah : undefined,
      tglPindah: undefined,
      pemilikHunianOptionValue: values.statusHunian !== "tetap" ? (values.pemilikHunianOptionValue ?? undefined) : undefined,
    }

    if (formMode === "add") {
      const result = await createWargaFromForm(payload)
      if (!result.ok) {
        setServerError(result.error)
        setFieldErrors(result.fieldErrors ?? {})
        return
      }
      await reloadList()
      pushToast("Warga baru berhasil ditambahkan")
      
      setTempPasswordData({
        nama: values.nama,
        telp: values.telp,
        password: "warga123",
      })
    } else if (selectedWarga) {
      const result = await updateWargaFromForm(Number(selectedWarga.id), payload)
      if (!result.ok) {
        setServerError(result.error)
        setFieldErrors(result.fieldErrors ?? {})
        return
      }
      await reloadList()
      pushToast("Data warga berhasil diperbarui")
    }

    setFormOpen(false)
    setSelectedWarga(null)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedWarga) {
      return
    }

    setServerError("")
    setIsDeleting(true)
    const result = await deleteWargaById(Number(selectedWarga.id))
    setIsDeleting(false)
    if (!result.ok) {
      setServerError(result.error)
      return
    }
    await reloadList()
    pushToast("Data warga berhasil dihapus", "ok")
    setDeleteOpen(false)
    setSelectedWarga(null)
  }

  const handleTogglePengurus = (warga: Warga) => {
    setTogglePengurusTarget(warga)
  }

  const handleResetPassword = async (warga: Warga) => {
    if (!confirm(`Reset password ${warga.nama}? Password akan direset ke default.`)) return
    const result = await resetWargaPasswordAction(Number(warga.id))
    if (!result.ok) {
      pushToast(result.error, "error")
      return
    }
    pushToast(`Password ${warga.nama} berhasil direset`)
  }

  const handlePindahConfirm = async (tglPindah: string) => {
    if (!pindahTarget) return
    const result = await pindahWargaAction(Number(pindahTarget.id), tglPindah)
    if (!result.ok) {
      pushToast(result.error, "error")
      return
    }
    setPindahTarget(null)
    await reloadList()
    pushToast(`${pindahTarget.nama} ditandai pindah`)
  }

  const handleTogglePengurusConfirm = async (warga: Warga, adminRole: string) => {
    setIsTogglingPengurus(true)
    setUpdatingPengurusId(warga.id)
    const nextIsPengurus = !warga.isPengurus
    const result = await updateWargaPengurusFromTable(Number(warga.id), {
      isPengurus: nextIsPengurus,
      adminRole: nextIsPengurus ? (adminRole as "ketua_rt" | "bendahara" | "sekretaris" | "anggota") : undefined,
    })
    setUpdatingPengurusId(null)
    setIsTogglingPengurus(false)
    if (!result.ok) {
      pushToast(result.error || "Gagal mengubah status pengurus", "error")
      return
    }
    setTogglePengurusTarget(null)
    await reloadList()
    pushToast(nextIsPengurus ? `${warga.nama} dijadikan pengurus` : `${warga.nama} bukan lagi pengurus`)
  }

  return (
    <main className="space-y-3.5 p-6 md:p-7">
      {initialError ? (
        <div className="flex items-center justify-between rounded-lg border border-kanvas-danger-soft bg-kanvas-danger-soft px-4 py-3 text-[12px] text-kanvas-danger">
          <span>{initialError}</span>
          <button
            type="button"
            className="ml-3 font-semibold underline"
            onClick={() => startTransition(async () => {
              const rows = await fetchWargaList({})
              setWargaData(rows)
            })}
          >
            Coba lagi
          </button>
        </div>
      ) : null}

      <WargaToolbar
        query={filters.query}
        status={filters.status}
        onQueryChange={(value) => {
          setFilters((state) => ({ ...state, query: value }))
          setCurrentPage(1)
        }}
        onStatusChange={(value) => {
          setFilters((state) => ({ ...state, status: value }))
          setCurrentPage(1)
        }}
        onAdd={openAddModal}
      />

      <WargaTable
        warga={paginatedWarga.items}
        onDetail={(w) => setDetailTarget(w)}
        onEdit={openEditModal}
        onDelete={openDeleteDialog}
        onTogglePengurus={handleTogglePengurus}
        onResetPassword={handleResetPassword}
        onPindah={(w) => setPindahTarget(w)}
        updatingPengurusId={updatingPengurusId}
        pagination={{
          page: paginatedWarga.page,
          totalPages: paginatedWarga.totalPages,
          totalItems: paginatedWarga.totalItems,
          startItem: paginatedWarga.startItem,
          endItem: paginatedWarga.endItem,
          onPageChange: setCurrentPage,
        }}
      />

      <WargaFormModal
        key={`${formMode}-${selectedWarga?.id ?? "new"}-${formOpen ? "open" : "closed"}`}
        open={formOpen}
        mode={formMode}
        initialValues={formValues}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmitWarga}
        serverError={serverError}
        fieldErrors={fieldErrors}
      />

      <DeleteWargaDialog
        open={deleteOpen}
        wargaNama={selectedWarga?.nama}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        serverError={serverError}
        deleting={isDeleting}
      />

      <TemporaryPasswordDialog
        open={!!tempPasswordData}
        wargaNama={tempPasswordData?.nama ?? ""}
        wargaTelp={tempPasswordData?.telp ?? ""}
        password={tempPasswordData?.password ?? ""}
        onClose={() => setTempPasswordData(null)}
      />

      <TogglePengurusDialog
        key={togglePengurusTarget?.id ?? "none"}
        open={!!togglePengurusTarget}
        warga={togglePengurusTarget}
        onClose={() => setTogglePengurusTarget(null)}
        onConfirm={handleTogglePengurusConfirm}
        submitting={isTogglingPengurus}
      />

      <PindahWargaDialog
        open={!!pindahTarget}
        wargaNama={pindahTarget?.nama ?? ""}
        onClose={() => setPindahTarget(null)}
        onConfirm={handlePindahConfirm}
      />

      <WargaDetailDialog
        warga={detailTarget}
        open={!!detailTarget}
        onClose={() => setDetailTarget(null)}
      />
    </main>
  )
}
