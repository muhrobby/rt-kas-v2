import type { AdminRole } from "@/lib/constants/admin-roles"

export interface PengurusItem {
  userId: string
  name: string
  blokRumah: string
  noTelp: string
  adminRole: AdminRole | null
  adminRoleLabel: string
}
