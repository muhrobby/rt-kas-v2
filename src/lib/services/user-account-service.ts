import "server-only"

import { generateId } from "better-auth"
import { hashPassword } from "better-auth/crypto"
import { and, eq, ne, sql } from "drizzle-orm"

import { db, type DbTransaction } from "@/lib/db"
import { account, user, warga } from "@/lib/db/schema"

type Tx = DbTransaction

type CreateWargaUserAccountInput = {
  wargaId: number
  nama: string
  phone: string
  password?: string
}

type UpdateWargaUserAccountInput = {
  wargaId: number
  nama: string
  phone: string
}

export class DuplicateUsernameError extends Error {
  constructor() {
    super("Nomor telepon sudah dipakai akun lain.")
    this.name = "DuplicateUsernameError"
  }
}

async function ensurePhoneUnique(phone: string, tx: Tx, excludeWargaId?: number) {
  const [existing] = await tx
    .select({ id: user.id })
    .from(user)
    .where(
      and(
        eq(user.username, phone),
        excludeWargaId !== undefined ? ne(user.wargaId, excludeWargaId) : undefined,
      ),
    )
    .limit(1)

  if (existing) {
    throw new DuplicateUsernameError()
  }
}

export async function createWargaUserAccount(input: CreateWargaUserAccountInput, tx: Tx): Promise<void> {
  await ensurePhoneUnique(input.phone, tx)

  const userId = generateId()
  const password = input.password ?? "warga123"
  const hashedPassword = await hashPassword(password)

  await tx.insert(user).values({
    id: userId,
    name: input.nama,
    email: `${input.phone}@kas-rt.local`,
    emailVerified: true,
    username: input.phone,
    displayUsername: input.phone,
    role: "user",
    wargaId: input.wargaId,
    mustChangePassword: true,
  })

  await tx.insert(account).values({
    id: generateId(),
    userId,
    accountId: userId,
    providerId: "credential",
    password: hashedPassword,
  })
}

export async function updateWargaUserAccount(input: UpdateWargaUserAccountInput, tx: Tx) {
  const [existingUser] = await tx.select().from(user).where(eq(user.wargaId, input.wargaId)).limit(1)
  if (!existingUser) return

  await ensurePhoneUnique(input.phone, tx, input.wargaId)

  await tx
    .update(user)
    .set({
      name: input.nama,
      username: input.phone,
      displayUsername: input.phone,
      email: `${input.phone}@kas-rt.local`,
      updatedAt: new Date(),
    })
    .where(eq(user.id, existingUser.id))
}

export async function deleteWargaUserAccount(wargaId: number, tx: Tx) {
  const [existingUser] = await tx.select({ id: user.id }).from(user).where(eq(user.wargaId, wargaId)).limit(1)
  if (!existingUser) return

  // Check if user has log_aktivitas references (ON DELETE RESTRICT would block hard delete)
  const [hasLogs] = await tx
    .select({ id: sql<number>`1` })
    .from(sql`log_aktivitas`)
    .where(sql`user_id = ${existingUser.id}`)
    .limit(1)

  if (hasLogs) {
    // Soft-disconnect: unlink wargaId, sessions/accounts will cascade or remain orphaned
    await tx
      .update(user)
      .set({ wargaId: null, role: "user", adminRole: null, updatedAt: new Date() })
      .where(eq(user.id, existingUser.id))
  } else {
    await tx.delete(user).where(eq(user.id, existingUser.id))
  }
}

/**
 * Create account for event panitia (non-warga).
 * Uses phone as username & initial password. role='user', no wargaId.
 * Access restricted to event pages via event_panitia table (requireEventAccess).
 */
export async function createPanitiaUserAccount(
  input: { nama: string; phone: string },
  tx: Tx,
): Promise<{ userId: string }> {
  await ensurePhoneUnique(input.phone, tx)

  const userId = generateId()
  const hashedPassword = await hashPassword(input.phone) // phone as initial password

  await tx.insert(user).values({
    id: userId,
    name: input.nama,
    email: `${input.phone}@panitia.local`,
    emailVerified: true,
    username: input.phone,
    displayUsername: input.phone,
    role: "user",
    wargaId: null,
    mustChangePassword: false,
  })

  await tx.insert(account).values({
    id: generateId(),
    userId,
    accountId: userId,
    providerId: "credential",
    password: hashedPassword,
  })

  return { userId }
}

/**
 * Reset password warga. Pengurus → "pengurus123", warga biasa → "warga123".
 * Sets mustChangePassword = true. Runs in a single transaction.
 */
export async function resetWargaPassword(wargaId: number): Promise<void> {
  await db.transaction(async (tx) => {
    // Get warga isPengurus status
    const [w] = await tx.select({ isPengurus: warga.isPengurus }).from(warga).where(eq(warga.id, wargaId)).limit(1)
    if (!w) throw new Error("Warga tidak ditemukan.")

    // Get user linked to warga
    const [u] = await tx.select({ id: user.id }).from(user).where(eq(user.wargaId, wargaId)).limit(1)
    if (!u) throw new Error("Akun warga tidak ditemukan.")

    const newPassword = w.isPengurus ? "pengurus123" : "warga123"
    const hashed = await hashPassword(newPassword)

    // Update password in account table
    await tx.update(account).set({ password: hashed, updatedAt: new Date() }).where(eq(account.userId, u.id))

    // Set mustChangePassword on user table
    await tx.update(user).set({ mustChangePassword: true, updatedAt: new Date() }).where(eq(user.id, u.id))
  })
}
