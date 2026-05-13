"use client"

import { BULAN_SINGKAT } from "@/lib/constants/months"

interface MonthPaymentSelectorProps {
  paidMonths: number[]
  notEligibleMonths: number[]
  selectedMonths: number[]
  onToggle: (month: number) => void
  firstBillMonth: number
  firstBillYear: number
  tahun: number
  disableEligibilityCheck?: boolean
}

export function MonthPaymentSelector({
  paidMonths,
  notEligibleMonths,
  selectedMonths,
  onToggle,
  firstBillMonth,
  firstBillYear,
  tahun,
  disableEligibilityCheck = false,
}: MonthPaymentSelectorProps) {
  const isNotEligible = (month: number): boolean => {
    if (disableEligibilityCheck) return false
    if (notEligibleMonths.includes(month)) return true
    if (tahun < firstBillYear) return true
    if (tahun === firstBillYear && month < firstBillMonth) return true
    return false
  }

  return (
    <div className="grid grid-cols-4 gap-1.5 rounded-lg border border-kanvas-line bg-white p-1.5 md:grid-cols-6 xl:grid-cols-12">
      {BULAN_SINGKAT.map((monthLabel, idx) => {
        const monthValue = idx + 1
        const paid = paidMonths.includes(monthValue)
        const notEligible = isNotEligible(monthValue)
        const active = selectedMonths.includes(monthValue)
        const disabled = paid || notEligible

        const title = paid
          ? "Sudah dibayar pada bulan ini"
          : notEligible
            ? `Tagihan belum mulai untuk warga ini (tagihan pertama: ${BULAN_SINGKAT[firstBillMonth - 1]} ${firstBillYear})`
            : undefined

        return (
          <button
            key={monthLabel}
            type="button"
            onClick={() => { if (!disabled) onToggle(monthValue) }}
            title={title}
            className="rounded-md px-1 py-1.5 text-[11px] font-semibold transition"
            style={{
              background: active ? "var(--kanvas-terra)" : paid ? "var(--kanvas-line-2)" : notEligible ? "var(--kanvas-line-2)" : "transparent",
              color: active ? "#ffffff" : paid ? "var(--kanvas-ink-4)" : notEligible ? "var(--kanvas-ink-3)" : "var(--kanvas-ink-2)",
              textDecoration: paid ? "line-through" : "none",
              opacity: disabled ? 0.55 : 1,
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            {monthLabel}
          </button>
        )
      })}
    </div>
  )
}


