-- TASK-002: Backfill periode kategori kas sekali bayar
-- Isi bulan_tagihan dan tahun_tagihan berdasarkan created_at untuk kategori dengan tipe_tagihan = 'sekali'.

UPDATE "kategori_kas"
SET
  "bulan_tagihan" = TO_CHAR("created_at", 'FMMM'),
  "tahun_tagihan" = EXTRACT(YEAR FROM "created_at")::INTEGER
WHERE "tipe_tagihan" = 'sekali'
  AND "bulan_tagihan" IS NULL
  AND "tahun_tagihan" IS NULL;--> statement-breakpoint

-- Verifikasi manual setelah migrasi:
-- SELECT id, nama_kategori, created_at, bulan_tagihan, tahun_tagihan
-- FROM kategori_kas
-- WHERE tipe_tagihan = 'sekali'
-- ORDER BY created_at DESC;
