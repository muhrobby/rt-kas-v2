import { requireAdmin } from "@/lib/auth/permissions"
import { ChangePasswordForm } from "@/features/auth/components/change-password-form"

export default async function AdminChangePasswordPage() {
  await requireAdmin()

  return <ChangePasswordForm />
}
