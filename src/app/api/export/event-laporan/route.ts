import { requirePermission } from "@/lib/auth/permissions"
import { generateFinalReport } from "@/lib/services/laporan-event-service"
import { generateEventExcel } from "@/lib/export/event-excel"
import { getAppSettings } from "@/lib/services/app-settings-service"
import { getPdfBranding } from "@/lib/branding/format-branding"
import { writeAuditLog } from "@/lib/services/audit-log-service"

export async function GET(request: Request) {
  const admin = await requirePermission("event.read")

  try {
    const { searchParams } = new URL(request.url)
    const eventId = Number(searchParams.get("eventId"))
    if (!eventId || isNaN(eventId)) {
      return Response.json({ error: "eventId tidak valid." }, { status: 400 })
    }

    const [report, settings] = await Promise.all([
      generateFinalReport(eventId),
      getAppSettings(),
    ])
    const branding = settings ? getPdfBranding(settings) : undefined
    const buffer = await generateEventExcel(report, branding)

    writeAuditLog({
      userId: admin.id,
      modul: "Export",
      aksi: "export_excel",
      keterangan: `Export Excel laporan event "${report.event.nama}"`,
    })

    const slug = report.event.nama.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    const tanggal = new Date().toISOString().slice(0, 10)

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Laporan-Event-${slug}-${tanggal}.xlsx"`,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal export Excel."
    return Response.json({ error: message }, { status: 500 })
  }
}
