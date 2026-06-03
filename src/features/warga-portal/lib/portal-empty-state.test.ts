import test from "node:test"
import assert from "node:assert/strict"

import { getWargaDashboardEmptyStateMessage, getWargaRiwayatEmptyStateMessage } from "./portal-empty-state"

test("portal empty state message is shown when dashboard has no eligible bills", () => {
  assert.equal(getWargaDashboardEmptyStateMessage(0), "Belum ada tagihan yang berlaku untuk bulan ini.")
})

test("portal empty state message mentions the selected period on riwayat", () => {
  assert.equal(
    getWargaRiwayatEmptyStateMessage(0, "Mei 2026"),
    "Belum ada tagihan yang berlaku untuk periode Mei 2026.",
  )
})
