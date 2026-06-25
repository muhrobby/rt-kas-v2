import type { Permission } from "@/lib/constants/admin-roles";
import type { FeatureFlagKey } from "@/lib/constants/feature-flags";

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
  | "eye"
  | "more"

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
  featureKey?: FeatureFlagKey
}

export interface WargaNavItem {
  id: string
  label: string
  href: string
  icon: WargaIconName
  featureKey?: FeatureFlagKey
}

export const adminNavItems: AdminNavItem[] = [
  { id: "dashboard",      label: "Beranda",           href: "/admin/dashboard",      icon: "home",   permission: "dashboard.read" },
  { id: "warga",          label: "Manajemen Warga",   href: "/admin/warga",          icon: "users",  permission: "warga.read",           featureKey: "admin.warga" },
  { id: "kategori",       label: "Kategori Kas",      href: "/admin/kategori",       icon: "doc",    permission: "kategori.read",        featureKey: "admin.kategori" },
  { id: "kas-masuk",      label: "Kas Masuk",         href: "/admin/kas-masuk",      icon: "in",     permission: "kas_masuk.read",       featureKey: "admin.kas-masuk" },
  { id: "kas-keluar",     label: "Kas Keluar",        href: "/admin/kas-keluar",     icon: "out",    permission: "kas_keluar.read",      featureKey: "admin.kas-keluar" },
  { id: "tunggakan",      label: "Tunggakan",         href: "/admin/tunggakan",      icon: "alert",  permission: "tunggakan.read",       featureKey: "admin.tunggakan" },
  { id: "laporan",        label: "Laporan Keuangan",  href: "/admin/laporan",        icon: "doc",    permission: "laporan.read",         featureKey: "admin.laporan" },
  { id: "event",          label: "Event/Acara",       href: "/admin/event",          icon: "calendar", permission: "event.read",       featureKey: "admin.event" },
  { id: "log-aktivitas",  label: "Log Aktivitas",     href: "/admin/log-aktivitas",  icon: "log",    permission: "log.read",             featureKey: "admin.log-aktivitas" },
  { id: "settings",       label: "Pengaturan",        href: "/admin/settings",       icon: "gear",   permission: "settings.read" },
  { id: "feature-flags",  label: "Feature Flags",     href: "/admin/settings/feature-flags",  icon: "eye",    permission: "feature_flags.read" },
  { id: "super-admins",   label: "Manajemen SA",      href: "/admin/settings/super-admins",   icon: "more",   permission: "super_admin.manage" },
  { id: "pengurus",       label: "Pengurus",          href: "/admin/pengurus",       icon: "shield", permission: "pengurus.manage",      featureKey: "admin.pengurus" },
]

export const wargaNavItems: WargaNavItem[] = [
  { id: "dashboard", label: "Beranda",  href: "/warga/dashboard", icon: "home" },
  { id: "riwayat",   label: "Riwayat", href: "/warga/riwayat",   icon: "receipt", featureKey: "warga.riwayat" },
  { id: "laporan",   label: "Laporan", href: "/warga/laporan",   icon: "doc",     featureKey: "warga.laporan" },
  { id: "event",     label: "Acara",   href: "/warga/event",     icon: "calendar", featureKey: "warga.event" },
]
