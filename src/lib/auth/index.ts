import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";

import { db } from "@/lib/db";
import { account, session, user, verification } from "@/lib/db/schema";
import { writeAuditLog } from "@/lib/services/audit-log-service";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: user,
      session: session,
      account: account,
      verification: verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [
    username({
      minUsernameLength: 8,
      maxUsernameLength: 20,
      usernameNormalization: false,
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  databaseHooks: {
    session: {
      delete: {
        after: async (deletedSession) => {
          try {
            await writeAuditLog({
              userId: deletedSession.userId,
              modul: "Autentikasi",
              aksi: "logout",
              keterangan: "Pengguna keluar dari sesi aktif",
            });
          } catch {
            // Do not block sign-out if audit logging fails.
          }
        },
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
});

export type AuthSession = typeof auth.$Infer.Session;
