# Dashboard Documentation

## Overview

Dashboard pada aplikasi **KasCerdas** adalah antarmuka ringkas yang menampilkan ringkasan keuangan pengguna dan metrik kesehatan finansial. Dashboard disesuaikan berdasarkan tipe pengguna:

- **Dashboard Utama (DashboardPage)**: umumnya untuk pengguna non-UMKM (usertype selain `umkm`).
- **Dashboard Mahasiswa (DashboardMahasiswaPage)**: menampilkan metrik yang selaras dengan kategori pemasukan/pengeluaran mahasiswa.
- **Dashboard UMKM (DashboardUMKMPage)**: menampilkan ringkasan bisnis, stok, utang/piutang, serta perhitungan laba-rugi berbasis parameter UMKM.
- **Dashboard Masyarakat (DashboardMasyarakatPage)**: menampilkan ringkasan keuangan masyarakat beserta pengingat budget dan skor kesehatan finansial.

Selain halaman dashboard, project juga memiliki sejumlah **komponen kartu** (card/component) yang dapat dipakai untuk visualisasi metrik seperti komposisi pemasukan/pengeluaran dan perkembangan periode.

Dokumentasi ini merangkum implementasi yang benar-benar ada di kode Frontend:

- `Frontend/src/pages/DashboardPage.jsx`
- `Frontend/src/pages/DashboardMahasiswaPage.jsx`
- `Frontend/src/pages/DashboardUMKMPage.jsx`
- `Frontend/src/pages/DashboardMasyarakatPage.jsx`

serta seluruh komponen dashboard card yang ditemukan pada project Frontend.

> Catatan: beberapa komponen card (mis. `AverageIncomeCard`, `ExpenseCompositionCard`, dsb.) merupakan *building blocks* visual. Pada halaman dashboard yang dianalisis, sebagian besar metrik utama dirender secara inline (bukan memanggil komponen-komponen tersebut). Namun seluruh komponen yang ditemukan tetap didokumentasikan pada bagian “Dashboard Components”.

## Purpose

Tujuan Dashboard dalam aplikasi KasCerdas adalah:

1. Menyediakan ringkasan cepat berupa angka-angka penting (mis. saldo pemasukan/pengeluaran, skor kesehatan finansial, ringkasan UMKM).
2. Memberikan insight “kesehatan finansial” berbentuk skor 0–100 dan kategori status berdasarkan beberapa aspek (cashflow, rasio tabungan, efisiensi pengeluaran, hutang, stabilitas arus kas).
3. Menyajikan pengingat budget (Budget Reminder) yang ditentukan berdasarkan persentase penggunaan dibanding limit.
4. Menyajikan akses cepat (Aksi Cepat) untuk membuat transaksi pada kategori tertentu.
5. Pada dashboard UMKM: memisahkan perhitungan keuangan bisnis (arus kas usaha, laba rugi, stok, serta utang/piutang).

## Dashboard Architecture

Berikut hubungan antar lapisan berdasarkan pola data props yang dipakai oleh halaman dashboard (Frontend):

**Database**
- Menyimpan data inti yang diturunkan ke dashboard: wallet (saldo), transaksi, budget, dan objek ringkasan UMKM (misalnya `umkmSummary`).
- Pada backend, model yang relevan meliputi `Transaction`, `Budget`, `Wallet` (data yang terhubung ke perhitungan di frontend).

**→ API**
- Backend API menyediakan payload untuk Frontend berupa:
  - `walletSummary` (contoh yang digunakan: `walletSummary.current`, `walletSummary.income`, `walletSummary.expense`, `walletSummary.smartCashPerDay`, `walletSummary.smartReductionPerDay`).
  - `walletInfo` (contoh: `walletInfo.balance`).
  - `transactions` (list transaksi; field yang digunakan: `type`, `amount`, `date`, `category`, `businessCategory`, `note`, `title`, `invoice`).
  - `budgets` (list budget; field: `category`, `limit`, `usage`).
  - `umkmSummary` (untuk UMKM; field yang digunakan: `income`, `operationalExpense`, `inventory`, `payables`, `receivables`, `estimatedHpp`).
  - `userProfile` (field: `nama`, `usertype`).

**→ Frontend State**
- Frontend menyuntikkan data tersebut ke halaman dashboard melalui props, misalnya:
  - `DashboardPage({ walletSummary, transactions, budgets, walletInfo, userProfile, umkmSummary, ... })`
  - `DashboardMahasiswaPage({ walletSummary, transactions, budgets, walletInfo, userProfile, ... })`
  - `DashboardUMKMPage({ walletSummary, transactions, budgets, walletInfo, userProfile, umkmSummary, eWalletBalance, ... })`
  - `DashboardMasyarakatPage({ walletSummary, transactions, budgets, walletInfo, userProfile, ... })`

**→ Dashboard Calculations**
- Perhitungan metrik dilakukan di dalam halaman dashboard (inline logic), misalnya:
  - penentuan `saldoPemasukan`/`saldoPengeluaran` berbasis filter transaksi.
  - perhitungan skor “Financial Health Score” (0–100) dengan komponen cashflow, rasio tabungan, efisiensi pengeluaran, kondisi hutang, stabilitas arus kas.
  - perhitungan Budget Reminder berdasarkan `usage/limit`.
  - khusus UMKM: perhitungan laba-rugi, arus kas usaha, stok dan status restock.

**→ Dashboard Components**
- Komponen kartu yang tersedia di project (untuk visualisasi lanjutan/analytics):
  - `StatCard`
  - `TransactionCard`
  - `BudgetCard`
  - `ExpenseCompositionCard`
  - `MahasiswaIncomeCompositionCard`, `MahasiswaExpenseCompositionCard`
  - `MasyarakatIncomeCompositionCard`, `MasyarakatExpenseCompositionCard`
  - `UmkmIncomeCompositionCard`, `UmkmExpenseCompositionCard`
  - `AverageIncomeCard`, `BiggestExpenseCard`
  - `MonthlyCashflowTableCard`, `UmkmMonthlyCashflowTableCard`, `MahasiswaMonthlyCashflowTableCard`, `MasyarakatMonthlyCashflowTableCard`
  - `PeriodDevelopmentCard` dan varian period development untuk mahasiswa/masyarakat/umkm

## Dashboard Pages

### Dashboard Utama

**File**: `Frontend/src/pages/DashboardPage.jsx`

**Purpose**
- Menampilkan ringkasan keuangan umum.
- Menampilkan kondisi kesehatan finansial (Financial Health Score) berbasis metrik yang dihitung dari `transactions`, `walletSummary`, `budgets`, dan `umkmSummary` bila user tipe UMKM.

**Fitur utama yang dirender**
1. **Hero Saldo**
   - “Selamat Datang” + nama pengguna.
   - Menampilkan `walletSummary.current` sebagai **Saldo E-Wallet**.

2. **Dua kartu saldo**
   - “Saldo Pemasukan” menampilkan `walletSummary.smartCashPerDay`.
   - “Saldo Pengeluaran” menampilkan `walletSummary.smartReductionPerDay`.

3. **Financial Health Score**
   - Menampilkan `overallScore` (0–100) dan kategori `financialCategory`.
   - Menampilkan 5 aspek kesehatan finansial di dalam `healthAspects`.

4. **Bagian UMKM (kondisional)**
   - Jika `userProfile?.usertype === 'umkm'` (`isUmkm`), maka dashboard utama juga menampilkan ringkasan UMKM:
     - Arus kas usaha (`businessIncome`, `businessExpense`)
     - HPP diperkirakan (`estimatedHpp`)
     - Laba rugi (`profitLoss`)
     - Stok barang dengan status “Menipis/Aman” berdasar `stock` vs `reorderLevel`
     - Hutang & Piutang (`totalPayables`, `totalReceivables`)

5. **Aksi Cepat (Quick Actions)**
   - Untuk UMKM: daftar aksi dengan `businessCategory` (contoh: Penjualan, Pemasukan, Pengeluaran Operasional, Beli Bahan Baku / Stok, Piutang Pelanggan, Hutang Supplier).
   - Untuk non-UMKM: aksi generic (Transfer, Tagihan, Investasi, QRIS, Donasi, Riwayat).

**Business Logic yang penting**

1. **Perhitungan pendapatan usaha (income) pada UMKM**
   - `initialIncome` dihitung dari transaksi dengan `businessCategory` atau `category` bernilai `initial`/`saldo awal`.
   - `businessIncome` untuk UMKM: `umkmSummary.income + initialIncome`.

2. **Perhitungan businessExpense untuk UMKM**
   - Menggunakan `umkmSummary.operationalExpense` dikurangi jumlah transaksi kategori `Initial/Saldo Awal` (menghindari double counting pada aset awal).

3. **Profit/loss dan kesehatan finansial**
   - `profitLoss = (businessIncome - initialIncome) - costOfGoodsSold - businessExpense`.
   - `cashflow = businessIncome - businessExpense`.
   - `cashflowScore`, `savingsScore`, `efficiencyScore`, `debtScore`, `stabilityScore` masing-masing dihitung dari rasio/komposisi.
   - `overallScore` adalah weighted sum:
     - cashflowScore 0.22
     - savingsScore 0.18
     - efficiencyScore 0.2
     - debtScore 0.2
     - stabilityScore 0.2

4. **Debt detection**
   - Mendeteksi transaksi hutang dengan regex pada `category` dan `note`:
     - `/hutang|utang|debt|loan/`.

5. **Stabilitas arus kas**
   - Menghitung jumlah transaksi pemasukan (`t.type === 'income'`) pada bulan ini.
   - `stabilityScore` mengambil nilai base 35 dan menaikkan/menurunkan berdasarkan:
     - positif arus kas
     - budget usage ratio
     - jumlah transaksi income bulan berjalan.

6. **Pengukuran Budget Usage Ratio**
   - Untuk overall score: `budgetUsageRatio = totalBudgetUsage / totalBudgetLimit` dengan pembatas `<= 1`.

### Dashboard Mahasiswa

**File**: `Frontend/src/pages/DashboardMahasiswaPage.jsx`

**Purpose**
- Menyediakan ringkasan keuangan mahasiswa untuk bulan berjalan.
- Menampilkan pengingat budget dan skor kesehatan finansial dengan kategori mahasiswa.

**Fitur utama yang dirender**
1. **Hero + Saldo e-wallet**
   - Menampilkan `walletSummary.current`.

2. **Kartu Saldo Pemasukan & Saldo Pengeluaran**
   - `totalIncome`: termasuk saldo awal bulan berjalan (`saldoAwalBulanIni`) + total transaksi income bulan ini.
   - `totalExpense`: total pengeluaran berdasarkan kategori pengeluaran mahasiswa.

3. **Budget Reminder**
   - Mengkalkulasi `totalBudgetUsage` vs `totalBudgetLimit`.
   - Menentukan status:
     - Belum ada budget
     - Pengeluaran masih aman (<= 80%)
     - Pengeluaran mendekati batas (<= 100%)
     - Budget terlampaui (> 100%)

4. **Financial Health Score**
   - Menentukan `overallScore` dan `financialCategory`.
   - Menampilkan ringkasan 5 aspek kesehatan finansial.

5. **Aksi Cepat**
   - Daftar aksi kategori mahasiswa:
     - Beasiswa, Tabungan, Uang Saku, Penghasilan Kerja Paruh Waktu
     - Kos, UKT, Makan, Transportasi
     - Kebutuhan Kuliah, Kebutuhan Lainnya
     - Hutang

**Business Logic yang penting**

1. **Kategori pemasukan & pengeluaran mahasiswa**
   - `mahasiswaPemasukanCategories`:
     - Beasiswa, Tabungan, Uang Saku, Penghasilan Kerja Paruh Waktu, Saldo Awal, Initial.
   - `mahasiswaPengeluaranCategories`:
     - UKT, Buku/Alat Tulis, Makan, Kos, Transportasi.

2. **Saldo awal bulan ini**
   - Mengambil transaksi `Saldo Awal`/`Initial` yang terjadi sebelum tanggal 1 bulan berjalan.
   - Hasilnya dipakai sebagai baseline `saldoAwalBulanIni`.

3. **Perhitungan totalIncome**
   - `saldoAwalBulanIni + sum(income transaksi kategori pemasukan pada bulan ini)`.

4. **Budget usage ratio**
   - Jika ada budget: `budgetUsageRatio = min(1, totalBudgetUsage/totalBudgetLimit)`.
   - Jika tidak ada budget: `budgetUsageRatio = min(1, totalExpense/Math.max(totalIncome,1))`.

5. **Debt scoring**
   - Deteksi hutang memakai regex pada `category` dan `note`.
   - `debtScore` = `100 - debtRatio*80` (clamp 0–100).

### Dashboard UMKM

**File**: `Frontend/src/pages/DashboardUMKMPage.jsx`

**Purpose**
- Menyajikan ringkasan finansial khusus bisnis UMKM.
- Fokus pada arus kas usaha, laba rugi, stok barang, serta hutang/piutang.

**Fitur utama yang dirender**
1. **Hero + Saldo e-wallet**
   - Menampilkan `eWalletBalanceValue` (berasal dari props `eWalletBalance`).

2. **Ringkasan Usaha (Stat Cards)**
   - “Saldo Pemasukan” (`businessIncome`)
   - “Saldo Pengeluaran” (`businessExpense`)
   - “Financial Score” (`financialScore`)
   - “Budget Reminder” (langsung dihitung dari `budgets`)

3. **Arus Kas Usaha & Laba Rugi Otomatis**
   - Arus Kas Usaha:
     - Pemasukan usaha = `businessIncome`
     - Keluar Operasional = `businessExpense`
     - HPP diperkirakan = `costOfGoodsSold` (`umkmSummary.estimatedHpp`)
   - Laba Rugi Otomatis = `profitLoss`

4. **Utang & Piutang**
   - `totalPayables = umkmSummary.payables`
   - `totalReceivables = umkmSummary.receivables`

5. **Stok Barang**
   - Menampilkan `umkmSummary.inventory` dan menandai status:
     - `stock <= reorderLevel` => “Menipis”
     - selain itu => “Aman”

6. **Aksi Cepat**
   - Daftar aksi spesifik UMKM:
     - Penjualan, Pemasukan, Pengeluaran Operasional
     - Beli Bahan Baku / Stok, Piutang Pelanggan, Hutang Supplier, Tabungan

**Business Logic yang penting**

1. **Saldo awal digabung ke pemasukan UMKM**
   - `initialIncome` dihitung dari transaksi `businessCategory`/`category` bernilai `initial`/`saldo awal`.
   - `businessIncome = rawUmkmIncome + initialIncome`.

2. **Pendapatan untuk laba-rugi (profitIncome)**
   - `profitIncome = rawUmkmIncome`.
   - Artinya: “Saldo awal” ikut pada tampilan “Saldo Pemasukan” tetapi tidak ikut pada laba-rugi otomatis.

3. **Business expense**
   - `businessExpense` adalah jumlah transaksi dengan `businessCategory`/`category` bernilai `Pengeluaran Operasional`.

4. **Financial Score**
   - Menggunakan base 50, lalu menambahkan/ mengurangkan poin berdasarkan:
     - businessIncome > 0
     - businessExpense <= 0 atau dibanding businessIncome*0.5
     - rasio stok menipis
     - profitLoss positif/negatif
     - totalReceivables <= businessIncome*0.3

5. **Budget Reminder**
   - `budgetUsageRatio = totalBudgetUsage / totalBudget`.
   - Status ditentukan dengan ambang:
     - <= 0.8 (aman)
     - <= 1 (mendekati)
     - > 1 (terlampaui)

### Dashboard Masyarakat

**File**: `Frontend/src/pages/DashboardMasyarakatPage.jsx`

**Purpose**
- Menyajikan ringkasan finansial masyarakat untuk bulan berjalan.
- Menampilkan Budget Reminder dan Financial Health Score.
- Menangani “Saldo Awal” dengan memperhitungkan saldo awal sebelum bulan berjalan.

**Fitur utama yang dirender**
1. **Hero + Saldo E-Wallet**
   - Menampilkan `eWalletBalance` dari `walletInfo.balance` (fallback `walletSummary.current`).

2. **Kartu Saldo Pemasukan & Saldo Pengeluaran**
   - `saldoPemasukanBulanIniTermasukSaldoAwal`:
     - sum income pada bulan berjalan
     - + sum saldo awal sebelum bulan berjalan
     - + fallback jika tidak ada transaksi saldo awal.
   - `saldoPengeluaranBulanIni` = sum expense bulan berjalan.

3. **Budget Reminder**
   - Menghitung `usageFromTransactions` untuk tiap budget kategori dengan filter transaksi expense bulan berjalan.
   - Menampilkan budget yang `ratio >= 0.8` dan `limit > 0`.
   - Status menampilkan apakah ada budget terlampaui (`ratio > 1`).

4. **Financial Health Score**
   - Skor dihitung dengan komponen:
     - cashflowScore
     - savingsScore
     - efficiencyScore
     - debtScore
     - stabilityScore

5. **Aksi Cepat**
   - Kategori masyarakat:
     - Penghasilan Kerja, Uang Saku, Tabungan, Makan, Hutang,
       Transport, Belanja, Tagihan, Kebutuhan Lainnya.

**Business Logic yang penting**

1. **Identifikasi transaksi Saldo Awal**
   - Fungsi `isSaldoAwalTransaction(transaction)` mengecek:
     - `category` dan `businessCategory` (dengan lowercase)
     - nilai: `saldo awal` atau `initial`.

2. **Perhitungan saldo awal sebelum bulan berjalan**
   - Menjumlahkan transaksi income saldo awal yang tanggalnya < start bulan (`monthStart`).

3. **Fallback initial balance**
   - Jika tidak ada transaksi saldo awal di semua transaksi bulan berjalan, maka fallback memakai `walletSummary.income` atau `walletSummary.current`.

4. **Kondisi akun baru**
   - `isAkunBaru` berlaku jika tidak ada income selain saldo awal dan tidak ada expense.
   - Pada kondisi akun baru:
     - `cashflowScore`, `savingsScore`, `efficiencyScore` diset ke nilai maksimal (100).

5. **Debt scoring**
   - Deteksi hutang menggunakan regex pada string gabungan: `category + note + title`.

## Dashboard Components

Bagian ini merangkum komponen card yang ada di project Frontend. Fokus pada komponen yang merupakan komponen dashboard/analytics.

### 1) `StatCard`

**File**: `Frontend/src/components/StatCard.jsx`

- **Purpose**: Kartu statistik sederhana dengan label, nilai, dan deskripsi.
- **Input Data**:
  - `label` (string)
  - `value` (string/number)
  - `description` (string)
- **Output Display**:
  - Menampilkan label, nilai besar, dan deskripsi.
- **Business Logic**:
  - Tidak ada perhitungan; hanya presentasi props.

### 2) `TransactionCard`

**File**: `Frontend/src/components/TransactionCard.jsx`

- **Purpose**: Kartu untuk menampilkan ringkasan transaksi.
- **Input Data**:
  - `transaction`: object transaksi
    - `title`, `category`, `type`, `amount`, `date`, `note`, `invoice`.
  - `onViewInvoice(transaction)` (opsional)
  - `onDelete(transaction)` (opsional)
  - `isDeleting` (boolean)
- **Output Display**:
  - Badge jenis: income/pengeluaran.
  - Judul, kategori, tanggal, note.
  - Jika `transaction.invoice` ada: area invoice + tombol “Lihat”.
- **Business Logic**:
  - Kondisi tampilan tombol delete berdasarkan `onDelete`.
  - Kondisi invoice berdasarkan keberadaan `transaction.invoice`.

### 3) `BudgetCard`

**File**: `Frontend/src/components/BudgetCard.jsx`

- **Purpose**: Kartu budget kategori dengan progress bar.
- **Input Data**:
  - `category` (string)
  - `usage` (number)
  - `limit` (number)
  - `children` (opsional)
- **Output Display**:
  - Persentase penggunaan (max 100, untuk limit > 0) dan indikator “Terlampaui/Dalam batas”.
  - Progress bar warna berbeda jika exceeded.
  - Teks “Digunakan” dan “Limit”.
- **Business Logic**:
  - `progress` dihitung:
    - jika `limit > 0`: `(usage/limit)*100` clamp 0–100
    - jika `limit <= 0`: usage>0 => 100
  - `isExceeded = limit > 0 ? usage > limit : usage > 0`.

### 4) `ExpenseCompositionCard`

**File**: `Frontend/src/components/ExpenseCompositionCard.jsx`

- **Purpose**: Komposisi pengeluaran berdasarkan kategori standar (Makan, Hutang, Transport, Belanja, Tagihan, Kebutuhan Lainnya).
- **Input Data**:
  - `transactions` (array transaksi)
  - `periodLabel` (string, opsional)
  - `compact` (boolean)
- **Output Display**:
  - Daftar kartu per kategori: persentase dan nominal.
  - Progress bar per kategori.
- **Business Logic**:
  - Menyaring transaksi bertipe `expense`/`pengeluaran`.
  - Memetakan kategori dengan heuristik berbasis substring kategori transaksi:
    - “makan” => Makan, dll.
  - Memastikan urutan: `['Makan','Hutang','Transport','Belanja','Tagihan','Kebutuhan Lainnya']`.

### 5) `AverageIncomeCard`

**File**: `Frontend/src/components/AverageIncomeCard.jsx`

- **Purpose**: Menghitung rata-rata pemasukan dan persentase perubahan pemasukan antar-bulan.
- **Input Data**:
  - `transactions` (array)
- **Output Display**:
  - Rata-rata pemasukan.
  - Pill perubahan persentase (Naik/Stabil/Turun) berdasarkan perbandingan bulan terakhir vs bulan sebelumnya.
- **Business Logic**:
  - Mengelompokkan pemasukan per `YYYY-MM`.
  - Mengambil `averageIncome` = total pemasukan / jumlah bulan unik.
  - Menentukan bulan terakhir dan bulan sebelumnya.
  - Jika income bulan sebelumnya = 0:
    - jika lastIncome > 0 => percentChange = 100 dan trend = up
    - jika lastIncome = 0 => percentChange = 0 trend = down

### 6) `BiggestExpenseCard`

**File**: `Frontend/src/components/BiggestExpenseCard.jsx`

- **Purpose**: Menentukan kategori pengeluaran terbesar dan proporsinya.
- **Input Data**:
  - `transactions` (array)
- **Output Display**:
  - Nama kategori terbesar.
  - Nominal terbesar.
  - (persentase nilai terbesar terhadap total pengeluaran dihitung, meski tidak ditampilkan eksplisit pada UI code yang ada).
- **Business Logic**:
  - Menyaring transaksi `type === 'expense'`.
  - Menjumlahkan per kategori (berdasarkan `t.category` atau `'-'`).
  - Mencari nilai maksimum.

### 7) `MonthlyCashflowTableCard`

**File**: `Frontend/src/components/MonthlyCashflowTableCard.jsx`

- **Purpose**: Merangkum arus kas bulanan dengan metrik berbasis rata-rata pemasukan/pengeluaran.
- **Input Data**:
  - `transactions` (array)
  - `periodLabel` (string)
  - `compact` (boolean)
- **Output Display**:
  - 5 kartu statistik:
    - Rata-rata pemasukan
    - Rata-rata pengeluaran
    - Rata-rata arus kas bersih
    - Arus kas tertinggi
    - Arus kas terendah
- **Business Logic**:
  - incomeAvg/expenseAvg dari rata-rata per transaksi.
  - netCashFlow = incomeAvg - expenseAvg.
  - highestNet/lowestNet berdasarkan cashflow per transaksi (income = +amount, expense = -amount).
  - Pewarnaan nilai arus kas bersih bergantung negatif/positif.

### 8) `PeriodDevelopmentCard`

**File**: `Frontend/src/components/PeriodDevelopmentCard.jsx`

- **Purpose**: Membandingkan performa finansial antara “periode saat ini” vs “periode sebelumnya”.
- **Input Data**:
  - `transactions`
  - `periodLabel`
  - `currentStart`, `currentEnd`, `previousStart`, `previousEnd` (Date, opsional)
- **Output Display**:
  - 4 baris dengan indikator:
    - Total pemasukan
    - Total pengeluaran
    - Total arus kas bersih
    - Rasio tabungan
  - Masing-masing baris punya pill indikator persentase perubahan.
- **Business Logic**:
  - `safeDateInRange` memastikan transaksi valid tanggal.
  - Jika range disediakan: filter transaksi pada range tersebut.
  - Jika tidak: fallback membandingkan bulan ini vs bulan sebelumnya.
  - `safePctChange` menangani kasus prev=0.

### 9) Komponen Komposisi UMKM

#### 9.1) `UmkmIncomeCompositionCard`

**File**: `Frontend/src/components/umkm/UmkmIncomeCompositionCard.jsx`

- **Purpose**: Komposisi pemasukan UMKM per pos.
- **Input Data**:
  - `transactions`, `periodLabel`, `compact`
- **Output Display**:
  - Kartu per kategori: Penjualan, Pemasukan, Tabungan.
  - Persentase dan nominal + progress bar.
- **Business Logic**:
  - Normalize kategori dari `businessCategory`/`category` dengan substring:
    - penjualan => Penjualan
    - pemasukan => Pemasukan
    - tabungan => Tabungan
  - Urutan tetap: `['Penjualan','Pemasukan','Tabungan']`.

#### 9.2) `UmkmExpenseCompositionCard`

**File**: `Frontend/src/components/umkm/UmkmExpenseCompositionCard.jsx`

- **Purpose**: Komposisi pengeluaran operasional UMKM berdasarkan kategori.
- **Input Data**:
  - `transactions`, `periodLabel`, `compact`, `categories` (opsional)
- **Output Display**:
  - Daftar kartu per kategori efektif, maksimal ditampilkan 8 baris.
  - Nominal dan persentase + progress bar.
- **Business Logic**:
  - `effectiveCategories`: gunakan `categories` prop jika tersedia dan tidak kosong, jika tidak gunakan default:
    - Pengeluaran Operasional, Beli Bahan Baku / Stok, Piutang Pelanggan, Hutang Supplier.
  - Normalisasi kategori dari `businessCategory`/`category`:
    - pengeluaran/operasional
    - beli/bahan/baku/stok
    - piutang/pelanggan
    - hutang/supplier
    - selain itu => Lainnya (namun disaring oleh effectiveCategories).

### 10) Komponen Komposisi Mahasiswa

#### 10.1) `MahasiswaIncomeCompositionCard`

**File**: `Frontend/src/components/mahasiswa/MahasiswaIncomeCompositionCard.jsx`

- **Purpose**: Komposisi pemasukan mahasiswa berdasarkan kategori studi.
- **Input Data**:
  - `transactions`, `periodLabel`, `compact`
- **Output Display**:
  - Kartu per kategori (Beasiswa, Tabungan, Uang Saku, Penghasilan Kerja Paruh Waktu).
  - Nominal dan persentase + progress bar.
- **Business Logic**:
  - normalize kategori dari substring kategori transaksi.
  - fallback kategori: “Lainnya” tidak dimasukkan karena baris hanya untuk orderedCats.

#### 10.2) `MahasiswaExpenseCompositionCard`

**File**: `Frontend/src/components/mahasiswa/MahasiswaExpenseCompositionCard.jsx`

- **Purpose**: Komposisi pengeluaran mahasiswa.
- **Input Data**:
  - `transactions`, `periodLabel`, `compact`
- **Output Display**:
  - Kartu per kategori (Kos, UKT, Makan, Hutang, Transportasi, Kebutuhan Kuliah, Kebutuhan Lainnya).
- **Business Logic**:
  - Normalisasi kategori dari substring pada `t.category`.

### 11) Komponen Komposisi Masyarakat

#### 11.1) `MasyarakatIncomeCompositionCard`

**File**: `Frontend/src/components/masyarakat/MasyarakatIncomeCompositionCard.jsx`

- **Purpose**: Komposisi pemasukan masyarakat.
- **Input Data**:
  - `transactions`, `periodLabel`, `compact`
- **Output Display**:
  - Kartu per kategori fixed: Penghasilan Kerja, Uang Saku, Tabungan.
- **Business Logic**:
  - normalize kategori dari substring.

#### 11.2) `MasyarakatExpenseCompositionCard`

**File**: `Frontend/src/components/masyarakat/MasyarakatExpenseCompositionCard.jsx`

- **Purpose**: Komposisi pengeluaran masyarakat.
- **Input Data**:
  - `transactions`, `periodLabel`, `compact`, `categories` (opsional)
- **Output Display**:
  - Kartu per kategori dari `effectiveCategories`.
  - Nominal dan persentase + progress bar.
- **Business Logic**:
  - Normalisasi kategori dari substring pada `t.category`.
  - Jika kategori tidak cocok => `Kebutuhan Lainnya`.

### 12) Komponen arus kas: varian UMKM/Mahasiswa/Masyarakat

Walaupun dokumentasi ini fokus pada file halaman dashboard, komponen arus kas bulanan juga ada pada folder masing-masing.

- `UmkmMonthlyCashflowTableCard.jsx`
- `MahasiswaMonthlyCashflowTableCard.jsx`
- `MasyarakatMonthlyCashflowTableCard.jsx`

**Catatan**: Pada bagian ini, penjelasan rinci mengikuti pola yang sama dengan `MonthlyCashflowTableCard` (mencari rata-rata pemasukan/pengeluaran dan arus kas bersih serta tertinggi/terendah).

## Financial Summary Cards

Pada implementasi halaman dashboard yang dianalisis, “financial summary cards” tampak sebagai kartu stat utama. Daftar kartu utama pada masing-masing halaman:

### DashboardPage.jsx (Dashboard Utama)
1. Saldo Pemasukan (`walletSummary.smartCashPerDay`)
2. Saldo Pengeluaran (`walletSummary.smartReductionPerDay`)
3. Financial Health Score:
   - Overall Score (0–100)
   - 5 aspek (Cashflow, Rasio Tabungan, Efisiensi Pengeluaran, Kondisi Hutang, Stabilitas Arus Kas)
4. (Khusus UMKM, kondisional `isUmkm`):
   - Arus Kas Usaha (businessIncome)
   - Pengeluaran Operasional (businessExpense)
   - HPP Diperkirakan (estimatedHpp)
   - Laba Rugi Otomatis (profitLoss)
   - Stok Barang (inventoryItems)
   - Hutang & Piutang (totalPayables, totalReceivables)

### DashboardMahasiswaPage.jsx
1. Saldo Pemasukan (totalIncome)
2. Saldo Pengeluaran (totalExpense)
3. Budget Reminder (status & badge persentase)
4. Financial Health Score (overallScore + healthAspects)

### DashboardUMKMPage.jsx
1. Saldo Pemasukan (businessIncome)
2. Saldo Pengeluaran (businessExpense)
3. Financial Score (financialScore)
4. Budget Reminder (status)
5. Arus Kas Usaha (businessIncome, businessExpense, costOfGoodsSold)
6. Laba Rugi Otomatis (profitLoss)
7. Utang & Piutang (totalPayables, totalReceivables)
8. Stok Barang (inventoryItems)

### DashboardMasyarakatPage.jsx
1. Saldo Pemasukan (saldoPemasukanBulanIniTermasukSaldoAwal)
2. Saldo Pengeluaran (saldoPengeluaranBulanIni)
3. Budget Reminder (budgetReminderStatus)
4. Financial Health Score (overallScore + healthAspects)

## Dashboard Metrics

Bagian ini merangkum semua metrik yang dihitung/ditampilkan pada halaman dashboard.

### Metrik yang umum di Dashboard Utama / Mahasiswa / Masyarakat

1. **Income / Pemasukan**
   - DashboardPage:
     - “Saldo Pemasukan” = `walletSummary.smartCashPerDay`
     - Untuk UMKM: `businessIncome = umkmSummary.income + initialIncome`.
   - DashboardMahasiswaPage:
     - `totalIncome = saldoAwalBulanIni + sum(income kategori mahasiswa pada bulan berjalan)`.
   - DashboardMasyarakatPage:
     - `saldoPemasukanBulanIniTermasukSaldoAwal = saldoPemasukanBulanIni + saldoAwalSebelumBulanIni + fallbackInitialBalance`.

2. **Expense / Pengeluaran**
   - DashboardPage:
     - “Saldo Pengeluaran” = `walletSummary.smartReductionPerDay`.
     - Untuk UMKM: `businessExpense` dari transaksi operasional.
   - DashboardMahasiswaPage:
     - `totalExpense` = sum expense kategori mahasiswa.
   - DashboardMasyarakatPage:
     - `saldoPengeluaranBulanIni` = sum expense bulan berjalan.

3. **Cashflow**
   - DashboardPage: `cashflow = businessIncome - businessExpense`.
   - DashboardMahasiswaPage: `cashflow = totalIncome - totalExpense`.
   - DashboardMasyarakatPage: `cashflow = businessIncome - businessExpense`.

4. **Savings / Rasio Tabungan**
   - DashboardPage:
     - `savingsRatio = businessIncome > 0 ? min(1, walletSummary.current / businessIncome) : 0`
     - `savingsScore = round(savingsRatio*100)`.
   - DashboardMahasiswaPage:
     - `savingsRatio = totalIncome > 0 ? min(1, walletSummary.current / totalIncome) : 0`.
   - DashboardMasyarakatPage:
     - `savingsRatio = businessIncome > 0 ? min(1, currentBalance / businessIncome) : ...` (dengan logika akun baru).

5. **Efficiency / Efisiensi Pengeluaran**
   - DashboardPage: berbasis `budgetUsageRatio` jika budget tersedia, clamp.
   - DashboardMahasiswaPage: jika budget tersedia gunakan `budgetUsageRatio`, jika tidak gunakan `totalExpense/totalIncome`.
   - DashboardMasyarakatPage: jika akun baru => 100, else berbasis budget usage ratio atau expense/income.

6. **Debt / Kondisi Hutang**
   - Ditentukan dari transaksi hutang berdasarkan regex pada category/note/title.
   - Skor:
     - `debtRatio = totalDebt / income`
     - `debtScore = round(clamp(100 - debtRatio*80, 0..100))`.

7. **Stability / Stabilitas Arus Kas**
   - Ditentukan berdasarkan:
     - jumlah transaksi income bulan berjalan
     - cashflow sign (positif/negatif)
     - budget usage ratio

### Metrik tambahan spesifik UMKM

1. **HPP (Cost of Goods Sold)**
   - `estimatedHpp = umkmSummary.estimatedHpp`.
2. **Profit/Loss (Laba Rugi)**
   - `profitLoss = profitIncome - costOfGoodsSold - businessExpense`.
3. **Inventory stok**
   - `stock` dan `reorderLevel`.
   - Status menipis: `stock <= reorderLevel`.
4. **Payables/Receivables**
   - `umkmSummary.payables` dan `umkmSummary.receivables`.

### Metrik khusus Budget Reminder

- **Budget Usage Ratio**
  - DashboardMahasiswaPage & DashboardMasyarakatPage: `totalBudgetUsage / totalBudgetLimit` (dengan clamp/penyesuaian).
  - DashboardUMKMPage dan Budget Reminder pada DashboardUMKMPage: `budgetUsageRatio = totalBudgetUsage / totalBudget`.

- **Status**
  - Tidak ada budget / aman / mendekati batas / terlampaui.

## Data Sources

Berdasarkan kode halaman dashboard, data yang digunakan adalah:

1. **Transactions**
   - Field digunakan: `type`, `amount`, `date`, `category`, `businessCategory`, `note`, `title`, `invoice`.
   - Filter berbeda untuk tiap dashboard (mis. kategori income/expense mahasiswa atau penggunaan regex hutang).

2. **Wallet Summary**
   - Field yang digunakan pada dashboard:
     - `walletSummary.current`
     - `walletSummary.income`
     - `walletSummary.expense`
     - `walletSummary.smartCashPerDay`
     - `walletSummary.smartReductionPerDay`

3. **Wallet Info**
   - Field yang digunakan:
     - `walletInfo.balance`

4. **Budgets**
   - Field yang digunakan:
     - `category`, `limit`, `usage`.
   - Penggunaan pada DashboardMasyarakatPage menghitung `usage` dengan menggabungkan `usage` budget + sum transaksi expense (diambil max).

5. **UMKM Summary**
   - Field yang digunakan:
     - `umkmSummary.income`
     - `umkmSummary.operationalExpense`
     - `umkmSummary.inventory` (array item stok)
     - `umkmSummary.payables`
     - `umkmSummary.receivables`
     - `umkmSummary.estimatedHpp`

6. **User Profile**
   - Field yang digunakan:
     - `userProfile.nama`
     - `userProfile.usertype`.

## Dashboard Rendering Flow

Alur rendering (ringkas) berdasarkan implementasi Frontend halaman dashboard:

1. **Data diperoleh dari API** (tidak ditampilkan langsung pada file dashboard, namun disuplai sebagai props dari `App`/routing).
   - Data yang masuk ke halaman dashboard biasanya sudah berupa objek `walletSummary`, `transactions`, `budgets`, dan set lain.

2. **Rendering halaman**
   - React memanggil komponen halaman dashboard.
   - Semua kalkulasi dikerjakan di awal komponen (sebelum `return`).

3. **Perhitungan metrik**
   - Filter transaksi berdasarkan bulan berjalan (khusus mahasiswa & masyarakat) menggunakan `new Date(t.date)`.
   - Menghitung total income/expense.
   - Menghitung budget usage ratio dan menentukan status.
   - Menghitung skor kesehatan finansial:
     - cashflowScore
     - savingsScore
     - efficiencyScore
     - debtScore
     - stabilityScore
   - Weighted sum menghasilkan `overallScore`.

4. **Menentukan label status**
   - `financialCategory` ditentukan dari `overallScore`:
     - >= 80 => “Sangat Sehat”
     - >= 60 => “Cukup Sehat”
     - >= 40 => “Kurang Stabil”
     - else => “Buruk”.

5. **Render UI**
   - Komponen/section dirender dengan nilai final.
   - Bagian-bagian tertentu hanya muncul sesuai kondisi:
     - UMKM section di DashboardPage jika `isUmkm`.

6. **Quick Actions**
   - Tombol cepat memanggil callback `onQuickAction` dengan parameter kategori.

## User Experience

### Loading State

Halaman dashboard yang dianalisis tidak menampilkan implementasi loading state eksplisit (mis. skeleton atau spinner) di dalam file halaman tersebut. Jika loading state ada, kemungkinan besar ditangani oleh layer routing/App sebelum props kosong diteruskan ke halaman.

### Empty State

Beberapa empty state dibentuk langsung melalui logic perhitungan:

- Budget Reminder:
  - Jika `budgets` kosong atau `totalBudget <= 0`: status “Belum ada budget”.
- Komposisi/inventory:
  - UMKM stok:
    - jika `inventoryItems.length === 0` menampilkan “Belum ada item stok.”
- Komponen analytics:
  - Beberapa card analytics (mis. `BiggestExpenseCard`, `AverageIncomeCard`) melakukan fallback saat tidak ada transaksi yang cocok.

### Error State

Tidak ada error state UI eksplisit (mis. pesan “terjadi kesalahan”) di halaman dashboard yang dianalisis. Penanganan error kemungkinan berada pada layer data fetching.

## Performance Considerations

1. **Perhitungan dilakukan di dalam render**
   - Mayoritas kalkulasi berada di badan function komponen. Untuk data kecil hingga menengah, ini aman.
   - Namun untuk transaksi sangat besar, sebaiknya kalkulasi dipindah ke `useMemo` agar tidak mengulang setiap re-render.

2. **Filter & reduce berulang**
   - Di dashboard mahasiswa & masyarakat: beberapa filter transaksi pada bulan berjalan dilakukan berkali-kali.
   - Optimisasi: gunakan hasil filter bulan berjalan sekali lalu reuse.

3. **Normalisasi kategori**
   - Komposisi card analytics memakai `toLowerCase()` dan substring matching. Ini cukup ringan namun bisa dioptimalkan untuk dataset besar.

## Security Considerations

1. **Validasi input**
   - Frontend melakukan casting `Number(t.amount)` dengan fallback 0.
   - Ini mengurangi risiko NaN di UI.

2. **Tidak ada operasi sensitif di frontend**
   - Dashboard hanya menampilkan data dan menghitung metrik.

3. **Data integrity**
   - Karena perhitungan skor dan budget reminder sensitif terhadap kategori dan field tertentu (`category`, `businessCategory`), konsistensi field dari backend/DB sangat penting.

4. **Callback Quick Actions**
   - `onQuickAction` hanya menerima string kategori. Pastikan backend route yang dipakai untuk membuat transaksi memvalidasi tipe transaksi dan kategori.

## Future Improvements

1. **Ekstraksi kalkulasi skor menjadi util/helper**
   - Ada duplikasi logic antara DashboardPage, DashboardMahasiswaPage, dan DashboardMasyarakatPage.

2. **Gunakan `useMemo` untuk perhitungan berat**
   - Terutama untuk filter transactions, reduce totals, dan regex debt detection.

3. **Standardisasi kategori**
   - Normalisasi kategori dan penentuan “Saldo Awal” bisa distandarkan pada util.

4. **Loading/Error state di dashboard**
   - Menambahkan skeleton loader dan error banner ketika API gagal.

5. **Konsistensi penggunaan komponen cards**
   - Beberapa card analytics belum digunakan langsung di dashboard halaman utama. Menyatukan approach agar UI lebih modular.

6. **Tambahkan unit tests untuk kalkulasi**
   - Kalkulasi skor (weighted sum, efficiencyScore) dapat diuji agar konsisten saat perubahan kategori.

## Contributed By

KasCerdas Team

