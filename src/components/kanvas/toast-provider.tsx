"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { PropsWithChildren } from "react"

type ToastTone = "ok" | "warn"

interface ToastItem {
  id: string
  message: string
  tone: ToastTone
}

interface ToastContextValue {
  pushToast: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const pushToast = useCallback((message: string, tone: ToastTone = "ok") => {
    const id = Math.random().toString(36).slice(2)
    setToasts((state) => [...state, { id, message, tone }])

    window.setTimeout(() => {
      setToasts((state) => state.filter((toast) => toast.id !== id))
    }, 3200)
  }, [])

  const contextValue = useMemo(() => ({ pushToast }), [pushToast])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-2 rounded-[10px] bg-[var(--kanvas-ink)] px-3.5 py-2.5 text-[12.5px] font-medium text-[var(--kanvas-paper-2)] shadow-[0_8px_24px_rgba(16,33,61,0.2)]"
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: toast.tone === "ok" ? "var(--kanvas-info)" : "var(--kanvas-terra)" }}
            />
            {toast.message}
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
