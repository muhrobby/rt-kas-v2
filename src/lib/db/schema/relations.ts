import { relations } from "drizzle-orm";

import { event, eventPanitia, pengeluaranEvent, sumbanganEvent } from "./event-acara";
import { kategoriKas } from "./kategori-kas";
import { transaksi } from "./transaksi";
import { pemilikHunian, warga } from "./warga";

export const pemilikHunianRelations = relations(pemilikHunian, ({ many }) => ({
  warga: many(warga),
}));

export const wargaRelations = relations(warga, ({ one, many }) => ({
  pemilikHunian: one(pemilikHunian, {
    fields: [warga.pemilikHunianId],
    references: [pemilikHunian.id],
  }),
  transaksi: many(transaksi),
  sumbanganEvent: many(sumbanganEvent),
}));

export const kategoriKasRelations = relations(kategoriKas, ({ many }) => ({
  transaksi: many(transaksi),
}));

export const transaksiRelations = relations(transaksi, ({ one }) => ({
  warga: one(warga, {
    fields: [transaksi.wargaId],
    references: [warga.id],
  }),
  kategori: one(kategoriKas, {
    fields: [transaksi.kategoriId],
    references: [kategoriKas.id],
  }),
}));

// ─── Event Relations ──────────────────────────────────────────────────────────

export const eventRelations = relations(event, ({ many }) => ({
  panitia: many(eventPanitia),
  sumbangan: many(sumbanganEvent),
  pengeluaran: many(pengeluaranEvent),
}));

export const eventPanitiaRelations = relations(eventPanitia, ({ one }) => ({
  event: one(event, {
    fields: [eventPanitia.eventId],
    references: [event.id],
  }),
}));

export const sumbanganEventRelations = relations(sumbanganEvent, ({ one }) => ({
  event: one(event, {
    fields: [sumbanganEvent.eventId],
    references: [event.id],
  }),
  warga: one(warga, {
    fields: [sumbanganEvent.wargaId],
    references: [warga.id],
  }),
}));

export const pengeluaranEventRelations = relations(pengeluaranEvent, ({ one }) => ({
  event: one(event, {
    fields: [pengeluaranEvent.eventId],
    references: [event.id],
  }),
}));
