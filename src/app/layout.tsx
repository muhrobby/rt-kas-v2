import { Geist_Mono, Inter } from "next/font/google"
import type { Metadata } from "next"

import { ToastProvider } from "@/components/kanvas"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { getAppBranding } from "@/lib/branding/format-branding"
import { getBrandingThemeStyle } from "@/lib/branding/theme-style"
import { getAppSettings } from "@/lib/services/app-settings-service"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export async function generateMetadata(): Promise<Metadata> {
  const branding = getAppBranding(await getAppSettings())

  return {
    title: branding.appName,
    description: `Aplikasi manajemen kas ${branding.rtRwLabel} untuk pengurus dan warga.`,
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const branding = getAppBranding(await getAppSettings())

  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body style={getBrandingThemeStyle(branding)}>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
