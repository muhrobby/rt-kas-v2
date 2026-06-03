import test from "node:test"
import assert from "node:assert/strict"

import { validateKasMasukBillingPeriods } from "./kas-masuk-billing"

test("validateKasMasukBillingPeriods rejects the whole submit when one monthly period is not eligible", () => {
  const result = validateKasMasukBillingPeriods({
    categoryType: "bulanan",
    wargaCreatedAt: new Date("2026-05-16T03:00:00.000Z"),
    months: [5, 6],
    year: 2026,
  })

  assert.equal(result.ok, false)
  assert.equal(result.error, "Periode tagihan belum berlaku untuk warga ini.")
})

test("validateKasMasukBillingPeriods keeps sekali categories on existing behavior", () => {
  const result = validateKasMasukBillingPeriods({
    categoryType: "sekali",
    wargaCreatedAt: new Date("2026-05-16T03:00:00.000Z"),
    months: [5],
    year: 2026,
  })

  assert.equal(result.ok, true)
})
