export type FeatureFlagScope = "admin" | "warga"

export const FEATURE_FLAG_REGISTRY = [
  {
    key: "admin.warga",
    scope: "admin",
    label: "Manajemen Warga",
    description: "Tampilkan menu Manajemen Warga di area admin.",
    defaultEnabled: true,
  },
  {
    key: "admin.kategori",
    scope: "admin",
    label: "Kategori Kas",
    description: "Tampilkan menu Kategori Kas di area admin.",
    defaultEnabled: true,
  },
  {
    key: "admin.kas-masuk",
    scope: "admin",
    label: "Kas Masuk",
    description: "Tampilkan menu Kas Masuk di area admin.",
    defaultEnabled: true,
  },
  {
    key: "admin.kas-keluar",
    scope: "admin",
    label: "Kas Keluar",
    description: "Tampilkan menu Kas Keluar di area admin.",
    defaultEnabled: true,
  },
  {
    key: "admin.tunggakan",
    scope: "admin",
    label: "Tunggakan",
    description: "Tampilkan menu Tunggakan di area admin.",
    defaultEnabled: true,
  },
  {
    key: "admin.laporan",
    scope: "admin",
    label: "Laporan Keuangan",
    description: "Tampilkan menu Laporan Keuangan di area admin.",
    defaultEnabled: true,
  },
  {
    key: "admin.log-aktivitas",
    scope: "admin",
    label: "Log Aktivitas",
    description: "Tampilkan menu Log Aktivitas di area admin.",
    defaultEnabled: true,
  },
  {
    key: "admin.event",
    scope: "admin",
    label: "Event/Acara",
    description: "Tampilkan menu Event/Acara di area admin.",
    defaultEnabled: true,
  },
  {
    key: "admin.pengurus",
    scope: "admin",
    label: "Pengurus",
    description: "Tampilkan menu Pengurus di area admin.",
    defaultEnabled: true,
  },
  {
    key: "warga.event",
    scope: "warga",
    label: "Acara",
    description: "Tampilkan menu Acara di portal warga.",
    defaultEnabled: true,
  },
  {
    key: "warga.laporan",
    scope: "warga",
    label: "Laporan",
    description: "Tampilkan menu Laporan di portal warga.",
    defaultEnabled: true,
  },
  {
    key: "warga.riwayat",
    scope: "warga",
    label: "Riwayat",
    description: "Tampilkan menu Riwayat di portal warga.",
    defaultEnabled: true,
  },
] as const

export type FeatureFlagKey = (typeof FEATURE_FLAG_REGISTRY)[number]["key"]
export type FeatureFlagRegistryEntry = (typeof FEATURE_FLAG_REGISTRY)[number]

/** Returns registry entries for requested scope. */
export function getFlagsByScope(scope: FeatureFlagScope): FeatureFlagRegistryEntry[] {
  return FEATURE_FLAG_REGISTRY.filter((flag) => flag.scope === scope)
}

/** Returns registry metadata for given key or null. */
export function getFlagMeta(key: string): FeatureFlagRegistryEntry | null {
  return FEATURE_FLAG_REGISTRY.find((flag) => flag.key === key) ?? null
}
