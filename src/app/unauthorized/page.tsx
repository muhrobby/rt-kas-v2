import Link from "next/link"

import { AppButton, AppCard } from "@/components/kanvas"
import { LogoutButton } from "@/components/auth/logout-button"
import { getCurrentUser } from "@/lib/auth/session"

export default async function UnauthorizedPage() {
  const currentUser = await getCurrentUser()

  const dashboardHref = currentUser?.role === "admin" ? "/admin/dashboard" : "/warga/dashboard"
  const roleLabel = currentUser?.role === "admin" ? "Admin" : "Warga"

  return (
    <main className="flex min-h-svh items-center justify-center bg-kanvas-paper p-6">
      <AppCard className="w-full max-w-lg p-7">
        <p className="text-xs font-semibold tracking-[1.4px] text-kanvas-ink-4 uppercase">Unauthorized</p>
        <h1 className="mt-2 text-3xl leading-tight text-kanvas-ink">Akses ditolak</h1>

        {currentUser ? (
          <p className="mt-3 text-sm leading-relaxed text-kanvas-ink-3">
            Akun Anda (role: <span className="font-semibold text-kanvas-ink">{roleLabel}</span>) tidak memiliki akses ke
            halaman yang Anda tuju.
          </p>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-kanvas-ink-3">
            Anda tidak memiliki izin untuk mengakses halaman ini. Silakan masuk menggunakan akun yang sesuai.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {currentUser ? (
            <>
              <LogoutButton
                label="Keluar dan Login Ulang"
                className="inline-flex items-center gap-2 rounded-lg border border-kanvas-line bg-kanvas-paper px-4 py-2 text-sm font-semibold text-kanvas-ink-2 transition hover:bg-kanvas-paper-2"
              />
              <Link href={dashboardHref}>
                <AppButton variant="primary" size="md">
                  Ke Halaman Saya
                </AppButton>
              </Link>
            </>
          ) : (
            <Link href="/login">
              <AppButton variant="primary" size="md">
                Kembali ke Login
              </AppButton>
            </Link>
          )}
        </div>
      </AppCard>
    </main>
  )
}
