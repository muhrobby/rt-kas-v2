"use client"

import { useState } from "react"

import { AppButton, AppField, AppInput, KanvasIcons } from "@/components/kanvas"
import { changePasswordAction } from "@/lib/actions/auth"
import { changePasswordSchema } from "@/lib/validations/auth"

type FieldErrors = {
  oldPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState("")
  const [success, setSuccess] = useState("")
  const [submitting, setSubmitting] = useState(false)

  function validateField(field: keyof FieldErrors, values: { oldPassword: string; newPassword: string; confirmPassword: string }) {
    const result = changePasswordSchema.safeParse(values)
    if (result.success) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
      return
    }
    const issue = result.error.issues.find((i) => i.path[0] === field)
    setFieldErrors((prev) => ({ ...prev, [field]: issue?.message }))
  }

  function validateClient(): boolean {
    const result = changePasswordSchema.safeParse({ oldPassword, newPassword, confirmPassword })
    if (result.success) {
      setFieldErrors({})
      return true
    }
    const errors: FieldErrors = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof FieldErrors
      if (!errors[field]) errors[field] = issue.message
    }
    setFieldErrors(errors)
    return false
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError("")
    setSuccess("")

    if (!validateClient()) return

    setSubmitting(true)
    try {
      const result = await changePasswordAction({ oldPassword, newPassword, confirmPassword })

      if (result.success) {
        setSuccess(result.message)
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setTimeout(() => { window.location.href = "/" }, 800)
      } else {
        setServerError(result.error)
      }
    } catch {
      setServerError("Tidak bisa terhubung ke server. Coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="flex min-h-svh items-center justify-center bg-kanvas-paper px-4 py-10 sm:px-6 lg:bg-kanvas-paper-2">
      <div className="w-full max-w-[420px]">
        <p className="text-[11.5px] font-semibold tracking-[1.6px] text-kanvas-ink-4 uppercase">Keamanan</p>
        <h1 className="mt-2 text-[32px] leading-tight text-kanvas-ink">Ganti Password</h1>
        <p className="mt-2 mb-7 text-[13px] text-kanvas-ink-3">
          Minimal 8 karakter, mengandung huruf dan angka, berbeda dari password lama.
        </p>

        <form onSubmit={handleSubmit}>
          <AppField label="Password Lama" hint={fieldErrors.oldPassword ? <span className="text-kanvas-danger">{fieldErrors.oldPassword}</span> : undefined}>
            <AppInput
              value={oldPassword}
              onChange={setOldPassword}
              onBlur={() => validateField("oldPassword", { oldPassword, newPassword, confirmPassword })}
              placeholder="••••••••"
              type="password"
              leading={<KanvasIcons.shield size={14} />}
            />
          </AppField>

          <AppField label="Password Baru" hint={fieldErrors.newPassword ? <span className="text-kanvas-danger">{fieldErrors.newPassword}</span> : undefined}>
            <AppInput
              value={newPassword}
              onChange={setNewPassword}
              onBlur={() => validateField("newPassword", { oldPassword, newPassword, confirmPassword })}
              placeholder="••••••••"
              type="password"
              leading={<KanvasIcons.shield size={14} />}
            />
          </AppField>

          <AppField label="Konfirmasi Password Baru" hint={fieldErrors.confirmPassword ? <span className="text-kanvas-danger">{fieldErrors.confirmPassword}</span> : undefined}>
            <AppInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              onBlur={() => validateField("confirmPassword", { oldPassword, newPassword, confirmPassword })}
              placeholder="••••••••"
              type="password"
              leading={<KanvasIcons.shield size={14} />}
            />
          </AppField>

          {serverError ? (
            <p className="mt-1 mb-4 rounded-lg border border-kanvas-danger-soft bg-kanvas-danger-soft px-3 py-2 text-[12px] text-kanvas-danger">
              {serverError}
            </p>
          ) : null}

          {success ? (
            <p className="mt-1 mb-4 rounded-lg border border-kanvas-success-soft bg-kanvas-success-soft px-3 py-2 text-[12px] text-kanvas-success">
              {success} Mengalihkan...
            </p>
          ) : null}

          <div className="flex gap-3">
            <AppButton
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => window.history.back()}
              disabled={submitting}
            >
              Batal
            </AppButton>
            <AppButton
              type="submit"
              className="flex-1"
              size="lg"
              trailing={<KanvasIcons.check size={14} />}
              disabled={submitting}
            >
              {submitting ? "Memproses..." : "Simpan"}
            </AppButton>
          </div>
        </form>
      </div>
    </section>
  )
}
