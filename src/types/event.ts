export type {
  Event,
  NewEvent,
  EventPanitia,
  NewEventPanitia,
  SumbanganEvent,
  NewSumbanganEvent,
  PengeluaranEvent,
  NewPengeluaranEvent,
} from "@/lib/db/schema/event-acara";

export type StatusEvent = "DRAFT" | "AKTIF" | "BALANCING" | "SELESAI" | "DIBATALKAN";

export type StatusPengeluaran = "PENDING" | "APPROVED" | "REJECTED";

export type SumberSumbangan =
  | "MANDIRI_WARGA"
  | "TALANGAN_KAS"
  | "URUNAN_PENGURUS"
  | "SUMBANGAN_TAMBAHAN_WARGA";
