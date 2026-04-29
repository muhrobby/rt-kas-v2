import type { MockAuthRole } from "@/features/auth/types"

export function getMockRedirectPathByRole(role: MockAuthRole): string {
  return role === "admin" ? "/admin/dashboard" : "/warga/dashboard"
}
