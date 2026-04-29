import type { PropsWithChildren, ReactNode } from "react"

interface AppFieldProps extends PropsWithChildren {
  label: string
  hint?: ReactNode
  optional?: boolean
}

export function AppField({ label, hint, optional, children }: AppFieldProps) {
  return (
    <label className="mb-3 block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[11.5px] font-semibold tracking-[0.4px] text-kanvas-ink-2 uppercase">{label}</span>
        {optional ? <span className="text-[10.5px] text-kanvas-ink-4">opsional</span> : null}
      </div>
      {children}
      {hint ? <div className="mt-1 text-[11px] text-kanvas-ink-4">{hint}</div> : null}
    </label>
  )
}
