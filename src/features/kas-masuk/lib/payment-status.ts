import type { TransaksiKas } from "@/types/rt-kas"

interface PaymentCheckParams {
  transactions: TransaksiKas[]
  wargaId: string
  kategoriId: string
  bulan: number
  tahun: number
}

function parsePeriodeLabel(periodeLabel?: string): { bulan: number; tahun: number } | null {
  if (!periodeLabel) {
    return null
  }

  const monthMap: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    Mei: 4,
    Jun: 5,
    Jul: 6,
    Agt: 7,
    Sep: 8,
    Okt: 9,
    Nov: 10,
    Des: 11,
  }

  const [monthRaw, yearRaw] = periodeLabel.trim().split(" ")
  const bulan = monthMap[monthRaw]
  const tahun = Number(yearRaw)

  if (bulan == null || Number.isNaN(tahun)) {
    return null
  }

  return { bulan, tahun }
}

export function isMonthlyPaymentPaid({
  transactions,
  wargaId,
  kategoriId,
  bulan,
  tahun,
}: PaymentCheckParams): boolean {
  return transactions.some((trx) => {
    if (trx.jenisArus !== "masuk") {
      return false
    }

    if (trx.wargaId !== wargaId || trx.kategoriId !== kategoriId) {
      return false
    }

    if (typeof trx.bulanTagihan === "number" && typeof trx.tahunTagihan === "number") {
      return trx.bulanTagihan === bulan && trx.tahunTagihan === tahun
    }

    const parsed = parsePeriodeLabel(trx.periodeLabel)
    return parsed?.bulan === bulan && parsed.tahun === tahun
  })
}

export function getPaidMonthsForWargaCategory(
  transactions: TransaksiKas[],
  wargaId: string,
  kategoriId: string,
  tahun: number,
) {
  const paidMonths: number[] = []

  transactions.forEach((trx) => {
    if (trx.jenisArus !== "masuk") {
      return
    }

    if (trx.wargaId !== wargaId || trx.kategoriId !== kategoriId) {
      return
    }

    if (typeof trx.bulanTagihan === "number" && typeof trx.tahunTagihan === "number") {
      if (trx.tahunTagihan === tahun && !paidMonths.includes(trx.bulanTagihan)) {
        paidMonths.push(trx.bulanTagihan)
      }
      return
    }

    const parsed = parsePeriodeLabel(trx.periodeLabel)
    if (parsed && parsed.tahun === tahun && !paidMonths.includes(parsed.bulan)) {
      paidMonths.push(parsed.bulan)
    }
  })

  return paidMonths.sort((a, b) => a - b)
}

export function isOneTimePaymentPaid(transactions: TransaksiKas[], wargaId: string, kategoriId: string) {
  return transactions.some(
    (trx) => trx.jenisArus === "masuk" && trx.wargaId === wargaId && trx.kategoriId === kategoriId,
  )
}
