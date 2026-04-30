"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { KanvasIcons, useToast } from "@/components/kanvas"
import { logoutClient } from "@/features/auth/lib/logout-client"

interface LogoutButtonProps {
  className?: string
  label?: string
  iconOnly?: boolean
  ariaLabel?: string
}

export function LogoutButton({ className, label = "Keluar", iconOnly = false, ariaLabel = "Keluar" }: LogoutButtonProps) {
  const router = useRouter()
  const { pushToast } = useToast()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      const result = await logoutClient()
      if (!result.success) {
        pushToast(result.error ?? "Gagal keluar. Coba lagi.", "error")
        return
      }

      router.replace("/login")
      router.refresh()
    } finally {
      setLoggingOut(false)
    }
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className={className}
        aria-label={ariaLabel}
        title={label}
      >
        <KanvasIcons.logout size={14} />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className={className}
      aria-label={ariaLabel}
      title={label}
    >
      <KanvasIcons.logout size={14} />
      {loggingOut ? "Proses..." : label}
    </button>
  )
}
