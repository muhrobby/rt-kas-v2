import {
  createKasMasukAction,
  getPaidMonthsAction,
  listKategoriAction,
  listTransaksiMasukAction,
  listWargaAction,
} from "@/lib/actions/kas-masuk"
import type { CreateKasMasukInput } from "@/lib/validations/transaksi"

export interface WargaOptionUi {
  id: string
  label: string
  sub: string
}

export interface KategoriOptionUi {
  id: string
  label: string
  sub: string
  nominal: number
  tipeTagihan: "bulanan" | "sekali"
}

export interface TransaksiUi {
  id: string
  tanggal: string
  jenisArus: "masuk" | "keluar"
  wargaId: string | null
  wargaNama: string | null
  blok: string | null
  kategoriId: string
  kategoriNama: string | null
  periodeLabel: string | null
  bulanTagihan: string | null
  tahunTagihan: number | null
  nominal: number
  catatan: string | null
}

const BULAN_SINGKAT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"]

export async function fetchWargaOptions(): Promise<WargaOptionUi[]> {
  const result = await listWargaAction({})
  if (!result.ok) return []
  return result.data
    .sort((a, b) => a.nama.localeCompare(b.nama))
    .map((w) => ({
      id: String(w.id),
      label: `${w.nama} · ${w.blok}`,
      sub: w.telp,
    }))
}

export async function fetchKategoriMasukOptions(): Promise<KategoriOptionUi[]> {
  const result = await listKategoriAction()
  if (!result.ok) return []
  return result.data
    .filter((k) => k.jenisArus === "masuk")
    .map((k) => ({
      id: String(k.id),
      label: k.nama,
      sub: k.tipeTagihan === "bulanan" ? "Bulanan" : "Sekali bayar",
      nominal: k.nominalDefault,
      tipeTagihan: k.tipeTagihan,
    }))
}

export async function fetchTransaksiMasuk(): Promise<TransaksiUi[]> {
  const result = await listTransaksiMasukAction()
  if (!result.ok) return []
  return result.data.map((row) => {
    const tanggal = new Date(row.tanggal).toISOString().slice(0, 10)
    const monthNumber = row.bulanTagihan != null ? Number(row.bulanTagihan) : null
    const monthIndex = monthNumber != null && Number.isInteger(monthNumber) ? monthNumber - 1 : -1
    const periodeLabel =
      row.jenisArus === "masuk" && row.bulanTagihan != null && row.tahunTagihan != null
        ? `${BULAN_SINGKAT[monthIndex] ?? row.bulanTagihan} ${row.tahunTagihan}`
        : row.jenisArus === "keluar"
          ? tanggal
          : null
    return {
      id: String(row.id),
      tanggal,
      jenisArus: row.jenisArus,
      wargaId: row.wargaId != null ? String(row.wargaId) : null,
      wargaNama: row.wargaNama ?? null,
      blok: row.wargaBlok ?? null,
      kategoriId: String(row.kategoriId),
      kategoriNama: row.kategoriNama ?? null,
      periodeLabel: periodeLabel ?? null,
      bulanTagihan: row.bulanTagihan,
      tahunTagihan: row.tahunTagihan ?? null,
      nominal: row.nominal,
      catatan: row.keterangan ?? null,
    }
  })
}

export async function fetchPaidMonths(wargaId: number, kategoriId: number, tahun: number): Promise<number[]> {
  const result = await getPaidMonthsAction(wargaId, kategoriId, tahun)
  if (!result.ok) return []
  return result.data
}

export async function createKasMasukFromForm(input: CreateKasMasukInput) {
  return createKasMasukAction(input)
}
