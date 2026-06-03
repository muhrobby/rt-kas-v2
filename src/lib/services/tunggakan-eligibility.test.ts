import test from "node:test"
import assert from "node:assert/strict"

import { shouldIncludeTunggakanBulananPeriod } from "./tunggakan-eligibility"

test("shouldIncludeTunggakanBulananPeriod excludes months before the first billable period", () => {
  const wargaCreatedAt = new Date("2026-05-02T03:00:00.000Z")

  assert.equal(shouldIncludeTunggakanBulananPeriod(wargaCreatedAt, 1, 2026), false)
  assert.equal(shouldIncludeTunggakanBulananPeriod(wargaCreatedAt, 4, 2026), false)
  assert.equal(shouldIncludeTunggakanBulananPeriod(wargaCreatedAt, 5, 2026), true)
})

test("shouldIncludeTunggakanBulananPeriod skips the registration month after the cutoff", () => {
  const wargaCreatedAt = new Date("2026-05-16T03:00:00.000Z")

  assert.equal(shouldIncludeTunggakanBulananPeriod(wargaCreatedAt, 5, 2026), false)
  assert.equal(shouldIncludeTunggakanBulananPeriod(wargaCreatedAt, 6, 2026), true)
})

test("shouldIncludeTunggakanBulananPeriod rolls over late December registrations to next year", () => {
  const wargaCreatedAt = new Date("2026-12-20T03:00:00.000Z")

  assert.equal(shouldIncludeTunggakanBulananPeriod(wargaCreatedAt, 12, 2026), false)
  assert.equal(shouldIncludeTunggakanBulananPeriod(wargaCreatedAt, 1, 2027), true)
})
