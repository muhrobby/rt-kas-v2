import { z } from "zod"

const FEATURE_FLAG_KEYS = [
  "admin.warga",
  "admin.kategori",
  "admin.kas-masuk",
  "admin.kas-keluar",
  "admin.tunggakan",
  "admin.laporan",
  "admin.log-aktivitas",
  "admin.event",
  "admin.pengurus",
  "warga.event",
  "warga.laporan",
  "warga.riwayat",
] as const

export const toggleFeatureFlagSchema = z.object({
  key: z.enum(FEATURE_FLAG_KEYS),
  enabled: z.boolean(),
})

export type ToggleFeatureFlagInput = z.infer<typeof toggleFeatureFlagSchema>
