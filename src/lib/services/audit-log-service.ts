import "server-only"

import { db } from "@/lib/db"
import { logAktivitas, type NewLogAktivitas } from "@/lib/db/schema"

export type AuditLogModul = "Data Warga" | "Kategori Kas" | "Kas Masuk" | "Kas Keluar" | "Autentikasi"
export type AuditLogAksi = "tambah" | "edit" | "hapus" | "login" | "logout"

type WriteAuditLogInput = Pick<NewLogAktivitas, "userId" | "modul" | "aksi" | "keterangan">

export async function writeAuditLog(input: WriteAuditLogInput): Promise<void> {
  await db.insert(logAktivitas).values({
    userId: input.userId,
    modul: input.modul,
    aksi: input.aksi,
    keterangan: input.keterangan,
  })
}
