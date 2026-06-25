import { listAllFlags, type FeatureFlagWithStatus } from "@/lib/services/feature-flag-service"
import type { FeatureFlagKey } from "@/lib/constants/feature-flags"

export interface FeatureFlagRowData {
  key: FeatureFlagKey
  scope: "admin" | "warga"
  label: string
  description: string | null
  enabled: boolean
}

export async function getFeatureFlagRows(): Promise<FeatureFlagRowData[]> {
  const flags: FeatureFlagWithStatus[] = await listAllFlags()
  return flags.map((f) => ({
    key: f.key,
    scope: f.scope,
    label: f.label,
    description: f.description,
    enabled: f.enabled,
  }))
}
