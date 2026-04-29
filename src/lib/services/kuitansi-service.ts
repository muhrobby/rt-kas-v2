import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { kategoriKas, transaksi, user, warga } from "@/lib/db/schema"

export type KuitansiWargaData = {
  transaksiId: number
  nomorKuitansi: string
  tanggal: string
  warga: string
  blok: string
  kategori: string
  nominal: number
  petugas: string | null
}

export type KuitansiAdminData = KuitansiWargaData

function formatDateId(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function getReceiptRef(transaksiId: number, tahun: number) {
  return `KW-${tahun}-${String(transaksiId).padStart(4, "0")}`
}

export async function getKuitansiForWarga({ wargaId, transaksiId }: { wargaId: number; transaksiId: number }): Promise<KuitansiWargaData> {
  const [row] = await db
    .select({
      transaksiId: transaksi.id,
      waktuTransaksi: transaksi.waktuTransaksi,
      nominal: transaksi.nominal,
      warga: warga.namaKepalaKeluarga,
      blok: warga.blokRumah,
      kategori: kategoriKas.namaKategori,
      petugas: user.name,
    })
    .from(transaksi)
    .innerJoin(warga, eq(transaksi.wargaId, warga.id))
    .innerJoin(kategoriKas, eq(transaksi.kategoriId, kategoriKas.id))
    .leftJoin(user, eq(transaksi.userId, user.id))
    .where(and(eq(transaksi.id, transaksiId), eq(transaksi.wargaId, wargaId), eq(transaksi.tipeArus, "masuk")))
    .limit(1)

  if (!row) {
    throw new Error("Kuitansi tidak ditemukan atau bukan milik warga ini.")
  }

  return {
    transaksiId: row.transaksiId,
    nomorKuitansi: getReceiptRef(row.transaksiId, row.waktuTransaksi.getFullYear()),
    tanggal: formatDateId(row.waktuTransaksi),
    warga: row.warga,
    blok: row.blok,
    kategori: row.kategori,
    nominal: Number(row.nominal),
    petugas: row.petugas,
  }
}

export async function getKuitansiForAdmin(transaksiId: number): Promise<KuitansiAdminData> {
  const [row] = await db
    .select({
      transaksiId: transaksi.id,
      waktuTransaksi: transaksi.waktuTransaksi,
      nominal: transaksi.nominal,
      warga: warga.namaKepalaKeluarga,
      blok: warga.blokRumah,
      kategori: kategoriKas.namaKategori,
      petugas: user.name,
    })
    .from(transaksi)
    .innerJoin(warga, eq(transaksi.wargaId, warga.id))
    .innerJoin(kategoriKas, eq(transaksi.kategoriId, kategoriKas.id))
    .leftJoin(user, eq(transaksi.userId, user.id))
    .where(and(eq(transaksi.id, transaksiId), eq(transaksi.tipeArus, "masuk")))
    .limit(1)

  if (!row) {
    throw new Error("Kuitansi tidak ditemukan.")
  }

  return {
    transaksiId: row.transaksiId,
    nomorKuitansi: getReceiptRef(row.transaksiId, row.waktuTransaksi.getFullYear()),
    tanggal: formatDateId(row.waktuTransaksi),
    warga: row.warga,
    blok: row.blok,
    kategori: row.kategori,
    nominal: Number(row.nominal),
    petugas: row.petugas,
  }
}
