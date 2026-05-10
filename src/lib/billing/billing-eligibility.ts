import "server-only"

const TIMEZONE = "Asia/Jakarta"
const CUTOFF_DAY = 15
const MIN_YEAR = 2000
const MAX_YEAR = 2100

export interface BillablePeriod {
  bulan: number
  tahun: number
}

function toJakartaDate(date: Date): { day: number; month: number; year: number } {
  const formatter = new Intl.DateTimeFormat("id-ID", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  })
  const parts = formatter.formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  return { day: get("day"), month: get("month"), year: get("year") }
}

export function getFirstBillablePeriod(createdAt: Date): BillablePeriod {
  const { day, month, year } = toJakartaDate(createdAt)

  if (day <= CUTOFF_DAY) {
    return { bulan: month, tahun: year }
  }

  let nextMonth = month + 1
  let nextYear = year

  if (nextMonth > 12) {
    nextMonth = 1
    nextYear += 1
  }

  return { bulan: nextMonth, tahun: nextYear }
}

export function toMonthIndex(period: BillablePeriod): number {
  if (!isValidBulan(period.bulan) || !isValidTahun(period.tahun)) {
    return -1
  }
  return (period.tahun - MIN_YEAR) * 12 + (period.bulan - 1)
}

export function isPeriodEligible(createdAt: Date, bulan: number, tahun: number): boolean {
  if (!isValidBulan(bulan) || !isValidTahun(tahun)) {
    return false
  }
  const first = getFirstBillablePeriod(createdAt)
  return toMonthIndex({ bulan, tahun }) >= toMonthIndex(first)
}

export function isValidBulan(bulan: number): boolean {
  return Number.isInteger(bulan) && bulan >= 1 && bulan <= 12
}

export function isValidTahun(tahun: number): boolean {
  return Number.isInteger(tahun) && tahun >= MIN_YEAR && tahun <= MAX_YEAR
}

export function isSameOrBeforePeriod(a: BillablePeriod, b: BillablePeriod): boolean {
  return toMonthIndex(a) <= toMonthIndex(b)
}

export function isSameOrAfterPeriod(a: BillablePeriod, b: BillablePeriod): boolean {
  return toMonthIndex(a) >= toMonthIndex(b)
}
