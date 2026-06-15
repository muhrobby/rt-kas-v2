import { FeatureFlagToggleRow } from "@/features/feature-flags/components/feature-flag-toggle-row"
import type { FeatureFlagRowData } from "@/features/feature-flags/lib/feature-flags-data"

interface FeatureFlagToggleListProps {
  flags: FeatureFlagRowData[]
}

export function FeatureFlagToggleList({ flags }: FeatureFlagToggleListProps) {
  const adminFlags = flags.filter((f) => f.scope === "admin")
  const wargaFlags = flags.filter((f) => f.scope === "warga")

  return (
    <div className="space-y-5">
      <section>
        <h2 className="mb-2.5 text-[15px] font-semibold text-kanvas-ink">Menu Admin</h2>
        <div className="space-y-2">
          {adminFlags.map((flag) => (
            <FeatureFlagToggleRow key={flag.key} flag={flag} />
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-2.5 text-[15px] font-semibold text-kanvas-ink">Menu Warga</h2>
        <div className="space-y-2">
          {wargaFlags.map((flag) => (
            <FeatureFlagToggleRow key={flag.key} flag={flag} />
          ))}
        </div>
      </section>
    </div>
  )
}
