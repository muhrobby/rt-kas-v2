"use client"

import { useEffect } from "react"

import { AppButton, AppCard } from "@/components/kanvas"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to console for Vercel Function Logs — no sensitive detail exposed to user
    console.error("[APP_ERROR]", error.digest ?? "no-digest")
  }, [error])

  return (
    <main className="flex min-h-svh items-center justify-center bg-kanvas-paper p-6">
      <AppCard className="w-full max-w-lg p-7">
        <p className="text-xs font-semibold tracking-[1.4px] text-kanvas-ink-4 uppercase">Error</p>
        <h1 className="mt-2 text-3xl leading-tight text-kanvas-ink">Terjadi kesalahan</h1>
        <p className="mt-3 text-sm leading-relaxed text-kanvas-ink-3">
          Halaman ini tidak dapat dimuat saat ini. Silakan coba lagi. Jika masalah berlanjut, hubungi pengurus RT.
        </p>
        <div className="mt-6">
          <AppButton variant="primary" size="md" onClick={reset}>
            Coba Lagi
          </AppButton>
        </div>
      </AppCard>
    </main>
  )
}
