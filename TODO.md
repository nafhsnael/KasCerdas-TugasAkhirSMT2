# TODO

## Step 1 — Understand current saldo awal & pemasukan usaha behavior
- [x] Baca `Frontend/src/pages/DashboardUMKMPage.jsx` untuk lihat cara `saldo awal` dimasukkan ke `businessIncome`/`profitLoss`.
- [x] Baca `Frontend/src/pages/DashboardPage.jsx` untuk cek perhitungan UMKM & saldo awal (potensi mismatch antar halaman).
- [x] Baca `Frontend/src/pages/InitialBalancePage.jsx` (bagaimana saldo awal disimpan ke wallet).
- [x] Baca `backend/app/Http/Controllers/Api/TransactionController.php` untuk cek aturan `Initial/Saldo Awal` (skip update wallet balance, tapi dipakai untuk reporting).

## Step 2 — Fix output: saldo awal masuk ke arus kas usaha & saldo pemasukan
- [ ] Identifikasi komponen/variabel yang digunakan untuk kartu "Arus Kas Usaha" dan "Saldo Pemasukan".
- [ ] Pastikan kategori "Saldo Awal" (transaksi) masuk ke `businessIncome` (arus kas/pemasukan u
- [ ] Jalankan build / lint (jika ada) atau minimal menjalankan aplikasi untuk memastikan output berubah sesuai permintaan.

saha) sampai benar-benar terlihat di output UI.
- [ ] Pastikan perubahan ini tidak mempengaruhi laba rugi (kalau memang diminta: saldo awal tidak ikut laba rugi).

## Step 3 — Validate