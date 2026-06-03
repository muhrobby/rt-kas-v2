import { isPeriodEligible } from "@/lib/billing/billing-eligibility"

export type KasMasukBillingCategoryType = "bulanan" | "sekali"

export interface ValidateKasMasukBillingPeriodsInput {
  categoryType: KasMasukBillingCategoryType
  wargaCreatedAt: Date
  months: number[]
  year: number
}

export function validateKasMasukBillingPeriods(input: ValidateKasMasukBillingPeriodsInput):
  | { ok: true; months: number[] }
  | { ok: false; error: string } {
  if (input.categoryType === "sekali") {
    return { ok: true, months: input.months }
  }

  for (const month of input.months) {
    if (!isPeriodEligible(input.wargaCreatedAt, month, input.year)) {
      return { ok: false, error: "Periode tagihan belum berlaku untuk warga ini." }
    }
  }

  return { ok: true, months: input.months }
}
