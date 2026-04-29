"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { AppButton, AppField, AppInput, KanvasIcons } from "@/components/kanvas"

function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return ""
  if (digits.startsWith("0")) return digits
  if (digits.startsWith("62")) return `0${digits.slice(2)}`
  return `0${digits}`
}

function toLegacy62(phone: string) {
  if (phone.startsWith("0")) return `62${phone.slice(1)}`
  return phone
}

export function LoginForm() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    setError("")

    if (!phone.trim() || !password.trim()) {
      setError("Nomor telepon dan password wajib diisi.")
      return
    }

    setSubmitting(true)
    try {
      const normalized = normalizePhone(phone)
      const response = await fetch("/api/auth/sign-in/username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: normalized,
          password,
          rememberMe: true,
        }),
      })

      if (!response.ok) {
        // Backward compatibility for accounts previously stored as 62...
        const legacyResponse = await fetch("/api/auth/sign-in/username", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: toLegacy62(normalized),
            password,
            rememberMe: true,
          }),
        })

        if (!legacyResponse.ok) {
          const payload = (await legacyResponse.json().catch(() => null)) as { message?: string } | null
          setError(payload?.message ?? "Login gagal. Periksa nomor telepon/password.")
          return
        }
      }

      router.replace("/")
      router.refresh()
    } catch {
      setError("Tidak bisa terhubung ke server. Coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="flex min-h-svh items-center justify-center bg-kanvas-paper px-4 py-10 sm:px-6 lg:bg-kanvas-paper-2">
      <div className="w-full max-w-[380px]">
        <p className="text-[11.5px] font-semibold tracking-[1.6px] text-kanvas-ink-4 uppercase">Masuk</p>
        <h1 className="mt-2 text-[32px] leading-tight text-kanvas-ink">Selamat datang kembali</h1>
        <p className="mt-2 mb-7 text-[13px] text-kanvas-ink-3">Gunakan nomor telepon yang terdaftar.</p>

        <AppField label="Nomor Telepon">
          <AppInput value={phone} onChange={setPhone} placeholder="08xx-xxxx-xxxx" leading={<KanvasIcons.users size={14} />} />
        </AppField>

        <AppField label="Password">
          <AppInput
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            type="password"
            leading={<KanvasIcons.shield size={14} />}
          />
        </AppField>

        {error ? <p className="mt-1 mb-4 rounded-lg border border-kanvas-danger-soft bg-kanvas-info-soft px-3 py-2 text-[12px] text-kanvas-danger">{error}</p> : null}

        <AppButton className="w-full" size="lg" onClick={submit} trailing={<KanvasIcons.arrowR size={14} />} disabled={submitting}>
          {submitting ? "Memproses..." : "Masuk"}
        </AppButton>

        <p className="mt-5 text-center text-[11.5px] text-kanvas-ink-4">Lupa password? Hubungi pengurus RT.</p>
      </div>
    </section>
  )
}
