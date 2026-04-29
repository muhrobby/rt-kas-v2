"use client"

import { useState } from "react"
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
  danger: { bg: "#ffffff", fg: "var(--kanvas-danger)", border: "var(--kanvas-danger-soft)", hover: "var(--kanvas-info-soft)" },
}

const sizes: Record<AppButtonSize, { py: number; px: number; fs: number }> = {
  sm: { py: 6, px: 10, fs: 12 },
  md: { py: 9, px: 14, fs: 13 },
  lg: { py: 12, px: 18, fs: 14 },
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
  const [hover, setHover] = useState(false)
  const palette = palettes[variant]
  const buttonSize = sizes[size]

  return (
    <button
      type="button"
      className={cn("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold", className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={disabled}
      style={{
        padding: `${buttonSize.py}px ${buttonSize.px}px`,
        fontSize: buttonSize.fs,
        background: hover ? palette.hover : palette.bg,
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
