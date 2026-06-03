import { z } from "zod"

export const EXPORT_LIMITS = {
  MAX_LAPORAN_MONTHS: 24,
  MAX_LOG_ROWS: 5000,
}

export const laporanQuerySchema = z.object({
  startMonth: z.coerce.number().int().min(1).max(12).default(1),
  startYear: z.coerce.number().int().min(2000).max(2100),
  endMonth: z.coerce.number().int().min(1).max(12).default(12),
  endYear: z.coerce.number().int().min(2000).max(2100),
  saldoAwal: z.coerce.number().finite().min(0).default(0),
}).refine((data) => {
  const start = data.startYear * 12 + data.startMonth
  const end = data.endYear * 12 + data.endMonth
  return end >= start && (end - start) < EXPORT_LIMITS.MAX_LAPORAN_MONTHS
}, {
  message: `Range laporan maksimal ${EXPORT_LIMITS.MAX_LAPORAN_MONTHS} bulan dan tanggal selesai tidak boleh sebelum tanggal mulai.`,
  path: ["endMonth"]
})

export const logAktivitasQuerySchema = z.object({
  modul: z.string().trim().min(1).max(100).optional(),
  aksi: z.string().trim().min(1).max(30).optional(),
  petugas: z.string().trim().min(1).max(120).optional(),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  query: z.string().trim().min(1).max(200).optional(),
}).refine(data => {
  // Wajib memiliki minimal satu filter jika data sangat besar, 
  // atau pada kasus ini kita pastikan tidak bisa export semuanya tanpa filter bulan/tanggal
  // Namun, logAktivitasQuerySchema sudah diset `EXPORT_LIMITS.MAX_LOG_ROWS` di route (5000)
  // Untuk kepastian tambahan, batasan filter wajib dikembalikan
  return data.tanggal || data.modul || data.petugas || data.aksi || data.query
}, {
  message: "Minimal satu filter (misalnya tanggal atau modul) harus diisi untuk melakukan export log aktivitas.",
  path: ["tanggal"]
})
