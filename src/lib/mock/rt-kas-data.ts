import type {
  ExpenseBreakdownItem,
  KategoriKas,
  LogAktivitas,
  MonthlyCashflow,
  TransaksiKas,
  TunggakanWarga,
  Warga,
  WargaHistoryPeriod,
  WargaPaymentStatus,
} from "@/types/rt-kas"

export const wargaMock: Warga[] = [
  { id: "W001", nama: "Budi Santoso", blok: "A-03", telp: "0812-3344-1102", statusHunian: "tetap", domisili: "2019-03-12", isPengurus: true, rolePengurus: "Ketua RT", jumlahAnggota: 4 },
  { id: "W002", nama: "Siti Rahmawati", blok: "A-05", telp: "0813-7782-0934", statusHunian: "tetap", domisili: "2017-08-22", isPengurus: true, rolePengurus: "Bendahara", jumlahAnggota: 3 },
  { id: "W003", nama: "Agus Pratama", blok: "A-08", telp: "0852-1190-3321", statusHunian: "tetap", domisili: "2020-11-04", isPengurus: false, jumlahAnggota: 5 },
  { id: "W004", nama: "Dewi Kartika", blok: "B-01", telp: "0857-9988-2010", statusHunian: "kontrak", domisili: "2024-02-01", pindah: "2026-02-01", isPengurus: false, jumlahAnggota: 2 },
  { id: "W005", nama: "Hendra Wijaya", blok: "B-04", telp: "0811-2233-4455", statusHunian: "tetap", domisili: "2015-05-30", isPengurus: true, rolePengurus: "Sekretaris", jumlahAnggota: 4 },
  { id: "W006", nama: "Maya Lestari", blok: "B-06", telp: "0822-1100-3344", statusHunian: "tetap", domisili: "2021-01-15", isPengurus: false, jumlahAnggota: 3 },
  { id: "W007", nama: "Rudi Hartono", blok: "B-09", telp: "0815-7766-2299", statusHunian: "kontrak", domisili: "2025-04-10", pindah: "2026-04-10", isPengurus: false, jumlahAnggota: 2 },
  { id: "W008", nama: "Indah Permatasari", blok: "C-02", telp: "0858-3344-1198", statusHunian: "tetap", domisili: "2018-09-08", isPengurus: false, jumlahAnggota: 4 },
  { id: "W009", nama: "Ahmad Fadillah", blok: "C-05", telp: "0812-9988-2210", statusHunian: "tetap", domisili: "2016-07-14", isPengurus: false, jumlahAnggota: 5 },
  { id: "W010", nama: "Rina Sulistiani", blok: "C-08", telp: "0856-4422-7788", statusHunian: "kontrak", domisili: "2024-06-01", isPengurus: false, jumlahAnggota: 3 },
  { id: "W011", nama: "Dedi Kurniawan", blok: "D-02", telp: "0813-1100-9922", statusHunian: "tetap", domisili: "2019-12-20", isPengurus: false, jumlahAnggota: 4 },
  { id: "W012", nama: "Ani Wulandari", blok: "D-04", telp: "0821-3344-5566", statusHunian: "tetap", domisili: "2014-03-08", isPengurus: false, jumlahAnggota: 6 },
  { id: "W013", nama: "Joko Susanto", blok: "D-07", telp: "0858-7766-3300", statusHunian: "kontrak", domisili: "2025-01-15", isPengurus: false, jumlahAnggota: 2 },
  { id: "W014", nama: "Fitri Handayani", blok: "D-10", telp: "0812-4455-6677", statusHunian: "tetap", domisili: "2020-08-30", isPengurus: false, jumlahAnggota: 3 },
  { id: "W015", nama: "Surya Darma", blok: "E-01", telp: "0857-2233-1100", statusHunian: "tetap", domisili: "2017-11-11", isPengurus: false, jumlahAnggota: 4 },
  { id: "W016", nama: "Lina Marlina", blok: "E-03", telp: "0822-9988-0011", statusHunian: "kontrak", domisili: "2025-03-01", isPengurus: false, jumlahAnggota: 2 },
  { id: "W017", nama: "Bastian Tampubolon", blok: "E-06", telp: "0813-5566-7788", statusHunian: "tetap", domisili: "2018-05-25", isPengurus: false, jumlahAnggota: 5 },
  { id: "W018", nama: "DewiAnggraeni", blok: "E-09", telp: "0856-1122-3344", statusHunian: "tetap", domisili: "2021-09-17", isPengurus: false, jumlahAnggota: 3 },
  { id: "W019", nama: "Galang Pratama", blok: "F-02", telp: "0811-2233-9900", statusHunian: "kontrak", domisili: "2025-07-01", isPengurus: false, jumlahAnggota: 2 },
  { id: "W020", nama: "Heni Kusuma", blok: "F-05", telp: "0858-4455-6677", statusHunian: "tetap", domisili: "2015-02-28", isPengurus: false, jumlahAnggota: 4 },
]

export const kategoriKasMock: KategoriKas[] = [
  { id: "K01", nama: "Iuran Bulanan Kas", jenisArus: "masuk", tipeTagihan: "bulanan", nominalDefault: 75000 },
  { id: "K02", nama: "Iuran Sampah", jenisArus: "masuk", tipeTagihan: "bulanan", nominalDefault: 35000 },
  { id: "K03", nama: "Iuran Keamanan", jenisArus: "masuk", tipeTagihan: "bulanan", nominalDefault: 50000 },
  { id: "K04", nama: "Iuran 17 Agustus", jenisArus: "masuk", tipeTagihan: "sekali", nominalDefault: 100000 },
  { id: "K05", nama: "Sumbangan Sukarela", jenisArus: "masuk", tipeTagihan: "sekali", nominalDefault: 0 },
  { id: "K06", nama: "Honor Petugas Kebersihan", jenisArus: "keluar", tipeTagihan: "bulanan", nominalDefault: 800000 },
  { id: "K07", nama: "Honor Satpam", jenisArus: "keluar", tipeTagihan: "bulanan", nominalDefault: 1200000 },
  { id: "K08", nama: "Listrik Pos Ronda", jenisArus: "keluar", tipeTagihan: "bulanan", nominalDefault: 150000 },
  { id: "K09", nama: "Iuran Parkir Tamu", jenisArus: "masuk", tipeTagihan: "bulanan", nominalDefault: 25000 },
  { id: "K10", nama: "Sumbangan Hari Raya", jenisArus: "masuk", tipeTagihan: "sekali", nominalDefault: 50000 },
  { id: "K11", nama: "Iuran Balita", jenisArus: "masuk", tipeTagihan: "bulanan", nominalDefault: 15000 },
  { id: "K12", nama: "Tagihan Listrik Bersama", jenisArus: "keluar", tipeTagihan: "bulanan", nominalDefault: 350000 },
  { id: "K13", nama: "Perbaikan Paving", jenisArus: "keluar", tipeTagihan: "sekali", nominalDefault: 500000 },
  { id: "K14", nama: "Iuran AC Bersama", jenisArus: "keluar", tipeTagihan: "bulanan", nominalDefault: 200000 },
  { id: "K15", nama: "Sumbangan Bencana", jenisArus: "masuk", tipeTagihan: "sekali", nominalDefault: 0 },
  { id: "K16", nama: "Pembersihan Selokan", jenisArus: "keluar", tipeTagihan: "sekali", nominalDefault: 300000 },
  { id: "K17", nama: "Iuran Wifi Bersama", jenisArus: "masuk", tipeTagihan: "bulanan", nominalDefault: 30000 },
  { id: "K18", nama: "Cat Jalan", jenisArus: "keluar", tipeTagihan: "sekali", nominalDefault: 750000 },
  { id: "K19", nama: "Iuran Kebun Komunal", jenisArus: "masuk", tipeTagihan: "bulanan", nominalDefault: 20000 },
  { id: "K20", nama: "Pengecatan Pos Ronda", jenisArus: "keluar", tipeTagihan: "sekali", nominalDefault: 400000 },
]

export const cashflowBulananMock: MonthlyCashflow[] = [
  { bulan: "Jan", pemasukan: 4350000, pengeluaran: 2700000 },
  { bulan: "Feb", pemasukan: 4125000, pengeluaran: 2950000 },
  { bulan: "Mar", pemasukan: 4500000, pengeluaran: 3180000 },
  { bulan: "Apr", pemasukan: 3175000, pengeluaran: 2410000 },
]

const saldoAwalKas = 12480000

export const cashflowDenganSaldoMock: MonthlyCashflow[] = cashflowBulananMock.reduce<MonthlyCashflow[]>((acc, month) => {
  const lastSaldo = acc.length === 0 ? saldoAwalKas : (acc[acc.length - 1].saldo ?? saldoAwalKas)
  const saldo = lastSaldo + month.pemasukan - month.pengeluaran
  return [...acc, { ...month, saldo }]
}, [])

export const saldoKasMock = cashflowDenganSaldoMock.at(-1)?.saldo ?? saldoAwalKas
export const pemasukanBulanIniMock = cashflowBulananMock.at(-1)?.pemasukan ?? 0
export const pengeluaranBulanIniMock = cashflowBulananMock.at(-1)?.pengeluaran ?? 0

export const transaksiMock: TransaksiKas[] = [
  { id: "T240", tanggal: "2026-04-22", jenisArus: "masuk", wargaId: "W001", wargaNama: "Budi Santoso", blok: "A-03", kategoriId: "K01", kategoriNama: "Iuran Bulanan Kas", periodeLabel: "Apr 2026", nominal: 75000 },
  { id: "T239", tanggal: "2026-04-22", jenisArus: "masuk", wargaId: "W001", wargaNama: "Budi Santoso", blok: "A-03", kategoriId: "K02", kategoriNama: "Iuran Sampah", periodeLabel: "Apr 2026", nominal: 35000 },
  { id: "T238", tanggal: "2026-04-21", jenisArus: "keluar", kategoriId: "K07", kategoriNama: "Honor Satpam", periodeLabel: "Apr 2026", nominal: 1200000, catatan: "Transfer Pak Joko" },
  { id: "T237", tanggal: "2026-04-20", jenisArus: "masuk", wargaId: "W008", wargaNama: "Indah Permatasari", blok: "C-02", kategoriId: "K03", kategoriNama: "Iuran Keamanan", periodeLabel: "Apr 2026", nominal: 50000 },
  { id: "T236", tanggal: "2026-04-20", jenisArus: "masuk", wargaId: "W002", wargaNama: "Siti Rahmawati", blok: "A-05", kategoriId: "K01", kategoriNama: "Iuran Bulanan Kas", periodeLabel: "Apr 2026", nominal: 75000 },
  { id: "T235", tanggal: "2026-04-19", jenisArus: "masuk", wargaId: "W005", wargaNama: "Hendra Wijaya", blok: "B-04", kategoriId: "K02", kategoriNama: "Iuran Sampah", periodeLabel: "Apr 2026", nominal: 35000 },
  { id: "T234", tanggal: "2026-04-19", jenisArus: "keluar", kategoriId: "K06", kategoriNama: "Honor Petugas Kebersihan", periodeLabel: "Apr 2026", nominal: 800000, catatan: "Cash Pak Tono" },
  { id: "T233", tanggal: "2026-04-18", jenisArus: "masuk", wargaId: "W003", wargaNama: "Agus Pratama", blok: "A-08", kategoriId: "K03", kategoriNama: "Iuran Keamanan", periodeLabel: "Apr 2026", nominal: 50000 },
  { id: "T232", tanggal: "2026-04-17", jenisArus: "masuk", wargaId: "W006", wargaNama: "Maya Lestari", blok: "B-06", kategoriId: "K01", kategoriNama: "Iuran Bulanan Kas", periodeLabel: "Apr 2026", nominal: 75000 },
  { id: "T231", tanggal: "2026-04-17", jenisArus: "masuk", wargaId: "W009", wargaNama: "Ahmad Fadillah", blok: "C-05", kategoriId: "K01", kategoriNama: "Iuran Bulanan Kas", periodeLabel: "Apr 2026", nominal: 75000 },
  { id: "T230", tanggal: "2026-04-16", jenisArus: "keluar", kategoriId: "K08", kategoriNama: "Listrik Pos Ronda", periodeLabel: "Apr 2026", nominal: 150000, catatan: "Token listrik" },
  { id: "T229", tanggal: "2026-04-15", jenisArus: "masuk", wargaId: "W011", wargaNama: "Dedi Kurniawan", blok: "D-02", kategoriId: "K02", kategoriNama: "Iuran Sampah", periodeLabel: "Apr 2026", nominal: 35000 },
  { id: "T228", tanggal: "2026-04-15", jenisArus: "masuk", wargaId: "W012", wargaNama: "Ani Wulandari", blok: "D-04", kategoriId: "K01", kategoriNama: "Iuran Bulanan Kas", periodeLabel: "Apr 2026", nominal: 75000 },
  { id: "T227", tanggal: "2026-04-14", jenisArus: "masuk", wargaId: "W015", wargaNama: "Surya Darma", blok: "E-01", kategoriId: "K03", kategoriNama: "Iuran Keamanan", periodeLabel: "Apr 2026", nominal: 50000 },
  { id: "T226", tanggal: "2026-04-13", jenisArus: "masuk", wargaId: "W017", wargaNama: "Bastian Tampubolon", blok: "E-06", kategoriId: "K01", kategoriNama: "Iuran Bulanan Kas", periodeLabel: "Apr 2026", nominal: 75000 },
  { id: "T225", tanggal: "2026-04-12", jenisArus: "masuk", wargaId: "W020", wargaNama: "Heni Kusuma", blok: "F-05", kategoriId: "K02", kategoriNama: "Iuran Sampah", periodeLabel: "Apr 2026", nominal: 35000 },
  { id: "T224", tanggal: "2026-04-11", jenisArus: "keluar", kategoriId: "K12", kategoriNama: "Tagihan Listrik Bersama", periodeLabel: "Apr 2026", nominal: 350000, catatan: "Tagihan PLN" },
  { id: "T223", tanggal: "2026-04-10", jenisArus: "masuk", wargaId: "W014", wargaNama: "Fitri Handayani", blok: "D-10", kategoriId: "K01", kategoriNama: "Iuran Bulanan Kas", periodeLabel: "Apr 2026", nominal: 75000 },
  { id: "T222", tanggal: "2026-04-09", jenisArus: "masuk", wargaId: "W018", wargaNama: "Dewi Anggraeni", blok: "E-09", kategoriId: "K03", kategoriNama: "Iuran Keamanan", periodeLabel: "Apr 2026", nominal: 50000 },
]

export const tunggakanMock: TunggakanWarga[] = [
  {
    warga: "Agus Pratama",
    blok: "A-08",
    items: [
      { kategori: "Iuran Bulanan Kas", periode: "Apr 2026", nominal: 75000 },
      { kategori: "Iuran Sampah", periode: "Apr 2026", nominal: 35000 },
    ],
  },
  {
    warga: "Rudi Hartono",
    blok: "B-09",
    items: [{ kategori: "Iuran Keamanan", periode: "Apr 2026", nominal: 50000 }],
  },
]

export const logAktivitasMock: LogAktivitas[] = [
  { tanggalWaktu: "2026-04-22 14:32", petugas: "Siti Rahmawati", modul: "Kas Masuk", aksi: "tambah", detail: "Pembayaran W001 · Iuran Bulanan Kas Apr 2026" },
  { tanggalWaktu: "2026-04-22 14:30", petugas: "Siti Rahmawati", modul: "Kas Masuk", aksi: "tambah", detail: "Pembayaran W001 · Iuran Sampah Apr 2026" },
  { tanggalWaktu: "2026-04-21 19:05", petugas: "Budi Santoso", modul: "Kas Keluar", aksi: "tambah", detail: "Honor Satpam Apr 2026" },
  { tanggalWaktu: "2026-04-21 08:15", petugas: "Siti Rahmawati", modul: "Kas Masuk", aksi: "tambah", detail: "Pembayaran W002 · Iuran Bulanan Kas Apr 2026" },
  { tanggalWaktu: "2026-04-20 16:45", petugas: "Hendra Wijaya", modul: "Kas Masuk", aksi: "tambah", detail: "Pembayaran W005 · Iuran Sampah Apr 2026" },
  { tanggalWaktu: "2026-04-20 10:20", petugas: "Budi Santoso", modul: "Kas Keluar", aksi: "tambah", detail: "Honor Petugas Kebersihan Apr 2026" },
  { tanggalWaktu: "2026-04-19 11:30", petugas: "Siti Rahmawati", modul: "Kas Masuk", aksi: "tambah", detail: "Pembayaran W008 · Iuran Keamanan Apr 2026" },
  { tanggalWaktu: "2026-04-18 09:10", petugas: "Siti Rahmawati", modul: "Kas Masuk", aksi: "tambah", detail: "Pembayaran W003 · Iuran Keamanan Apr 2026" },
  { tanggalWaktu: "2026-04-17 14:55", petugas: "Hendra Wijaya", modul: "Kas Masuk", aksi: "tambah", detail: "Pembayaran W006 · Iuran Bulanan Kas Apr 2026" },
  { tanggalWaktu: "2026-04-17 14:50", petugas: "Hendra Wijaya", modul: "Kas Masuk", aksi: "tambah", detail: "Pembayaran W009 · Iuran Bulanan Kas Apr 2026" },
  { tanggalWaktu: "2026-04-16 08:30", petugas: "Budi Santoso", modul: "Kas Keluar", aksi: "tambah", detail: "Listrik Pos Ronda Apr 2026" },
  { tanggalWaktu: "2026-04-15 15:20", petugas: "Siti Rahmawati", modul: "Kas Masuk", aksi: "tambah", detail: "Pembayaran W011 · Iuran Sampah Apr 2026" },
  { tanggalWaktu: "2026-04-15 15:15", petugas: "Siti Rahmawati", modul: "Kas Masuk", aksi: "tambah", detail: "Pembayaran W012 · Iuran Bulanan Kas Apr 2026" },
  { tanggalWaktu: "2026-04-14 10:00", petugas: "Hendra Wijaya", modul: "Kas Masuk", aksi: "tambah", detail: "Pembayaran W015 · Iuran Keamanan Apr 2026" },
  { tanggalWaktu: "2026-04-13 16:40", petugas: "Siti Rahmawati", modul: "Kas Masuk", aksi: "tambah", detail: "Pembayaran W017 · Iuran Bulanan Kas Apr 2026" },
  { tanggalWaktu: "2026-04-12 09:25", petugas: "Hendra Wijaya", modul: "Kas Masuk", aksi: "tambah", detail: "Pembayaran W020 · Iuran Sampah Apr 2026" },
  { tanggalWaktu: "2026-04-11 11:10", petugas: "Budi Santoso", modul: "Kas Keluar", aksi: "tambah", detail: "Tagihan Listrik Bersama Apr 2026" },
  { tanggalWaktu: "2026-04-10 14:30", petugas: "Siti Rahmawati", modul: "Kas Masuk", aksi: "tambah", detail: "Pembayaran W014 · Iuran Bulanan Kas Apr 2026" },
  { tanggalWaktu: "2026-04-09 08:45", petugas: "Hendra Wijaya", modul: "Kas Masuk", aksi: "tambah", detail: "Pembayaran W018 · Iuran Keamanan Apr 2026" },
]

export const wargaStatusAprMock: WargaPaymentStatus[] = [
  { kategori: "Iuran Bulanan Kas", tipeTagihan: "bulanan", status: "lunas", nominal: 75000, tanggalBayar: "2026-04-22" },
  { kategori: "Iuran Sampah", tipeTagihan: "bulanan", status: "lunas", nominal: 35000, tanggalBayar: "2026-04-22" },
  { kategori: "Iuran Keamanan", tipeTagihan: "bulanan", status: "belum", nominal: 50000 },
  { kategori: "Iuran 17 Agustus", tipeTagihan: "sekali", status: "belum-tempo", nominal: 100000, jatuhTempoLabel: "Agt 2026" },
]

export const wargaHistoryMock: WargaHistoryPeriod[] = [
  {
    periode: "Apr 2026",
    items: [
      { kategori: "Iuran Bulanan Kas", status: "lunas", tanggalBayar: "22 Apr 2026", nominal: 75000, refKuitansi: "KW-2026-0240" },
      { kategori: "Iuran Sampah", status: "lunas", tanggalBayar: "22 Apr 2026", nominal: 35000, refKuitansi: "KW-2026-0239" },
      { kategori: "Iuran Keamanan", status: "belum", nominal: 50000 },
    ],
  },
]

export const pengeluaranBreakdownAprMock: ExpenseBreakdownItem[] = [
  { kategori: "Honor Satpam", nominal: 1200000 },
  { kategori: "Honor Petugas Kebersihan", nominal: 800000 },
  { kategori: "Listrik Pos Ronda", nominal: 145000 },
  { kategori: "Perawatan Taman", nominal: 175000 },
]
