"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { KanvasIcons } from "@/components/kanvas"
import { LogoutButton } from "@/components/auth/logout-button"
import { wargaNavItems } from "@/lib/constants/nav"

const iconMap = {
  home: KanvasIcons.home,
  receipt: KanvasIcons.receipt,
  doc: KanvasIcons.doc,
} as const

export function WargaMobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-40 border-t border-kanvas-line bg-white/98 backdrop-blur-sm md:hidden">
      <div className="grid grid-cols-4 pb-[max(env(safe-area-inset-bottom),0px)]">
        {wargaNavItems.map((item) => {
          const Icon = iconMap[item.icon]
          const active = pathname === item.href
          return (
            <Link
              key={item.id}
              href={item.href}
              className="relative flex flex-col items-center gap-1 px-1 py-2 text-[11px] font-semibold"
              style={{ color: active ? "var(--kanvas-terra)" : "var(--kanvas-ink-3)" }}
            >
              {active ? <span className="absolute top-0 h-[2px] w-10 rounded-full bg-kanvas-terra" /> : null}
              <Icon size={14} />
              {item.label}
            </Link>
          )
        })}

        <LogoutButton
          className="relative flex flex-col items-center gap-1 px-1 py-2 text-[11px] font-semibold text-kanvas-ink-3 disabled:cursor-not-allowed disabled:opacity-50"
          iconOnly={false}
          label="Keluar"
          ariaLabel="Keluar"
        />
      </div>
    </nav>
  )
}
