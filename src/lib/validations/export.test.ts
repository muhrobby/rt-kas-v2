import test from "node:test"
import assert from "node:assert/strict"

import { laporanQuerySchema } from "./export"

test("laporanQuerySchema accepts UI month values from 1 to 12", () => {
  const result = laporanQuerySchema.safeParse({
    startMonth: "1",
    startYear: "2026",
    endMonth: "12",
    endYear: "2026",
    saldoAwal: "0",
  })

  assert.equal(result.success, true)
})

test("laporanQuerySchema rejects month 0", () => {
  const result = laporanQuerySchema.safeParse({
    startMonth: "0",
    startYear: "2026",
    endMonth: "3",
    endYear: "2026",
    saldoAwal: "0",
  })

  assert.equal(result.success, false)
})
