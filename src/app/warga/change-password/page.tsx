import { requireWarga } from "@/lib/auth/permissions"
import { ChangePasswordForm } from "@/features/auth/components/change-password-form"

export default async function WargaChangePasswordPage() {
  await requireWarga()

  return <ChangePasswordForm />
}
