-- Backfill periode untuk transaksi "sekali" yang belum punya bulan/tahun tagihan
-- Pakai waktu_transaksi sebagai sumber periode

DO $$
DECLARE
    dup_count INTEGER;
BEGIN
    -- Cek apakah ada transaksi "sekali" dengan periode null yang duplikat
    -- (lebih dari 1 record untuk kombinasi warga_id + kategori_id yang sama)
    SELECT COUNT(*) INTO dup_count
    FROM (
        SELECT warga_id, kategori_id
        FROM transaksi t
        JOIN kategori_kas k ON t.kategori_id = k.id
        WHERE k.tipe_tagihan = 'sekali'
          AND t.tipe_arus = 'masuk'
          AND t.bulan_tagihan IS NULL
          AND t.tahun_tagihan IS NULL
        GROUP BY warga_id, kategori_id
        HAVING COUNT(*) > 1
    ) AS duplicates;

    IF dup_count > 0 THEN
        RAISE EXCEPTION 'Backfill aborted: Found transaksi "sekali" with null period that have duplicate warga_id+kategori_id. Each "sekali" billing should only have one transaction per warga per kategori. Please resolve duplicates manually before running this migration.';
    END IF;

    -- Backfill bulan_tagihan dan tahun_tagihan dari waktu_transaksi
    UPDATE transaksi t
    SET
        bulan_tagihan = TO_CHAR(t.waktu_transaksi, 'FM999999999'),
        tahun_tagihan = EXTRACT(YEAR FROM t.waktu_transaksi)::INTEGER
    FROM kategori_kas k
    WHERE t.kategori_id = k.id
      AND k.tipe_tagihan = 'sekali'
      AND t.tipe_arus = 'masuk'
      AND t.bulan_tagihan IS NULL
      AND t.tahun_tagihan IS NULL;

    RAISE NOTICE 'Backfill completed for "sekali" transactions with null period.';

END $$;