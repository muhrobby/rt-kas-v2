import {
  cashflowBulananMock,
  cashflowDenganSaldoMock,
  kategoriKasMock,
  logAktivitasMock,
  pemasukanBulanIniMock,
  pengeluaranBulanIniMock,
  saldoKasMock,
  transaksiMock,
  tunggakanMock,
  wargaMock,
} from "@/lib/mock/rt-kas-data"

const rekapPeriode = "Apr 2026"
const acuanHari = new Date("2026-04-22")

const kontrakAkanHabis = wargaMock
  .filter((warga) => warga.statusHunian === "kontrak" && warga.pindah)
  .map((warga) => {
    const tglPindah = new Date(warga.pindah ?? "")
    const sisaHari = Math.max(0, Math.ceil((tglPindah.getTime() - acuanHari.getTime()) / (1000 * 60 * 60 * 24)))
    return {
      warga: warga.nama,
      blok: warga.blok,
      pindah: warga.pindah ?? "",
      sisaHari,
    }
  })
  .filter((item) => item.sisaHari <= 120)
  .sort((a, b) => a.sisaHari - b.sisaHari)

const kategoriMasukBulanan = kategoriKasMock.filter((kategori) => kategori.jenisArus === "masuk" && kategori.tipeTagihan === "bulanan")
const kategoriSudahMasukPeriode = new Set(
  transaksiMock.filter((trx) => trx.jenisArus === "masuk" && trx.periodeLabel === rekapPeriode).map((trx) => trx.kategoriId),
)
const kategoriBelumDitagih = kategoriMasukBulanan.filter((kategori) => !kategoriSudahMasukPeriode.has(kategori.id))

const tunggakanTerbesar = tunggakanMock
  .map((item) => ({
    warga: item.warga,
    blok: item.blok,
    total: item.items.reduce((sum, row) => sum + row.nominal, 0),
  }))
  .sort((a, b) => b.total - a.total)

export const dashboardData = {
  periodeLabel: rekapPeriode,
  saldoKas: saldoKasMock,
  pemasukanBulanIni: pemasukanBulanIniMock,
  pengeluaranBulanIni: pengeluaranBulanIniMock,
  totalWargaAktif: wargaMock.length,
  cashflowBulanan: cashflowBulananMock,
  cashflowDenganSaldo: cashflowDenganSaldoMock,
  logTerbaru: logAktivitasMock,
  totalTunggakanNominal: tunggakanMock.reduce(
    (sum, warga) => sum + warga.items.reduce((itemSum, item) => itemSum + item.nominal, 0),
    0,
  ),
  totalWargaMenunggak: tunggakanMock.length,
  tunggakanTerbesar,
  kontrakAkanHabis,
  kategoriBelumDitagih,
}
