import type { InputHTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

interface AppInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  leading?: ReactNode
  value?: string
  onChange?: (value: string) => void
}

export function AppInput({ className, leading, value, onChange, ...props }: AppInputProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-2 rounded-lg border border-[var(--kanvas-line)] bg-white px-3 py-2.5 focus-within:border-[var(--kanvas-terra)] focus-within:ring-2 focus-within:ring-[var(--kanvas-terra-soft)]",
        className,
      )}
    >
      {leading ? <span className="text-[var(--kanvas-ink-4)]">{leading}</span> : null}
      <input
        value={value ?? ""}
        onChange={(event) => onChange?.(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-[13px] text-[var(--kanvas-ink)] outline-none"
        {...props}
      />
    </div>
  )
}
