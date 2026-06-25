import "server-only"

import { and, desc, eq, lte, gte, sql, notInArray } from "drizzle-orm"

import { db } from "@/lib/db"
import { logAktivitas, user } from "@/lib/db/schema"
import type { LogAktivitas } from "@/types/rt-kas"

export type LogAktivitasFilters = {
  modul?: string
  aksi?: string
  petugas?: string
  tanggal?: string
  query?: string
  limit?: number
  offset?: number
  excludeUserIds?: string[]
}

const DEFAULT_LIMIT = 100
const MAX_LIMIT = 5000

export async function listLogAktivitas(
  filters: LogAktivitasFilters = {},
): Promise<LogAktivitas[]> {
  const {
    modul,
    aksi,
    petugas,
    tanggal,
    query,
    limit = DEFAULT_LIMIT,
    offset = 0,
    excludeUserIds,
  } = filters

  const safeLimit = Math.min(Math.max(1, limit), MAX_LIMIT)

  const conditions = []

  if (excludeUserIds && excludeUserIds.length > 0) {
    conditions.push(notInArray(logAktivitas.userId, excludeUserIds))
  }

  if (modul && modul !== "semua") {
    conditions.push(eq(logAktivitas.modul, modul))
  }

  if (aksi && aksi !== "semua") {
    conditions.push(eq(logAktivitas.aksi, aksi as "tambah" | "edit" | "hapus" | "login" | "logout" | "export_excel"))
  }

  if (petugas && petugas !== "semua") {
    conditions.push(eq(logAktivitas.userId, petugas))
  }

  if (tanggal) {
    const startOfDay = new Date(tanggal)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(tanggal)
    endOfDay.setHours(23, 59, 59, 999)
    conditions.push(gte(logAktivitas.waktuLog, startOfDay))
    conditions.push(lte(logAktivitas.waktuLog, endOfDay))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const rows = await db
    .select({
      waktuLog: logAktivitas.waktuLog,
      userName: user.name,
      modul: logAktivitas.modul,
      aksi: logAktivitas.aksi,
      keterangan: logAktivitas.keterangan,
    })
    .from(logAktivitas)
    .leftJoin(user, eq(logAktivitas.userId, user.id))
    .where(whereClause)
    .orderBy(desc(logAktivitas.waktuLog))
    .limit(safeLimit)
    .offset(offset)

  let results = rows.map((row) => ({
    tanggalWaktu: row.waktuLog.toISOString(),
    petugas: row.userName ?? "Unknown",
    modul: row.modul,
    aksi: row.aksi as LogAktivitas["aksi"],
    detail: row.keterangan,
  }))

  if (query && query.trim()) {
    const q = query.trim().toLowerCase()
    results = results.filter(
      (item) =>
        item.detail.toLowerCase().includes(q) ||
        item.petugas.toLowerCase().includes(q),
    )
  }

  return results
}

export type LogFiltersResult = {
  modul: string[]
  aksi: string[]
  petugas: { id: string; nama: string }[]
}

export async function getLogFilters(excludeUserIds?: string[]): Promise<LogFiltersResult> {
  const modulPromise = db.selectDistinct({ modul: logAktivitas.modul }).from(logAktivitas).orderBy(logAktivitas.modul)
  const aksiPromise = db.selectDistinct({ aksi: logAktivitas.aksi }).from(logAktivitas).orderBy(logAktivitas.aksi)

  const petugasQuery = db
    .select({ id: logAktivitas.userId, nama: user.name })
    .from(logAktivitas)
    .innerJoin(user, eq(user.id, logAktivitas.userId))

  if (excludeUserIds && excludeUserIds.length > 0) {
    petugasQuery.where(notInArray(logAktivitas.userId, excludeUserIds))
  }

  const [modulRows, aksiRows, petugasRows] = await Promise.all([
    modulPromise,
    aksiPromise,
    petugasQuery.groupBy(logAktivitas.userId, user.name).orderBy(user.name),
  ])

  return {
    modul: modulRows.map((r) => r.modul),
    aksi: aksiRows.map((r) => r.aksi),
    petugas: petugasRows.map((r) => ({ id: r.id, nama: r.nama ?? r.id })),
  }
}

export type LogAktivitasListResult = {
  data: LogAktivitas[]
  total: number
  limit: number
  offset: number
}

export async function listLogAktivitasWithCount(
  filters: LogAktivitasFilters = {},
): Promise<LogAktivitasListResult> {
  const { limit = DEFAULT_LIMIT, offset = 0, excludeUserIds } = filters
  const safeLimit = Math.min(Math.max(1, limit), MAX_LIMIT)

  const conditions = []

  if (excludeUserIds && excludeUserIds.length > 0) {
    conditions.push(notInArray(logAktivitas.userId, excludeUserIds))
  }

  if (filters.modul && filters.modul !== "semua") {
    conditions.push(eq(logAktivitas.modul, filters.modul))
  }

  if (filters.aksi && filters.aksi !== "semua") {
    conditions.push(eq(logAktivitas.aksi, filters.aksi as "tambah" | "edit" | "hapus" | "login" | "logout" | "export_excel"))
  }

  if (filters.petugas && filters.petugas !== "semua") {
    conditions.push(eq(logAktivitas.userId, filters.petugas))
  }

  if (filters.tanggal) {
    const startOfDay = new Date(filters.tanggal)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(filters.tanggal)
    endOfDay.setHours(23, 59, 59, 999)
    conditions.push(gte(logAktivitas.waktuLog, startOfDay))
    conditions.push(lte(logAktivitas.waktuLog, endOfDay))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const [countResult] = await db
    .select({ total: sql<number>`count(*)` })
    .from(logAktivitas)
    .where(whereClause)

  const data = await listLogAktivitas({ ...filters, limit: safeLimit, offset })

  return {
    data,
    total: Number(countResult?.total ?? 0),
    limit: safeLimit,
    offset,
  }
}
