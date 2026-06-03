import test from "node:test"
import assert from "node:assert/strict"

import { filterSelectableMonths } from "./month-eligibility"

test("filterSelectableMonths removes paid and not yet eligible months", () => {
  const result = filterSelectableMonths([1, 2, 3, 4, 5, 6], {
    categoryType: "bulanan",
    year: 2026,
    paidMonths: [2, 5],
    notEligibleMonths: [1, 3],
    firstBillMonth: 4,
    firstBillYear: 2026,
  })

  assert.deepEqual(result, [4, 6])
})

test("filterSelectableMonths keeps all unpaid months for sekali categories", () => {
  const result = filterSelectableMonths([1, 2, 3], {
    categoryType: "sekali",
    year: 2026,
    paidMonths: [2],
    notEligibleMonths: [1, 3],
    firstBillMonth: 4,
    firstBillYear: 2026,
  })

  assert.deepEqual(result, [1, 3])
})
