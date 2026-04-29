import {
  cashflowBulananMock,
  cashflowDenganSaldoMock,
  kategoriKasMock,
  pengeluaranBreakdownAprMock,
  saldoKasMock,
  wargaHistoryMock,
  wargaMock,
  wargaStatusAprMock,
} from "@/lib/mock/rt-kas-data"

export const wargaPortalProfile = wargaMock[0]

export const wargaPortalData = {
  profile: wargaPortalProfile,
  saldoKas: saldoKasMock,
  billStatusCurrent: wargaStatusAprMock,
  historyPeriods: wargaHistoryMock,
  cashflowBulanan: cashflowBulananMock,
  cashflowDenganSaldo: cashflowDenganSaldoMock,
  kategoriMasuk: kategoriKasMock.filter((item) => item.jenisArus === "masuk"),
  pengeluaranBreakdownDefault: pengeluaranBreakdownAprMock,
}

export function getLunasCount() {
  return wargaPortalData.billStatusCurrent.filter((item) => item.status === "lunas").length
}

export function getYtdDelta() {
  return wargaPortalData.cashflowBulanan.reduce((sum, row) => sum + row.pemasukan - row.pengeluaran, 0)
}
