import "dotenv/config"

import { hashPassword } from "better-auth/crypto"
import { and, eq, like } from "drizzle-orm"

import { db } from "@/lib/db"
import { account, user, warga } from "@/lib/db/schema"

function toZeroPrefix(phone: string) {
  if (phone.startsWith("0")) return phone
  if (phone.startsWith("62")) return `0${phone.slice(2)}`
  return `0${phone}`
}

async function main() {
  console.log("Migrating phone prefix from 62... to 0...")

  const usersToMigrate = await db
    .select({
      id: user.id,
      username: user.username,
      wargaId: user.wargaId,
    })
    .from(user)
    .where(like(user.username, "62%"))

  let migratedUsers = 0
  let skippedUsers = 0

  for (const u of usersToMigrate) {
    if (!u.username) continue
    const newPhone = toZeroPrefix(u.username)

    const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.username, newPhone)).limit(1)
    if (existing && existing.id !== u.id) {
      skippedUsers += 1
      console.warn(`Skip user ${u.id}: target username ${newPhone} already used by ${existing.id}`)
      continue
    }

    await db.transaction(async (tx) => {
      await tx
        .update(user)
        .set({
          username: newPhone,
          displayUsername: newPhone,
          email: `${newPhone}@kas-rt.local`,
          updatedAt: new Date(),
        })
        .where(eq(user.id, u.id))

      const [credentialAccount] = await tx
        .select({ id: account.id })
        .from(account)
        .where(and(eq(account.userId, u.id), eq(account.providerId, "credential")))
        .limit(1)

      if (credentialAccount) {
        const newHash = await hashPassword(newPhone)
        await tx
          .update(account)
          .set({
            password: newHash,
            updatedAt: new Date(),
          })
          .where(eq(account.id, credentialAccount.id))
      }

      if (u.wargaId) {
        await tx
          .update(warga)
          .set({
            noTelp: newPhone,
            updatedAt: new Date(),
          })
          .where(eq(warga.id, u.wargaId))
      }
    })

    migratedUsers += 1
  }

  const wargaToMigrate = await db.select({ id: warga.id, noTelp: warga.noTelp }).from(warga).where(like(warga.noTelp, "62%"))
  let migratedWargaOnly = 0

  for (const w of wargaToMigrate) {
    const normalized = toZeroPrefix(w.noTelp)
    const [userMatch] = await db.select({ id: user.id }).from(user).where(eq(user.wargaId, w.id)).limit(1)
    if (userMatch) continue

    await db
      .update(warga)
      .set({
        noTelp: normalized,
        updatedAt: new Date(),
      })
      .where(eq(warga.id, w.id))

    migratedWargaOnly += 1
  }

  console.log(`Done. migrated users: ${migratedUsers}, skipped users: ${skippedUsers}, migrated warga-only: ${migratedWargaOnly}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
