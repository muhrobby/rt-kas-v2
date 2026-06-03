import { requirePermission } from "@/lib/auth/permissions"
import { generateLaporanPDFBytes } from "@/lib/export/pdf"
import { getLaporanKeuangan } from "@/lib/services/laporan-service"
import { getAppSettings } from "@/lib/services/app-settings-service"
import { getPdfBranding } from "@/lib/branding/format-branding"
import { laporanQuerySchema } from "@/lib/validations/export"
import { rateLimit } from "@/lib/rate-limit/limiter"
import { rateLimitKeys } from "@/lib/rate-limit/keys"
import { writeAuditLog } from "@/lib/services/audit-log-service"
import { headers } from "next/headers"

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]

export async function GET(request: Request) {
  const admin = await requirePermission("laporan.export")

  try {
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || "127.0.0.1"
    const key = rateLimitKeys.exportLaporan(admin.id, ip)

    const result = await rateLimit(key, 10, 10 * 60 * 1000)

    if (!result.success) {
      try {
        await writeAuditLog({
          userId: admin.id,
          modul: "Laporan",
          aksi: "export_pdf",
          keterangan: `Rate limited export laporan PDF. IP: ${ip}`,
        })
      } catch (e) {
        console.error("[AUDIT_LOG_ERROR]", e)
      }

      return Response.json(
        { error: "Terlalu banyak permintaan export. Silakan coba lagi nanti." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        },
      )
    }

    const { searchParams } = new URL(request.url)
    const nowYear = new Date().getFullYear()

    const parsed = laporanQuerySchema.safeParse({
      startMonth: searchParams.get("startMonth") ?? "1",
      startYear: searchParams.get("startYear") ?? String(nowYear),
      endMonth: searchParams.get("endMonth") ?? "12",
      endYear: searchParams.get("endYear") ?? String(nowYear),
      saldoAwal: searchParams.get("saldoAwal") ?? "0",
    })

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message || "Parameter export tidak valid." },
        { status: 400 }
      )
    }

    const resultLaporan = await getLaporanKeuangan(parsed.data)

    const settings = await getAppSettings()
    const branding = getPdfBranding(settings)

    const bytes = generateLaporanPDFBytes({
      rows: resultLaporan.rows,
      totalPemasukan: resultLaporan.totalPemasukan,
      totalPengeluaran: resultLaporan.totalPengeluaran,
      saldoPeriode: resultLaporan.saldoPeriode,
      saldoAwal: parsed.data.saldoAwal,
      periodeLabel: `${MONTH_NAMES[parsed.data.startMonth - 1]} ${parsed.data.startYear} - ${MONTH_NAMES[parsed.data.endMonth - 1]} ${parsed.data.endYear}`,
      branding,
    })

    try {
      await writeAuditLog({
        userId: admin.id,
        modul: "Laporan",
        aksi: "export_pdf",
        keterangan: `Export laporan keuangan PDF periode ${parsed.data.startMonth}/${parsed.data.startYear} s.d ${parsed.data.endMonth}/${parsed.data.endYear}`,
      })
    } catch (e) {
      console.error("[AUDIT_LOG_ERROR]", e)
    }

    return new Response(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="laporan-kas-${parsed.data.startYear}-${parsed.data.endYear}.pdf"`,
      },
    })
  } catch (error) {
    console.error("[EXPORT_LAPORAN_PDF_ERROR]", error)
    return Response.json({ error: "Gagal memproses export laporan." }, { status: 500 })
  }
}
