export interface MonthEligibilityContext {
  categoryType?: "bulanan" | "sekali"
  year: number
  paidMonths: number[]
  notEligibleMonths: number[]
  firstBillMonth?: number
  firstBillYear?: number
}

function isSelectableMonth(month: number, context: MonthEligibilityContext): boolean {
  if (context.paidMonths.includes(month)) return false
  if (context.categoryType === "sekali") return true
  if (context.notEligibleMonths.includes(month)) return false
  if (context.firstBillYear != null && context.year < context.firstBillYear) return false
  if (context.firstBillMonth != null && context.firstBillYear != null && context.year === context.firstBillYear && month < context.firstBillMonth) return false
  return true
}

export function filterSelectableMonths(months: number[], context: MonthEligibilityContext): number[] {
  return months.filter((month) => isSelectableMonth(month, context))
}
