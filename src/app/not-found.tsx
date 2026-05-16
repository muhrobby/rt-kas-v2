import Link from "next/link"

import { AppButton, AppCard } from "@/components/kanvas"

export default function NotFoundPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-kanvas-paper p-6">
      <AppCard className="w-full max-w-lg p-7">
        <p className="text-xs font-semibold tracking-[1.4px] text-kanvas-ink-4 uppercase">404</p>
        <h1 className="mt-2 text-3xl leading-tight text-kanvas-ink">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm leading-relaxed text-kanvas-ink-3">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <div className="mt-6">
          <Link href="/">
            <AppButton variant="primary" size="md">
              Kembali ke Beranda
            </AppButton>
          </Link>
        </div>
      </AppCard>
    </main>
  )
}
