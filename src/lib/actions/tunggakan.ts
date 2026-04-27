"use server"

import { requireAdmin } from "@/lib/auth/permissions"
import { getTunggakan } from "@/lib/services/tunggakan-service"
import { tunggakanFilterSchema } from "@/lib/validations/tunggakan"
import { ZodError } from "zod"
import { z } from "zod"

type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false
      error: string
      fieldErrors?: Record<string, string[]>
    }

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    const flattened = error.flatten().fieldErrors as Record<string, string[]>
    return {
      ok: false,
      error: "Input tidak valid.",
      fieldErrors: flattened,
    }
  }
  return {
    ok: false,
    error: "Terjadi kesalahan server. Coba lagi.",
  }
}

export async function getTunggakanAction(
  filter: z.infer<typeof tunggakanFilterSchema>
): Promise<ActionResult<Awaited<ReturnType<typeof getTunggakan>>>> {
  await requireAdmin()

  try {
    const parsed = tunggakanFilterSchema.parse(filter)
    const result = await getTunggakan(parsed)
    return { ok: true, data: result }
  } catch (error) {
    return toActionError(error)
  }
}
