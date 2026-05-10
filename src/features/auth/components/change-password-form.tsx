"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { AppButton, AppField, AppInput, KanvasIcons } from "@/components/kanvas"
import { changePasswordAction } from "@/lib/actions/auth"

export function ChangePasswordForm() {
  const router = useRouter()
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError("Semua field wajib diisi.")
      return
    }

    setSubmitting(true)
    try {
      const result = await changePasswordAction({
        oldPassword,
        newPassword,
        confirmPassword,
      })

      if (result.success) {
        setSuccess(result.message)
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
        
        // Hard redirect to force middleware to re-check must_change_password
        setTimeout(() => {
          window.location.href = "/"
        }, 2000)
      } else {
        setError(result.error)
      }
    } catch {
      setError("Tidak bisa terhubung ke server. Coba lagi.")
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
          Pastikan password baru minimal 8 karakter dan mengandung huruf serta angka.
        </p>

        <form onSubmit={handleSubmit}>
          <AppField label="Password Lama">
            <AppInput
              value={oldPassword}
              onChange={setOldPassword}
              placeholder="••••••••"
              type="password"
              leading={<KanvasIcons.shield size={14} />}
            />
          </AppField>

          <AppField label="Password Baru">
            <AppInput
              value={newPassword}
              onChange={setNewPassword}
              placeholder="••••••••"
              type="password"
              leading={<KanvasIcons.shield size={14} />}
            />
          </AppField>

          <AppField label="Konfirmasi Password Baru">
            <AppInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="••••••••"
              type="password"
              leading={<KanvasIcons.shield size={14} />}
            />
          </AppField>

          {error ? (
            <p className="mt-1 mb-4 rounded-lg border border-kanvas-danger-soft bg-kanvas-danger-soft px-3 py-2 text-[12px] text-kanvas-danger">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="mt-1 mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-[12px] text-green-700">
              {success} Mengalihkan ke dashboard...
            </p>
          ) : null}

          <div className="flex gap-3">
            <AppButton
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => router.back()}
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
