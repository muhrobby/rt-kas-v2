"use client"

import { useEffect } from "react"
import type { PropsWithChildren, MouseEvent } from "react"

interface AppModalProps extends PropsWithChildren {
  open: boolean
  onClose: () => void
  width?: number
}

export function AppModal({ open, onClose, width = 520, children }: AppModalProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  if (!open) {
    return null
  }

  const handlePanelClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(29,22,18,0.45)] backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[92%] max-w-[92%] overflow-auto rounded-[14px] border border-kanvas-line bg-kanvas-paper-2 shadow-[0_20px_60px_rgba(16,33,61,0.32)]"
        style={{ width }}
        onClick={handlePanelClick}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  )
}
