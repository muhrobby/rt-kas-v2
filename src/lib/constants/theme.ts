export type KanvasCardStyle = "soft" | "outlined" | "sharp"

export const kanvasTheme = {
  colors: {
    paper: "#eef4ff",
    paper2: "#f6f9ff",
    card: "#ffffff",
    ink: "#10213d",
    ink2: "#1f3b63",
    ink3: "#4d668a",
    ink4: "#7f95b4",
    line: "#d9e5f7",
    line2: "#e8effb",
    terra: "#2d6bb4",
    terra2: "#1f4f8a",
    terraSoft: "#d6e7fb",
  },
  radius: {
    soft: 12,
    outlined: 10,
    sharp: 4,
  },
  shadow: {
    soft: "0 1px 2px rgba(29,22,18,0.04), 0 4px 12px rgba(29,22,18,0.04)",
    outlined: "none",
    sharp: "0 1px 0 rgba(29,22,18,0.06)",
  },
  border: {
    soft: "1px solid #e8effb",
    outlined: "1px solid #d9e5f7",
    sharp: "1px solid #c8daf4",
  },
} as const

export function getKanvasCardTokens(cardStyle: KanvasCardStyle = "soft") {
  return {
    radius: kanvasTheme.radius[cardStyle],
    shadow: kanvasTheme.shadow[cardStyle],
    border: kanvasTheme.border[cardStyle],
  }
}
