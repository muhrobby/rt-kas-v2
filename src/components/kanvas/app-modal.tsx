"use client"

import { useEffect, useRef, useId } from "react"
import type { PropsWithChildren, MouseEvent } from "react"

interface AppModalProps extends PropsWithChildren {
  open: boolean
  onClose: () => void
  width?: number
  title?: string
}

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export function AppModal({ open, onClose, width = 520, title, children }: AppModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const headingId = useId()

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement
      document.body.style.overflow = "hidden"

      const focusableContent = modalRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTORS)
      if (focusableContent) {
        focusableContent.focus()
      } else {
        modalRef.current?.focus()
      }
    } else {
      document.body.style.overflow = ""
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key === "Tab") {
        const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
        if (!focusableElements || focusableElements.length === 0) {
          event.preventDefault()
          return
        }

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
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
        ref={modalRef}
        className="max-h-[92%] max-w-[92%] overflow-auto rounded-[14px] border border-kanvas-line bg-kanvas-paper-2 shadow-[0_20px_60px_rgba(16,33,61,0.32)]"
        style={{ width }}
        onClick={handlePanelClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? headingId : undefined}
        tabIndex={-1}
      >
        {title && (
          <div id={headingId} className="border-b border-kanvas-line px-6 py-4 text-[15px] font-medium text-kanvas-ink">
            {title}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
