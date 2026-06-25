import "server-only"

import { and, eq, gte, ilike, isNull, or, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { pemilikHunian, warga } from "@/lib/db/schema"
import { pemilikHunianOptionValueSchema } from "@/lib/validations/pemilik-hunian"

export type PemilikHunianOption = {
  value: string
  source: "pemilik_hunian" | "warga"
  id: number
  label: string
  description: string | null
  nama: string
  noTelp: string | null
}

export function toPemilikHunianOption(
  source: PemilikHunianOption["source"],
  id: number,
  nama: string,
  noTelp: string | null,
  blokRumah?: string | null,
): PemilikHunianOption {
  const value = `${source === "warga" ? "warga" : "pemilik"}:${id}`
  const phoneDisplay = noTelp ?? "-"
  const description =
    source === "warga" && blokRumah
      ? `Warga Blok ${blokRumah} - ${phoneDisplay}`
      : `Pemilik external - ${phoneDisplay}`

  return { value, source, id, label: nama, description, nama, noTelp }
}

/** Cari dan gabung opsi pemilik hunian dari tabel pemilik_hunian dan warga aktif. */
export async function listPemilikHunianOptions(input?: {
  query?: string
}): Promise<PemilikHunianOption[]> {
  const q = input?.query?.trim() ?? ""

  const [pemilikRows, wargaRows] = await Promise.all([
    db
      .select({
        id: pemilikHunian.id,
        nama: pemilikHunian.nama,
        noTelp: pemilikHunian.noTelp,
      })
      .from(pemilikHunian)
      .where(
        q
          ? or(ilike(pemilikHunian.nama, `%${q}%`), ilike(pemilikHunian.noTelp, `%${q}%`))
          : undefined,
      )
      .orderBy(pemilikHunian.nama)
      .limit(50),
    db
      .select({
        id: warga.id,
        nama: warga.namaKepalaKeluarga,
        noTelp: warga.noTelp,
        blokRumah: warga.blokRumah,
      })
      .from(warga)
      .where(
        and(
          isNull(warga.tglPindah),
          q
            ? or(
                ilike(warga.namaKepalaKeluarga, `%${q}%`),
                ilike(warga.noTelp, `%${q}%`),
                ilike(warga.blokRumah, `%${q}%`),
              )
            : undefined,
        ),
      )
      .orderBy(warga.namaKepalaKeluarga)
      .limit(50),
  ])

  const options: PemilikHunianOption[] = [
    ...pemilikRows.map((r) => toPemilikHunianOption("pemilik_hunian", r.id, r.nama, r.noTelp)),
    ...wargaRows.map((r) => toPemilikHunianOption("warga", r.id, r.nama, r.noTelp, r.blokRumah)),
  ]

  return dedupeOptions(options)
}

function dedupeOptions(options: PemilikHunianOption[]): PemilikHunianOption[] {
  const byPhone = new Map<string, PemilikHunianOption>()
  const noPhone: PemilikHunianOption[] = []

  for (const opt of options) {
    if (!opt.noTelp) {
      noPhone.push(opt)
      continue
    }
    const key = opt.noTelp.replace(/\D/g, "")
    const existing = byPhone.get(key)
    if (!existing || opt.source === "pemilik_hunian") {
      byPhone.set(key, opt)
    }
  }

  const deduped = [...byPhone.values(), ...noPhone]
  deduped.sort((a, b) => a.label.localeCompare(b.label))
  return deduped.slice(0, 50)
}

/** Resolve value opsi (pemilik:<id> atau warga:<id>) ke pemilikHunianId valid. */
export async function resolvePemilikHunianIdFromOption(value: string): Promise<number> {
  const parsed = pemilikHunianOptionValueSchema.safeParse(value)
  if (!parsed.success) {
    throw new Error("INVALID_OPTION_VALUE")
  }

  const [prefix, idStr] = value.split(":")
  const id = Number(idStr)

  if (prefix === "pemilik") {
    const [row] = await db
      .select({ id: pemilikHunian.id })
      .from(pemilikHunian)
      .where(eq(pemilikHunian.id, id))
      .limit(1)

    if (!row) throw new Error("PEMILIK_NOT_FOUND")
    return row.id
  }

  const [wargaRow] = await db
    .select({
      id: warga.id,
      namaKepalaKeluarga: warga.namaKepalaKeluarga,
      noTelp: warga.noTelp,
      tglPindah: warga.tglPindah,
    })
    .from(warga)
    .where(eq(warga.id, id))
    .limit(1)

  if (!wargaRow) throw new Error("WARGA_NOT_FOUND")
  if (wargaRow.tglPindah) throw new Error("WARGA_ALREADY_MOVED")

  if (wargaRow.noTelp) {
    const [existing] = await db
      .select({ id: pemilikHunian.id })
      .from(pemilikHunian)
      .where(eq(pemilikHunian.noTelp, wargaRow.noTelp))
      .limit(1)

    if (existing) return existing.id
  }

  const [newRow] = await db
    .insert(pemilikHunian)
    .values({
      nama: wargaRow.namaKepalaKeluarga,
      noTelp: wargaRow.noTelp,
    })
    .returning({ id: pemilikHunian.id })

  return newRow.id
}

export async function listPemilikHunian() {
  return db.select().from(pemilikHunian).orderBy(pemilikHunian.nama)
}

export async function createPemilikHunian(data: { nama: string; noTelp?: string }) {
  // Dedup window: if identical record (nama + noTelp) was created within last 10s,
  // return existing instead of inserting duplicate. Protects against double-submit.
  const tenSecondsAgo = new Date(Date.now() - 10_000)

  const [recentDuplicate] = await db
    .select()
    .from(pemilikHunian)
    .where(
      and(
        eq(pemilikHunian.nama, data.nama),
        data.noTelp ? eq(pemilikHunian.noTelp, data.noTelp) : sql`${pemilikHunian.noTelp} is null`,
        gte(pemilikHunian.createdAt, tenSecondsAgo),
      ),
    )
    .limit(1)

  if (recentDuplicate) {
    return recentDuplicate
  }

  const [row] = await db
    .insert(pemilikHunian)
    .values({ nama: data.nama, noTelp: data.noTelp ?? null })
    .returning()
  return row
}
