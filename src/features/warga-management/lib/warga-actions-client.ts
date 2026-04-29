import {
  createWargaAction,
  deleteWargaAction,
  listWargaAction,
  updateWargaAction,
  updateWargaPengurusAction,
} from "@/lib/actions/warga"
import type { CreateWargaInput, ToggleWargaPengurusInput, UpdateWargaInput } from "@/lib/validations/warga"
import type { Warga } from "@/types/rt-kas"

type WargaRow = {
  id: number
  nama: string
  blok: string
  telp: string
  statusHunian: "tetap" | "kontrak"
  jumlahAnggota: number
  tglBatasDomisili: string | null
  tglPindah: string | null
  isPengurus: boolean
  rolePengurus: string | null
  createdAt: Date
}

function toDateInput(date: Date | string | null | undefined) {
  if (!date) return ""
  const value = typeof date === "string" ? new Date(date) : date
  return Number.isNaN(value.getTime()) ? "" : value.toISOString().slice(0, 10)
}

function toUiWarga(row: WargaRow): Warga {
  return {
    id: String(row.id),
    nama: row.nama,
    blok: row.blok,
    telp: row.telp,
    statusHunian: row.statusHunian,
    domisili: toDateInput(row.createdAt),
    pindah: row.tglBatasDomisili ?? undefined,
    isPengurus: row.isPengurus,
    rolePengurus: row.rolePengurus ?? undefined,
    jumlahAnggota: row.jumlahAnggota,
  }
}

export async function fetchWargaList(input: { search?: string; status?: "semua" | "tetap" | "kontrak" }) {
  const result = await listWargaAction(input)
  return result.data.map((row) => toUiWarga(row as WargaRow))
}

export async function createWargaFromForm(input: CreateWargaInput) {
  return createWargaAction(input)
}

export async function updateWargaFromForm(id: number, input: UpdateWargaInput) {
  return updateWargaAction(id, input)
}

export async function deleteWargaById(id: number) {
  return deleteWargaAction(id)
}

export async function updateWargaPengurusFromTable(id: number, input: ToggleWargaPengurusInput) {
  return updateWargaPengurusAction(id, input)
}
