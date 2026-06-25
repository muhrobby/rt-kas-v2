import { notFound } from "next/navigation"

import { requirePermission, requireFeatureEnabled } from "@/lib/auth/permissions"
import { getAdminRoleFresh } from "@/lib/auth/session"
import { getPermissions } from "@/lib/auth/permission-matrix"
import { getEventById, listEvents } from "@/lib/services/event-service"
import { getSaldoEvent } from "@/lib/services/saldo-event-service"
import { listSumbanganByEvent } from "@/lib/services/sumbangan-event-service"
import { listPengeluaranByEvent } from "@/lib/services/pengeluaran-event-service"
import { listPanitiaByEvent } from "@/lib/services/event-panitia-service"
import { generateFinalReport } from "@/lib/services/laporan-event-service"
import { EventDetailView } from "@/features/event-acara/components/event-detail-view"
import type { Permission } from "@/lib/constants/admin-roles"
import type { LaporanFinalEvent } from "@/lib/services/laporan-event-service"

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const admin =   await requirePermission("event.read")
  await requireFeatureEnabled("admin.event")
  const { id: idStr } = await params
  const id = Number(idStr)
  if (!id || isNaN(id)) notFound()

  const ev = await getEventById(id)
  if (!ev) notFound()

  const adminRole = await getAdminRoleFresh(admin.id)
  const permSet = getPermissions(adminRole)
  const permissions = [...permSet] as Permission[]

  const [saldo, sumbanganList, pengeluaranList, panitiaList, activeEventsAll] = await Promise.all([
    getSaldoEvent(id),
    listSumbanganByEvent(id),
    listPengeluaranByEvent(id),
    listPanitiaByEvent(id),
    listEvents({ status: "AKTIF" }),
  ])

  // Exclude the current event from the cancel target list
  const activeEvents = activeEventsAll
    .filter((e) => e.id !== id)
    .map((e) => ({ id: e.id, nama: e.nama }))

  let laporanData: LaporanFinalEvent | undefined
  if (ev.status === "SELESAI") {
    try {
      laporanData = await generateFinalReport(id)
    } catch {
      // laporan not available, show empty state
    }
  }

  return (
    <EventDetailView
      event={{
        id: ev.id,
        nama: ev.nama,
        tanggalPelaksanaan: typeof ev.tanggalPelaksanaan === "string" ? ev.tanggalPelaksanaan : String(ev.tanggalPelaksanaan),
        deskripsi: ev.deskripsi,
        status: ev.status,
      }}
      saldo={saldo}
      sumbanganList={sumbanganList}
      pengeluaranList={pengeluaranList}
      panitiaList={panitiaList}
      permissions={permissions}
      laporanData={laporanData}
      activeEvents={activeEvents}
    />
  )
}
