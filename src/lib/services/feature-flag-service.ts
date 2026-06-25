import "server-only"

import { cache } from "react"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { featureFlags } from "@/lib/db/schema"
import {
  FEATURE_FLAG_REGISTRY,
  getFlagMeta,
  getFlagsByScope,
  type FeatureFlagKey,
} from "@/lib/constants/feature-flags"

export type FeatureFlagWithStatus = {
  key: FeatureFlagKey
  scope: "admin" | "warga"
  label: string
  description: string | null
  enabled: boolean
  updatedAt: Date | null
  updatedBy: string | null
  isDefault: boolean
}

const _getEnabledFlagsByScope = cache(
  async (scope: "admin" | "warga"): Promise<Set<FeatureFlagKey>> => {
    const registryEntries = getFlagsByScope(scope)

    try {
      const rows = await db
        .select({ key: featureFlags.key, enabled: featureFlags.enabled })
        .from(featureFlags)
        .where(eq(featureFlags.scope, scope))

      const dbMap = new Map(rows.map((r) => [r.key, r.enabled]))

      const enabledKeys = new Set<FeatureFlagKey>()
      for (const entry of registryEntries) {
        const enabled = dbMap.has(entry.key) ? dbMap.get(entry.key)! : entry.defaultEnabled
        if (enabled) {
          enabledKeys.add(entry.key)
        }
      }
      return enabledKeys
    } catch {
      return new Set<FeatureFlagKey>(registryEntries.filter((e) => e.defaultEnabled).map((e) => e.key))
    }
  },
)

/** Returns a Set of enabled feature flag keys for the given scope, merged with registry defaults. */
export async function getEnabledFlagsByScope(scope: "admin" | "warga"): Promise<Set<FeatureFlagKey>> {
  return _getEnabledFlagsByScope(scope)
}

/** Returns true if the flag is enabled, using registry defaults as fallback. */
export async function isFeatureEnabled(key: FeatureFlagKey): Promise<boolean> {
  const meta = getFlagMeta(key)
  if (!meta) return false
  const enabled = await getEnabledFlagsByScope(meta.scope)
  return enabled.has(key)
}

/** Lists all flags with their current DB status merged with registry metadata. */
export async function listAllFlags(): Promise<FeatureFlagWithStatus[]> {
  const rows = await db.select().from(featureFlags)
  const dbMap = new Map(rows.map((r) => [r.key, r]))

  return FEATURE_FLAG_REGISTRY.map((entry) => {
    const dbRow = dbMap.get(entry.key)
    return {
      key: entry.key,
      scope: entry.scope,
      label: entry.label,
      description: entry.description ?? null,
      enabled: dbRow?.enabled ?? entry.defaultEnabled,
      updatedAt: dbRow?.updatedAt ?? null,
      updatedBy: dbRow?.updatedBy ?? null,
      isDefault: !dbRow,
    }
  })
}

/** Upserts a feature flag's enabled status. Rejects keys outside the registry. */
export async function setFlagEnabled(
  key: FeatureFlagKey,
  enabled: boolean,
  userId: string,
): Promise<void> {
  const meta = getFlagMeta(key)
  if (!meta) {
    throw new Error("INVALID_FLAG_KEY")
  }

  await db
    .insert(featureFlags)
    .values({
      key,
      scope: meta.scope,
      label: meta.label,
      description: meta.description ?? null,
      enabled,
      isBuiltIn: true,
      updatedAt: new Date(),
      updatedBy: userId,
    })
    .onConflictDoUpdate({
      target: featureFlags.key,
      set: {
        enabled,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    })
}
