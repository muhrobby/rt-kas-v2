interface StatusDotProps {
  tone?: "ok" | "warn" | "danger" | "neutral" | "terra"
  size?: number
}

const colors = {
  ok: "var(--kanvas-info)",
  warn: "var(--kanvas-terra-2)",
  danger: "var(--kanvas-danger)",
  neutral: "var(--kanvas-ink-4)",
  terra: "var(--kanvas-terra)",
} as const

export function StatusDot({ tone = "neutral", size = 8 }: StatusDotProps) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: 999,
        background: colors[tone],
      }}
    />
  )
}
