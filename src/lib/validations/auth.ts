import { z } from "zod"

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Password lama wajib diisi"),
    newPassword: z
      .string()
      .min(8, "Password baru minimal 8 karakter")
      .regex(/[a-zA-Z]/, "Password harus mengandung huruf")
      .regex(/[0-9]/, "Password harus mengandung angka"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "Password baru tidak boleh sama dengan password lama",
    path: ["newPassword"],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
