import { requirePermission } from "@/lib/auth/permissions"
import { getAdminRoleFresh } from "@/lib/auth/session"
import { createLogAktivitasExcel } from "@/lib/export/excel"
import { listLogAktivitas } from "@/lib/services/log-aktivitas-service"
import { logAktivitasQuerySchema, EXPORT_LIMITS } from "@/lib/validations/export"
import { rateLimit } from "@/lib/rate-limit/limiter"
import { rateLimitKeys } from "@/lib/rate-limit/keys"
import { writeAuditLog } from "@/lib/services/audit-log-service"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { headers } from "next/headers"

export async function GET(request: Request) {
  const admin = await requirePermission("log.export")

  const adminRole = await getAdminRoleFresh(admin.id)
  let excludeUserIds: string[] | undefined
  if (adminRole !== "super_admin") {
    const superAdminRows = await db
      .select({ id: user.id })
      .from(user)
      .where(and(eq(user.role, "admin"), eq(user.adminRole, "super_admin")))
    excludeUserIds = superAdminRows.map((r) => r.id)
  }

  try {
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || "127.0.0.1"
    const key = rateLimitKeys.exportLogAktivitas(admin.id, ip)
    
    // Allow 10 exports per 10 minutes
    const result = await rateLimit(key, 10, 10 * 60 * 1000)
    
    if (!result.success) {
      // Optional: log abuse attempt silently without failing the request flow early
      try {
        await writeAuditLog({
          userId: admin.id,
          modul: "Log Aktivitas",
          aksi: "export_excel",
          keterangan: `Rate limited export log aktivitas. IP: ${ip}`,
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
    const parsed = logAktivitasQuerySchema.safeParse({
      modul: searchParams.get("modul") ?? undefined,
      aksi: searchParams.get("aksi") ?? undefined,
      petugas: searchParams.get("petugas") ?? undefined,
      tanggal: searchParams.get("tanggal") ?? undefined,
      query: searchParams.get("query") ?? undefined,
    })

    if (!parsed.success) {
      return Response.json({ error: "Parameter export log tidak valid." }, { status: 400 })
    }

    const logs = await listLogAktivitas({
      modul: parsed.data.modul,
      aksi: parsed.data.aksi,
      petugas: parsed.data.petugas,
      tanggal: parsed.data.tanggal,
      query: parsed.data.query,
      limit: EXPORT_LIMITS.MAX_LOG_ROWS,
      excludeUserIds,
    })

    if (logs.length === 0) {
      return Response.json({ error: "Tidak ada data log untuk diexport." }, { status: 404 })
    }

    const buffer = await createLogAktivitasExcel(logs)

    // Write audit log on success
    try {
      const filters = Object.entries(parsed.data).filter(([key, v]) => v && key).map(([k, v]) => `${k}:${v}`).join(", ")
      await writeAuditLog({
        userId: admin.id,
        modul: "Log Aktivitas",
        aksi: "export_excel",
        keterangan: `Export log aktivitas Excel${filters ? ` (Filters: ${filters})` : ''}`,
      })
    } catch (e) {
      console.error("[AUDIT_LOG_ERROR]", e)
    }

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="log-aktivitas.xlsx"`,
      },
    })
  } catch (error) {
    console.error("[EXPORT_LOG_ERROR]", error)
    return Response.json({ error: "Gagal memproses export log aktivitas." }, { status: 500 })
  }
}
