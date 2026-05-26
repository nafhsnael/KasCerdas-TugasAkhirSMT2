# TODO

## 1) Pastikan transaksi masyarakat langsung masuk riwayat seperti mahasiswa
- [x] Analisis `addTransaction` untuk usertype `masyarakat` di `Frontend/src/App.jsx`
- [x] Samakan perilaku dengan `addTransaction` mahasiswa: lakukan optimistic update + replace saat API sukses + rollback saat gagal
- [x] Pastikan riwayat memfilter berdasar `metadata.is_masyarakat` dan `category` sesuai dropdown (Makan/Hutang/Transport/dst)


## 2) Testing
- [ ] Jalankan build/dev Frontend dan cek tidak ada error lint/runtime
- [ ] Verifikasi manual: simpan transaksi masyarakat → langsung tampil di Riwayat Transaksi Masyarakat tanpa reload

