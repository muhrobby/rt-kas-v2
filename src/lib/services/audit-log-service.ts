import "server-only"

import { db } from "@/lib/db"
import { logAktivitas, type NewLogAktivitas } from "@/lib/db/schema"

export type AuditLogModul = "Data Warga" | "Kategori Kas" | "Kas Masuk" | "Kas Keluar" | "Autentikasi" | "Pengaturan" | "Laporan" | "Log Aktivitas" | "Export"
export type AuditLogAksi = "tambah" | "edit" | "hapus" | "login" | "logout" | "export_excel" | "export_pdf" | "change_password"

type WriteAuditLogInput = Pick<NewLogAktivitas, "userId" | "modul" | "aksi" | "keterangan">

export async function writeAuditLog(input: WriteAuditLogInput): Promise<void> {
  db.insert(logAktivitas)
    .values({
      userId: input.userId,
      modul: input.modul,
      aksi: input.aksi,
      keterangan: input.keterangan,
    })
    .catch(() => {
      // Non-blocking: audit log failure must not fail the parent action
    })
}
