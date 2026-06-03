# Report Implementasi TASK-001: Audit Branch dan Isolasi Hotfix Billing Eligibility

Tanggal: 2026-06-03

## Ringkasan

TASK-001 difokuskan pada audit read-only untuk memisahkan perubahan hotfix billing dari perubahan staging yang tidak terkait. Workspace saat audit berada di branch `main`, sehingga target production sudah sesuai.

## Hasil Audit Branch

- Current branch: `main`
- Diff yang dianalisis: `main..staging`
- Kesimpulan: `staging` memiliki banyak perubahan non-issue dan tidak boleh dimerge penuh ke `main`.

## File Hotfix Kandidat

File yang terkait langsung dengan aturan mulai tagihan dan guard billing:

- `src/lib/actions/kas-masuk.ts`
- `src/lib/actions/tunggakan.ts`
- `src/features/kas-masuk/components/kas-masuk-form-modal.tsx`

File pendukung aturan billing yang sudah ada dan tetap menjadi acuan:

- `src/lib/billing/billing-eligibility.ts`

## File Staging yang Tidak Boleh Ikut

Perubahan berikut jelas berada di luar scope hotfix billing:

- `docker-compose.staging.yml`
- `drizzle/0008_admin_sub_roles.sql`
- `drizzle/meta/0008_snapshot.json`
- `src/app/admin/layout.tsx`
- `src/app/admin/pengurus/page.tsx`
- `src/components/auth/permission-gate.tsx`
- `src/components/layout/admin-mobile-sidebar.tsx`
- `src/components/layout/admin-shell.tsx`
- `src/components/layout/admin-sidebar.tsx`
- `src/features/pengurus-management/components/pengurus-list.tsx`
- `src/features/pengurus-management/types.ts`
- `src/lib/actions/admin-role.ts`
- `src/lib/actions/app-settings.ts`
- `src/lib/actions/kas-keluar.ts`
- `src/lib/actions/kategori.ts`
- `src/lib/actions/kuitansi.ts`
- `src/lib/actions/laporan.ts`
- `src/lib/actions/log-aktivitas.ts`
- `src/lib/actions/warga.ts`
- `src/lib/auth/index.ts`
- `src/lib/auth/permission-matrix.ts`
- `src/lib/auth/permissions.ts`
- `src/lib/auth/session.ts`
- `src/lib/constants/admin-roles.ts`
- `src/lib/constants/nav.ts`
- `src/lib/db/schema/auth.ts`
- `src/lib/db/seed.ts`
- `src/lib/db/truncate.ts`
- `src/lib/services/admin-role-service.ts`
- `src/lib/validations/admin-role.ts`

## Catatan

- Hotfix production harus tetap minimal dan hanya mengambil perubahan billing yang relevan.
- Jangan membawa refactor permission, admin sub-role, atau migration staging ke `main`.
- Report ini hanya hasil audit dan isolasi file; belum ada perubahan fungsional di luar dokumentasi task.
