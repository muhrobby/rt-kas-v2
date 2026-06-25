ALTER TYPE "public"."status_hunian" ADD VALUE 'kos';--> statement-breakpoint
CREATE TABLE "pemilik_hunian" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"no_telp" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "warga" DROP CONSTRAINT "warga_ck_status_domisili";--> statement-breakpoint
ALTER TABLE "warga" ADD COLUMN "pemilik_hunian_id" integer;--> statement-breakpoint
ALTER TABLE "warga" ADD CONSTRAINT "warga_pemilik_hunian_id_pemilik_hunian_id_fk" FOREIGN KEY ("pemilik_hunian_id") REFERENCES "public"."pemilik_hunian"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warga" ADD CONSTRAINT "warga_ck_status_domisili" CHECK ((
      ("warga"."status_hunian" = 'tetap' and "warga"."tgl_batas_domisili" is null)
      or
      ("warga"."status_hunian" = 'kontrak' and "warga"."tgl_batas_domisili" is not null)
    ));
