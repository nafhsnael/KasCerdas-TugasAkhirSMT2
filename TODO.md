- [x] Cari komponen analisis periode (dropdown) yang mengatur bulan ini/bulan kemarin
- [x] Ubah dropdown analisis supaya yang tampil bukan lagi “Bulan Ini” pada posisi label, tapi opsi lain (terlihat di dropdown)
- [ ] Pisahkan halaman analisis keuangan berdasarkan usertype: Mahasiswa, UMKM, Masyarakat
  - [ ] Buat 3 page baru: `AnalysisMahasiswaPage.jsx`, `AnalysisUMKMPage.jsx`, `AnalysisMasyarakatPage.jsx`
  - [ ] Pecah router di `Frontend/src/App.jsx` untuk map `currentPage === 'analysis'` ke page sesuai `userProfile.usertype`
  - [ ] Pastikan komponen analisis (arus kas bulanan, komposisi pengeluaran per pos, perkembangan) tetap ada per page, tapi tetap dipakai bersama komponen UI yang sama
  - [ ] Build ulang untuk memastikan tidak error

