import { isPeriodEligible } from "@/lib/billing/billing-eligibility"

export function shouldIncludeTunggakanBulananPeriod(wargaCreatedAt: Date, bulan: number, tahun: number): boolean {
  return isPeriodEligible(wargaCreatedAt, bulan, tahun)
}
