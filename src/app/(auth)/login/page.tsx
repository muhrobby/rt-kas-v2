import { LoginBrandPanel } from "@/features/auth/components/login-brand-panel"
import { LoginForm } from "@/features/auth/components/login-form"
import { getAppBranding } from "@/lib/branding/format-branding"
import { getAppSettings } from "@/lib/services/app-settings-service"

export default async function LoginPage() {
  const branding = getAppBranding(await getAppSettings())

  return (
    <main className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
      <LoginBrandPanel branding={branding} />
      <LoginForm />
    </main>
  )
}
