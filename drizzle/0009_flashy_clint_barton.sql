ALTER TABLE "transaksi" DROP CONSTRAINT "transaksi_ck_masuk_keluar_shape";--> statement-breakpoint
ALTER TABLE "kategori_kas" ADD COLUMN "bulan_tagihan" varchar(20);--> statement-breakpoint
ALTER TABLE "kategori_kas" ADD COLUMN "tahun_tagihan" integer;--> statement-breakpoint
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_ck_masuk_keluar_shape" CHECK ((
      ("transaksi"."tipe_arus" = 'keluar' and "transaksi"."warga_id" is null)
      or
      ("transaksi"."tipe_arus" = 'masuk' and "transaksi"."warga_id" is not null)
    ));
