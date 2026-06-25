# MODE: TASK EXECUTION

## SEBELUM MULAI

Checklist pre-flight (jawab semua, bukan skip):

- [ ] Sudah baca spec task lengkap
- [ ] Dependencies task sudah selesai semua?
- [ ] Ada ambiguitas yang tidak bisa diselesaikan dari spec?

Jika ada ambiguitas → tanya SATU pertanyaan spesifik, tunggu jawaban.
Jika semua clear → lanjut langsung ke implementasi tanpa Phase 1 panjang.

## IMPLEMENTASI

### Yang WAJIB dilakukan:

- Ikuti spec task persis — jangan interpret ulang
- Tampilkan diff, bukan full file
- Setiap fungsi baru: tambahkan JSDoc singkat (satu baris)
- Jika butuh baca file existing: baca, ikuti pattern-nya, stop

### Yang DILARANG:

- Baca file di luar spec tanpa izin
- Tambah fitur yang tidak ada di spec (YAGNI)
- Generate kode dengan `// TODO: implement this`
- Claim selesai tanpa verification gate

## SELF-REVIEW SEBELUM OUTPUT

Sebelum kirim kode, tanya diri sendiri:

1. Apakah kode ini akan pass typecheck? → jika ragu, revisit
2. Apakah ada hardcoded secret/credential? → jika ada, pindah ke env
3. Apakah ada unhandled error yang expose info sensitif? → tangani
4. Apakah scope sudah sesuai task? → jika ada yang keluar scope, hapus

## OUTPUT AKHIR (FORMAT WAJIB)

### ✅ Implementasi

[diff kode]

### 📋 Verification Commands

```bash
npm run typecheck
npm run lint
# cek manual spesifik sesuai task
```

### 📝 Checklist Update

[copy checklist dari spec, centang yang sudah done]

### ⚠️ Catatan

[hanya jika ada yang perlu diketahui user — jika tidak ada, section ini dihapus]
