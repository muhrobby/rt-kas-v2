import test from "node:test"
import assert from "node:assert/strict"

import {
  getFirstBillablePeriod,
  isPeriodEligible,
  toMonthIndex,
} from "./billing-eligibility"

test("getFirstBillablePeriod uses the same month for dates on or before the 15th in Jakarta", () => {
  const createdAt = new Date("2026-06-15T16:59:59.000Z")

  assert.deepEqual(getFirstBillablePeriod(createdAt), { bulan: 6, tahun: 2026 })
})

test("getFirstBillablePeriod moves the first bill to the next month after the 15th in Jakarta", () => {
  const createdAt = new Date("2026-06-15T17:00:00.000Z")

  assert.deepEqual(getFirstBillablePeriod(createdAt), { bulan: 7, tahun: 2026 })
})

test("getFirstBillablePeriod rolls over to January for late December registrations", () => {
  const createdAt = new Date("2026-12-20T03:00:00.000Z")

  assert.deepEqual(getFirstBillablePeriod(createdAt), { bulan: 1, tahun: 2027 })
})

test("isPeriodEligible rejects periods before the first billable month", () => {
  const createdAt = new Date("2026-06-20T03:00:00.000Z")

  assert.equal(isPeriodEligible(createdAt, 6, 2026), false)
  assert.equal(isPeriodEligible(createdAt, 7, 2026), true)
})

test("isPeriodEligible returns false for invalid month or year", () => {
  const createdAt = new Date("2026-06-10T03:00:00.000Z")

  assert.equal(isPeriodEligible(createdAt, 0, 2026), false)
  assert.equal(isPeriodEligible(createdAt, 6, 1999), false)
})

test("toMonthIndex returns negative one for invalid periods", () => {
  assert.equal(toMonthIndex({ bulan: 13, tahun: 2026 }), -1)
})
