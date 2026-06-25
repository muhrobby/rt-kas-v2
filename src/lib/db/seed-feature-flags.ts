import { db } from "./index";
import { featureFlags } from "./schema/feature-flags";
import { FEATURE_FLAG_REGISTRY } from "../constants/feature-flags";

/** Seed feature flags from registry into DB — idempotent, does NOT overwrite existing enabled state. */
export async function seedFeatureFlags(): Promise<void> {
  const existingKeys = new Set(
    (await db.select({ key: featureFlags.key }).from(featureFlags)).map((r) => r.key),
  );

  const newEntries = FEATURE_FLAG_REGISTRY.filter((entry) => !existingKeys.has(entry.key));

  if (newEntries.length > 0) {
    await db.insert(featureFlags).values(
      newEntries.map((entry) => ({
        key: entry.key,
        enabled: entry.defaultEnabled,
        scope: entry.scope,
        label: entry.label,
        description: entry.description ?? null,
      })),
    );
  }

  const skipped = FEATURE_FLAG_REGISTRY.length - newEntries.length;
  console.log(`[seed-feature-flags] Inserted ${newEntries.length} new flag(s), skipped ${skipped} existing`);
}
