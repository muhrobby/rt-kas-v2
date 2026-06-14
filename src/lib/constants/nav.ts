import type { Permission } from "@/lib/constants/admin-roles";

export type AdminIconName =
  | "home"
  | "users"
  | "doc"
  | "in"
  | "out"
  | "alert"
  | "log"
  | "gear"
  | "shield"
  | "calendar"

export type WargaIconName = "home" | "receipt" | "doc" | "calendar"

export interface AdminNavItem {
  id: string
  label: string
  href: string
  icon: AdminIconName
  /**
   * Permission yang dibutuhkan untuk menampilkan menu ini.
   * Filtering aktual dilakukan di TASK-006.
   * Saat ini hanya metadata — belum mempengaruhi rendering.
   */
  permission: Permission
}

export interface WargaNavItem {
  id: string
  label: string
  href: string
  icon: WargaIconName
}

export const adminNavItems: AdminNavItem[] = [
  { id: "dashboard",      label: "Beranda",           href: "/admin/dashboard",      icon: "home",   permission: "dashboard.read" },
  { id: "warga",          label: "Manajemen Warga",   href: "/admin/warga",          icon: "users",  permission: "warga.read" },
  { id: "kategori",       label: "Kategori Kas",      href: "/admin/kategori",       icon: "doc",    permission: "kategori.read" },
  { id: "kas-masuk",      label: "Kas Masuk",         href: "/admin/kas-masuk",      icon: "in",     permission: "kas_masuk.read" },
  { id: "kas-keluar",     label: "Kas Keluar",        href: "/admin/kas-keluar",     icon: "out",    permission: "kas_keluar.read" },
  { id: "tunggakan",      label: "Tunggakan",         href: "/admin/tunggakan",      icon: "alert",  permission: "tunggakan.read" },
  { id: "laporan",        label: "Laporan Keuangan",  href: "/admin/laporan",        icon: "doc",    permission: "laporan.read" },
  // { id: "event",          label: "Event/Acara",       href: "/admin/event",          icon: "calendar", permission: "event.read" },
  { id: "log-aktivitas",  label: "Log Aktivitas",     href: "/admin/log-aktivitas",  icon: "log",    permission: "log.read" },
  { id: "settings",       label: "Pengaturan",        href: "/admin/settings",       icon: "gear",   permission: "settings.read" },
  { id: "pengurus",       label: "Pengurus",          href: "/admin/pengurus",       icon: "shield", permission: "pengurus.manage" },
]

export const wargaNavItems: WargaNavItem[] = [
  { id: "dashboard", label: "Beranda",  href: "/warga/dashboard", icon: "home" },
  { id: "riwayat",   label: "Riwayat", href: "/warga/riwayat",   icon: "receipt" },
  { id: "laporan",   label: "Laporan", href: "/warga/laporan",   icon: "doc" },
  { id: "event",     label: "Acara",   href: "/warga/event",     icon: "calendar" },
]
