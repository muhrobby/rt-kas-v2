import type { PropsWithChildren } from "react"
import Link from "next/link"

import { getCurrentUser } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { LogoutButton } from "@/components/auth/logout-button"

export default async function PanitiaLayout({ children }: PropsWithChildren) {
  const user = await getCurrentUser()
  if (!user || user.role !== "user") redirect("/login")

  return (
    <div className="min-h-svh bg-kanvas-paper">
      <header className="sticky top-0 z-30 border-b border-kanvas-line bg-white px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/panitia/event" className="text-[15px] font-semibold text-kanvas-ink">
            Panitia Event
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-kanvas-ink-3 hidden sm:block">{user.name}</span>
            <LogoutButton iconOnly={false} label="Keluar" className="text-[12px] text-kanvas-ink-3 hover:text-kanvas-danger" />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-3xl">{children}</div>
    </div>
  )
}
