"use client"

import { useTransition } from "react"

import { useToast } from "@/components/kanvas"
import { toggleFeatureFlagAction } from "@/lib/actions/feature-flags"
import type { FeatureFlagRowData } from "@/features/feature-flags/lib/feature-flags-data"

interface FeatureFlagToggleRowProps {
  flag: FeatureFlagRowData
}

export function FeatureFlagToggleRow({ flag }: FeatureFlagToggleRowProps) {
  const { pushToast } = useToast()
  const [pending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleFeatureFlagAction({ key: flag.key, enabled: !flag.enabled })
      if (!result.ok) {
        pushToast(result.error || "Gagal mengubah status flag")
      } else {
        pushToast(`${flag.label}: ${result.data.enabled ? "Aktif" : "Nonaktif"}`)
      }
    })
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-kanvas-line bg-white px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-kanvas-ink">{flag.label}</p>
        <p className="text-[11px] text-kanvas-ink-4">{flag.key}</p>
        {flag.description ? (
          <p className="mt-0.5 text-[11px] text-kanvas-ink-3">{flag.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={handleToggle}
        className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        style={{ backgroundColor: flag.enabled ? "var(--kanvas-terra)" : "var(--kanvas-ink-4)" }}
        aria-label={`Toggle ${flag.label}`}
      >
        <span
          className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
          style={{ transform: flag.enabled ? "translateX(18px)" : "translateX(2px)" }}
        />
      </button>
    </div>
  )
}
