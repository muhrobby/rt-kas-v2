import { requireAdmin } from "@/lib/auth/permissions"
import { createLaporanExcel } from "@/lib/export/excel"
import { getLaporanKeuangan } from "@/lib/services/laporan-service"
import { laporanQuerySchema } from "@/lib/validations/export"
import { rateLimit } from "@/lib/rate-limit/limiter"
import { rateLimitKeys } from "@/lib/rate-limit/keys"
import { writeAuditLog } from "@/lib/services/audit-log-service"
import { headers } from "next/headers"

export async function GET(request: Request) {
  const admin = await requireAdmin()

  try {
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || "127.0.0.1"
    const key = rateLimitKeys.exportLaporan(admin.id, ip)
    
    // Allow 10 exports per 10 minutes
    const result = await rateLimit(key, 10, 10 * 60 * 1000)
    
    if (!result.success) {
      // Optional: log abuse attempt silently without failing the request flow early
      try {
        await writeAuditLog({
          userId: admin.id,
          modul: "Laporan",
          aksi: "export_excel",
          keterangan: `Rate limited export laporan keuangan. IP: ${ip}`,
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
          }
        }
      )
    }

    const { searchParams } = new URL(request.url)
    const nowYear = new Date().getFullYear()
    
    const parsed = laporanQuerySchema.safeParse({
      startMonth: searchParams.get("startMonth") ?? "0",
      startYear: searchParams.get("startYear") ?? String(nowYear),
      endMonth: searchParams.get("endMonth") ?? "11",
      endYear: searchParams.get("endYear") ?? String(nowYear),
      saldoAwal: searchParams.get("saldoAwal") ?? "0",
    })

    if (!parsed.success) {
      return Response.json({ 
        error: parsed.error.issues[0]?.message || "Parameter export laporan tidak valid." 
      }, { status: 400 })
    }

    const resultLaporan = await getLaporanKeuangan(parsed.data)

    const buffer = await createLaporanExcel(resultLaporan.rows, {
      totalPemasukan: resultLaporan.totalPemasukan,
      totalPengeluaran: resultLaporan.totalPengeluaran,
      saldoPeriode: resultLaporan.saldoPeriode,
    })

    // Write audit log on success
    try {
      await writeAuditLog({
        userId: admin.id,
        modul: "Laporan",
        aksi: "export_excel",
        keterangan: `Export laporan keuangan Excel periode ${parsed.data.startMonth + 1}/${parsed.data.startYear} s.d ${parsed.data.endMonth + 1}/${parsed.data.endYear}`,
      })
    } catch (e) {
      console.error("[AUDIT_LOG_ERROR]", e)
    }

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="laporan.xlsx"',
      },
    })
  } catch (error) {
    console.error("[EXPORT_LAPORAN_ERROR]", error)
    return Response.json({ error: "Gagal memproses export laporan." }, { status: 500 })
  }
}
