import { relations } from "drizzle-orm";

import { kategoriKas } from "./kategori-kas";
import { transaksi } from "./transaksi";
import { warga } from "./warga";

export const wargaRelations = relations(warga, ({ many }) => ({
  transaksi: many(transaksi),
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
