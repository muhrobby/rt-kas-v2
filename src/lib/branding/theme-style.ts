import type { CSSProperties } from "react"

import type { AppBranding } from "@/lib/branding/format-branding"

export function getBrandingThemeStyle(branding: AppBranding): CSSProperties {
  return {
    "--kanvas-terra": branding.primaryColor,
    "--kanvas-terra-2": branding.secondaryColor,
    "--kanvas-terra-soft": branding.accentColor,
    "--primary": branding.primaryColor,
    "--sidebar-primary": branding.primaryColor,
  } as CSSProperties
}
