ALTER TABLE "warga" DROP CONSTRAINT "warga_ck_status_domisili";--> statement-breakpoint
ALTER TABLE "warga" ADD CONSTRAINT "warga_ck_status_domisili" CHECK ((
      ("warga"."status_hunian" = 'tetap' and "warga"."tgl_batas_domisili" is null)
      or
      ("warga"."status_hunian" = 'kontrak' and "warga"."tgl_batas_domisili" is not null)
      or
      ("warga"."status_hunian" = 'kos' and "warga"."tgl_batas_domisili" is not null)
    ));
