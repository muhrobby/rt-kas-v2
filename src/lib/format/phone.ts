export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return ""
  if (digits.startsWith("0")) return digits
  if (digits.startsWith("62")) return `0${digits.slice(2)}`
  return `0${digits}`
}
