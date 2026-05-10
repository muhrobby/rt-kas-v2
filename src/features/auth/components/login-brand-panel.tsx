import type { AppBranding } from "@/lib/branding/format-branding"

interface LoginBrandPanelProps {
  branding: AppBranding
}

export function LoginBrandPanel({ branding }: LoginBrandPanelProps) {
  const brandInitial = branding.appName.trim().charAt(0).toUpperCase() || "K"

  return (
    <section className="relative hidden min-h-svh overflow-hidden bg-[linear-gradient(160deg,var(--kanvas-terra)_0%,var(--kanvas-terra-2)_60%,#173968_100%)] text-kanvas-paper-2 lg:flex lg:flex-col lg:justify-between lg:p-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle at 20% 80%, #fff 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/15 font-serif text-2xl">{brandInitial}</div>
          <div>
            <p className="text-2xl leading-none">{branding.appName}</p>
            <p className="mt-1 text-[10.5px] tracking-[1.5px] uppercase opacity-80">{branding.organizationName}</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <h2 className="max-w-xl text-5xl leading-[1.05] italic">{branding.rtRwLabel}</h2>
        <p className="mt-5 max-w-md text-sm leading-relaxed opacity-90">
          Pengelolaan iuran, pengeluaran, dan transparansi kas RT - dirancang untuk pengurus dan warga.
        </p>
      </div>

      <div className="relative flex items-center gap-5 text-xs opacity-70">
        <span>{branding.rtRwLabel}</span>
        <span>-</span>
        <span>{branding.address || branding.organizationName}</span>
        <span>-</span>
        <span>v0.0.1</span>
      </div>
    </section>
  )
}
