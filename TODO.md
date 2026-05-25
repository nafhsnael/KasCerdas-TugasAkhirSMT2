## TODO - Delete Transaksi UMKM/Mahasiswa/Masyarakat

- [x] Tambahkan tombol `Hapus` di `src/components/TransactionCard.jsx` (dengan konfirmasi).
- [x] Tambahkan prop `onDelete` + state `isDeleting` pada `TransactionCard`.
- [x] Implementasi handler delete (memanggil backend `DELETE /api/transactions/{transaction}`) untuk halaman Masyarakat.
- [x] Implementasi handler delete dan wiring tombol “Hapus” untuk `src/pages/TransactionsUMKMPage.jsx`.
- [x] Implementasi handler delete dan wiring tombol “Hapus” untuk `src/pages/TransactionsMahasiswaPage.jsx`.
- [ ] Pastikan transaksi yang ditampilkan punya `transaction.id` berasal dari backend (bukan id lokal `t${Date.now()}`) agar delete benar-benar tersinkron.
- [x] `npm run build` selesai dan tidak ada error.


