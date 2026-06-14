import "server-only"

import { and, eq, gte, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { pemilikHunian } from "@/lib/db/schema"

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
