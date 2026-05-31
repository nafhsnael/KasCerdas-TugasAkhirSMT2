# Financial Analysis Documentation

## Overview

Halaman **Analisis Keuangan** pada aplikasi **KasCerdas** bertujuan membantu pengguna memantau kondisi keuangan secara lebih terstruktur dibanding tampilan dashboard ringkas. Analisis ini fokus pada:

- Ringkasan arus kas (cashflow) berbasis periode pilihan.
- Komposisi pengeluaran berdasarkan kategori/pos.
- (Untuk beberapa role) komposisi pemasukan.
- Perkembangan performa keuangan dengan perbandingan periode sebelumnya.

Seluruh analisis diimplementasikan pada Frontend menggunakan React. Untuk semua halaman analisis, komponen kartu visual dirender berdasarkan hasil filter transaksi sesuai rentang tanggal yang ditentukan oleh UI pemilihan periode.

Dokumentasi ini ditulis berdasarkan implementasi file yang tersedia di project:

- `Frontend/src/pages/AnalysisPage.jsx`
- `Frontend/src/pages/AnalysisMahasiswaPage.jsx`
- `Frontend/src/pages/AnalysisUMKMPage.jsx`
- `Frontend/src/pages/AnalysisMasyarakatPage.jsx`
- komponen kartu yang digunakan pada masing-masing halaman.

## Purpose

Tujuan halaman Financial Analysis dalam KasCerdas:

1. Memberi pengguna kemampuan memilih rentang waktu analisis (mis. bulan ini, bulan kemarin, 3/6 bulan terakhir, tahun ini).
2. Memproses data transaksi agar menjadi metrik finansial yang mudah dipahami (arus kas bulanan, komposisi pengeluaran/pemasukan, perkembangan).
3. Menyajikan informasi dalam bentuk komponen kartu agar UI konsisten.
4. Memberi perbandingan performa antara periode saat ini dan periode sebelumnya melalui komponen *period development*.

## Analysis Architecture

Alur arsitektur analisis keuangan (berdasarkan kode Frontend yang tersedia):

**Database**
- Menyediakan sumber data transaksi (`transactions`) yang memuat minimal field berikut:
  - `date`
  - `type` (mis. `income` / `expense` atau sinonim seperti `pengeluaran`)
  - `category` (untuk pemetaan kategori analisis)
  - `businessCategory` (untuk analisis UMKM)
  - `amount`

**→ API**
- API menyediakan data transaksi ke komponen halaman analisis dalam bentuk props `transactions`.

**→ Frontend State**
- Setiap halaman analisis memiliki state `selectedPeriod` (string kunci periode).
- UI pemilihan periode mengubah `selectedPeriod` lewat handler `setSelectedPeriod`.

**→ Analysis Calculations**
- Rentang tanggal ditentukan oleh fungsi `getPeriodRanges(periodKey)`.
- Transaksi difilter dengan fungsi `isTxInRange(tx, start, end)`.
- Komponen kartu menerima `filteredTransactions` dan menghitung metrik internalnya sendiri (menggunakan `useMemo`).

**→ Analysis Components**
- Kartu visual di-render sebagai komponen:
  - `MonthlyCashflowTableCard` (dan varian per role)
  - `ExpenseCompositionCard` (dan varian per role)
  - `IncomeCompositionCard` (dan varian per role)
  - `PeriodDevelopmentCard` (dan varian per role)
  - `BiggestExpenseCard` serta `StatCard` (dihandle pada file analysis tertentu via import)

> Penting: walaupun beberapa komponen seperti `StatCard` dan `BiggestExpenseCard` di-*import* pada beberapa halaman analysis, rendering aktualnya harus mengikuti apa yang ada di kode `return` komponen. Analisis ini hanya menguraikan komponen yang benar-benar digunakan dalam `return` halaman.

## Analysis Pages

### Analysis Utama

**File**: `Frontend/src/pages/AnalysisPage.jsx`

**Purpose**
- Menyediakan analisis keuangan umum untuk pengguna.
- Menggunakan periode pilihan untuk memfilter transaksi.

**UI dan komponen yang dirender**
1. **MonthlyCashflowTableCard**
   - `transactions={filteredTransactions}`
   - `periodLabel={label}`
   - `compact` (boolean true)

2. **ExpenseCompositionCard**
   - `transactions={filteredTransactions}`
   - `periodLabel={label}`
   - `compact` (boolean true)

3. **PeriodDevelopmentCard**
   - memakai `transactions={transactions}` (bukan filtered) namun parameter periodStart/end spesifik diberikan melalui props:
     - `currentStart`, `currentEnd`
     - `previousStart`, `previousEnd`
   - `periodLabel={label}`

**Business Logic / Calculation Logic**
1. Period selection:
   - State `selectedPeriod` default `'bulan_ini'`.
   - `getPeriodRanges` mengembalikan:
     - `currentStart`, `currentEnd`
     - `previousStart`, `previousEnd`
     - `label` (label tampilan)

2. Filtering transaksi:
   - `filteredTransactions` dihitung dengan `tx.filter((t) => isTxInRange(t, currentStart, currentEnd))`.

3. Penentuan rentang periode tertentu:
   - `bulan_ini`: current month vs previous month
   - `bulan_kemarin`: current = bulan kemarin, previous = 2 bulan sebelum
   - `3_bulan_terakhir`: current = 2 bulan sebelum + bulan berjalan (range span), previous = 3 bulan sebelum range tersebut
   - `6_bulan_terakhir`: analog 6 bulan
   - `tahun_ini`: current = year berjalan, previous = tahun sebelumnya

**Visualization**
- MonthlyCashflowTableCard dan ExpenseCompositionCard merender grafik/progress bar sebagai bagian kartu.
- PeriodDevelopmentCard merender perbandingan empat metrik dalam layout tabel/daftar.

### Analysis Mahasiswa

**File**: `Frontend/src/pages/AnalysisMahasiswaPage.jsx`

**Purpose**
- Memberikan analisis spesifik untuk mahasiswa.
- Menampilkan arus kas bulanan, komposisi pengeluaran, komposisi pemasukan, serta perkembangan.

**UI dan komponen yang dirender**
1. **MahasiswaMonthlyCashflowTableCard**
   - `transactions={filteredTransactions}`
   - `periodLabel={label}`
   - `compact`

2. **MahasiswaExpenseCompositionCard**
   - `transactions={filteredTransactions}`
   - `periodLabel={label}`
   - `compact`

3. **MahasiswaIncomeCompositionCard**
   - `transactions={filteredTransactions}`
   - `periodLabel={label}`
   - `compact`

4. **MahasiswaPeriodDevelopmentCard**
   - `transactions={transactions}`
   - `periodLabel={label}`
   - `currentStart`, `currentEnd`, `previousStart`, `previousEnd`

**Business Logic / Calculation Logic**
1. Period selection dan rentang tanggal:
   - Mekanisme identik dengan AnalysisPage, menggunakan `PERIOD_OPTIONS` dan `getPeriodRanges`.

2. Filtering transaksi mahasiswa:
   - `filteredTransactions` di-*filter* dengan:
     - berada dalam `currentStart..currentEnd`
     - `type` termasuk `expense` atau `pengeluaran`
     - kategori pengeluaran harus cocok salah satu dari:
       - `'Kos'`, `'UKT'`, `'Makan'`, `'Hutang'`, `'Transportasi'`, `'Kebutuhan Kuliah'`, `'Kebutuhan Lainnya'`

**Visualization**
- MonthlyCashflowTableCard varian mahasiswa.
- Komposisi pengeluaran/pemasukan mahasiswa memakai progress bar kategori.
- PeriodDevelopmentCard varian mahasiswa merender data perkembangan.

### Analysis UMKM

**File**: `Frontend/src/pages/AnalysisUMKMPage.jsx`

**Purpose**
- Menyediakan analisis spesifik UMKM.

**UI dan komponen yang dirender**
1. **UmkmMonthlyCashflowTableCard**
   - `transactions={filteredTransactions}`
   - `periodLabel={label}`
   - `compact`

2. **UmkmExpenseCompositionCard**
   - `transactions={filteredTransactions}`
   - `periodLabel={label}`
   - `compact`

3. **UmkmIncomeCompositionCard**
   - `transactions={filteredTransactions}`
   - `periodLabel={label}`
   - `compact`

4. **UmkmPeriodDevelopmentCard**
   - `transactions={transactions}`
   - `periodLabel={label}`
   - `currentStart`, `currentEnd`, `previousStart`, `previousEnd`

**Business Logic / Calculation Logic**
1. Period selection dan rentang tanggal:
   - `getPeriodRanges` mengembalikan rentang menggunakan fungsi end-of-day dan end-of-month.

2. Filtering transaksi UMKM:
   - Filter utama:
     - `inRange` sesuai currentStart/currentEnd
     - `type` diinterpretasi dari `t?.type` lower-case
     - kategori berdasarkan `businessCategory` atau `category`
   - Mapping kategori UMKM yang digunakan pada analisis:
     - pengeluaran operasional:
       - `rawCat` mengandung `'pengeluaran'` atau `'operasional'`
     - beli bahan:
       - `rawCat` mengandung `'beli'` / `'bahan'` / `'baku'` / `'stok'`
     - piutang:
       - `rawCat` mengandung `'piutang'` / `'pelanggan'`
     - hutang:
       - `rawCat` mengandung `'hutang'` / `'supplier'`
   - Kriteria pengambilan transaksi:
     - `expense/pengeluaran` bila kategori termasuk pengeluaran operasional / beli bahan / hutang
     - `piutang` selalu diikutkan (walaupun type yang digunakan bisa tidak selalu expense)

**Visualization**
- Monthly cashflow varian UMKM.
- Income/Expense composition varian UMKM.
- Period development varian UMKM.

### Analysis Masyarakat

**File**: `Frontend/src/pages/AnalysisMasyarakatPage.jsx`

**Purpose**
- Menyediakan analisis untuk tipe masyarakat.

**UI dan komponen yang dirender**
1. **MasyarakatMonthlyCashflowTableCard**
   - `transactions={filteredTransactions}`
   - `periodLabel={label}`
   - `compact`

2. **MasyarakatExpenseCompositionCard**
   - `transactions={filteredTransactions}`
   - `periodLabel={label}`
   - `compact`
   - `categories` di-*pass* eksplisit dengan daftar:
     - `'Makan'`, `'Hutang'`, `'Transport'`, `'Belanja'`, `'Tagihan'`, `'Kebutuhan Lainnya'`

3. **MasyarakatIncomeCompositionCard**
   - `transactions={filteredTransactions}`
   - `periodLabel={label}`
   - `compact`

4. **MasyarakatPeriodDevelopmentCard**
   - `transactions={transactions}`
   - `periodLabel={label}`
   - `currentStart`, `currentEnd`, `previousStart`, `previousEnd`

**Business Logic / Calculation Logic**
1. Filtering transaksi masyarakat:
   - transaksi harus berada dalam range `currentStart..currentEnd`
   - `type` harus `'expense'` atau `'pengeluaran'`
   - kategori pengeluaran harus salah satu dari daftar:
     - `'Makan'`, `'Hutang'`, `'Transport'`, `'Belanja'`, `'Tagihan'`, `'Kebutuhan Lainnya'`

**Visualization**
- Monthly cashflow varian masyarakat.
- Expense composition varian masyarakat (dengan categories props).
- Income composition varian masyarakat.
- Period development varian masyarakat.

## Analysis Components

Bagian ini menjelaskan semua komponen card yang digunakan oleh halaman analisis dan/atau merupakan komponen pendukung yang menjadi bagian dari analisis.

> Fokus pada komponen yang ada di project dan dipakai oleh `Analysis*Page.jsx`.

### Monthly Cashflow Table Cards (Umum/Mahasiswa/UMKM/Masyarakat)

#### A) `MonthlyCashflowTableCard`

**File**: `Frontend/src/components/MonthlyCashflowTableCard.jsx`

- **Purpose**: Menghitung ringkasan arus kas berbasis rata-rata pemasukan/pengeluaran dan memberikan insight nilai tertinggi/terendah.
- **Data Source**: array `transactions` (props).
- **Calculation Logic**:
  - `incomeAvg` = rata-rata amount untuk transaksi `type === 'income'`.
  - `expenseAvg` = rata-rata amount untuk transaksi `type === 'expense'`.
  - `netCashFlow = incomeAvg - expenseAvg`.
  - `perTxNet` dibuat dari setiap transaksi:
    - income => +amount
    - expense => -amount
  - `highestNet` = max(perTxNet), `lowestNet` = min(perTxNet).
  - `isNegative` = netCashFlow < 0.
- **Visualization**:
  - 5 kartu statistik:
    - rata-rata pemasukan
    - rata-rata pengeluaran
    - rata-rata arus kas bersih
    - arus kas tertinggi
    - arus kas terendah

#### B) Varian UMKM / Mahasiswa / Masyarakat

Komponen varian diimplementasikan dengan pola yang sama (menghitung rata-rata income/expense, net cashflow, highest/lowest). Nama file:

- `Frontend/src/components/umkm/UmkmMonthlyCashflowTableCard.jsx`
- `Frontend/src/components/mahasiswa/MahasiswaMonthlyCashflowTableCard.jsx`
- `Frontend/src/components/masyarakat/MasyarakatMonthlyCashflowTableCard.jsx`

Dalam dokumen ini, logika inti tetap konsisten: menggunakan `transactions` yang dipassing ke komponen, kemudian memisahkan income/expense berdasarkan `t?.type`.

### Expense Composition Cards

#### A) `ExpenseCompositionCard`

**File**: `Frontend/src/components/ExpenseCompositionCard.jsx`

- **Purpose**: Menampilkan distribusi pengeluaran berdasarkan kategori standar.
- **Data Source**:
  - `transactions`
  - `periodLabel` (opsional)
  - `compact` (boolean)
- **Calculation Logic**:
  - hanya transaksi `type === 'expense'` atau `type === 'pengeluaran'` (case-insensitive).
  - total pengeluaran = sum amount.
  - mapping kategori berbasis substring pada `t?.category` lower-case:
    - mengandung 'makan' => Makan
    - mengandung 'hutang' => Hutang
    - mengandung 'transport' => Transport
    - mengandung 'belanja' => Belanja
    - mengandung 'tagihan' => Tagihan
    - selain itu => Kebutuhan Lainnya
  - urutan kategori: Makan, Hutang, Transport, Belanja, Tagihan, Kebutuhan Lainnya.
- **Visualization**:
  - grid kartu kategori dengan persentase dan progress bar.

#### B) Varian Mahasiswa / UMKM / Masyarakat

Nama file:

- `Frontend/src/components/mahasiswa/MahasiswaExpenseCompositionCard.jsx`
  - mapping kategori: Kos/UKT/Makan/Hutang/Transportasi/Kebutuhan Kuliah/Kebutuhan Lainnya
  - warna kategori didefinisikan pada map `CATEGORY_COLOR`.

- `Frontend/src/components/umkm/UmkmExpenseCompositionCard.jsx`
  - kategori efektif diambil dari `categories` prop jika ada, selain itu default kategori UMKM.
  - normalisasi kategori dari substring `businessCategory`/`category`.
  - menyediakan tampilan fallback jika tidak ada orderedRows.

- `Frontend/src/components/masyarakat/MasyarakatExpenseCompositionCard.jsx`
  - kategori efektif = `categories` prop jika diberikan, jika tidak pakai DEFAULT_CATEGORIES.
  - normalisasi kategori dari substring pada `t?.category` lower-case.

### Income Composition Cards (Mahasiswa/UMKM/Masyarakat)

#### A) `MahasiswaIncomeCompositionCard`

**File**: `Frontend/src/components/mahasiswa/MahasiswaIncomeCompositionCard.jsx`

- **Purpose**: Komposisi pemasukan mahasiswa berdasarkan kategori studi.
- **Data Source**: `transactions`.
- **Calculation Logic**:
  - filter transaksi `type === 'income'`.
  - normalize kategori pemasukan dengan substring:
    - beasiswa => Beasiswa
    - tabungan => Tabungan
    - uang saku => Uang Saku
    - penghasilan kerja paruh waktu => Penghasilan Kerja Paruh Waktu
  - urutan kategori tetap (orderedCats).
  - persentase = nominal / totalIncome.
- **Visualization**: kartu persentase + progress bar.

#### B) `UmkmIncomeCompositionCard`

**File**: `Frontend/src/components/umkm/UmkmIncomeCompositionCard.jsx`

- **Purpose**: Komposisi pemasukan UMKM (pos) berupa Penjualan, Pemasukan, Tabungan.
- **Calculation Logic**:
  - filter `type === 'income'`.
  - normalisasi kategori dari substring:
    - penjualan => Penjualan
    - pemasukan => Pemasukan
    - tabungan => Tabungan
  - urutan tetap: Penjualan, Pemasukan, Tabungan.
- **Visualization**: progress bar.

#### C) `MasyarakatIncomeCompositionCard`

**File**: `Frontend/src/components/masyarakat/MasyarakatIncomeCompositionCard.jsx`

- **Purpose**: Komposisi pemasukan masyarakat.
- **Calculation Logic**:
  - filter `type === 'income'`.
  - normalisasi kategori:
    - uang saku => Uang Saku
    - tabungan => Tabungan
    - penghasilan kerja => Penghasilan Kerja
  - urutan default: Penghasilan Kerja, Uang Saku, Tabungan.

### Period Development Cards (Umum/Mahasiswa/UMKM/Masyarakat)

#### A) `PeriodDevelopmentCard` (umum)

**File**: `Frontend/src/components/PeriodDevelopmentCard.jsx`

- **Purpose**: Membandingkan performa finansial periode saat ini vs periode sebelumnya.
- **Data Source**:
  - `transactions`
  - `currentStart`, `currentEnd`
  - `previousStart`, `previousEnd`
  - `periodLabel`
- **Calculation Logic**:
  - `safeDateInRange` memastikan transaksi punya date valid dan berada di range.
  - `currentTx` dan `previousTx` dipilih:
    - jika range props tersedia, pakai filter rentang tersebut
    - jika tidak, fallback membandingkan bulan ini vs bulan sebelumnya.
  - Hitung metrik:
    - incomeCur = sum amount untuk `type === 'income'` pada currentTx
    - expenseCur = sum amount untuk `type === 'expense'` pada currentTx
    - netCur = incomeCur - expenseCur
    - savingsRatioCurPct = (netCur/incomeCur)*100
    - sama untuk previousTx
  - perubahan persentase dihitung dengan `safePctChange` pada masing-masing metrik.
- **Visualization**:
  - 4 baris: total pemasukan, total pengeluaran, total arus kas bersih, rasio tabungan.
  - tiap baris memiliki pill indikator perubahan (naik/turun) berdasarkan tanda.

#### B) Varian Mahasiswa / UMKM / Masyarakat

File:
- `Frontend/src/components/mahasiswa/MahasiswaPeriodDevelopmentCard.jsx`
- `Frontend/src/components/umkm/UmkmPeriodDevelopmentCard.jsx`
- `Frontend/src/components/masyarakat/MasyarakatPeriodDevelopmentCard.jsx`

Implementasi varian mengikuti pola yang sama: memfilter transaksi berdasarkan range, lalu menghitung income/expense/net dan rasio tabungan, serta membandingkannya ke periode sebelumnya.

### BiggestExpenseCard

**File**: `Frontend/src/components/BiggestExpenseCard.jsx`

- **Purpose**: Menghitung kategori pengeluaran terbesar dari kumpulan transaksi.
- **Data Source**: `transactions`.
- **Calculation Logic**:
  - filter transaksi `type === 'expense'`.
  - akumulasi jumlah amount per `t.category`.
  - pilih kategori dengan amount maksimum.
  - hitung percent terhadap totalExpense.
- **Visualization**:
  - menampilkan kategori terbesar dan jumlah.

> Catatan implementasi: komponen ini di-*import* pada `AnalysisPage.jsx` dan/atau file lain, tetapi tidak selalu dirender pada `return`. Dokumentasi fokus pada komponen yang digunakan oleh halaman.

### StatCard

**File**: `Frontend/src/components/StatCard.jsx`

- **Purpose**: Komponen card generik untuk label, nilai, dan deskripsi.
- **Data Source**: props `label`, `value`, `description`.
- **Calculation Logic**: tidak ada perhitungan.
- **Visualization**: menampilkan teks dan value.

> Catatan implementasi: StatCard di-*import* pada file analysis, namun harus dicek apakah benar-benar dipakai di JSX `return` halaman (pada file yang dibaca, umumnya tidak langsung dirender selain penggunaan kartu lain).

## Financial Metrics

Metrik yang muncul dalam komponen analisis:

1. **Arus kas bulanan**
   - `incomeAvg` (rata-rata pemasukan)
   - `expenseAvg` (rata-rata pengeluaran)
   - `netCashFlow` (rata-rata arus kas bersih)
   - `highestNet` dan `lowestNet` (nilai tertinggi/terendah arus kas per transaksi)

2. **Komposisi pengeluaran**
   - `nominal` per kategori
   - `percentage` per kategori = nominal / totalExpense * 100

3. **Komposisi pemasukan** (untuk role yang memiliki komponen ini)
   - `nominal` dan `percentage` per kategori pemasukan.

4. **Perkembangan (period development)**
   - incomeCur, expenseCur, netCur
   - savingsRatioCurPct = (netCur/incomeCur)*100
   - serta versi previous dan persentase perubahan masing-masing.

## Financial Health Analysis

Berdasarkan analisis terhadap implementasi file `Analysis*Page.jsx` dan komponen kartu yang digunakan, tidak ditemukan implementasi *Financial Health Score* sejenis milik dashboard (cashflowScore, savingsScore, debtScore, stabilityScore) pada halaman analysis.

Namun, komponen `PeriodDevelopmentCard` melakukan analisis finansial dengan indikator perkembangan berdasarkan:

- perubahan total pemasukan
- perubahan total pengeluaran
- perubahan arus kas bersih
- perubahan rasio tabungan

Ini dapat dipahami sebagai analisis kesehatan keuangan berbasis tren periode, bukan skor agregat 0–100 seperti di Dashboard.

## Analysis Workflow

## Data Processing Flow

1. User memilih periode melalui dropdown (`selectedPeriod`).
2. `getPeriodRanges(selectedPeriod)` menghitung rentang `currentStart/currentEnd` dan `previousStart/previousEnd`.
3. Transaksi difilter menjadi `filteredTransactions` berdasarkan:
   - berada dalam range saat ini
   - kategori dan tipe transaksi disaring sesuai role:
     - Analysis Utama: tidak membatasi kategori secara spesifik pada halaman utama; hanya memfilter range.
     - Analysis Mahasiswa: memfilter expense/pengeluaran dan kategori spesifik.
     - Analysis UMKM: memfilter kombinasi expense categories dan piutang.
     - Analysis Masyarakat: memfilter expense/pengeluaran dan kategori spesifik.
4. Komponen kartu menerima `filteredTransactions` (untuk cashflow & composition) dan menghitung metrik internal.
5. Komponen `PeriodDevelopmentCard` menerima seluruh `transactions` beserta parameter range, lalu memfilter internal untuk current vs previous.

## Calculation Pipeline

Pipeline per halaman (ringkas):

- `selectedPeriod`
  → `currentStart/currentEnd` & `previousStart/previousEnd`
  → filtering transaksi sesuai role
  → komponen:
    - MonthlyCashflowTableCard: avg + highest/lowest
    - Expense/IncomeCompositionCard: nominal + percentage + progress bar
    - PeriodDevelopmentCard: current vs previous + safe percentage change

## User Experience

### Loading State

Halaman analysis tidak memunculkan implementasi loading state khusus di file yang dianalisis. Loading kemungkinan ditangani di level lain (mis. parent route/App ketika props transactions belum siap).

### Empty State

Empty state spesifik tidak eksplisit di level halaman. Namun beberapa komponen kartu memiliki fallback bila tidak ada data yang cocok:

- Pada komponen komposisi/arus kas, total bisa bernilai 0 sehingga persentase ditampilkan sebagai 0.0%.
- Pada BiggestExpenseCard terdapat fallback kategori '-' bila tidak ada data expense.

### Error State

Tidak ada error state eksplisit pada file analysis yang dianalisis.

## Performance Considerations

1. Filtering transaksi menggunakan `useMemo` pada setiap halaman analysis.
2. Komponen kartu juga menggunakan `useMemo` untuk perhitungan.
3. Periode dipilih menggunakan state sederhana, sehingga rerender menargetkan subtree komponen kartu.

## Security Considerations

1. Analisis hanya melakukan perhitungan dan rendering data.
2. Tidak ada operasi sensitif seperti otorisasi atau modifikasi data.
3. Pemrosesan tanggal menggunakan `new Date(tx?.date)` dengan validasi `Number.isNaN(d.getTime())` agar tanggal invalid tidak mempengaruhi perhitungan.

## Future Improvements

1. Tambahkan empty/error state eksplisit agar UX lebih informatif saat data kosong.
2. Ekstraksi fungsi period ranges dan filtering menjadi util agar tidak duplikatif antar halaman.
3. Tambahkan standarisasi mapping kategori (mis. untuk type `income/expense` vs `pengeluaran`).
4. Harmonisasi komponen: bila `StatCard` dan `BiggestExpenseCard` ingin digunakan, pastikan rendering sesuai requirement desain.

## Contributed By

KasCerdas Team

