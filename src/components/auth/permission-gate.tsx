import type { ReactNode } from "react"

import { getCurrentUser } from "@/lib/auth/session"
import { hasAdminPermission } from "@/lib/auth/permissions"
import type { Permission } from "@/lib/constants/admin-roles"

interface PermissionGateProps {
  /**
   * Permission yang dibutuhkan untuk menampilkan children.
   * Bisa single permission atau array (any match = tampil).
   */
  permission: Permission | Permission[]
  /** Konten yang ditampilkan jika user memiliki permission. */
  children: ReactNode
  /** Konten fallback jika user tidak memiliki permission. Default: null (tidak render apa-apa). */
  fallback?: ReactNode
}

/**
 * Server Component untuk menyembunyikan UI berdasarkan permission admin.
 *
 * PENTING: Ini HANYA untuk UX — bukan boundary keamanan.
 * Backend guard (requirePermission) tetap wajib di server action/API route.
 *
 * Contoh penggunaan:
 * ```tsx
 * <PermissionGate permission="warga.write">
 *   <AddWargaButton />
 * </PermissionGate>
 * ```
 */
export async function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return <>{fallback}</>

  const permissions = Array.isArray(permission) ? permission : [permission]
  const hasAccess = permissions.some((p) => hasAdminPermission(currentUser, p))

  if (!hasAccess) return <>{fallback}</>
  return <>{children}</>
}
