"use server"

import { revalidatePath } from "next/cache"
import { ZodError } from "zod"

import { requirePermission } from "@/lib/auth/permissions"
import { db } from "@/lib/db"
import { writeAuditLog, writeAuditLogStrict } from "@/lib/services/audit-log-service"
import { getEventById } from "@/lib/services/event-service"
import { createSumbangan, createBulkSumbanganMandiri } from "@/lib/services/sumbangan-event-service"
import { createTalanganTransaksi } from "@/lib/services/transfer-kas-event-service"
import {
  createSumbanganSchema,
  createBulkSumbanganSchema,
  type CreateSumbanganInput,
  type CreateBulkSumbanganInput,
} from "@/lib/validations/sumbangan-event"

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    return { ok: false, error: "Input tidak valid.", fieldErrors: error.flatten().fieldErrors as Record<string, string[]> }
  }
  if (error instanceof Error) return { ok: false, error: error.message }
  return { ok: false, error: "Terjadi kesalahan server." }
}

export async function createSumbanganAction(
  input: CreateSumbanganInput,
): Promise<ActionResult<{ sumbanganId: number; transaksiId?: number }>> {
  const admin = await requirePermission("event.write")

  try {
    const parsed = createSumbanganSchema.parse(input)

    const ev = await getEventById(parsed.eventId)
    if (!ev) return { ok: false, error: "Event tidak ditemukan." }

    let sumbanganId: number
    let transaksiId: number | undefined

    await db.transaction(async (tx) => {
      if (parsed.sumber === "TALANGAN_KAS") {
        const result = await createTalanganTransaksi(tx, {
          eventId: parsed.eventId,
          nominal: parsed.nominal,
          eventNama: ev.nama,
          recordedBy: admin.id,
        })
        transaksiId = result.transaksiId
      }

      const result = await createSumbangan(
        { ...parsed, linkedTransaksiId: transaksiId },
        admin.id,
      )
      sumbanganId = result.id
    })

    const auditPayload = {
      userId: admin.id,
      modul: "Sumbangan Event" as const,
      aksi: "tambah" as const,
      keterangan: `Mencatat sumbangan Rp ${parsed.nominal.toLocaleString("id-ID")} sumber ${parsed.sumber} untuk event "${ev.nama}"`,
    }

    if (parsed.sumber === "TALANGAN_KAS") {
      // Financial action: strict variant — fail if audit log fails
      await writeAuditLogStrict(auditPayload)
    } else {
      writeAuditLog(auditPayload)
    }

    if (parsed.sumber === "TALANGAN_KAS") {
      revalidatePath("/admin/kas-keluar")
    }
    revalidatePath(`/admin/event/${parsed.eventId}`)

    return { ok: true, data: { sumbanganId: sumbanganId!, transaksiId } }
  } catch (error) {
    return toActionError(error)
  }
}

export async function createBulkSumbanganMandiriAction(
  input: CreateBulkSumbanganInput,
): Promise<ActionResult<{ count: number }>> {
  const admin = await requirePermission("event.write")

  try {
    const parsed = createBulkSumbanganSchema.parse(input)
    const ev = await getEventById(parsed.eventId)
    const eventLabel = ev ? `"${ev.nama}"` : `#${parsed.eventId}`
    const result = await createBulkSumbanganMandiri(parsed, admin.id)

    writeAuditLog({
      userId: admin.id,
      modul: "Sumbangan Event",
      aksi: "tambah",
      keterangan: `Mencatat ${result.count} sumbangan mandiri untuk event ${eventLabel}`,
    })

    revalidatePath(`/admin/event/${parsed.eventId}`)
    return { ok: true, data: result }
  } catch (error) {
    return toActionError(error)
  }
}
