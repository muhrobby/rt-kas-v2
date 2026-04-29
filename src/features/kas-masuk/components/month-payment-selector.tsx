"use client"

import { BULAN_SINGKAT } from "@/lib/constants/months"

interface MonthPaymentSelectorProps {
  paidMonths: number[]
  selectedMonths: number[]
  onToggle: (month: number) => void
}

export function MonthPaymentSelector({ paidMonths, selectedMonths, onToggle }: MonthPaymentSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-1.5 rounded-lg border border-kanvas-line bg-white p-1.5 md:grid-cols-6 xl:grid-cols-12">
      {BULAN_SINGKAT.map((monthLabel, idx) => {
        const monthValue = idx + 1
        const paid = paidMonths.includes(monthValue)
        const active = selectedMonths.includes(monthValue)

        return (
          <button
            key={monthLabel}
            type="button"
            disabled={paid}
            onClick={() => onToggle(monthValue)}
            className="rounded-md px-1 py-1.5 text-[11px] font-semibold transition"
            style={{
              background: active ? "var(--kanvas-terra)" : paid ? "var(--kanvas-line-2)" : "transparent",
              color: active ? "#ffffff" : paid ? "var(--kanvas-ink-4)" : "var(--kanvas-ink-2)",
              textDecoration: paid ? "line-through" : "none",
              opacity: paid ? 0.65 : 1,
              cursor: paid ? "not-allowed" : "pointer",
            }}
          >
            {monthLabel}
          </button>
        )
      })}
    </div>
  )
}
