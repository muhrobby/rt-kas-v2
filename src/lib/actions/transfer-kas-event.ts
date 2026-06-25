"use server"

import { revalidatePath } from "next/cache"

import { requirePermission } from "@/lib/auth/permissions"
import { db } from "@/lib/db"
import { getEventById } from "@/lib/services/event-service"
import { writeAuditLogStrict } from "@/lib/services/audit-log-service"
import { taruhDiKas } from "@/lib/services/transfer-kas-event-service"

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export async function taruhDiKasAction(
  input: { eventId: number },
): Promise<ActionResult<{ nominal: number; transaksiId: number }>> {
  const admin = await requirePermission("event.transfer")

  try {
    const ev = await getEventById(input.eventId)
    if (!ev) return { ok: false, error: "Event tidak ditemukan." }

    let result: { transaksiPemasukanId: number; pengeluaranSistemId: number; nominal: number }

    await db.transaction(async (tx) => {
      result = await taruhDiKas(tx, {
        eventId: input.eventId,
        eventNama: ev.nama,
        byUserId: admin.id,
      })
    })

    await writeAuditLogStrict({
      userId: admin.id,
      modul: "Event Acara",
      aksi: "transfer",
      keterangan: `Transfer sisa dana Rp ${result!.nominal.toLocaleString("id-ID")} event "${ev.nama}" ke Kas RT`,
    })

    revalidatePath(`/admin/event/${input.eventId}`)
    revalidatePath("/admin/kas-masuk")
    revalidatePath("/admin/dashboard")

    return { ok: true, data: { nominal: result!.nominal, transaksiId: result!.transaksiPemasukanId } }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Terjadi kesalahan server." }
  }
}
