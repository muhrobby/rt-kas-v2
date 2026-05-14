"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { PropsWithChildren } from "react"

import { KanvasIcons } from "@/components/kanvas/icons"

type ToastTone = "ok" | "warn" | "error" | "info"

interface ToastItem {
  id: string
  message: string
  tone: ToastTone
  timerId: ReturnType<typeof setTimeout>
}

interface ToastContextValue {
  pushToast: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const MAX_TOASTS = 5
const DISMISS_MS = 3200

const dotColor: Record<ToastTone, string> = {
  ok: "var(--kanvas-success)",
  warn: "var(--kanvas-warning)",
  error: "var(--kanvas-danger)",
  info: "var(--kanvas-info)",
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => {
      const item = prev.find((t) => t.id === id)
      if (item) clearTimeout(item.timerId)
      return prev.filter((t) => t.id !== id)
    })
  }, [])

  const pushToast = useCallback(
    (message: string, tone: ToastTone = "ok") => {
      setToasts((prev) => {
        // Dedup: skip if identical message+tone already visible
        if (prev.some((t) => t.message === message && t.tone === tone)) return prev

        const id = Math.random().toString(36).slice(2)
        const timerId = setTimeout(() => dismiss(id), DISMISS_MS)

        const next = [...prev, { id, message, tone, timerId }]
        // Drop oldest if over limit
        if (next.length > MAX_TOASTS) {
          const dropped = next.shift()!
          clearTimeout(dropped.timerId)
        }
        return next
      })
    },
    [dismiss],
  )

  const contextValue = useMemo(() => ({ pushToast }), [pushToast])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-2 rounded-[10px] bg-kanvas-ink px-3.5 py-2.5 text-[12.5px] font-medium text-kanvas-paper-2 shadow-[0_8px_24px_rgba(16,33,61,0.2)]"
          >
            <span
              className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: dotColor[toast.tone] }}
            />
            <span>{toast.message}</span>
            <button
              type="button"
              aria-label="Tutup notifikasi"
              onClick={() => dismiss(toast.id)}
              className="ml-1 shrink-0 rounded p-0.5 opacity-60 hover:opacity-100"
            >
              <KanvasIcons.x size={12} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider")
  }
  return context
}
