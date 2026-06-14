import { notFound, redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/auth/session"
import { getEventById } from "@/lib/services/event-service"
import { getSaldoEvent } from "@/lib/services/saldo-event-service"
import { listPengeluaranByEvent } from "@/lib/services/pengeluaran-event-service"
import { isPanitiaAktif } from "@/lib/services/event-panitia-service"
import { EventDetailPanitiaView } from "@/features/event-acara/components/event-detail-panitia-view"

export default async function PanitiaEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const { id: idStr } = await params
  const id = Number(idStr)
  if (!id || isNaN(id)) notFound()

  // Verify user is active panitia for this event
  const isActive = await isPanitiaAktif(user.id, id)
  if (!isActive) notFound()

  const ev = await getEventById(id)
  if (!ev) notFound()

  const [saldo, pengeluaranList] = await Promise.all([
    getSaldoEvent(id),
    listPengeluaranByEvent(id),
  ])

  return (
    <EventDetailPanitiaView
      event={{
        id: ev.id,
        nama: ev.nama,
        tanggalPelaksanaan: typeof ev.tanggalPelaksanaan === "string" ? ev.tanggalPelaksanaan : String(ev.tanggalPelaksanaan),
        status: ev.status,
      }}
      saldo={saldo}
      pengeluaranList={pengeluaranList}
    />
  )
}
