import { requireAdmin } from "@/lib/auth/permissions"
import { createLaporanExcel } from "@/lib/export/excel"
import { getLaporanKeuangan } from "@/lib/services/laporan-service"
import { z } from "zod"

const querySchema = z.object({
  startMonth: z.coerce.number().int().min(0).max(11).default(0),
  startYear: z.coerce.number().int().min(2000).max(2100),
  endMonth: z.coerce.number().int().min(0).max(11).default(11),
  endYear: z.coerce.number().int().min(2000).max(2100),
  saldoAwal: z.coerce.number().min(0).default(0),
})

export async function GET(request: Request) {
  await requireAdmin()

  try {
    const { searchParams } = new URL(request.url)
    const nowYear = new Date().getFullYear()
    const parsed = querySchema.parse({
      startMonth: searchParams.get("startMonth") ?? "0",
      startYear: searchParams.get("startYear") ?? String(nowYear),
      endMonth: searchParams.get("endMonth") ?? "11",
      endYear: searchParams.get("endYear") ?? String(nowYear),
      saldoAwal: searchParams.get("saldoAwal") ?? "0",
    })

    const result = await getLaporanKeuangan(parsed)

    const buffer = createLaporanExcel(result.rows, {
      totalPemasukan: result.totalPemasukan,
      totalPengeluaran: result.totalPengeluaran,
      saldoPeriode: result.saldoPeriode,
    })

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="laporan.xlsx"',
      },
    })
  } catch {
    return Response.json({ error: "Parameter export laporan tidak valid." }, { status: 400 })
  }
}
