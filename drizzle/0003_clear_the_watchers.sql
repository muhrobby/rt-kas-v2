CREATE TABLE "app_settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"app_name" text NOT NULL,
	"organization_name" text NOT NULL,
	"rt_number" text NOT NULL,
	"rw_number" text NOT NULL,
	"address" text,
	"phone" text,
	"email" text,
	"primary_color" text NOT NULL,
	"secondary_color" text NOT NULL,
	"accent_color" text NOT NULL,
	"receipt_title" text NOT NULL,
	"receipt_footer" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "app_settings_ck_singleton_id" CHECK ("app_settings"."id" = 1)
);
