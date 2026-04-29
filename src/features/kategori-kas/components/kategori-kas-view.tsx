"use client"

import { useEffect, useMemo, useState, useTransition } from "react"

import { useToast } from "@/components/kanvas"
import { paginateItems } from "@/lib/pagination"
import type { KategoriKas } from "@/types/rt-kas"

import { DeleteKategoriDialog } from "@/features/kategori-kas/components/delete-kategori-dialog"
import {
  KategoriFormModal,
  mapKategoriToFormValues,
  type KategoriFormValues,
} from "@/features/kategori-kas/components/kategori-form-modal"
import { KategoriTable } from "@/features/kategori-kas/components/kategori-table"
import { KategoriToolbar } from "@/features/kategori-kas/components/kategori-toolbar"
import { filterKategori, type KategoriFilters } from "@/features/kategori-kas/lib/kategori-filters"
import {
  createKategoriFromForm,
  deleteKategoriById,
  fetchKategoriList,
  updateKategoriFromForm,
} from "@/features/kategori-kas/lib/kategori-actions-client"

const defaultFilters: KategoriFilters = {
  query: "",
  arus: "semua",
  tipe: "semua",
}

const defaultFormValues: KategoriFormValues = {
  nama: "",
  jenisArus: "masuk",
  tipeTagihan: "bulanan",
  nominalDefault: 0,
}

export function KategoriKasView() {
  const { pushToast } = useToast()
  const [filters, setFilters] = useState<KategoriFilters>(defaultFilters)
  const [kategoriData, setKategoriData] = useState<KategoriKas[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"add" | "edit">("add")
  const [selectedKategori, setSelectedKategori] = useState<KategoriKas | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [serverError, setServerError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof KategoriFormValues, string[]>>>({})
  const [isLoading, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    startTransition(async () => {
      try {
        const rows = await fetchKategoriList()
        setKategoriData(rows)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal memuat data kategori"
        setServerError(message)
      }
    })
  }, [])

  const filteredKategori = useMemo(() => filterKategori(kategoriData, filters), [kategoriData, filters])

  const paginatedKategori = useMemo(() => {
    const result = paginateItems(filteredKategori, currentPage, 10)
    if (result.totalPages > 0 && currentPage > result.totalPages) {
      return paginateItems(filteredKategori, 1, 10)
    }
    return result
  }, [filteredKategori, currentPage])

  const formValues = useMemo(() => {
    if (!selectedKategori || formMode === "add") return defaultFormValues
    return mapKategoriToFormValues(selectedKategori)
  }, [formMode, selectedKategori])

  const reloadList = async () => {
    const rows = await fetchKategoriList()
    setKategoriData(rows)
  }

  const openAddModal = () => {
    setServerError("")
    setFieldErrors({})
    setFormMode("add")
    setSelectedKategori(null)
    setFormOpen(true)
  }

  const openEditModal = (item: KategoriKas) => {
    setServerError("")
    setFieldErrors({})
    setFormMode("edit")
    setSelectedKategori(item)
    setFormOpen(true)
  }

  const openDeleteDialog = (item: KategoriKas) => {
    setServerError("")
    setSelectedKategori(item)
    setDeleteOpen(true)
  }

  const handleSubmitKategori = async (values: KategoriFormValues) => {
    setServerError("")
    setFieldErrors({})

    if (formMode === "add") {
      const result = await createKategoriFromForm(values)
      if (!result.ok) {
        setServerError(result.error)
        setFieldErrors(result.fieldErrors ?? {})
        return
      }
      await reloadList()
      pushToast("Kategori baru berhasil ditambahkan")
    } else if (selectedKategori) {
      const result = await updateKategoriFromForm(Number(selectedKategori.id), values)
      if (!result.ok) {
        setServerError(result.error)
        setFieldErrors(result.fieldErrors ?? {})
        return
      }
      await reloadList()
      pushToast("Kategori berhasil diperbarui")
    }

    setFormOpen(false)
    setSelectedKategori(null)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedKategori) return
    setServerError("")
    setIsDeleting(true)
    const result = await deleteKategoriById(Number(selectedKategori.id))
    setIsDeleting(false)
    if (!result.ok) {
      setServerError(result.error)
      return
    }
    await reloadList()
    pushToast("Kategori berhasil dihapus", "warn")
    setDeleteOpen(false)
    setSelectedKategori(null)
  }

  return (
    <main className="space-y-3.5 p-6 md:p-7">
      {isLoading ? (
        <p className="text-[12px] text-kanvas-ink-3">Memuat data kategori...</p>
      ) : null}

      <KategoriToolbar
        query={filters.query}
        arus={filters.arus}
        tipe={filters.tipe}
        onQueryChange={(value) => {
          setFilters((state) => ({ ...state, query: value }))
          setCurrentPage(1)
        }}
        onArusChange={(value) => {
          setFilters((state) => ({ ...state, arus: value }))
          setCurrentPage(1)
        }}
        onTipeChange={(value) => {
          setFilters((state) => ({ ...state, tipe: value }))
          setCurrentPage(1)
        }}
        onAdd={openAddModal}
      />

      <KategoriTable
        kategori={paginatedKategori.items}
        onEdit={openEditModal}
        onDelete={openDeleteDialog}
        pagination={{
          page: paginatedKategori.page,
          totalPages: paginatedKategori.totalPages,
          totalItems: paginatedKategori.totalItems,
          startItem: paginatedKategori.startItem,
          endItem: paginatedKategori.endItem,
          onPageChange: setCurrentPage,
        }}
      />

      <KategoriFormModal
        key={`${formMode}-${selectedKategori?.id ?? "new"}-${formOpen ? "open" : "closed"}`}
        open={formOpen}
        mode={formMode}
        initialValues={formValues}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmitKategori}
        serverError={serverError}
        fieldErrors={fieldErrors}
      />

      <DeleteKategoriDialog
        open={deleteOpen}
        kategoriNama={selectedKategori?.nama}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        serverError={serverError}
        deleting={isDeleting}
      />
    </main>
  )
}
