# TASKS - Production Hotfix Aturan Mulai Tagihan Warga Baru

## Scope Dokumen

Dokumen ini adalah output Phase 1 dan Phase 2 saja. Tidak ada implementasi kode fungsional di fase ini.

Tujuan hotfix: memastikan warga yang terdaftar tanggal 16 sampai akhir bulan tidak ditagih dan tidak bisa dibayar pada bulan pendaftaran. Tagihan pertama untuk warga tersebut dimulai bulan berikutnya. Perubahan harus production-safe untuk `main` dan tidak membawa breaking change atau fitur staging lain yang tidak terkait.

Catatan branch saat dokumen dibuat:

- Workspace saat ini berada di branch `staging`, bukan `main`.
- Branch `staging` memiliki banyak perubahan non-issue terhadap `main`, terutama admin sub-role/permission dan docker compose staging.
- Untuk hotfix production, jangan merge seluruh `staging` ke `main`.
- Backport hanya file dan perubahan yang terkait aturan mulai tagihan warga baru.

## Phase 1 - Review PRD

### Ringkasan PRD

PRD sudah memuat aturan utama issue ini secara eksplisit:

- `WRG-011`: tanggal mulai tagihan efektif berdasarkan `warga.createdAt` dan cutoff tanggal 15.
- `KM-011`: backend guard menolak pembayaran periode sebelum tagihan pertama.
- `TNG-009`: tunggakan mengecualikan periode sebelum tagihan pertama.
- `PW-009`: portal warga tidak menampilkan status tagihan `belum` sebelum tagihan pertama.
- `13.6 Tagihan Warga Baru`: sumber tanggal adalah `warga.createdAt`, cutoff tanggal 15, timezone bisnis `Asia/Jakarta`, dan scope hanya kategori `bulanan`.

### Ambiguitas atau Hal yang Terlewat

- PRD sudah jelas untuk aturan cutoff tanggal 15: tanggal 1 sampai 15 mulai bulan yang sama, tanggal 16 sampai akhir bulan mulai bulan berikutnya.
- PRD belum mencatat risiko branch/deployment drift: PRD menyatakan fitur implemented, tetapi production masih mengalami issue.
- PRD belum menyebut strategi hotfix production agar tidak ikut membawa perubahan staging yang tidak terkait.
- PRD belum menjelaskan detail UI ketika bulan yang sudah terpilih menjadi tidak eligible setelah admin mengganti warga, kategori, atau tahun.
- PRD belum menentukan apakah bulan tidak eligible harus benar-benar disembunyikan atau cukup disabled. PRD mengizinkan hide atau disable, jadi task harus memilih satu behavior konsisten.
- PRD belum menyediakan metode test data untuk mengatur `createdAt` warga tanggal 15, 16, dan akhir tahun pada database development.
- PRD belum punya test otomatis khusus billing eligibility. Verifikasi saat ini harus memakai manual test plus `npm run typecheck`, `npm run lint`, dan `npm run build`.
- PRD menyebut timezone `Asia/Jakarta`, tetapi schema memakai `timestamp` Drizzle. Implementer harus memverifikasi hasil cutoff pada data production/dev agar tidak bergeser karena interpretasi timezone.
- PRD mencakup kategori `sekali`, tetapi issue ini hanya boleh mengubah behavior kategori `bulanan`. Kategori `sekali` harus tetap mengikuti behavior existing.

### Keputusan Blueprint

- Sumber kebenaran aturan billing adalah utility server `src/lib/billing/billing-eligibility.ts`.
- Guard backend di kas masuk wajib tetap ada meskipun UI sudah disable bulan.
- UI kas masuk harus menyaring `selectedMonths` sebelum validasi dan submit, bukan hanya disable button bulan.
- Tunggakan admin dan portal warga harus memakai helper eligibility yang sama agar tidak terjadi perbedaan aturan antar fitur.
- Tidak ada migration database dan tidak ada dependency baru untuk hotfix ini.
- Tidak ada perubahan auth, permission, schema, export, branding, atau admin sub-role yang boleh ikut dalam hotfix ini.

## Phase 2 - Security dan Resource Review

### Security Checklist

- [ ] Injection vulnerabilities: risiko rendah jika query tetap memakai Drizzle query builder dan tidak membuat SQL string manual dari bulan/tahun.
- [ ] Secrets/credentials hardcoded: tidak relevan untuk hotfix ini. Jangan sentuh `.env`, `.env.example`, atau config secret.
- [ ] Unhandled error yang ekspos info sensitif: backend harus mengembalikan error generik/user-friendly seperti `Periode tagihan belum berlaku untuk warga ini.`.
- [ ] Input validation dan sanitization: `wargaId`, `kategoriId`, `bulanTagihan`, dan `tahunTagihan` tetap wajib divalidasi server-side sebelum cek eligibility.
- [ ] Auth/Authorization gaps: action admin kas masuk dan tunggakan tetap wajib admin/permission check. Portal warga tetap wajib mengambil `wargaId` dari session server.
- [ ] IDOR: portal warga tidak boleh menerima `wargaId` dari client. Admin action boleh menerima `wargaId` hanya setelah authorization admin berhasil.

### Resource Checklist

- [ ] Memory leaks: tidak ada event listener, subscription, atau long-running process baru yang dibutuhkan.
- [ ] Unclosed connections: tidak ada koneksi DB manual baru yang dibutuhkan.
- [ ] Race conditions: backend guard eligibility tidak menggantikan unique constraint anti-duplikasi pembayaran. Insert paralel tetap harus ditangani dengan transaksi/duplicate check existing.
- [ ] Infinite loops: perhitungan periode harus memakai month index atau loop berbatas 12/24 bulan.
- [ ] N+1 query problem: tunggakan tidak boleh query per warga per bulan. `createdAt` warga harus ikut dalam query awal dan eligibility dihitung di memory.
- [ ] Inefisiensi O(n^2+): kombinasi warga x kategori x bulan existing masih dapat diterima dalam batas range 24 bulan. Hotfix tidak boleh menambah query nested.

## Blueprint Struktur Folder Final

Struktur final yang relevan untuk hotfix production:

```text
docs/
  PRD.md
  TASKS.md
  report-implementation/
    [tanggal]-billing-eligibility-production-hotfix.md
src/
  lib/
    billing/
      billing-eligibility.ts
    actions/
      kas-masuk.ts
      tunggakan.ts
      warga-portal.ts
    services/
      tunggakan-service.ts
      warga-portal-service.ts
    validations/
      transaksi.ts
      tunggakan.ts
    db/
      schema/
        warga.ts
        transaksi.ts
  features/
    kas-masuk/
      components/
        kas-masuk-form-modal.tsx
        kas-masuk-view.tsx
        month-payment-selector.tsx
      lib/
        kas-masuk-actions-client.ts
    warga-portal/
      components/
        warga-dashboard-view.tsx
        warga-riwayat-view.tsx
        warga-bill-status.tsx
```

File yang tidak boleh ikut berubah untuk hotfix ini:

- `src/lib/auth/*`, kecuali sudah berubah di `main` dan tidak berasal dari staging sub-role.
- `src/lib/constants/admin-roles.ts`.
- `src/lib/services/admin-role-service.ts`.
- `src/lib/actions/admin-role.ts`.
- `src/app/admin/pengurus/page.tsx`.
- `drizzle/0008_admin_sub_roles.sql`.
- `docker-compose.staging.yml`.

## Dependency Map Antar Fitur

| Fitur | Bergantung pada | Dipakai oleh | Catatan |
|---|---|---|---|
| Billing Eligibility Core | `warga.createdAt`, timezone `Asia/Jakarta` | Kas Masuk, Tunggakan, Portal Warga | Harus menjadi sumber aturan tunggal. |
| Kas Masuk Backend Guard | Billing Eligibility Core, validasi transaksi, auth admin | Kas Masuk UI, produksi hotfix | Security boundary utama. |
| Kas Masuk UI | Billing data dari action, paid months, not eligible months | Admin input pembayaran | Sumber issue production paling mungkin karena `main` belum menyaring selected months seperti `staging`. |
| Tunggakan Admin | Billing Eligibility Core, kategori bulanan, transaksi masuk | Dashboard monitoring admin | Tidak boleh query per warga per bulan. |
| Portal Warga | Billing Eligibility Core, session `wargaId` | Dashboard dan riwayat warga | Tidak boleh menerima `wargaId` dari client. |
| QA dan Rollout | Semua fitur di atas | Release production `main` | Wajib memastikan diff hotfix minimal dan tidak membawa fitur staging lain. |

## Task List

### TASK-001: Audit branch dan isolasi perubahan hotfix

**File yang dibuat/diubah:**

- `docs/TASKS.md`
- `docs/report-implementation/[tanggal]-billing-eligibility-production-hotfix.md`

**Input/Output yang diharapkan:**

- Input: branch `main`, branch `staging`, dan diff file terkait billing.
- Output: daftar file yang aman dibackport dan daftar file staging yang tidak boleh ikut masuk production.

**Dependencies antar task:**

- Tidak ada.

**Kriteria selesai:**

- [ ] Konfirmasi branch kerja sebelum implementasi. Jika target adalah production, branch harus `main` atau feature branch yang dibuat dari `main`.
- [ ] Jalankan diff read-only `main..staging` dan identifikasi perubahan yang terkait issue billing saja.
- [ ] Pastikan tidak ada perubahan admin sub-role, migration `0008_admin_sub_roles`, docker compose staging, atau permission refactor yang ikut task hotfix.
- [ ] Catat bahwa `staging` memiliki perubahan non-issue yang tidak boleh dimerge penuh ke `main`.
- [ ] Buat report singkat berisi file kandidat hotfix dan alasan pemilihan.

Status: done

**Catatan keamanan:**

- Jangan checkout atau reset branch tanpa konfirmasi jika ada perubahan kerja user.
- Jangan membuka atau menyalin isi `.env` ke report.
- Jangan melakukan merge seluruh staging ke main karena membawa perubahan authorization dan migration yang tidak diminta.

### TASK-002: Verifikasi dan kunci aturan Billing Eligibility Core

**File yang dibuat/diubah:**

- `src/lib/billing/billing-eligibility.ts`
- `src/lib/db/schema/warga.ts` hanya dibaca untuk memastikan field `createdAt` tersedia.

**Input/Output yang diharapkan:**

- Input: `createdAt` warga sebagai `Date`, `bulan` angka 1 sampai 12, dan `tahun` angka 2000 sampai 2100.
- Output: periode tagihan pertama `{ bulan, tahun }` dan boolean eligibility untuk periode tertentu.
- Output gagal: bulan/tahun invalid menghasilkan `false`, bukan crash yang bocor ke user.

**Dependencies antar task:**

- TASK-001 harus selesai dulu agar file yang disentuh tetap minimal.

**Kriteria selesai:**

- [ ] `getFirstBillablePeriod` memakai cutoff tanggal 15.
- [ ] Warga dibuat tanggal 1 sampai 15 eligible pada bulan yang sama.
- [ ] Warga dibuat tanggal 16 sampai akhir bulan eligible pada bulan berikutnya.
- [ ] Warga dibuat 20 Desember 2026 eligible mulai Januari 2027.
- [ ] Perhitungan memakai kalender `Asia/Jakarta`.
- [ ] Fungsi tidak melakukan query database.
- [ ] Tidak ada perubahan schema database atau migration baru.
- [ ] `npm run typecheck` tidak error setelah task ini.

Status: done

**Catatan keamanan:**

- Jangan menerima `createdAt` dari payload client sebagai sumber keputusan backend.
- Jangan menambahkan dependency date/time baru tanpa kebutuhan jelas.
- Jangan mengubah batas tahun validasi 2000 sampai 2100 tanpa update PRD.

### TASK-003: Backport guard UI Kas Masuk agar selected months selalu eligible

**File yang dibuat/diubah:**

- `src/features/kas-masuk/components/kas-masuk-form-modal.tsx`
- `src/features/kas-masuk/components/month-payment-selector.tsx`
- `src/features/kas-masuk/lib/kas-masuk-actions-client.ts`

**Input/Output yang diharapkan:**

- Input: warga terpilih, kategori terpilih, tahun terpilih, bulan lunas, bulan tidak eligible, dan periode tagihan pertama warga.
- Output UI: bulan sebelum tagihan pertama disabled atau tidak dapat dipilih untuk kategori `bulanan`.
- Output submit: payload `bulanTagihan` hanya berisi bulan yang selectable dan eligible.
- Output UX: label jumlah bulan terpilih menghitung bulan yang benar-benar valid untuk disubmit.

**Dependencies antar task:**

- TASK-001 harus selesai dulu.
- TASK-002 harus selesai dulu.

**Kriteria selesai:**

- [ ] `kas-masuk-form-modal.tsx` memiliki fungsi lokal untuk menentukan bulan selectable berdasarkan `paidMonths`, `notEligibleMonths`, `firstBillMonth`, `firstBillYear`, kategori, dan tahun.
- [ ] `selectedMonths` difilter dari state bulan sebelum dipakai untuk label, validasi, rendering, dan submit.
- [ ] Jika admin mengganti warga dari warga eligible bulan berjalan ke warga yang belum eligible, bulan lama yang tersimpan di state tidak ikut tersubmit.
- [ ] Jika admin mengganti tahun ke sebelum tahun tagihan pertama, semua bulan bulanan menjadi tidak selectable.
- [ ] Kategori `sekali` tetap bisa memilih satu bulan sesuai behavior existing dan tidak terkena guard eligibility bulanan.
- [ ] Bulan yang sudah lunas tetap disabled/tercoret sesuai behavior existing.
- [ ] Empty/error state `Pilih minimal 1 bulan.` memakai `selectedMonths.length`, bukan state mentah.
- [ ] Tidak ada perubahan layout besar atau styling yang tidak terkait hotfix.
- [ ] `npm run typecheck` dan `npm run lint` tidak error.

Status: done

**Catatan keamanan:**

- UI guard bukan security boundary. Backend tetap wajib menolak periode tidak eligible.
- Jangan menampilkan data internal selain info periode tagihan pertama yang memang dibutuhkan admin.
- Jangan mengubah permission atau auth pada task ini.

### TASK-004: Verifikasi guard backend Kas Masuk untuk bypass UI

**File yang dibuat/diubah:**

- `src/lib/actions/kas-masuk.ts`
- `src/lib/validations/transaksi.ts`

**Input/Output yang diharapkan:**

- Input: payload kas masuk berisi `wargaId`, `kategoriId`, `bulanTagihan`, `tahunTagihan`, `nominal`, dan optional `keterangan`.
- Output sukses: transaksi tersimpan hanya untuk periode yang eligible.
- Output gagal: `{ ok: false, error: "Periode tagihan belum berlaku untuk warga ini." }` atau pesan sepadan yang user-friendly.

**Dependencies antar task:**

- TASK-002 harus selesai dulu.
- TASK-003 tidak wajib selesai dulu karena backend guard harus berdiri sendiri.

**Kriteria selesai:**

- [ ] Action mengambil `warga.createdAt` dari database, bukan dari client.
- [ ] Untuk kategori `bulanan`, semua bulan dalam multi-submit dicek dengan `isPeriodEligible`.
- [ ] Jika ada satu bulan tidak eligible dalam multi-submit, seluruh submit ditolak dan tidak ada transaksi parsial.
- [ ] Untuk kategori `sekali`, behavior existing tidak berubah.
- [ ] Validasi duplikasi pembayaran existing tetap berjalan.
- [ ] Error duplicate tetap user-friendly dan tidak membuka detail database.
- [ ] Revalidation path existing untuk admin dashboard, kas masuk, dan portal warga tetap dipertahankan.
- [ ] `npm run typecheck` dan `npm run lint` tidak error.

Status: done

**Catatan keamanan:**

- Backend guard wajib tetap ada walaupun UI sudah benar.
- Jangan expose stack trace atau detail constraint database di response action.
- Jangan mengubah authorization admin di luar kebutuhan hotfix.

### TASK-005: Verifikasi Tunggakan Admin mengecualikan periode sebelum tagihan pertama

**File yang dibuat/diubah:**

- `src/lib/services/tunggakan-service.ts`
- `src/lib/actions/tunggakan.ts`
- `src/lib/validations/tunggakan.ts`

**Input/Output yang diharapkan:**

- Input: filter tunggakan `bulanMulai`, `tahunMulai`, `bulanSelesai`, `tahunSelesai`, dan optional `kategoriId`.
- Output: daftar tunggakan tidak berisi item kategori `bulanan` sebelum periode tagihan pertama tiap warga.
- Output summary: `totalWarga` dan `totalNominal` dihitung setelah periode tidak eligible dikecualikan.

**Dependencies antar task:**

- TASK-002 harus selesai dulu.

**Kriteria selesai:**

- [ ] Query warga untuk tunggakan menyertakan `createdAt`.
- [ ] Warga dibuat 2 Mei 2026 tidak muncul menunggak Januari sampai April 2026.
- [ ] Warga dibuat 2 Mei 2026 muncul menunggak Mei 2026 jika belum dibayar.
- [ ] Warga dibuat 16 Mei 2026 tidak muncul menunggak Mei 2026.
- [ ] Warga dibuat 16 Mei 2026 muncul menunggak Juni 2026 jika belum dibayar.
- [ ] Warga dibuat 20 Desember 2026 muncul mulai Januari 2027, bukan Desember 2026.
- [ ] Tidak ada query tambahan per warga per bulan.
- [ ] Range filter maksimal 24 bulan tetap berlaku.
- [ ] Behavior kategori `sekali` tidak berubah.

Status: done

**Catatan keamanan:**

- Action tunggakan tetap admin-only.
- Jangan mengembalikan data warga lebih banyak dari yang dibutuhkan tabel tunggakan.
- Validasi range tetap wajib untuk mencegah CPU exhaustion.

### TASK-006: Verifikasi Portal Warga tidak menampilkan tagihan sebelum eligible

**File yang dibuat/diubah:**

- `src/lib/services/warga-portal-service.ts`
- `src/features/warga-portal/components/warga-dashboard-view.tsx`
- `src/features/warga-portal/components/warga-riwayat-view.tsx`
- `src/features/warga-portal/components/warga-bill-status.tsx`

**Input/Output yang diharapkan:**

- Input: `wargaId` dari session server dan periode dashboard/riwayat.
- Output dashboard: status tagihan bulan berjalan tidak menampilkan `belum` jika bulan berjalan belum eligible.
- Output riwayat: periode sebelum tagihan pertama tidak membuat status `belum` baru.
- Output kuitansi: transaksi lunas yang valid tetap dapat dilihat sesuai authorization existing.

**Dependencies antar task:**

- TASK-002 harus selesai dulu.

**Kriteria selesai:**

- [ ] Portal mengambil `wargaId` dari session server, bukan query string atau input client.
- [ ] Warga dibuat 2 Mei 2026 tidak melihat tagihan belum bayar untuk Januari sampai April 2026.
- [ ] Warga dibuat 2 Mei 2026 melihat tagihan Mei 2026 jika belum dibayar.
- [ ] Warga dibuat 16 Mei 2026 tidak melihat tagihan Mei 2026 sebagai `belum`.
- [ ] Dashboard bulan berjalan tidak menampilkan `belum` jika periode belum eligible.
- [ ] Kategori `sekali` tetap memakai status existing seperti `belum-tempo`.
- [ ] Empty state tetap jelas dan layout mobile tidak rusak.

Status: done

**Catatan keamanan:**

- Jangan menerima `wargaId` dari client pada portal warga.
- Jangan mengubah otorisasi kuitansi; warga tetap hanya boleh melihat transaksi miliknya.
- Jangan menampilkan data warga lain pada error atau empty state.

### TASK-007: Manual regression test untuk cutoff tanggal 15

**File yang dibuat/diubah:**

- `docs/report-implementation/[tanggal]-billing-eligibility-production-hotfix.md`
- `docs/TASKS.md` untuk update checklist setelah implementasi.

**Input/Output yang diharapkan:**

- Input: data test warga dengan `createdAt` tanggal 15, tanggal 16, dan tanggal 20 Desember.
- Output: hasil manual test kas masuk, tunggakan, dan portal warga yang membuktikan aturan cutoff benar.

**Dependencies antar task:**

- TASK-003 harus selesai dulu.
- TASK-004 harus selesai dulu.
- TASK-005 harus selesai dulu.
- TASK-006 harus selesai dulu.

**Kriteria selesai:**

- [ ] Test warga dibuat 15 Mei 2026: Mei 2026 eligible.
- [ ] Test warga dibuat 16 Mei 2026: Mei 2026 tidak eligible, Juni 2026 eligible.
- [ ] Test warga dibuat 20 Desember 2026: Desember 2026 tidak eligible, Januari 2027 eligible.
- [ ] Test form kas masuk: bulan tidak eligible disabled dan tidak terkirim saat submit.
- [ ] Test bypass UI: payload langsung untuk bulan tidak eligible ditolak backend.
- [ ] Test multi-submit: jika salah satu bulan tidak eligible, tidak ada transaksi parsial tersimpan.
- [ ] Test tunggakan: periode sebelum tagihan pertama tidak muncul dan summary tetap benar.
- [ ] Test portal warga: dashboard dan riwayat tidak menampilkan tagihan `belum` sebelum eligible.
- [ ] Test kategori `sekali`: behavior tidak berubah.
- [ ] Catat hasil aktual, expected, dan bukti command verification di report.

Status: done

**Catatan keamanan:**

- Gunakan database development/test, bukan data production asli.
- Jangan memasukkan nomor telepon warga production ke report.
- Saat test bypass UI, jangan menyimpan request berisi session/token di dokumentasi.

### TASK-008: Verifikasi build dan production-safe diff sebelum release

**File yang dibuat/diubah:**

- `docs/report-implementation/[tanggal]-billing-eligibility-production-hotfix.md`
- Tidak ada file source tambahan kecuali hasil task sebelumnya.

**Input/Output yang diharapkan:**

- Input: perubahan hotfix yang sudah selesai.
- Output: bukti bahwa build aman, diff minimal, dan tidak ada breaking change dari staging ke main.

**Dependencies antar task:**

- TASK-001 sampai TASK-007 harus selesai dulu.

**Kriteria selesai:**

- [ ] Jalankan `npm run typecheck` dan hasilnya pass.
- [ ] Jalankan `npm run lint` dan hasilnya pass atau hanya warning non-blocking yang sudah dicatat.
- [ ] Jalankan `npm run build` dan hasilnya pass.
- [ ] Pastikan `package.json` dan `package-lock.json` tidak berubah kecuali ada alasan eksplisit. Untuk hotfix ini seharusnya tidak berubah.
- [ ] Pastikan tidak ada migration Drizzle baru untuk hotfix ini.
- [ ] Pastikan diff akhir hanya mencakup file terkait billing eligibility/kas masuk/portal/tunggakan dan dokumentasi report.
- [ ] Pastikan tidak ada perubahan admin sub-role staging yang ikut masuk.
- [ ] Pastikan tidak ada `.env`, credential, token, atau data production yang tersentuh.

Status: done

**Catatan keamanan:**

- Jangan commit secrets atau file environment.
- Jangan force push atau amend commit production tanpa instruksi eksplisit.
- Jangan deploy sebelum bukti verification command dan manual regression tercatat.

## Checkpoint Implementasi

### Checkpoint A: Scope dan Core Rule

- [ ] TASK-001 selesai.
- [ ] TASK-002 selesai.
- [ ] Tidak ada file staging non-issue yang masuk scope hotfix.

### Checkpoint B: Admin Payment Flow

- [ ] TASK-003 selesai.
- [ ] TASK-004 selesai.
- [ ] Admin tidak bisa memilih atau submit bulan sebelum tagihan pertama.
- [ ] Backend menolak bypass UI untuk periode tidak eligible.

### Checkpoint C: Monitoring dan Portal

- [ ] TASK-005 selesai.
- [ ] TASK-006 selesai.
- [ ] Tunggakan dan portal warga memakai aturan eligibility yang sama.

### Checkpoint D: Release Safety

- [ ] TASK-007 selesai.
- [ ] TASK-008 selesai.
- [ ] Diff minimal dan production-safe.

## Skenario Acceptance Global

- [ ] Warga dibuat tanggal 15 Mei 2026, kategori bulanan belum dibayar, form kas masuk memperbolehkan Mei 2026.
- [ ] Warga dibuat tanggal 16 Mei 2026, form kas masuk tidak memperbolehkan Mei 2026.
- [ ] Warga dibuat tanggal 16 Mei 2026, backend menolak pembayaran Mei 2026 walaupun payload dikirim langsung.
- [ ] Warga dibuat tanggal 16 Mei 2026, tunggakan Mei 2026 tidak menampilkan warga tersebut.
- [ ] Warga dibuat tanggal 16 Mei 2026, tunggakan Juni 2026 menampilkan warga tersebut jika belum bayar.
- [ ] Warga dibuat tanggal 16 Mei 2026, portal warga bulan Mei tidak menampilkan tagihan `belum`.
- [ ] Warga dibuat tanggal 20 Desember 2026, tagihan pertama adalah Januari 2027.
- [ ] Kategori `sekali` tidak berubah dari behavior existing.
- [ ] Tidak ada dependency baru, migration baru, atau perubahan auth/permission yang tidak terkait hotfix.

## Verification Commands

Jalankan setelah implementasi, bukan pada Phase 1/2:

```bash
npm run typecheck
npm run lint
npm run build
```

## Catatan Untuk Implementer Junior atau AI Agent

- Jangan menebak behavior. Ikuti PRD section `13.6 Tagihan Warga Baru` dan task ini.
- Jangan merge seluruh `staging` ke `main`.
- Jangan memperbaiki fitur lain walaupun terlihat dekat dengan file yang sama.
- Jika menemukan beda antara `main` dan `staging`, ambil hanya perubahan yang terkait issue bulan tidak eligible.
- Jika branch kerja bukan `main` atau feature branch dari `main`, berhenti dan minta arahan sebelum mengubah source code.
- Jika ada data production yang dibutuhkan untuk validasi, minta data dummy atau jalankan test di environment staging/dev, bukan production langsung.
