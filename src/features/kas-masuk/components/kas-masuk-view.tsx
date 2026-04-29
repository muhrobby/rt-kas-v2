"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from "react"

import { AppCard, useToast } from "@/components/kanvas"
import { paginateItems } from "@/lib/pagination"
import { getKuitansiAdminAction } from "@/lib/actions/kuitansi"
import { generateKuitansiPDF } from "@/lib/export/pdf"

import {
  KasMasukFormModal,
  type KasMasukFormValues,
} from "@/features/kas-masuk/components/kas-masuk-form-modal"
import { KasMasukToolbar } from "@/features/kas-masuk/components/kas-masuk-toolbar"
import { RecentKasMasukTable } from "@/features/kas-masuk/components/recent-kas-masuk-table"
import { KuitansiDialog } from "@/features/warga-portal/components/kuitansi-dialog"
import {
  createKasMasukFromForm,
  fetchKategoriMasukOptions,
  fetchPaidMonths,
  fetchTransaksiMasuk,
  fetchWargaOptions,
  type KategoriOptionUi,
  type TransaksiUi,
  type WargaOptionUi,
} from "@/features/kas-masuk/lib/kas-masuk-actions-client"

const defaultFormValues: KasMasukFormValues = {
  wargaId: "",
  kategoriId: "",
  bulan: [new Date().getMonth() + 1],
  tahun: new Date().getFullYear(),
  nominal: 0,
  catatan: "",
}

interface KuitansiSelection {
  refKuitansi: string
  kategori: string
  tanggalBayar: string
  nominal: number
  wargaNama: string
  blok?: string
  petugas?: string | null
}

export function KasMasukView() {
  const { pushToast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [transactions, setTransactions] = useState<TransaksiUi[]>([])
  const [wargaOptions, setWargaOptions] = useState<WargaOptionUi[]>([])
  const [kategoriOptions, setKategoriOptions] = useState<KategoriOptionUi[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [serverError, setServerError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)
  const [isLoading, startTransition] = useTransition()

  const [selectedWargaId, setSelectedWargaId] = useState("")
  const [selectedKategoriId, setSelectedKategoriId] = useState("")
  const [paidMonths, setPaidMonths] = useState<number[]>([])
  const [oneTimePaid, setOneTimePaid] = useState(false)
  const [loadingPaidMonths, setLoadingPaidMonths] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<KuitansiSelection | null>(null)
  const [receiptError, setReceiptError] = useState<string | null>(null)
  const [receiptPending, startReceiptTransition] = useTransition()

  const [selectedKategori, setSelectedKategori] = useState<KategoriOptionUi | null>(null)

  useEffect(() => {
    startTransition(async () => {
      const [warga, kategori, transaksi] = await Promise.all([
        fetchWargaOptions(),
        fetchKategoriMasukOptions(),
        fetchTransaksiMasuk(),
      ])
      setWargaOptions(warga)
      setKategoriOptions(kategori)
      setTransactions(transaksi)
    })
  }, [])

  const handleWargaChange = useCallback((id: string) => {
    setSelectedWargaId(id)
    setPaidMonths([])
    setOneTimePaid(false)
    setReceiptError(null)
  }, [])

  const handleKategoriChange = useCallback(
    async (id: string) => {
      setSelectedKategoriId(id)
      const found = kategoriOptions.find((k) => k.id === id) ?? null
      setSelectedKategori(found)
      setPaidMonths([])
      setOneTimePaid(false)

      if (found?.tipeTagihan === "bulanan" && selectedWargaId && id) {
        setLoadingPaidMonths(true)
        try {
          const months = await fetchPaidMonths(Number(selectedWargaId), Number(id), new Date().getFullYear())
          setPaidMonths(months)
        } finally {
          setLoadingPaidMonths(false)
        }
      }
      if (found?.tipeTagihan === "sekali" && selectedWargaId && id) {
        const rows = transactions.filter(
          (t) => t.jenisArus === "masuk" && t.wargaId === selectedWargaId && t.kategoriId === id,
        )
        setOneTimePaid(rows.length > 0)
      }
    },
    [kategoriOptions, selectedWargaId, transactions],
  )

  const transaksiMasuk = useMemo(
    () => transactions.filter((trx) => trx.jenisArus === "masuk"),
    [transactions],
  )

  const paginatedTransaksi = useMemo(() => {
    const result = paginateItems(transaksiMasuk, currentPage, 8)
    if (result.totalPages > 0 && currentPage > result.totalPages) {
      return paginateItems(transaksiMasuk, 1, 8)
    }
    return result
  }, [transaksiMasuk, currentPage])

  const totalNominalMasuk = useMemo(
    () => transaksiMasuk.reduce((sum, trx) => sum + trx.nominal, 0),
    [transaksiMasuk],
  )

  const reloadTransactions = async () => {
    const rows = await fetchTransaksiMasuk()
    setTransactions(rows)
  }

  const openForm = () => {
    setServerError("")
    setFieldErrors({})
    setSelectedWargaId("")
    setSelectedKategoriId("")
    setSelectedKategori(null)
    setPaidMonths([])
    setOneTimePaid(false)
    setFormOpen(true)
  }

  const handleSubmit = async (values: KasMasukFormValues) => {
    setServerError("")
    setFieldErrors({})
    setSubmitting(true)
    try {
      const result = await createKasMasukFromForm({
        wargaId: Number(selectedWargaId),
        kategoriId: Number(selectedKategoriId),
        nominal: values.nominal,
        bulanTagihan: selectedKategori?.tipeTagihan === "bulanan" ? values.bulan.map(String) : undefined,
        tahunTagihan: selectedKategori?.tipeTagihan === "bulanan" ? values.tahun : undefined,
        keterangan: values.catatan || undefined,
      })
      if (!result.ok) {
        setServerError(result.error)
        setFieldErrors(result.fieldErrors ?? {})
        return
      }
      await reloadTransactions()
      setFormOpen(false)
      pushToast(
        selectedKategori?.tipeTagihan === "bulanan" && values.bulan.length > 1
          ? `Pembayaran ${values.bulan.length} bulan berhasil dicatat`
          : "Pembayaran kas masuk berhasil dicatat",
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenKuitansi = (transaksiId: number) => {
    setReceiptError(null)
    startReceiptTransition(async () => {
      const result = await getKuitansiAdminAction(transaksiId)
      if (!result.ok) {
        setReceiptError(result.error)
        return
      }
      setSelectedReceipt({
        refKuitansi: result.data.nomorKuitansi,
        kategori: result.data.kategori,
        tanggalBayar: result.data.tanggal,
        nominal: result.data.nominal,
        wargaNama: result.data.warga,
        blok: result.data.blok,
        petugas: result.data.petugas,
      })
      setReceiptOpen(true)
    })
  }

  return (
    <main className="space-y-3.5 p-6 md:p-7">
      {isLoading ? (
        <p className="text-[12px] text-[var(--kanvas-ink-3)]">Memuat data...</p>
      ) : null}

      <KasMasukToolbar
        totalTransaksi={transaksiMasuk.length}
        totalNominal={totalNominalMasuk}
        onOpenForm={openForm}
      />

      <RecentKasMasukTable
        transactions={paginatedTransaksi.items}
        onOpenKuitansi={handleOpenKuitansi}
        pagination={{
          page: paginatedTransaksi.page,
          totalPages: paginatedTransaksi.totalPages,
          totalItems: paginatedTransaksi.totalItems,
          startItem: paginatedTransaksi.startItem,
          endItem: paginatedTransaksi.endItem,
          onPageChange: setCurrentPage,
        }}
      />

      {receiptError ? <AppCard className="border-dashed p-3 text-[12px] text-destructive">{receiptError}</AppCard> : null}

      <KuitansiDialog
        open={receiptOpen}
        data={selectedReceipt}
        onClose={() => setReceiptOpen(false)}
        onDownloadPdf={generateKuitansiPDF}
      />

      {receiptPending ? <p className="text-[12px] text-[var(--kanvas-ink-3)]">Memuat kuitansi...</p> : null}

      <KasMasukFormModal
        key={formOpen ? "open" : "closed"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        wargaOptions={wargaOptions}
        kategoriOptions={kategoriOptions}
        wargaId={selectedWargaId}
        kategoriId={selectedKategoriId}
        onWargaChange={handleWargaChange}
        onKategoriChange={handleKategoriChange}
        initialValues={defaultFormValues}
        onSubmit={handleSubmit}
        serverError={serverError}
        fieldErrors={fieldErrors}
        submitting={submitting}
        paidMonths={paidMonths}
        oneTimePaid={oneTimePaid}
        loadingPaidMonths={loadingPaidMonths}
      />
    </main>
  )
}
