CREATE TYPE "public"."status_event" AS ENUM('DRAFT', 'AKTIF', 'BALANCING', 'SELESAI', 'DIBATALKAN');--> statement-breakpoint
CREATE TYPE "public"."status_pengeluaran" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."sumber_sumbangan" AS ENUM('MANDIRI_WARGA', 'TALANGAN_KAS', 'URUNAN_PENGURUS', 'SUMBANGAN_TAMBAHAN_WARGA');--> statement-breakpoint
CREATE TABLE "event" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"tanggal_pelaksanaan" date NOT NULL,
	"deskripsi" text,
	"status" "status_event" DEFAULT 'DRAFT' NOT NULL,
	"created_by" text NOT NULL,
	"closed_at" timestamp,
	"cancelled_at" timestamp,
	"cancel_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_panitia" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"appointed_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	"appointed_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pengeluaran_event" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"deskripsi" varchar(255) NOT NULL,
	"nominal" integer NOT NULL,
	"tanggal" date NOT NULL,
	"status" "status_pengeluaran" DEFAULT 'PENDING' NOT NULL,
	"recorded_by" text NOT NULL,
	"approved_by" text,
	"approved_at" timestamp,
	"rejected_by" text,
	"rejected_at" timestamp,
	"rejected_reason" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pengeluaran_event_ck_nominal" CHECK ("pengeluaran_event"."nominal" > 0),
	CONSTRAINT "pengeluaran_event_ck_status_shape" CHECK ((
      ("pengeluaran_event"."status" = 'APPROVED' and "pengeluaran_event"."approved_by" is not null and "pengeluaran_event"."approved_at" is not null)
      or
      ("pengeluaran_event"."status" = 'REJECTED' and "pengeluaran_event"."rejected_by" is not null and "pengeluaran_event"."rejected_at" is not null and "pengeluaran_event"."rejected_reason" is not null)
      or
      ("pengeluaran_event"."status" = 'PENDING' and "pengeluaran_event"."approved_by" is null and "pengeluaran_event"."rejected_by" is null)
    ))
);
--> statement-breakpoint
CREATE TABLE "sumbangan_event" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"warga_id" integer,
	"nominal" integer NOT NULL,
	"sumber" "sumber_sumbangan" DEFAULT 'MANDIRI_WARGA' NOT NULL,
	"tanggal" date DEFAULT now() NOT NULL,
	"keterangan" text,
	"recorded_by" text NOT NULL,
	"linked_transaksi_id" integer,
	"refunded_at" timestamp,
	"transferred_to_event_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sumbangan_event_ck_nominal" CHECK ("sumbangan_event"."nominal" >= 0)
);
--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "event_panitia" ADD CONSTRAINT "event_panitia_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "event_panitia" ADD CONSTRAINT "event_panitia_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "event_panitia" ADD CONSTRAINT "event_panitia_appointed_by_user_id_fk" FOREIGN KEY ("appointed_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pengeluaran_event" ADD CONSTRAINT "pengeluaran_event_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pengeluaran_event" ADD CONSTRAINT "pengeluaran_event_recorded_by_user_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pengeluaran_event" ADD CONSTRAINT "pengeluaran_event_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pengeluaran_event" ADD CONSTRAINT "pengeluaran_event_rejected_by_user_id_fk" FOREIGN KEY ("rejected_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sumbangan_event" ADD CONSTRAINT "sumbangan_event_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sumbangan_event" ADD CONSTRAINT "sumbangan_event_warga_id_warga_id_fk" FOREIGN KEY ("warga_id") REFERENCES "public"."warga"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sumbangan_event" ADD CONSTRAINT "sumbangan_event_recorded_by_user_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sumbangan_event" ADD CONSTRAINT "sumbangan_event_linked_transaksi_id_transaksi_id_fk" FOREIGN KEY ("linked_transaksi_id") REFERENCES "public"."transaksi"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sumbangan_event" ADD CONSTRAINT "sumbangan_event_transferred_to_event_id_event_id_fk" FOREIGN KEY ("transferred_to_event_id") REFERENCES "public"."event"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_event_panitia_active" ON "event_panitia" USING btree ("event_id","user_id") WHERE "event_panitia"."is_active" = true;--> statement-breakpoint
CREATE INDEX "idx_event_panitia_event_active" ON "event_panitia" USING btree ("event_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_event_panitia_user" ON "event_panitia" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_pengeluaran_event_status" ON "pengeluaran_event" USING btree ("event_id","status");--> statement-breakpoint
CREATE INDEX "idx_pengeluaran_event_recorded" ON "pengeluaran_event" USING btree ("recorded_by");--> statement-breakpoint
CREATE INDEX "idx_sumbangan_event_event" ON "sumbangan_event" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_sumbangan_event_warga" ON "sumbangan_event" USING btree ("warga_id");