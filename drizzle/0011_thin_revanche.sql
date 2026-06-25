ALTER TABLE "transaksi" DROP CONSTRAINT "transaksi_ck_masuk_keluar_shape";--> statement-breakpoint
DROP INDEX "uq_transaksi_masuk_bulanan";--> statement-breakpoint
DROP INDEX "uq_transaksi_masuk_sekali";--> statement-breakpoint
ALTER TABLE "transaksi" ADD COLUMN "event_id" integer;--> statement-breakpoint
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "transaksi_event_id_idx" ON "transaksi" USING btree ("event_id") WHERE "transaksi"."event_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_transaksi_masuk_bulanan" ON "transaksi" USING btree ("warga_id","kategori_id","tahun_tagihan","bulan_tagihan") WHERE "transaksi"."tipe_arus" = 'masuk' and "transaksi"."bulan_tagihan" is not null and "transaksi"."tahun_tagihan" is not null and "transaksi"."event_id" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_transaksi_masuk_sekali" ON "transaksi" USING btree ("warga_id","kategori_id") WHERE "transaksi"."tipe_arus" = 'masuk' and "transaksi"."bulan_tagihan" is null and "transaksi"."tahun_tagihan" is null and "transaksi"."event_id" is null;--> statement-breakpoint
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_ck_masuk_keluar_shape" CHECK ((
      ("transaksi"."tipe_arus" = 'keluar' and "transaksi"."warga_id" is null)
      or
      ("transaksi"."tipe_arus" = 'masuk' and "transaksi"."warga_id" is not null and "transaksi"."event_id" is null)
      or
      ("transaksi"."tipe_arus" = 'masuk' and "transaksi"."warga_id" is null and "transaksi"."event_id" is not null)
    ));