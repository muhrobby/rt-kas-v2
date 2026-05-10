import { sql } from "drizzle-orm";
import { check, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const appSettings = pgTable(
  "app_settings",
  {
    id: integer("id").primaryKey(),
    appName: text("app_name").notNull(),
    organizationName: text("organization_name").notNull(),
    rtNumber: text("rt_number").notNull(),
    rwNumber: text("rw_number").notNull(),
    address: text("address"),
    phone: text("phone"),
    email: text("email"),
    primaryColor: text("primary_color").notNull(),
    secondaryColor: text("secondary_color").notNull(),
    accentColor: text("accent_color").notNull(),
    receiptTitle: text("receipt_title").notNull(),
    receiptFooter: text("receipt_footer"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [check("app_settings_ck_singleton_id", sql`${table.id} = 1`)],
);

export type AppSettings = typeof appSettings.$inferSelect;
export type NewAppSettings = typeof appSettings.$inferInsert;
