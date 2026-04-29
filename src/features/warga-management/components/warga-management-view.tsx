"use client"

import { useEffect, useMemo, useState, useTransition } from "react"

import { useToast } from "@/components/kanvas"
import { paginateItems } from "@/lib/pagination"
import { createWargaFromForm, deleteWargaById, fetchWargaList, updateWargaFromForm, updateWargaPengurusFromTable } from "@/features/warga-management/lib/warga-actions-client"

import { DeleteWargaDialog } from "@/features/warga-management/components/delete-warga-dialog"
import { WargaFormModal } from "@/features/warga-management/components/warga-form-modal"
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
}

function mapWargaToFormValues(warga: Warga): WargaFormValues {
  return {
    nama: warga.nama,
    blok: warga.blok,
    telp: warga.telp,
    statusHunian: warga.statusHunian,
    jumlahAnggota: warga.jumlahAnggota ?? 1,
    pindah: warga.pindah ?? "",
  }
}

export function WargaManagementView() {
  const { pushToast } = useToast()
  const [filters, setFilters] = useState<WargaFilters>(defaultFilters)
  const [wargaData, setWargaData] = useState<Warga[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<WargaFormMode>("add")
  const [selectedWarga, setSelectedWarga] = useState<Warga | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [serverError, setServerError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof WargaFormValues, string[]>>>({})
  const [isLoading, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)
  const [updatingPengurusId, setUpdatingPengurusId] = useState<string | null>(null)

  useEffect(() => {
    startTransition(async () => {
      try {
        const rows = await fetchWargaList({})
        setWargaData(rows)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal memuat data warga"
        setServerError(message)
      }
    })
  }, [])

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
      tglBatasDomisili: values.statusHunian === "kontrak" ? values.pindah : undefined,
      tglPindah: values.statusHunian === "kontrak" ? values.pindah : undefined,
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
    pushToast("Data warga berhasil dihapus", "warn")
    setDeleteOpen(false)
    setSelectedWarga(null)
  }

  const handleTogglePengurus = async (warga: Warga) => {
    setUpdatingPengurusId(warga.id)
    const nextIsPengurus = !warga.isPengurus
    const nextRolePengurus = nextIsPengurus ? warga.rolePengurus ?? "Pengurus" : undefined
    const result = await updateWargaPengurusFromTable(Number(warga.id), {
      isPengurus: nextIsPengurus,
      rolePengurus: nextRolePengurus,
    })
    setUpdatingPengurusId(null)
    if (!result.ok) {
      pushToast(result.error || "Gagal mengubah status pengurus", "warn")
      return
    }
    await reloadList()
    pushToast(nextIsPengurus ? `${warga.nama} dijadikan pengurus` : `${warga.nama} bukan lagi pengurus`)
  }

  return (
    <main className="space-y-3.5 p-6 md:p-7">
      {isLoading ? <p className="text-[12px] text-kanvas-ink-3">Memuat data warga...</p> : null}

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
        onEdit={openEditModal}
        onDelete={openDeleteDialog}
        onTogglePengurus={handleTogglePengurus}
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
    </main>
  )
}
