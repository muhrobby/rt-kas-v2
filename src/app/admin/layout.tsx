import type { PropsWithChildren } from "react"

import { getCurrentUser } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { warga } from "@/lib/db/schema"
import { AdminShell } from "@/components/layout/admin-shell"
import { eq } from "drizzle-orm"

export default async function AdminLayout({ children }: PropsWithChildren) {
  const currentUser = await getCurrentUser()

  let wargaData = null
  if (currentUser?.wargaId) {
    const [wargaRow] = await db
      .select()
      .from(warga)
      .where(eq(warga.id, currentUser.wargaId))
      .limit(1)
    wargaData = wargaRow
  }

  const userDisplay = {
    name: wargaData?.namaKepalaKeluarga ?? currentUser?.name ?? "User",
    initials: getInitials(wargaData?.namaKepalaKeluarga ?? currentUser?.name ?? "U"),
    role: wargaData?.rolePengurus ?? currentUser?.role ?? "Admin",
    wargaId: currentUser?.wargaId ?? null,
  }

  return <AdminShell user={userDisplay}>{children}</AdminShell>
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
