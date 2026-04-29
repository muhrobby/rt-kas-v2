import type { SVGProps } from "react"

export interface KanvasIconProps extends Omit<SVGProps<SVGSVGElement>, "width" | "height"> {
  size?: number
  strokeWidth?: number
}

function IconPath({ path, size = 16, strokeWidth = 1.5, ...props }: KanvasIconProps & { path: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={path} />
    </svg>
  )
}

export const KanvasIcons = {
  home: (props: KanvasIconProps) => <IconPath {...props} path="M3 11.5L12 4l9 7.5M5 10v10h14V10" />,
  users: (props: KanvasIconProps) => (
    <IconPath
      {...props}
      path="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
    />
  ),
  in: (props: KanvasIconProps) => <IconPath {...props} path="M12 5v14M5 12l7 7 7-7" />,
  out: (props: KanvasIconProps) => <IconPath {...props} path="M12 19V5M19 12l-7-7-7 7" />,
  alert: (props: KanvasIconProps) => (
    <IconPath {...props} path="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0M12 9v4M12 17h.01" />
  ),
  doc: (props: KanvasIconProps) => <IconPath {...props} path="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h6" />,
  log: (props: KanvasIconProps) => <IconPath {...props} path="M3 6h18M3 12h18M3 18h12" />,
  search: (props: KanvasIconProps) => <IconPath {...props} path="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16M21 21l-4.3-4.3" />,
  plus: (props: KanvasIconProps) => <IconPath {...props} path="M12 5v14M5 12h14" />,
  filter: (props: KanvasIconProps) => <IconPath {...props} path="M22 3H2l8 9.46V19l4 2v-8.54z" />,
  download: (props: KanvasIconProps) => <IconPath {...props} path="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
  print: (props: KanvasIconProps) => <IconPath {...props} path="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />,
  chevronR: (props: KanvasIconProps) => <IconPath {...props} path="M9 6l6 6-6 6" />,
  chevronL: (props: KanvasIconProps) => <IconPath {...props} path="M15 6l-6 6 6 6" />,
  chevronD: (props: KanvasIconProps) => <IconPath {...props} path="M6 9l6 6 6-6" />,
  chevronU: (props: KanvasIconProps) => <IconPath {...props} path="M6 15l6-6 6 6" />,
  edit: (props: KanvasIconProps) => <IconPath {...props} path="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />,
  trash: (props: KanvasIconProps) => <IconPath {...props} path="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />,
  whatsapp: (props: KanvasIconProps) => <IconPath {...props} path="M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 21l2.3-5.4A8.5 8.5 0 1 1 21 11.5z" />,
  check: (props: KanvasIconProps) => <IconPath {...props} path="M20 6 9 17l-5-5" />,
  x: (props: KanvasIconProps) => <IconPath {...props} path="M18 6 6 18M6 6l12 12" />,
  bell: (props: KanvasIconProps) => <IconPath {...props} path="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />,
  menu: (props: KanvasIconProps) => <IconPath {...props} path="M3 6h18M3 12h18M3 18h18" />,
  wallet: (props: KanvasIconProps) => <IconPath {...props} path="M21 12V7H5a2 2 0 1 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M16 12h5v4h-5a2 2 0 1 1 0-4z" />,
  receipt: (props: KanvasIconProps) => <IconPath {...props} path="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2zM8 7h8M8 11h8M8 15h5" />,
  calendar: (props: KanvasIconProps) => <IconPath {...props} path="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18" />,
  shield: (props: KanvasIconProps) => <IconPath {...props} path="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  arrowR: (props: KanvasIconProps) => <IconPath {...props} path="M5 12h14M13 5l7 7-7 7" />,
  more: (props: KanvasIconProps) => <IconPath {...props} strokeWidth={2.5} path="M5 12h.01M12 12h.01M19 12h.01" />,
  logout: (props: KanvasIconProps) => <IconPath {...props} path="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
}
