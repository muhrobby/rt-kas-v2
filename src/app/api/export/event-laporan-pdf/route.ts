import { requirePermission } from "@/lib/auth/permissions"
import { generateFinalReport } from "@/lib/services/laporan-event-service"
import { generateEventPDFBytes } from "@/lib/export/event-pdf"
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
    const pdfBytes = generateEventPDFBytes(report, branding)

    writeAuditLog({
      userId: admin.id,
      modul: "Export",
      aksi: "export_pdf",
      keterangan: `Export PDF laporan event "${report.event.nama}"`,
    })

    const slug = report.event.nama.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    const tanggal = new Date().toISOString().slice(0, 10)

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Laporan-Event-${slug}-${tanggal}.pdf"`,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal export PDF."
    return Response.json({ error: message }, { status: 500 })
  }
}
