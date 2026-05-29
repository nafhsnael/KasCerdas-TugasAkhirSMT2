## TODO - Tambah Target Tabungan pada Form Transaksi (Deposit)

### Step 1: Sinkronisasi kebutuhan
- [x] Verifikasi backend sudah punya endpoint `POST /savings/{saving}/deposit`.
- [x] Verifikasi UI halaman yang dipakai: `TransactionsPage.jsx`, `TransactionsMahasiswaPage.jsx`, `TransactionsMasyarakatPage.jsx`, `TransactionsUMKMPage.jsx`.

### Step 2: Implementasi frontend deposit dengan “judul=nama target tabungan”
- [ ] Update `Frontend/src/pages/TransactionsPage.jsx`:
  - [ ] Ambil list savings via `savingAPI.list()`.
  - [ ] Tambah dropdown “Target tabungan”.
  - [ ] Saat pilih target: `form.title = saving.name`.
  - [ ] Saat submit dengan kategori Tabungan: panggil `savingAPI.deposit(savingId, amount)`.
  - [ ] Setelah sukses: refresh list savings & (opsional) transactions via mekanisme yang ada di `App.jsx`.

- [ ] Update `Frontend/src/pages/TransactionsMahasiswaPage.jsx`:
  - [ ] Tambah dropdown “Target tabungan”
  - [ ] Judul & nominal konek dengan target
  - [ ] Deposit via endpoint

- [ ] Update `Frontend/src/pages/TransactionsMasyarakatPage.jsx`:
  - [ ] Tambah dropdown “Target tabungan”
  - [ ] Judul & nominal konek dengan target
  - [ ] Deposit via endpoint

- [ ] Update `Frontend/src/pages/TransactionsUMKMPage.jsx`:
  - [ ] Tentukan apakah deposit tabungan memang relevan di UMKM. Jika relevan, implementasi sama seperti yang lain.

### Step 3: Testing manual
- [ ] Buat 1 target tabungan, deposit sebagian -> progress berubah.
- [ ] Deposit sampai mencapai target_amount -> status completed.
- [ ] Pastikan judul transaksi (di form) mengunci nama target tabungan.

