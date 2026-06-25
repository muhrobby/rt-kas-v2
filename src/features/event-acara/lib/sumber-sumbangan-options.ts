import type { StatusEvent } from "@/lib/constants/event-status"
import type { SumberSumbangan } from "@/lib/validations/sumbangan-event"

export const SUMBER_LABEL: Record<SumberSumbangan, string> = {
  MANDIRI_WARGA: "Sukarela Warga",
  TALANGAN_KAS: "Talangan Kas RT",
  URUNAN_PENGURUS: "Urunan Pengurus",
  SUMBANGAN_TAMBAHAN_WARGA: "Sumbangan Tambahan Warga",
}

/**
 * Sumber yang boleh dipakai berdasarkan status event.
 * AKTIF: semua sumber.
 * BALANCING: hanya untuk tutup defisit (bukan MANDIRI_WARGA).
 */
export function allowedSumberByStatus(status: StatusEvent): SumberSumbangan[] {
  if (status === "AKTIF") {
    return ["MANDIRI_WARGA", "TALANGAN_KAS", "URUNAN_PENGURUS", "SUMBANGAN_TAMBAHAN_WARGA"]
  }
  if (status === "BALANCING") {
    return ["TALANGAN_KAS", "URUNAN_PENGURUS", "SUMBANGAN_TAMBAHAN_WARGA"]
  }
  return []
}
