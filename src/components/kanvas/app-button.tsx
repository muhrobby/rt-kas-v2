"use client"

import type { ButtonHTMLAttributes, CSSProperties, PropsWithChildren, ReactNode } from "react"

import { cn } from "@/lib/utils"

type AppButtonVariant = "primary" | "dark" | "outline" | "ghost" | "danger"
type AppButtonSize = "sm" | "md" | "lg"

interface AppButtonProps extends PropsWithChildren, Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  variant?: AppButtonVariant
  size?: AppButtonSize
  leading?: ReactNode
  trailing?: ReactNode
  style?: CSSProperties
}

const palettes: Record<AppButtonVariant, { bg: string; fg: string; border: string; hover: string }> = {
  primary: { bg: "var(--kanvas-terra)", fg: "#ffffff", border: "var(--kanvas-terra)", hover: "var(--kanvas-terra-2)" },
  dark: { bg: "var(--kanvas-ink)", fg: "var(--kanvas-paper-2)", border: "var(--kanvas-ink)", hover: "var(--kanvas-ink-2)" },
  outline: { bg: "#ffffff", fg: "var(--kanvas-ink-2)", border: "var(--kanvas-line)", hover: "var(--kanvas-paper)" },
  ghost: { bg: "transparent", fg: "var(--kanvas-ink-2)", border: "transparent", hover: "var(--kanvas-paper-2)" },
  danger: { bg: "#ffffff", fg: "var(--kanvas-danger)", border: "var(--kanvas-danger-soft)", hover: "var(--kanvas-danger-soft)" },
}

const sizes: Record<AppButtonSize, { py: number; px: number; fs: number }> = {
  sm: { py: 6, px: 10, fs: 12 },
  md: { py: 9, px: 14, fs: 13 },
  lg: { py: 12, px: 18, fs: 14 },
}

// Unique class prefix per variant to scope CSS rules
const variantClass: Record<AppButtonVariant, string> = {
  primary: "appbtn-primary",
  dark: "appbtn-dark",
  outline: "appbtn-outline",
  ghost: "appbtn-ghost",
  danger: "appbtn-danger",
}

// Inject global CSS once per variant using a module-level set
const injected = new Set<string>()

function injectVariantStyle(variant: AppButtonVariant) {
  if (typeof document === "undefined") return
  const cls = variantClass[variant]
  if (injected.has(cls)) return
  injected.add(cls)

  const p = palettes[variant]
  const style = document.createElement("style")
  style.dataset.appbtn = cls
  style.textContent = `
    .${cls}:not(:disabled):hover { background: ${p.hover} !important; }
    .${cls}:focus-visible { outline: 2px solid ${p.border}; outline-offset: 2px; }
  `
  document.head.appendChild(style)
}

export function AppButton({
  children,
  className,
  variant = "primary",
  size = "md",
  leading,
  trailing,
  style,
  disabled,
  ...props
}: AppButtonProps) {
  const palette = palettes[variant]
  const buttonSize = sizes[size]

  // Inject CSS rule for this variant (no-op if already injected)
  injectVariantStyle(variant)

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold",
        variantClass[variant],
        className,
      )}
      disabled={disabled}
      style={{
        padding: `${buttonSize.py}px ${buttonSize.px}px`,
        fontSize: buttonSize.fs,
        background: palette.bg,
        color: palette.fg,
        border: `1px solid ${palette.border}`,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background 0.12s",
        ...style,
      }}
      {...props}
    >
      {leading}
      {children}
      {trailing}
    </button>
  )
}
