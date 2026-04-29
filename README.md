# RT Kas (Kanvas RT)

Aplikasi web untuk pengelolaan kas RT: data warga, kategori kas, kas masuk/keluar, tunggakan, laporan, log aktivitas, dan portal warga.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- PostgreSQL + Drizzle ORM
- Better Auth (role `admin` dan `user`)
- Tailwind CSS 4 + shadcn/ui

## Fitur Utama

- Admin: dashboard, manajemen warga, kategori kas, kas masuk, kas keluar, tunggakan, laporan, log aktivitas
- Warga: dashboard pribadi, riwayat pembayaran, laporan transparansi, kuitansi
- Export: laporan dan log aktivitas ke Excel
- Validasi dan business rules di server action + schema database

## Struktur Folder (ringkas)

```text
src/
  app/                # routes (auth, admin, warga, api)
  components/         # komponen shared + layout + ui
  features/           # modul per fitur
  lib/
    actions/          # server actions
    auth/             # auth dan permission
    db/               # schema, seed, truncate, migrasi util
    services/         # business logic
    validations/      # zod schemas
drizzle/              # migration files
```

## Prasyarat

- Node.js 20+
- PostgreSQL berjalan dan bisa diakses

## Setup Cepat

1. Install dependency

```bash
npm install
```

2. Buat file environment

```bash
cp .env.example .env
```

3. Isi variabel di `.env`

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `SEED_ADMIN_PASSWORD`

4. Siapkan database

```bash
npm run db:push
npm run db:seed
```

5. Jalankan development server

```bash
npm run dev
```

App berjalan di `http://localhost:3000`.

## Scripts

- `npm run dev` - jalankan app (dev)
- `npm run build` - build production
- `npm run start` - jalankan hasil build
- `npm run lint` - lint codebase
- `npm run typecheck` - cek TypeScript
- `npm run db:generate` - generate migration
- `npm run db:migrate` - apply migration
- `npm run db:push` - push schema ke database
- `npm run db:studio` - buka Drizzle Studio
- `npm run db:seed` - seed data awal
- `npm run db:truncate` - kosongkan data tabel
- `npm run db:migrate-phone-prefix` - util migrasi format nomor telepon

## Catatan Keamanan

- Jangan commit file `.env`
- Gunakan secret yang kuat untuk `BETTER_AUTH_SECRET`
- Batasi akses DB hanya ke environment yang diperlukan
