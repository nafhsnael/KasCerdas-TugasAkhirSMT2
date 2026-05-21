# TODO
- [x] Integrasikan Quick Action Dashboard -> otomatis set filter kategori bisnis pada halaman Transaksi (UMKM).

- [ ] Pastikan mapping: Penjualan, Pemasukan Lain, Pengeluaran Operasional, Beli Bahan Baku, Piutang Pelanggan, Utang Supplier -> value select `filters.type` (TransactionsUMKMPage).
- [ ] Propagasi callback dari DashboardPage ke App lalu ke TransactionsUMKMPage.
- [ ] Tambahkan efek (useEffect) di TransactionsUMKMPage agar saat menerima `defaultCategory` dari App/quick action, select "Filter Kategori Bisnis" ter-set dan transaksi ter-filter.
- [ ] Tambahkan jenis halaman non-UMKM bila diperlukan (opsional).
- [ ] Jalankan build/lint/dev server untuk memastikan tidak ada error kompilasi.

