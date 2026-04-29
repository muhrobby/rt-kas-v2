import Link from "next/link"

import { AppCard } from "@/components/kanvas"

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-kanvas-paper p-6">
      <AppCard className="w-full max-w-lg p-7">
        <p className="text-xs font-semibold tracking-[1.4px] text-kanvas-ink-4 uppercase">Unauthorized</p>
        <h1 className="mt-2 text-3xl leading-tight text-kanvas-ink">Akses ditolak</h1>
        <p className="mt-3 text-sm leading-relaxed text-kanvas-ink-3">
          Akun Anda tidak memiliki izin untuk mengakses halaman ini. Silakan masuk kembali menggunakan akun yang sesuai.
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-kanvas-terra bg-kanvas-terra px-4 py-2 text-sm font-semibold text-white transition hover:bg-kanvas-terra-2"
          >
            Kembali ke Login
          </Link>
        </div>
      </AppCard>
    </main>
  )
}
