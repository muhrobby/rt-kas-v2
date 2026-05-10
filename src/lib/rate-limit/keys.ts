export const rateLimitKeys = {
  login: (ip: string, path: string = '/api/auth/sign-in') => `rate-limit:login:${ip}:${path}`,
  exportLaporan: (adminId: string, ip: string) => `rate-limit:export:laporan:${adminId}:${ip}`,
  exportLogAktivitas: (adminId: string, ip: string) => `rate-limit:export:log:${adminId}:${ip}`,
};