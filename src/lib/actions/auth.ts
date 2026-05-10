"use server"

import { eq } from "drizzle-orm"
import { hashPassword, verifyPassword } from "better-auth/crypto"

import { requireAuth } from "@/lib/auth/permissions"
import { db } from "@/lib/db"
import { account, user } from "@/lib/db/schema"
import { changePasswordSchema } from "@/lib/validations/auth"
import { writeAuditLog } from "@/lib/services/audit-log-service"

type ChangePasswordResult =
  | { success: true; message: string }
  | { success: false; error: string }

export async function changePasswordAction(input: {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}): Promise<ChangePasswordResult> {
  try {
    // 1. Get current user session
    const currentUser = await requireAuth()

    // 2. Validate input
    const validated = changePasswordSchema.parse(input)

    // 3. Get user account with password
    const [userAccount] = await db
      .select({
        id: account.id,
        password: account.password,
      })
      .from(account)
      .where(eq(account.userId, currentUser.id))
      .limit(1)

    if (!userAccount || !userAccount.password) {
      return {
        success: false,
        error: "Akun tidak ditemukan atau tidak memiliki password.",
      }
    }

    // 4. Verify old password
    const isValidOldPassword = await verifyPassword({
      password: validated.oldPassword,
      hash: userAccount.password,
    })

    if (!isValidOldPassword) {
      return {
        success: false,
        error: "Password lama tidak sesuai.",
      }
    }

    // 5. Hash new password
    const newPasswordHash = await hashPassword(validated.newPassword)

    // 6. Update password in database
    await db
      .update(account)
      .set({
        password: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(account.id, userAccount.id))

    // 7. Clear must_change_password flag
    await db
      .update(user)
      .set({
        mustChangePassword: false,
        updatedAt: new Date(),
      })
      .where(eq(user.id, currentUser.id))

    // 8. Write audit log (non-blocking)
    try {
      await writeAuditLog({
        userId: currentUser.id,
        modul: "Autentikasi",
        aksi: "change_password",
        keterangan: "Pengguna berhasil mengganti password",
      })
    } catch {
      // Do not block password change if audit logging fails
    }

    return {
      success: true,
      message: "Password berhasil diubah.",
    }
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return {
        success: false,
        error: "Data tidak valid. Periksa kembali input Anda.",
      }
    }

    // Generic error for security
    return {
      success: false,
      error: "Gagal mengubah password. Silakan coba lagi.",
    }
  }
}
