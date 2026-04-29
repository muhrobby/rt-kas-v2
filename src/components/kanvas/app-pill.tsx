import type { CSSProperties, PropsWithChildren } from "react"

type AppPillTone = "neutral" | "ok" | "warn" | "danger" | "terra" | "plum" | "olive"

interface AppPillProps extends PropsWithChildren {
  tone?: AppPillTone
  soft?: boolean
  style?: CSSProperties
}

const tones: Record<AppPillTone, [string, string]> = {
  neutral: ["var(--kanvas-ink-3)", "var(--kanvas-line-2)"],
  ok: ["var(--kanvas-info)", "var(--kanvas-info-soft)"],
  warn: ["var(--kanvas-terra-2)", "var(--kanvas-terra-soft)"],
  danger: ["var(--kanvas-danger)", "var(--kanvas-danger-soft)"],
  terra: ["var(--kanvas-terra-2)", "var(--kanvas-terra-soft)"],
  plum: ["var(--kanvas-ink-2)", "var(--kanvas-line-2)"],
  olive: ["var(--kanvas-ink-3)", "var(--kanvas-line-2)"],
}

export function AppPill({ tone = "neutral", soft = true, style, children }: AppPillProps) {
  const [fg, bg] = tones[tone]

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 8px",
        borderRadius: 999,
        background: soft ? bg : fg,
        color: soft ? fg : "#fff",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.2,
        lineHeight: 1.6,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  )
}
