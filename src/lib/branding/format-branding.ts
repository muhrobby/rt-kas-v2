import type { AppSettings } from "@/lib/db/schema/app-settings"

export type AppSettingsView = AppSettings & {
  rtRwLabel: string
}

export type AppBranding = Pick<
  AppSettingsView,
  "appName" | "organizationName" | "rtRwLabel" | "address" | "primaryColor" | "secondaryColor" | "accentColor"
>

export type PdfBranding = Pick<
  AppSettingsView,
  | "appName"
  | "organizationName"
  | "rtRwLabel"
  | "address"
  | "phone"
  | "email"
  | "primaryColor"
  | "secondaryColor"
  | "accentColor"
  | "receiptTitle"
  | "receiptFooter"
>

export function formatRtRwLabel(rtNumber: string, rwNumber: string): string {
  return `RT ${rtNumber.padStart(2, "0")} / RW ${rwNumber.padStart(3, "0")}`
}

export function formatAppSettingsForView(settings: AppSettings): AppSettingsView {
  return {
    ...settings,
    rtRwLabel: formatRtRwLabel(settings.rtNumber, settings.rwNumber),
  }
}

export function getAppBranding(settings: AppSettings): AppBranding {
  const view = formatAppSettingsForView(settings)

  return {
    appName: view.appName,
    organizationName: view.organizationName,
    rtRwLabel: view.rtRwLabel,
    address: view.address,
    primaryColor: view.primaryColor,
    secondaryColor: view.secondaryColor,
    accentColor: view.accentColor,
  }
}

export function getPdfBranding(settings: AppSettings): PdfBranding {
  const view = formatAppSettingsForView(settings)

  return {
    appName: view.appName,
    organizationName: view.organizationName,
    rtRwLabel: view.rtRwLabel,
    address: view.address,
    phone: view.phone,
    email: view.email,
    primaryColor: view.primaryColor,
    secondaryColor: view.secondaryColor,
    accentColor: view.accentColor,
    receiptTitle: view.receiptTitle,
    receiptFooter: view.receiptFooter,
  }
}
