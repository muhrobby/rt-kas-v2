export type AdminIconName =
  | "home"
  | "users"
  | "doc"
  | "in"
  | "out"
  | "alert"
  | "log"

export type WargaIconName = "home" | "receipt" | "doc"

export interface AdminNavItem {
  id: string
  label: string
  href: string
  icon: AdminIconName
}

export interface WargaNavItem {
  id: string
  label: string
  href: string
  icon: WargaIconName
}

export const adminNavItems: AdminNavItem[] = [
  { id: "dashboard", label: "Beranda", href: "/admin/dashboard", icon: "home" },
  { id: "warga", label: "Manajemen Warga", href: "/admin/warga", icon: "users" },
  { id: "kategori", label: "Kategori Kas", href: "/admin/kategori", icon: "doc" },
  { id: "kas-masuk", label: "Kas Masuk", href: "/admin/kas-masuk", icon: "in" },
  { id: "kas-keluar", label: "Kas Keluar", href: "/admin/kas-keluar", icon: "out" },
  { id: "tunggakan", label: "Tunggakan", href: "/admin/tunggakan", icon: "alert" },
  { id: "laporan", label: "Laporan Keuangan", href: "/admin/laporan", icon: "doc" },
  { id: "log-aktivitas", label: "Log Aktivitas", href: "/admin/log-aktivitas", icon: "log" },
]

export const wargaNavItems: WargaNavItem[] = [
  { id: "dashboard", label: "Beranda", href: "/warga/dashboard", icon: "home" },
  { id: "riwayat", label: "Riwayat", href: "/warga/riwayat", icon: "receipt" },
  { id: "laporan", label: "Laporan", href: "/warga/laporan", icon: "doc" },
]
