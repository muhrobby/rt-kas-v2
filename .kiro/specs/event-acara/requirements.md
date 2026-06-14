# Requirements Document

## Introduction

Fitur Event/Acara memungkinkan pengurus RT mengelola acara komunitas (contoh: 17 Agustus, kerja bakti, perayaan hari besar) sebagai entitas keuangan yang **terisolasi dari Kas RT utama**. Pengurus membuat event, menunjuk panitia, dan menarik sumbangan sukarela dari warga. Panitia mencatat pengeluaran event secara terinci (bulk input), pengurus menyetujui pengeluaran tersebut, dan setelah event balance pengurus dapat memindahkan sisa dana positif ke Kas RT. Laporan final hanya dibuat setelah saldo event balance (≥ 0 dan tidak ada pengeluaran pending).

Tujuan utama:

1. Memisahkan dana event dari saldo kas utama RT sehingga pelaporan event tidak mencampuri arus kas reguler.
2. Memberikan transparansi pemasukan (sumbangan) dan pengeluaran event kepada warga dan pengurus.
3. Mendelegasikan pencatatan pengeluaran ke panitia, dengan kontrol persetujuan tetap pada pengurus.
4. Menyediakan jalur eksplisit (button "Taruh di Kas") untuk memasukkan sisa dana ke Kas RT sebagai pemasukan resmi.
5. Mencegah dan menangani kondisi saldo event minus secara terkontrol (lihat Requirement 7).

## Glossary

- **Sistem_Event**: Subsistem yang mengelola siklus hidup entitas Event (pembuatan, status, pembatalan, penutupan).
- **Sistem_Panitia**: Subsistem yang mengelola penunjukan dan pencabutan keanggotaan Panitia per Event.
- **Sistem_Sumbangan**: Subsistem yang mencatat kontribusi keuangan dari Warga atau Pengurus ke Event.
- **Sistem_Pengeluaran_Event**: Subsistem yang mencatat itemisasi belanja Event yang diinput oleh Panitia.
- **Sistem_Approval**: Subsistem yang memberi keputusan approve atau reject pada Pengeluaran_Event.
- **Sistem_Saldo_Event**: Subsistem yang menghitung saldo Event berdasarkan Sumbangan dan Pengeluaran_Event yang sudah approved.
- **Sistem_Transfer_Kas**: Subsistem yang memindahkan sisa dana Event ke Kas RT sebagai transaksi pemasukan kas.
- **Sistem_Laporan_Event**: Subsistem yang menghasilkan laporan final Event setelah saldo balance.
- **Sistem_Otorisasi**: Subsistem yang memvalidasi peran (Pengurus, Panitia, Warga) pada setiap aksi.
- **Sistem_Audit**: Subsistem pencatatan log aktivitas yang sudah ada di aplikasi (`log-aktivitas`) yang harus dipanggil dari fitur Event.
- **Pengurus**: Pengguna dengan peran administrator RT (mencakup sub-role pengurus yang sudah ada).
- **Panitia**: Pengguna (Warga atau Pengurus) yang ditunjuk Pengurus untuk mengelola Pengeluaran_Event pada Event tertentu.
- **Warga**: Pengguna terdaftar yang dapat memberikan Sumbangan ke Event.
- **Event**: Entitas acara komunitas dengan atribut nama, tanggal, deskripsi, dan status.
- **Sumbangan**: Catatan kontribusi keuangan ke Event dengan nominal ≥ 0 (boleh nol untuk warga yang tidak bersedia).
- **Pengeluaran_Event**: Catatan satu item belanja Event dengan deskripsi, nominal, tanggal, dan status approval.
- **Saldo_Event**: Nilai numerik = jumlah Sumbangan − jumlah Pengeluaran_Event yang berstatus APPROVED, dievaluasi pada satu titik waktu.
- **Status_Event**: Salah satu dari `DRAFT`, `AKTIF`, `BALANCING`, `SELESAI`, `DIBATALKAN`.
- **Status_Pengeluaran**: Salah satu dari `PENDING`, `APPROVED`, `REJECTED`.
- **Talangan_Kas_RT**: Sumbangan ke Event yang sumbernya adalah Kas RT, dicatat pula sebagai Pengeluaran Kas RT pada modul transaksi utama.
- **Kas_RT**: Saldo kas utama yang dikelola oleh modul `kas-masuk` dan `kas-keluar` yang sudah ada.

## Requirements

### Requirement 1: Pembuatan dan Siklus Hidup Event

**User Story:** Sebagai Pengurus, saya ingin membuat dan mengelola siklus hidup Event, sehingga setiap acara komunitas memiliki ruang keuangan tersendiri yang terpisah dari Kas RT.

#### Acceptance Criteria

1. WHEN seorang Pengurus mengirim form pembuatan Event dengan nama, tanggal pelaksanaan, dan deskripsi opsional, THE Sistem_Event SHALL menyimpan Event baru dengan Status_Event bernilai `DRAFT`.
2. IF nama Event kosong atau tanggal pelaksanaan tidak valid, THEN THE Sistem_Event SHALL menolak pembuatan Event dan mengembalikan pesan kesalahan yang menyebut field yang gagal divalidasi.
3. WHEN seorang Pengurus mengaktifkan Event dengan Status_Event `DRAFT`, THE Sistem_Event SHALL mengubah Status_Event menjadi `AKTIF`.
4. WHILE Status_Event bernilai `AKTIF`, THE Sistem_Event SHALL mengizinkan pencatatan Sumbangan dan Pengeluaran_Event pada Event tersebut.
5. WHEN seorang Pengurus memindahkan Event dari Status_Event `AKTIF` ke `BALANCING`, THE Sistem_Event SHALL menolak Sumbangan baru dan Pengeluaran_Event baru pada Event tersebut.
6. IF seorang Pengurus mencoba mengubah Status_Event dengan transisi yang tidak diizinkan oleh Sistem_Event, THEN THE Sistem_Event SHALL menolak perubahan dan mengembalikan pesan kesalahan transisi.
7. THE Sistem_Event SHALL hanya mengizinkan transisi: `DRAFT → AKTIF`, `DRAFT → DIBATALKAN`, `AKTIF → BALANCING`, `AKTIF → DIBATALKAN`, `BALANCING → SELESAI`, `BALANCING → AKTIF`.

### Requirement 2: Penunjukan Panitia

**User Story:** Sebagai Pengurus, saya ingin menunjuk satu atau lebih Panitia untuk sebuah Event, sehingga pencatatan operasional pengeluaran Event dapat didelegasikan.

#### Acceptance Criteria

1. WHEN seorang Pengurus menunjuk seorang Warga atau Pengurus sebagai Panitia pada Event tertentu, THE Sistem_Panitia SHALL menyimpan keanggotaan Panitia dengan referensi ke Event dan ke pengguna yang ditunjuk.
2. IF Pengurus menunjuk pengguna yang sudah menjadi Panitia pada Event yang sama, THEN THE Sistem_Panitia SHALL menolak penunjukan dan mengembalikan pesan bahwa pengguna sudah menjadi Panitia Event tersebut.
3. WHEN seorang Pengurus mencabut keanggotaan seorang Panitia dari Event, THE Sistem_Panitia SHALL menonaktifkan keanggotaan dan mempertahankan riwayat Pengeluaran_Event yang sudah dibuat oleh Panitia tersebut.
4. WHILE seorang pengguna terdaftar sebagai Panitia aktif pada Event, THE Sistem_Otorisasi SHALL mengizinkan pengguna tersebut membuat dan mengubah Pengeluaran_Event berstatus `PENDING` pada Event itu saja.
5. THE Sistem_Panitia SHALL mengizinkan satu Event memiliki lebih dari satu Panitia.
6. THE Sistem_Panitia SHALL mengizinkan satu pengguna menjadi Panitia pada lebih dari satu Event secara bersamaan.

### Requirement 3: Sumbangan Warga (Sukarela)

**User Story:** Sebagai Pengurus, saya ingin mencatat sumbangan dari warga untuk sebuah Event dengan nilai sukarela, sehingga warga yang tidak mampu atau tidak bersedia tetap dapat tercatat tanpa paksaan.

#### Acceptance Criteria

1. WHILE Status_Event bernilai `AKTIF`, THE Sistem_Sumbangan SHALL menerima pencatatan Sumbangan dengan nominal bernilai integer ≥ 0.
2. WHEN seorang Pengurus mencatat Sumbangan untuk seorang Warga pada Event tertentu dengan nominal ≥ 0, THE Sistem_Sumbangan SHALL menyimpan Sumbangan terkait Warga, Event, nominal, tanggal, dan pencatat.
3. IF nominal Sumbangan bernilai negatif, THEN THE Sistem_Sumbangan SHALL menolak pencatatan dan mengembalikan pesan kesalahan validasi nominal.
4. THE Sistem_Sumbangan SHALL mengizinkan satu Warga memiliki lebih dari satu Sumbangan pada Event yang sama.
5. WHEN seorang Pengurus mencatat Sumbangan dengan sumber dana `Talangan_Kas_RT`, THE Sistem_Sumbangan SHALL menyimpan Sumbangan dengan flag sumber `TALANGAN_KAS` dan THE Sistem_Transfer_Kas SHALL mencatat Pengeluaran Kas RT pada modul transaksi utama dengan nominal yang sama dan keterangan yang merujuk ke Event.
6. WHILE Status_Event bernilai `BALANCING`, `SELESAI`, atau `DIBATALKAN`, THE Sistem_Sumbangan SHALL menolak pencatatan Sumbangan baru kecuali jenis `TALANGAN_KAS` pada status `BALANCING` (lihat Requirement 7).
7. THE Sistem_Sumbangan SHALL menyimpan tanggal Sumbangan dengan default tanggal sistem saat pencatatan.

### Requirement 4: Input Pengeluaran Event oleh Panitia

**User Story:** Sebagai Panitia, saya ingin menginput banyak item pengeluaran sekaligus untuk Event yang saya tangani, sehingga pencatatan belanja efisien dan terinci.

#### Acceptance Criteria

1. WHILE seorang pengguna terdaftar sebagai Panitia aktif pada Event berstatus `AKTIF`, THE Sistem_Pengeluaran_Event SHALL menerima pengiriman daftar (array) item Pengeluaran_Event dalam satu request, dengan jumlah item antara 1 dan 50 inklusif.
2. WHEN Panitia mengirim daftar Pengeluaran_Event yang valid, THE Sistem_Pengeluaran_Event SHALL menyimpan setiap item dengan deskripsi, nominal, tanggal pengeluaran, Event terkait, Panitia pencatat, dan Status_Pengeluaran bernilai `PENDING`.
3. IF salah satu item dalam daftar tidak valid (deskripsi kosong, nominal ≤ 0, tanggal tidak valid, atau melebihi batas panjang deskripsi 255 karakter), THEN THE Sistem_Pengeluaran_Event SHALL menolak seluruh daftar dan mengembalikan daftar indeks item yang gagal divalidasi tanpa menyimpan satu pun item.
4. WHILE Status_Pengeluaran sebuah Pengeluaran_Event bernilai `PENDING`, THE Sistem_Pengeluaran_Event SHALL mengizinkan Panitia pencatat atau Pengurus untuk mengubah deskripsi, nominal, atau tanggal item tersebut.
5. WHILE Status_Pengeluaran sebuah Pengeluaran_Event bernilai `APPROVED` atau `REJECTED`, THE Sistem_Pengeluaran_Event SHALL menolak perubahan terhadap item tersebut.
6. WHILE Status_Pengeluaran sebuah Pengeluaran_Event bernilai `PENDING`, THE Sistem_Pengeluaran_Event SHALL mengizinkan Panitia pencatat atau Pengurus menghapus item tersebut.
7. WHILE Status_Event bernilai `BALANCING`, THE Sistem_Pengeluaran_Event SHALL mengizinkan Pengurus melakukan approval atau reject terhadap Pengeluaran_Event yang masih `PENDING`, dan THE Sistem_Pengeluaran_Event SHALL menolak penambahan Pengeluaran_Event baru.

### Requirement 5: Approval Pengeluaran oleh Pengurus

**User Story:** Sebagai Pengurus, saya ingin meninjau dan memberikan keputusan approve atau reject pada setiap Pengeluaran_Event, sehingga hanya pengeluaran sah yang mempengaruhi Saldo_Event.

#### Acceptance Criteria

1. WHEN seorang Pengurus melakukan approve pada Pengeluaran_Event yang berstatus `PENDING`, THE Sistem_Approval SHALL mengubah Status_Pengeluaran menjadi `APPROVED` dan menyimpan identitas Pengurus serta waktu approval.
2. WHEN seorang Pengurus melakukan reject pada Pengeluaran_Event yang berstatus `PENDING`, THE Sistem_Approval SHALL mengubah Status_Pengeluaran menjadi `REJECTED` dan menyimpan identitas Pengurus, waktu reject, serta alasan reject yang wajib diisi.
3. IF seorang pengguna yang bukan Pengurus mencoba melakukan approve atau reject Pengeluaran_Event, THEN THE Sistem_Otorisasi SHALL menolak aksi tersebut dan mengembalikan pesan kesalahan otorisasi.
4. IF Pengurus mencoba approve Pengeluaran_Event yang sudah berstatus `APPROVED` atau `REJECTED`, THEN THE Sistem_Approval SHALL menolak aksi dan mengembalikan pesan bahwa Pengeluaran_Event sudah diputuskan.
5. WHILE Status_Pengeluaran bernilai `REJECTED`, THE Sistem_Saldo_Event SHALL mengabaikan Pengeluaran_Event tersebut dalam perhitungan Saldo_Event.
6. THE Sistem_Approval SHALL menyimpan riwayat keputusan untuk setiap Pengeluaran_Event sehingga keputusan dapat diaudit.

### Requirement 6: Saldo Event dan Visibilitas Keuangan

**User Story:** Sebagai Pengurus dan Panitia, saya ingin melihat ringkasan keuangan Event secara real-time, sehingga keputusan pengeluaran dan approval dapat dibuat berdasarkan informasi terkini.

#### Acceptance Criteria

1. THE Sistem_Saldo_Event SHALL menghitung Saldo_Event sebagai (jumlah nominal seluruh Sumbangan terkait Event) dikurangi (jumlah nominal seluruh Pengeluaran_Event berstatus `APPROVED` terkait Event).
2. WHEN halaman detail Event diakses oleh Pengurus atau Panitia aktif Event tersebut, THE Sistem_Saldo_Event SHALL mengembalikan empat nilai: total Sumbangan, total Pengeluaran_Event `APPROVED`, total Pengeluaran_Event `PENDING`, dan Saldo_Event saat ini.
3. WHEN halaman detail Event diakses, THE Sistem_Saldo_Event SHALL menyertakan nilai proyeksi saldo = total Sumbangan dikurangi (total Pengeluaran_Event `APPROVED` ditambah total Pengeluaran_Event `PENDING`).
4. IF total Pengeluaran_Event `APPROVED` melebihi total Sumbangan untuk sebuah Event, THEN THE Sistem_Saldo_Event SHALL mengembalikan Saldo_Event sebagai nilai negatif dan menandai Event berstatus indikator `MINUS`.
5. WHERE peran pengakses adalah Warga, THE Sistem_Saldo_Event SHALL hanya mengembalikan nilai total Sumbangan dan total Pengeluaran_Event `APPROVED` tanpa rincian item.

### Requirement 7: Penanganan Saldo Event Minus

**User Story:** Sebagai Pengurus, saya ingin sistem mencegah Saldo_Event menjadi negatif tanpa keputusan eksplisit, sehingga risiko keuangan Event tetap terkontrol dan setiap defisit memiliki sumber penutup yang jelas.

#### Acceptance Criteria

1. IF approval pada Pengeluaran_Event akan menyebabkan Saldo_Event bernilai negatif, THEN THE Sistem_Approval SHALL menolak approval dan mengembalikan pesan yang mencantumkan nominal kekurangan dana.
2. WHILE Saldo_Event bernilai negatif setelah approval pada Pengeluaran_Event yang sebelumnya tercatat sah (contoh karena Sumbangan dibatalkan), THE Sistem_Event SHALL menahan transisi Status_Event ke `SELESAI` sampai Saldo_Event ≥ 0.
3. WHILE Status_Event bernilai `BALANCING` dan Saldo_Event bernilai negatif, THE Sistem_Sumbangan SHALL mengizinkan pencatatan Sumbangan tambahan dengan sumber `TALANGAN_KAS`, `URUNAN_PENGURUS`, atau `SUMBANGAN_TAMBAHAN_WARGA` untuk menutup defisit.
4. WHEN seorang Pengurus mencatat Sumbangan bersumber `TALANGAN_KAS` untuk menutup defisit Event, THE Sistem_Transfer_Kas SHALL membuat satu transaksi Pengeluaran Kas RT pada modul transaksi utama dengan nominal yang sama, kategori `Talangan Event`, dan keterangan yang merujuk Event.
5. IF saldo Kas RT tidak mencukupi untuk Talangan_Kas_RT yang diminta, THEN THE Sistem_Transfer_Kas SHALL menolak pencatatan Talangan dan mengembalikan pesan saldo Kas RT tidak cukup.
6. THE Sistem_Event SHALL melarang penutupan Event (transisi ke `SELESAI`) jika Saldo_Event bernilai negatif atau terdapat Pengeluaran_Event berstatus `PENDING`.

### Requirement 8: Transfer Sisa Dana ke Kas RT (Taruh di Kas)

**User Story:** Sebagai Pengurus, saya ingin memindahkan sisa dana positif sebuah Event ke Kas RT melalui satu aksi eksplisit, sehingga dana lebih tercatat sebagai pemasukan Kas RT yang dapat ditelusuri.

#### Acceptance Criteria

1. WHILE Status_Event bernilai `BALANCING` dan Saldo_Event bernilai > 0 dan tidak terdapat Pengeluaran_Event berstatus `PENDING`, THE Sistem_Transfer_Kas SHALL menampilkan opsi "Taruh di Kas" untuk Pengurus.
2. WHEN seorang Pengurus mengeksekusi aksi "Taruh di Kas" pada sebuah Event, THE Sistem_Transfer_Kas SHALL membuat satu transaksi Pemasukan pada modul transaksi utama dengan nominal sama dengan Saldo_Event, kategori `Sisa Dana Event`, sumber referensi Event, dan keterangan nama Event.
3. WHEN transaksi Pemasukan dari aksi "Taruh di Kas" berhasil dibuat, THE Sistem_Saldo_Event SHALL mencatat satu entri penyesuaian Pengeluaran_Event sistem (atau entri transfer-out) dengan nominal yang sama sehingga Saldo_Event menjadi 0.
4. IF Saldo_Event ≤ 0 saat aksi "Taruh di Kas" diminta, THEN THE Sistem_Transfer_Kas SHALL menolak aksi dan mengembalikan pesan bahwa tidak ada sisa dana untuk dipindahkan.
5. IF terdapat satu atau lebih Pengeluaran_Event berstatus `PENDING` saat aksi "Taruh di Kas" diminta, THEN THE Sistem_Transfer_Kas SHALL menolak aksi dan mengembalikan pesan yang menyebut jumlah Pengeluaran_Event `PENDING` yang harus diputuskan terlebih dahulu.
6. THE Sistem_Transfer_Kas SHALL menjalankan pembuatan transaksi Pemasukan Kas RT dan penyesuaian Saldo_Event dalam satu transaksi database atomik agar tidak menghasilkan kondisi parsial.
7. WHEN aksi "Taruh di Kas" berhasil, THE Sistem_Audit SHALL mencatat satu entri log aktivitas yang berisi identitas Pengurus, Event, nominal, dan referensi transaksi yang dibuat.

### Requirement 9: Penutupan Event dan Laporan Final

**User Story:** Sebagai Pengurus, saya ingin menerbitkan laporan final Event setelah seluruh keuangan balance, sehingga transparansi keuangan acara dapat dibagikan ke warga.

#### Acceptance Criteria

1. WHEN seorang Pengurus meminta penutupan Event, THE Sistem_Event SHALL memvalidasi bahwa Status_Event bernilai `BALANCING`, tidak terdapat Pengeluaran_Event berstatus `PENDING`, dan Saldo_Event = 0.
2. IF salah satu kondisi penutupan Event tidak terpenuhi, THEN THE Sistem_Event SHALL menolak permintaan penutupan dan mengembalikan daftar kondisi yang gagal terpenuhi.
3. WHEN seluruh kondisi penutupan terpenuhi, THE Sistem_Event SHALL mengubah Status_Event menjadi `SELESAI` dan THE Sistem_Laporan_Event SHALL menghasilkan laporan final yang berisi: detail Event, daftar Sumbangan dengan nominal dan sumber, daftar Pengeluaran_Event `APPROVED` dengan nominal dan tanggal, total Sumbangan, total Pengeluaran, sisa dana yang ditransfer ke Kas RT (jika ada), dan tanggal penutupan.
4. WHILE Status_Event bernilai `SELESAI`, THE Sistem_Event SHALL menolak perubahan apa pun terhadap Sumbangan, Pengeluaran_Event, dan Panitia pada Event tersebut.
5. THE Sistem_Laporan_Event SHALL mengizinkan Pengurus mengekspor laporan final dalam format yang sama dengan modul `admin-laporan` yang sudah ada (mengikuti konvensi format laporan kas yang berlaku).

### Requirement 10: Pembatalan Event

**User Story:** Sebagai Pengurus, saya ingin membatalkan Event yang batal terlaksana, sehingga catatan keuangan terkait dapat ditangani dengan benar tanpa mengganggu Kas RT.

#### Acceptance Criteria

1. WHEN seorang Pengurus membatalkan Event yang berstatus `DRAFT` atau `AKTIF`, THE Sistem_Event SHALL mengubah Status_Event menjadi `DIBATALKAN`.
2. IF terdapat satu atau lebih Sumbangan tercatat pada Event saat permintaan pembatalan, THEN THE Sistem_Event SHALL meminta Pengurus memilih salah satu opsi: pengembalian Sumbangan ke Warga (manual di luar sistem dan ditandai `REFUNDED`), pengalihan total Sumbangan ke Kas RT, atau pengalihan ke Event lain yang berstatus `AKTIF`.
3. WHEN Pengurus memilih opsi pengalihan Sumbangan ke Kas RT, THE Sistem_Transfer_Kas SHALL membuat satu transaksi Pemasukan Kas RT dengan nominal sama dengan total Sumbangan dan keterangan yang merujuk Event.
4. WHEN Pengurus memilih opsi pengalihan Sumbangan ke Event lain, THE Sistem_Sumbangan SHALL memindahkan referensi Sumbangan ke Event tujuan dan THE Sistem_Audit SHALL mencatat tindakan pemindahan.
5. WHILE Status_Event bernilai `DIBATALKAN`, THE Sistem_Event SHALL menolak penambahan Sumbangan dan Pengeluaran_Event baru.
6. WHEN Pengurus membatalkan Event, THE Sistem_Pengeluaran_Event SHALL menandai seluruh Pengeluaran_Event `PENDING` pada Event tersebut sebagai `REJECTED` dengan alasan otomatis "Event dibatalkan".

### Requirement 11: Otorisasi dan Hak Akses

**User Story:** Sebagai pemilik produk, saya ingin setiap aksi pada fitur Event dilindungi oleh kontrol akses berbasis peran, sehingga hanya pengguna sah yang dapat melakukan tindakan tertentu.

#### Acceptance Criteria

1. THE Sistem_Otorisasi SHALL hanya mengizinkan Pengurus melakukan: pembuatan Event, perubahan Status_Event, penunjukan dan pencabutan Panitia, approval atau reject Pengeluaran_Event, aksi "Taruh di Kas", dan penutupan Event.
2. THE Sistem_Otorisasi SHALL mengizinkan Panitia aktif Event tertentu melakukan: pembuatan, perubahan, dan penghapusan Pengeluaran_Event berstatus `PENDING` pada Event tersebut saja.
3. THE Sistem_Otorisasi SHALL mengizinkan Pengurus melakukan seluruh aksi yang diizinkan untuk Panitia pada Event mana pun.
4. THE Sistem_Otorisasi SHALL mengizinkan Warga membaca daftar Event berstatus `AKTIF`, `BALANCING`, dan `SELESAI` beserta ringkasan Sumbangan dan total Pengeluaran_Event `APPROVED` tanpa rincian item.
5. IF pengguna tanpa peran sah mencoba mengakses endpoint atau halaman Event, THEN THE Sistem_Otorisasi SHALL mengembalikan respons unauthorized dengan kode HTTP 401 atau 403 sesuai konteks autentikasi.
6. THE Sistem_Otorisasi SHALL memvalidasi peran pada server-side untuk setiap server action atau API route terkait fitur Event.

### Requirement 12: Audit Trail

**User Story:** Sebagai Pengurus, saya ingin setiap aksi penting pada fitur Event tercatat di log aktivitas, sehingga riwayat perubahan dapat ditelusuri saat audit.

#### Acceptance Criteria

1. WHEN salah satu aksi berikut berhasil: pembuatan Event, perubahan Status_Event, penunjukan Panitia, pencabutan Panitia, pencatatan Sumbangan, pengiriman daftar Pengeluaran_Event, approval Pengeluaran_Event, reject Pengeluaran_Event, aksi "Taruh di Kas", pembatalan Event, dan penutupan Event, THE Sistem_Audit SHALL menyimpan satu entri log aktivitas yang memuat jenis aksi, identitas pelaku, identitas Event terkait, nilai sebelum (jika relevan), nilai sesudah (jika relevan), dan timestamp.
2. THE Sistem_Audit SHALL menggunakan modul log aktivitas yang sudah ada di aplikasi tanpa membuat duplikasi tabel log baru.
3. WHILE pengguna mengakses halaman riwayat Event, THE Sistem_Audit SHALL hanya menampilkan entri log Event yang dapat diakses oleh peran pengguna sesuai Requirement 11.
