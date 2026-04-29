export type Role = "admin" | "warga"

export type StatusHunian = "tetap" | "kontrak"

export type JenisArus = "masuk" | "keluar"

export type TipeTagihan = "bulanan" | "sekali"

export type AksiAktivitas = "tambah" | "edit" | "hapus" | "login" | "logout"

export interface Warga {
  id: string
  nama: string
  blok: string
  telp: string
  statusHunian: StatusHunian
  domisili: string
  pindah?: string
  isPengurus: boolean
  rolePengurus?: string
  jumlahAnggota?: number
}

export interface KategoriKas {
  id: string
  nama: string
  jenisArus: JenisArus
  tipeTagihan: TipeTagihan
  nominalDefault: number
  createdAt?: string
}

export interface TransaksiKas {
  id: string
  tanggal: string
  jenisArus: JenisArus
  wargaId?: string
  wargaNama?: string
  blok?: string
  kategoriId: string
  kategoriNama: string
  periodeLabel?: string
  bulanTagihan?: number
  tahunTagihan?: number
  nominal: number
  catatan?: string
  createdBy?: string
}

export interface LogAktivitas {
  tanggalWaktu: string
  petugas: string
  modul: string
  aksi: AksiAktivitas
  detail: string
}

export interface TunggakanItem {
  kategori: string
  periode: string
  nominal: number
}

export interface TunggakanWarga {
  warga: string
  blok: string
  items: TunggakanItem[]
}

export interface MonthlyCashflow {
  bulan: string
  pemasukan: number
  pengeluaran: number
  saldo?: number
}

export type WargaPaymentStatusState = "lunas" | "belum" | "belum-tempo"

export interface WargaPaymentStatus {
  kategori: string
  tipeTagihan: TipeTagihan
  status: WargaPaymentStatusState
  nominal: number
  tanggalBayar?: string
  jatuhTempoLabel?: string
  transaksiId?: number
  refKuitansi?: string
}

export interface WargaHistoryItem {
  kategori: string
  status: WargaPaymentStatusState
  tanggalBayar?: string
  nominal: number
  transaksiId?: number
  refKuitansi?: string
}

export interface WargaHistoryPeriod {
  periode: string
  items: WargaHistoryItem[]
}

export interface ExpenseBreakdownItem {
  kategori: string
  nominal: number
}
