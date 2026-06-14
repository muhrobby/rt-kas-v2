export const STATUS_EVENT = ["DRAFT", "AKTIF", "BALANCING", "SELESAI", "DIBATALKAN"] as const;
export type StatusEvent = (typeof STATUS_EVENT)[number];

export const ALLOWED_TRANSITIONS: Record<StatusEvent, StatusEvent[]> = {
  DRAFT: ["AKTIF", "DIBATALKAN"],
  AKTIF: ["BALANCING", "DIBATALKAN"],
  BALANCING: ["SELESAI", "AKTIF"],
  SELESAI: [],
  DIBATALKAN: [],
};

export function canTransition(from: StatusEvent, to: StatusEvent): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
