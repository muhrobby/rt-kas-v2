"use client"

import { useEffect, useMemo, useState, useTransition } from "react"

import { useToast } from "@/components/kanvas"
import { paginateItems } from "@/lib/pagination"

import {
  KasKeluarFormModal,
  type KasKeluarFormValues,
} from "@/features/kas-keluar/components/kas-keluar-form-modal"
import { KasKeluarToolbar } from "@/features/kas-keluar/components/kas-keluar-toolbar"
import { RecentKasKeluarTable } from "@/features/kas-keluar/components/recent-kas-keluar-table"
import {
  createKasKeluarFromForm,
  fetchKategoriKeluarOptions,
  fetchTransaksiKeluar,
  type KategoriKeluarOptionUi,
  type TransaksiKeluarUi,
} from "@/features/kas-keluar/lib/kas-keluar-actions-client"

const defaultFormValues: KasKeluarFormValues = {
  kategoriId: "",
  nominal: 0,
  tanggal: new Date().toISOString().slice(0, 10),
  catatan: "",
}

export function KasKeluarView() {
  const { pushToast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [transactions, setTransactions] = useState<TransaksiKeluarUi[]>([])
  const [kategoriOptions, setKategoriOptions] = useState<KategoriKeluarOptionUi[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [serverError, setServerError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)
  const [isLoading, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const [kategori, transaksi] = await Promise.all([
        fetchKategoriKeluarOptions(),
        fetchTransaksiKeluar(),
      ])
      setKategoriOptions(kategori)
      setTransactions(transaksi)
    })
  }, [])

  const transaksiKeluar = useMemo(
    () => transactions.filter((trx) => trx.jenisArus === "keluar"),
    [transactions],
  )

  const paginatedTransaksi = useMemo(() => {
    const result = paginateItems(transaksiKeluar, currentPage, 8)
    if (result.totalPages > 0 && currentPage > result.totalPages) {
      return paginateItems(transaksiKeluar, 1, 8)
    }
    return result
  }, [transaksiKeluar, currentPage])

  const totalNominalKeluar = useMemo(
    () => transaksiKeluar.reduce((sum, trx) => sum + trx.nominal, 0),
    [transaksiKeluar],
  )

  const reloadTransactions = async () => {
    const rows = await fetchTransaksiKeluar()
    setTransactions(rows)
  }

  const handleSubmit = async (values: KasKeluarFormValues) => {
    setServerError("")
    setFieldErrors({})
    setSubmitting(true)
    try {
      const result = await createKasKeluarFromForm({
        kategoriId: Number(values.kategoriId),
        nominal: values.nominal,
        waktuTransaksi: values.tanggal,
        keterangan: values.catatan || undefined,
      })
      if (!result.ok) {
        setServerError(result.error)
        setFieldErrors(result.fieldErrors ?? {})
        return
      }
      await reloadTransactions()
      setFormOpen(false)
      pushToast("Pengeluaran berhasil dicatat")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="space-y-3.5 p-6 md:p-7">
      {isLoading ? (
        <p className="text-[12px] text-[var(--kanvas-ink-3)]">Memuat data...</p>
      ) : null}

      <KasKeluarToolbar
        totalTransaksi={transaksiKeluar.length}
        totalNominal={totalNominalKeluar}
        onOpenForm={() => setFormOpen(true)}
      />

      <RecentKasKeluarTable
        transactions={paginatedTransaksi.items}
        pagination={{
          page: paginatedTransaksi.page,
          totalPages: paginatedTransaksi.totalPages,
          totalItems: paginatedTransaksi.totalItems,
          startItem: paginatedTransaksi.startItem,
          endItem: paginatedTransaksi.endItem,
          onPageChange: setCurrentPage,
        }}
      />

      <KasKeluarFormModal
        key={formOpen ? "open" : "closed"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        kategoriOptions={kategoriOptions}
        initialValues={defaultFormValues}
        onSubmit={handleSubmit}
        serverError={serverError}
        fieldErrors={fieldErrors}
        submitting={submitting}
      />
    </main>
  )
}
