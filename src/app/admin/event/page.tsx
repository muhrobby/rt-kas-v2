import { requirePermission, hasAdminPermission } from "@/lib/auth/permissions"
import { listEvents } from "@/lib/services/event-service"
import { EventListView } from "@/features/event-acara/components/event-list-view"

export default async function AdminEventPage() {
  const admin = await requirePermission("event.read")
  const events = await listEvents()
  const canWrite = hasAdminPermission(admin, "event.write")

  return (
    <main className="space-y-3.5 p-4 md:p-6 lg:p-7">
      <section>
        <h1 className="text-[24px] text-kanvas-ink">Event / Acara</h1>
        <p className="text-[12px] text-kanvas-ink-3">Kelola acara RT, panitia, sumbangan, dan pengeluaran.</p>
      </section>
      <EventListView events={events} canWrite={canWrite} />
    </main>
  )
}
