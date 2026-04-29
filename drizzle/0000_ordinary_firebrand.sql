CREATE TYPE "public"."jenis_arus" AS ENUM('masuk', 'keluar');--> statement-breakpoint
CREATE TYPE "public"."tipe_tagihan" AS ENUM('bulanan', 'sekali');--> statement-breakpoint
CREATE TYPE "public"."aksi" AS ENUM('tambah', 'edit', 'hapus', 'login', 'logout');--> statement-breakpoint
CREATE TYPE "public"."tipe_arus" AS ENUM('masuk', 'keluar');--> statement-breakpoint
CREATE TYPE "public"."status_hunian" AS ENUM('tetap', 'kontrak');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"username" text,
	"display_username" text,
	"role" text DEFAULT 'user',
	"warga_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_ck_role" CHECK ("user"."role" in ('admin', 'user'))
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kategori_kas" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama_kategori" text NOT NULL,
	"jenis_arus" "jenis_arus" NOT NULL,
	"tipe_tagihan" "tipe_tagihan" DEFAULT 'bulanan' NOT NULL,
	"nominal_default" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "log_aktivitas" (
	"id" serial PRIMARY KEY NOT NULL,
	"waktu_log" timestamp DEFAULT now() NOT NULL,
	"user_id" text NOT NULL,
	"modul" text NOT NULL,
	"aksi" "aksi" NOT NULL,
	"keterangan" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaksi" (
	"id" serial PRIMARY KEY NOT NULL,
	"waktu_transaksi" timestamp DEFAULT now() NOT NULL,
	"user_id" text NOT NULL,
	"warga_id" integer,
	"kategori_id" integer NOT NULL,
	"bulan_tagihan" varchar(20),
	"tahun_tagihan" integer,
	"nominal" integer NOT NULL,
	"tipe_arus" "tipe_arus" NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transaksi_ck_nominal_pos" CHECK ("transaksi"."nominal" > 0),
	CONSTRAINT "transaksi_ck_tahun" CHECK ("transaksi"."tahun_tagihan" is null or "transaksi"."tahun_tagihan" between 2000 and 2100),
	CONSTRAINT "transaksi_ck_masuk_keluar_shape" CHECK ((
      ("transaksi"."tipe_arus" = 'keluar' and "transaksi"."warga_id" is null and "transaksi"."bulan_tagihan" is null and "transaksi"."tahun_tagihan" is null)
      or
      ("transaksi"."tipe_arus" = 'masuk' and "transaksi"."warga_id" is not null)
    ))
);
--> statement-breakpoint
CREATE TABLE "warga" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama_kepala_keluarga" text NOT NULL,
	"blok_rumah" text NOT NULL,
	"no_telp" text NOT NULL,
	"status_hunian" "status_hunian" DEFAULT 'tetap' NOT NULL,
	"jumlah_anggota" integer DEFAULT 1 NOT NULL,
	"tgl_batas_domisili" date,
	"tgl_pindah" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "warga_no_telp_unique" UNIQUE("no_telp"),
	CONSTRAINT "warga_ck_status_domisili" CHECK ((
      ("warga"."status_hunian" = 'tetap' and "warga"."tgl_batas_domisili" is null)
      or
      ("warga"."status_hunian" = 'kontrak' and "warga"."tgl_batas_domisili" is not null)
    ))
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_aktivitas" ADD CONSTRAINT "log_aktivitas_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_warga_id_warga_id_fk" FOREIGN KEY ("warga_id") REFERENCES "public"."warga"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_kategori_id_kategori_kas_id_fk" FOREIGN KEY ("kategori_id") REFERENCES "public"."kategori_kas"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_warga_id_nonnull" ON "user" USING btree ("warga_id") WHERE "user"."warga_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_transaksi_masuk_bulanan" ON "transaksi" USING btree ("warga_id","kategori_id","tahun_tagihan","bulan_tagihan") WHERE "transaksi"."tipe_arus" = 'masuk' and "transaksi"."bulan_tagihan" is not null and "transaksi"."tahun_tagihan" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_transaksi_masuk_sekali" ON "transaksi" USING btree ("warga_id","kategori_id") WHERE "transaksi"."tipe_arus" = 'masuk' and "transaksi"."bulan_tagihan" is null and "transaksi"."tahun_tagihan" is null;