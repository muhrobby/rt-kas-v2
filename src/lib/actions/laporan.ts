"use server"

import { requireAdmin } from "@/lib/auth/permissions"
import { getLaporanKeuangan, type LaporanResult } from "@/lib/services/laporan-service"
import { ZodError, z } from "zod"

type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false
      error: string
      fieldErrors?: Record<string, string[]>
    }

const filterSchema = z.object({
  startMonth: z.number().int().min(0).max(11),
  startYear: z.number().int().min(2000).max(2100),
  endMonth: z.number().int().min(0).max(11),
  endYear: z.number().int().min(2000).max(2100),
  saldoAwal: z.number().int().min(0).optional(),
})

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    const flattened = error.flatten().fieldErrors as Record<string, string[]>
    return {
      ok: false,
      error: "Input tidak valid.",
      fieldErrors: flattened,
    }
  }
  if (error instanceof Error) {
    return {
      ok: false,
      error: error.message,
    }
  }
  return {
    ok: false,
    error: "Terjadi kesalahan server. Coba lagi.",
  }
}

export async function getLaporanAction(
  filter: z.infer<typeof filterSchema>,
): Promise<ActionResult<LaporanResult>> {
  await requireAdmin()

  try {
    const parsed = filterSchema.parse(filter)
    const result = await getLaporanKeuangan(parsed)
    return { ok: true, data: result }
  } catch (error) {
    return toActionError(error)
  }
}
