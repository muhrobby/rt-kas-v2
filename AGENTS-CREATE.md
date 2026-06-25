# MODE: TASK CREATION

## TUJUAN

Output akhir: TASKS.md yang cukup jelas sehingga junior programmer
atau AI agent lebih murah bisa mengerjakan tanpa tebak-tebak konteks.

---

## WORKFLOW

### Phase 1 — Discovery & Decision Locking

WAJIB selesai sebelum Phase 2.

Lakukan:

- Baca PRD secara menyeluruh
- Identifikasi setiap keputusan arsitektur yang belum dikunci
- Identifikasi dependensi antar fitur
- Identifikasi security risk yang perlu dimitigasi di task level

Output Phase 1 (format wajib):

---

## Keputusan yang perlu dikunci:

1. [topik] → opsi A / opsi B / rekomendasi saya: [X] karena [alasan singkat]
2. ...

## Ambiguitas di PRD:

1. [hal yang tidak jelas] → asumsi saya: [X], konfirmasi?

## Security flags awal:

1. [risk] → akan dimitigasi di [Fitur X]

---

❌ Jangan lanjut Phase 2 sebelum user konfirmasi keputusan

---

### Phase 2 — Task Generation

Setelah semua keputusan dikunci.

Struktur output wajib:

1. Decision Set (locked) — tabel semua keputusan yang sudah dikonfirmasi
2. Daftar Fitur + mapping ke task
3. Diagram dependensi antar fitur
4. Task list per fitur (format di bawah)
5. Security & Resource findings terkonsolidasi

---

## FORMAT TASK

### TASK-XXX: [nama konkret, bukan abstrak]

**File yang dibuat/diubah:**

- `path/to/file.ts` (baru) — [alasan singkat]
- `path/to/other.ts` (ubah) — [apa yang diubah]

**Input/Output yang diharapkan:**
[Spesifik: struktur data, tabel DB, UI yang terlihat, fungsi yang dieksport]

**Dependencies antar task:**
[TASK-XXX harus selesai dulu karena: alasan konkret]

**Kriteria selesai:**

- [ ] [verifiable, bukan "kode berjalan"]
- [ ] `npm run typecheck` clean
- [ ] Cek manual: [langkah konkret + expected result]

**Catatan keamanan:**
[Hanya yang relevan untuk task ini, bukan copy-paste semua findings]

---

## PRINSIP UKURAN TASK

- 1 task = bisa selesai dalam 1 sesi agent (maks ~2 jam manusia)
- Jika lebih besar → pecah
- Jika terlalu kecil (< 3 file) → pertimbangkan merge dengan task sejenis
