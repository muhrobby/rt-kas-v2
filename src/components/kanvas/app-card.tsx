import type { CSSProperties, PropsWithChildren } from "react"

import { cn } from "@/lib/utils"
import { getKanvasCardTokens, type KanvasCardStyle, kanvasTheme } from "@/lib/constants/theme"

interface AppCardProps extends PropsWithChildren {
  className?: string
  style?: CSSProperties
  cardStyle?: KanvasCardStyle
}

export function AppCard({ children, className, style, cardStyle = "soft" }: AppCardProps) {
  const tokens = getKanvasCardTokens(cardStyle)

  return (
    <div
      className={cn("rounded-xl", className)}
      style={{
        background: kanvasTheme.colors.card,
        borderRadius: tokens.radius,
        boxShadow: tokens.shadow,
        border: tokens.border,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
