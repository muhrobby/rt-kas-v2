import assert from "node:assert/strict"
import test from "node:test"

import {
  FEATURE_FLAG_REGISTRY,
  getFlagMeta,
  getFlagsByScope,
} from "./feature-flags"

test("FEATURE_FLAG_REGISTRY contains 12 unique entries with enabled defaults", () => {
  assert.equal(FEATURE_FLAG_REGISTRY.length, 12)
  assert.ok(FEATURE_FLAG_REGISTRY.every((flag) => flag.defaultEnabled === true))

  const keys = FEATURE_FLAG_REGISTRY.map((flag) => flag.key)
  assert.equal(new Set(keys).size, FEATURE_FLAG_REGISTRY.length)
})

test("getFlagsByScope returns only flags for requested scope", () => {
  const adminFlags = getFlagsByScope("admin")
  const wargaFlags = getFlagsByScope("warga")

  assert.equal(adminFlags.length, 9)
  assert.equal(wargaFlags.length, 3)
  assert.ok(adminFlags.every((flag) => flag.scope === "admin"))
  assert.ok(wargaFlags.every((flag) => flag.scope === "warga"))
})

test("getFlagMeta returns matching flag metadata or null", () => {
  assert.deepEqual(getFlagMeta("admin.warga"), {
    key: "admin.warga",
    scope: "admin",
    label: "Manajemen Warga",
    description: "Tampilkan menu Manajemen Warga di area admin.",
    defaultEnabled: true,
  })

  assert.equal(getFlagMeta("admin.unknown"), null)
})
