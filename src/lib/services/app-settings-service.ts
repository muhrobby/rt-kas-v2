"server-only"

import { cache } from "react"
import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { appSettings } from "@/lib/db/schema"
import { defaultAppSettings } from "@/lib/constants/app-settings"
import type { AppSettingsInput } from "@/lib/validations/app-settings"

export const getAppSettings = cache(async function getAppSettings() {
  const fallbackSettings = {
    ...defaultAppSettings,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  try {
    const [row] = await db.select().from(appSettings).where(eq(appSettings.id, 1)).limit(1)

    if (!row) {
      return fallbackSettings
    }

    return row
  } catch {
    return fallbackSettings
  }
})

export async function updateAppSettings(input: AppSettingsInput) {
  const [updated] = await db
    .insert(appSettings)
    .values({
      id: 1,
      appName: input.appName,
      organizationName: input.organizationName,
      rtNumber: input.rtNumber,
      rwNumber: input.rwNumber,
      address: input.address ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor,
      accentColor: input.accentColor,
      receiptTitle: input.receiptTitle,
      receiptFooter: input.receiptFooter ?? null,
    })
    .onConflictDoUpdate({
      target: appSettings.id,
      set: {
        appName: input.appName,
        organizationName: input.organizationName,
        rtNumber: input.rtNumber,
        rwNumber: input.rwNumber,
        address: input.address ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        primaryColor: input.primaryColor,
        secondaryColor: input.secondaryColor,
        accentColor: input.accentColor,
        receiptTitle: input.receiptTitle,
        receiptFooter: input.receiptFooter ?? null,
        updatedAt: new Date(),
      },
    })
    .returning()

  return updated
}
