import { redirect } from "next/navigation"
import { and, desc, eq } from "drizzle-orm"

import { getCurrentUser } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { event, eventPanitia } from "@/lib/db/schema"
import { PanitiaEventListView } from "@/features/panitia-event/components/panitia-event-list-view"

export default async function PanitiaEventListPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const rawRows = await db
    .select({
      id: event.id,
      nama: event.nama,
      tanggalPelaksanaan: event.tanggalPelaksanaan,
      status: event.status,
    })
    .from(eventPanitia)
    .innerJoin(event, eq(eventPanitia.eventId, event.id))
    .where(and(eq(eventPanitia.userId, user.id), eq(eventPanitia.isActive, true)))
    .orderBy(desc(event.tanggalPelaksanaan))

  const rows = rawRows.map((r) => ({
    ...r,
    tanggalPelaksanaan: typeof r.tanggalPelaksanaan === "string"
      ? r.tanggalPelaksanaan
      : String(r.tanggalPelaksanaan),
  }))

  return <PanitiaEventListView rows={rows} />
}
