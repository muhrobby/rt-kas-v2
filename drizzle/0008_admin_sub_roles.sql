-- TASK-002: Tambah kolom admin_role pada tabel user
-- Sub-role domain untuk permission granular admin RT Kas.
-- Nilai valid: 'ketua_rt' | 'bendahara' | 'sekretaris' | 'anggota' | NULL

--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "admin_role" text;--> statement-breakpoint

-- Check constraint: admin_role hanya boleh nilai valid atau NULL
ALTER TABLE "user" ADD CONSTRAINT "user_ck_admin_role"
  CHECK ("admin_role" is null or "admin_role" in ('ketua_rt', 'bendahara', 'sekretaris', 'anggota'));--> statement-breakpoint

-- Check constraint: user dengan role 'user' tidak boleh memiliki admin_role
ALTER TABLE "user" ADD CONSTRAINT "user_ck_admin_role_only_for_admin"
  CHECK (not ("role" = 'user' and "admin_role" is not null));--> statement-breakpoint

-- Backfill: semua user admin existing mendapat admin_role berdasarkan warga.role_pengurus
-- Mapping eksplisit dari nilai role_pengurus yang dikenal:
--   'Ketua RT' / 'ketua rt' / 'ketua_rt'  → ketua_rt
--   'Bendahara' / 'bendahara'              → bendahara
--   'Sekretaris' / 'sekretaris'            → sekretaris
--   'Anggota' / 'anggota'                  → anggota
-- Admin yang tidak punya mapping jelas → default 'ketua_rt' (backward compatibility).
-- ⚠️ WAJIB review daftar admin setelah deploy dan turunkan manual jika perlu.
UPDATE "user"
SET "admin_role" = CASE
  WHEN lower(trim(w.role_pengurus)) IN ('ketua rt', 'ketua_rt', 'ketua')
    THEN 'ketua_rt'
  WHEN lower(trim(w.role_pengurus)) IN ('bendahara')
    THEN 'bendahara'
  WHEN lower(trim(w.role_pengurus)) IN ('sekretaris')
    THEN 'sekretaris'
  WHEN lower(trim(w.role_pengurus)) IN ('anggota', 'anggota pengurus')
    THEN 'anggota'
  ELSE 'ketua_rt'  -- default compatibility: wajib review manual setelah deploy
END
FROM "warga" w
WHERE "user"."role" = 'admin'
  AND "user"."warga_id" = w.id;--> statement-breakpoint

-- Backfill admin tanpa warga_id (akun admin teknis tanpa data warga):
-- Juga mendapat default 'ketua_rt' agar tidak terkunci.
UPDATE "user"
SET "admin_role" = 'ketua_rt'
WHERE "role" = 'admin'
  AND "admin_role" IS NULL;--> statement-breakpoint

-- Verifikasi: semua admin harus punya admin_role setelah backfill
-- (query ini tidak mengubah data, hanya untuk validasi manual saat migration)
-- SELECT id, name, role, admin_role FROM "user" WHERE role = 'admin' AND admin_role IS NULL;
-- Hasil harus 0 baris.
