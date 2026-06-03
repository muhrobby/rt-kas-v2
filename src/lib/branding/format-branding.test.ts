import test from "node:test"
import assert from "node:assert/strict"

import { formatRtRwLabel } from "./format-branding"

test("formatRtRwLabel pads rt and rw numbers from database values", () => {
  assert.equal(formatRtRwLabel("1", "10"), "RT 01 / RW 010")
})
