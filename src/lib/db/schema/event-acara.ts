import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { transaksi } from "./transaksi";
import { warga } from "./warga";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const statusEventEnum = pgEnum("status_event", [
  "DRAFT",
  "AKTIF",
  "BALANCING",
  "SELESAI",
  "DIBATALKAN",
]);

export const statusPengeluaranEnum = pgEnum("status_pengeluaran", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const sumberSumbanganEnum = pgEnum("sumber_sumbangan", [
  "MANDIRI_WARGA",
  "TALANGAN_KAS",
  "URUNAN_PENGURUS",
  "SUMBANGAN_TAMBAHAN_WARGA",
]);

// ─── Tabel: event ─────────────────────────────────────────────────────────────

export const event = pgTable("event", {
  id: serial("id").primaryKey(),
  nama: text("nama").notNull(),
  tanggalPelaksanaan: date("tanggal_pelaksanaan").notNull(),
  deskripsi: text("deskripsi"),
  status: statusEventEnum("status").notNull().default("DRAFT"),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
  closedAt: timestamp("closed_at"),
  cancelledAt: timestamp("cancelled_at"),
  cancelReason: text("cancel_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ─── Tabel: event_panitia ─────────────────────────────────────────────────────

export const eventPanitia = pgTable(
  "event_panitia",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade", onUpdate: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
    isActive: boolean("is_active").notNull().default(true),
    appointedAt: timestamp("appointed_at").notNull().defaultNow(),
    revokedAt: timestamp("revoked_at"),
    appointedBy: text("appointed_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
  },
  (table) => [
    uniqueIndex("uq_event_panitia_active")
      .on(table.eventId, table.userId)
      .where(sql`${table.isActive} = true`),
    index("idx_event_panitia_event_active").on(table.eventId, table.isActive),
    index("idx_event_panitia_user").on(table.userId),
  ],
);

// ─── Tabel: sumbangan_event ───────────────────────────────────────────────────

export const sumbanganEvent = pgTable(
  "sumbangan_event",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "restrict", onUpdate: "cascade" }),
    wargaId: integer("warga_id").references(() => warga.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    nominal: integer("nominal").notNull(),
    sumber: sumberSumbanganEnum("sumber").notNull().default("MANDIRI_WARGA"),
    tanggal: date("tanggal").notNull().defaultNow(),
    keterangan: text("keterangan"),
    recordedBy: text("recorded_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
    linkedTransaksiId: integer("linked_transaksi_id").references(() => transaksi.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    refundedAt: timestamp("refunded_at"),
    transferredToEventId: integer("transferred_to_event_id").references(() => event.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    check("sumbangan_event_ck_nominal", sql`${table.nominal} >= 0`),
    index("idx_sumbangan_event_event").on(table.eventId),
    index("idx_sumbangan_event_warga").on(table.wargaId),
  ],
);

// ─── Tabel: pengeluaran_event ─────────────────────────────────────────────────

export const pengeluaranEvent = pgTable(
  "pengeluaran_event",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "restrict", onUpdate: "cascade" }),
    deskripsi: varchar("deskripsi", { length: 255 }).notNull(),
    nominal: integer("nominal").notNull(),
    tanggal: date("tanggal").notNull(),
    status: statusPengeluaranEnum("status").notNull().default("PENDING"),
    recordedBy: text("recorded_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
    approvedBy: text("approved_by").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    approvedAt: timestamp("approved_at"),
    rejectedBy: text("rejected_by").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    rejectedAt: timestamp("rejected_at"),
    rejectedReason: text("rejected_reason"),
    isSystem: boolean("is_system").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check("pengeluaran_event_ck_nominal", sql`${table.nominal} > 0`),
    check(
      "pengeluaran_event_ck_status_shape",
      sql`(
      (${table.status} = 'APPROVED' and ${table.approvedBy} is not null and ${table.approvedAt} is not null)
      or
      (${table.status} = 'REJECTED' and ${table.rejectedBy} is not null and ${table.rejectedAt} is not null and ${table.rejectedReason} is not null)
      or
      (${table.status} = 'PENDING' and ${table.approvedBy} is null and ${table.rejectedBy} is null)
    )`,
    ),
    index("idx_pengeluaran_event_status").on(table.eventId, table.status),
    index("idx_pengeluaran_event_recorded").on(table.recordedBy),
  ],
);

// ─── Type Exports ─────────────────────────────────────────────────────────────

export type Event = typeof event.$inferSelect;
export type NewEvent = typeof event.$inferInsert;

export type EventPanitia = typeof eventPanitia.$inferSelect;
export type NewEventPanitia = typeof eventPanitia.$inferInsert;

export type SumbanganEvent = typeof sumbanganEvent.$inferSelect;
export type NewSumbanganEvent = typeof sumbanganEvent.$inferInsert;

export type PengeluaranEvent = typeof pengeluaranEvent.$inferSelect;
export type NewPengeluaranEvent = typeof pengeluaranEvent.$inferInsert;
