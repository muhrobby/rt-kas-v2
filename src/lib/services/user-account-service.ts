import "server-only"

import { generateId } from "better-auth"
import { hashPassword } from "better-auth/crypto"
import { and, eq, ne } from "drizzle-orm"

import { type DbTransaction } from "@/lib/db"
import { account, user } from "@/lib/db/schema"

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

export async function createWargaUserAccount(input: CreateWargaUserAccountInput, tx: Tx) {
  await ensurePhoneUnique(input.phone, tx)

  const userId = generateId()
  const password = input.password ?? input.phone
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
  await tx.delete(user).where(eq(user.id, existingUser.id))
}
