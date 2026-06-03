# Report Implementasi TASK-005: Tunggakan Admin Billing Exclusion

Tanggal: 2026-06-03

## Ringkasan

TASK-005 memastikan tunggakan admin tidak memasukkan periode bulanan sebelum tagihan pertama warga, sambil tetap menjaga range filter dan behavior kategori `sekali`.

## Perubahan

- File: `src/lib/services/tunggakan-eligibility.ts`
  - Menambahkan wrapper pure `shouldIncludeTunggakanBulananPeriod()` sebagai titik keputusan tunggakan bulanan.

- File: `src/lib/services/tunggakan-service.ts`
  - Memakai helper di atas saat iterasi periode bulanan.
  - `warga.createdAt` tetap diambil dari query awal.
  - Tidak ada query tambahan per warga per bulan.

- File: `src/lib/services/tunggakan-eligibility.test.ts`
  - Menambahkan regresi test untuk warga 2 Mei, 16 Mei, dan 20 Desember.

## Hasil Verifikasi

- `node --import tsx --test src/lib/services/tunggakan-eligibility.test.ts` ✅
- `npm run typecheck` ✅
- `npm run lint` ✅

## Catatan

- Range filter maksimal 24 bulan tetap berlaku di schema validasi.
- Behavior kategori `sekali` tidak diubah.
