"use server"

import { requirePermission } from "@/lib/auth/permissions"
import { createPemilikHunian, listPemilikHunian } from "@/lib/services/pemilik-hunian-service"
import { createPemilikHunianSchema } from "@/lib/validations/pemilik-hunian"

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

export async function listPemilikHunianAction() {
  await requirePermission("warga.write")
  const data = await listPemilikHunian()
  return { ok: true as const, data }
}

export async function createPemilikHunianAction(input: { nama: string; noTelp?: string }): Promise<ActionResult<{ id: number; nama: string }>> {
  await requirePermission("warga.write")

  const parsed = createPemilikHunianSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    const flat = parsed.error.flatten().fieldErrors
    if (flat.nama) fieldErrors.nama = flat.nama
    if (flat.noTelp) fieldErrors.noTelp = flat.noTelp
    return { ok: false, error: "Input tidak valid.", fieldErrors }
  }

  const row = await createPemilikHunian(parsed.data)
  return { ok: true, data: { id: row.id, nama: row.nama } }
}
