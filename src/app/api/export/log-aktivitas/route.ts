import { requireAdmin } from "@/lib/auth/permissions"
import { createLogAktivitasExcel } from "@/lib/export/excel"
import { listLogAktivitas } from "@/lib/services/log-aktivitas-service"
import { z } from "zod"

const querySchema = z.object({
  modul: z.string().trim().min(1).max(100).optional(),
  aksi: z.string().trim().min(1).max(30).optional(),
  petugas: z.string().trim().min(1).max(120).optional(),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  query: z.string().trim().min(1).max(200).optional(),
})

export async function GET(request: Request) {
  await requireAdmin()

  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse({
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
  })

  const buffer = createLogAktivitasExcel(logs)

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="log-aktivitas.xlsx"`,
    },
  })
}
