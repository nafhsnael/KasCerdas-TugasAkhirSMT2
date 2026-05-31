# Analysis Data Flow Documentation

## Overview

Dokumentasi ini menjelaskan alur data, arsitektur, dan logika analisis keuangan yang sudah terimplementasi di proyek KasCerdas.
Dokumen berfokus pada kode frontend yang melakukan filtering, agregasi, transformasi, kalkulasi metrik, pemetaan komponen visual, serta penanganan error dan performa.

> Catatan: dokumen ini dibuat berdasarkan implementasi kode yang ada saat ini.
> Tidak ada endpoint API baru yang ditambahkan atau diusulkan.

## Analysis Data Architecture

Arsitektur analisis KasCerdas terdiri dari beberapa lapisan data utama:

1. Sumber Transaksi
2. Filtering / Klasifikasi Transaksi
3. Agregasi Nilai Finansial
4. Kalkulasi Analisis
5. Generasi Metrik dan Skor
6. Komponen Visualisasi

Diagram alur data dalam format Markdown:

```
Transactions
↓
Filtering
↓
Aggregation
↓
Analysis Calculation
↓
Metrics Generation
↓
Visualization Components
```

Struktur ini dipetakan langsung ke beberapa file frontend utama, termasuk `Frontend/src/App.jsx`, `Frontend/src/pages/AnalysisPage.jsx`, `Frontend/src/pages/AnalysisMasyarakatPage.jsx`, `Frontend/src/pages/AnalysisMahasiswaPage.jsx`, `Frontend/src/pages/AnalysisUMKMPage.jsx`, `Frontend/src/pages/DashboardPage.jsx`, `Frontend/src/pages/DashboardMahasiswaPage.jsx`, dan `Frontend/src/pages/DashboardMasyarakatPage.jsx`.

## Data Sources

### Transaction data source

Semua analisis didasarkan pada saham transaksi pengguna yang dipegang di state utama aplikasi.
Sumber transaksi dapat berupa:

- `transactions` — array transaksi global yang digunakan untuk klasifikasi dan pemrosesan standar.
- `mahasiswaTransactions` — subset transaksi yang dikategorikan sebagai milik pengguna mahasiswa.
- `masyarakatTransactions` — subset transaksi yang dikategorikan sebagai milik pengguna masyarakat.
- `umkmTransactions` — kumpulan transaksi khusus untuk usertype `umkm`.

### Sumber data pendukung lainnya

Selain transaksi, analisis juga memakai data berikut:

- `walletSummary` — ringkasan e-wallet pengguna, termasuk `current`, `income`, dan `expense`.
- `budgets` — daftar anggaran (budget) dan penggunaan (`usage` / `limit`).
- `userProfile` — profil pengguna, jenis akun, dan metadata.
- `walletInfo` — data saldo asli yang dapat menimpa atau mengoreksi `walletSummary`.
- `umkmSummary` — ringkasan khusus UMKM: pendapatan, pengeluaran operasional, HPP, piutang, hutang, dan stok.

### Klasifikasi transaksi oleh App.jsx

Kode di `Frontend/src/App.jsx` membuat dua turunan transaksi utama untuk analisis:

- `mahasiswaTransactions` menyaring transaksi yang secara eksplisit bertanda sebagai mahasiswa melalui metadata atau kategori unik mahasiswa.
- `masyarakatTransactions` menyaring transaksi yang secara eksplisit bertanda sebagai masyarakat melalui metadata atau kategori unik masyarakat.

Logika klasifikasi ini penting karena seluruh halaman analisis bergantung pada subset transaksi yang sesuai dengan usertype.

#### Klasifikasi Mahasiswa

- Memeriksa metadata `is_mahasiswa`.
- Jika metadata ada, nilai `true` berarti transaksi milik mahasiswa.
- Jika metadata `is_masyarakat` ada, false berarti mahasiswa.
- Jika metadata tidak ada, gunakan heuristik kategori yang menghindari kategori yang biasa dipakai masyarakat.

#### Klasifikasi Masyarakat

- Memeriksa metadata `is_masyarakat`.
- Jika metadata ada, nilai `true` berarti transaksi milik masyarakat.
- Jika metadata `is_mahasiswa` ada, false berarti masyarakat.
- Jika metadata tidak ada, gunakan heuristik kategori yang menghindari kategori khas mahasiswa.

### Sumber data UMKM

UMKM memakai state terpisah `umkmTransactions` dan `umkmSummary`.
Data ini tidak diklasifikasikan ulang melalui metadata yang sama seperti mahasiswa/masyarakat, melainkan dikelola secara khusus sebagai data UMKM.

## Transaction Processing Flow

Alur pemrosesan transaksi umum mengikuti langkah berikut:

1. Pastikan `transactions` berupa array dengan pengecekan `Array.isArray(transactions)`.
2. Filter berdasarkan rentang waktu (periode yang dipilih) menggunakan `isTxInRange` atau pemeriksaan `Date` secara manual.
3. Filter berdasarkan jenis transaksi (`type`), seperti:
   - `income`
   - `expense`
   - nilai alternatif `pengeluaran`
4. Filter tambahan berdasar kategori atau kondisi khusus, tergantung halaman.
5. Group / agregasi berdasarkan kategori atau properti lain.
6. Ubah ke format yang siap divisualisasikan.

### Pendekatan rentang waktu

Beberapa halaman analisis memakai `getPeriodRanges(periodKey)` untuk membangun rentang waktu `currentStart`, `currentEnd`, `previousStart`, dan `previousEnd`.

Rentang waktu yang didukung:

- `bulan_ini`
- `bulan_kemarin`
- `3_bulan_terakhir`
- `6_bulan_terakhir`
- `tahun_ini`

Fungsi ini menghasilkan rentang hari lengkap dengan batas jam kepala hari:

- `startOfDay` pada `00:00:00.000`
- `endOfDay` pada `23:59:59.999`

### Validasi tanggal dan proteksi kesalahan

Semua fungsi rentang waktu menggunakan pemeriksaan `Number.isNaN(d.getTime())` sebelum menganggap transaksi valid.
Jika tanggal tidak valid, transaksi tersebut dikeluarkan dari analisis.

### Filter jenis transaksi

Sebagai dasar, banyak analisis memakai pola seperti:

```js
const type = (t?.type || '').toLowerCase()
return type === 'expense' || type === 'pengeluaran'
```

atau

```js
return t?.type === 'income'
```

Ini memungkinkan dukungan untuk data yang menggunakan tipe bahasa campuran.

## Expense Analysis Flow

Expense analysis secara umum terdiri dari tiga langkah:

- Expense Composition
- Category Breakdown
- Expense Percentage

### Expense Composition

Komponen utama yang menangani komposisi pengeluaran adalah:

- `ExpenseCompositionCard` — generic
- `MasyarakatExpenseCompositionCard` — masyarakat
- `MahasiswaExpenseCompositionCard` — mahasiswa
- `UmkmExpenseCompositionCard` — UMKM

Semua komponen ini menerapkan pola yang sama:

1. Filter transaksi untuk `expense` / `pengeluaran`.
2. Normalisasi kategori berdasarkan teks kategori atau `businessCategory`.
3. Hitung total pengeluaran.
4. Hitung jumlah per kategori.
5. Hitung persentase kategori terhadap total.

#### ExpenseCompositionCard (Generic)

File: `Frontend/src/components/ExpenseCompositionCard.jsx`

- Mengidentifikasi transaksi pengeluaran dengan `type === 'expense'` atau `type === 'pengeluaran'`.
- Menentukan kategori dengan heuristik kata kunci:
  - `makan` → `Makan`
  - `hutang` → `Hutang`
  - `transport` → `Transport`
  - `belanja` → `Belanja`
  - `tagihan` → `Tagihan`
  - sisanya → `Kebutuhan Lainnya`
- Menghitung total pengeluaran lokal:

```js
const totalExpenseLocal = expenseTx.reduce((sum, t) => sum + (Number(t?.amount) || 0), 0)
```

- Membuat barisan kategori tertata dan persentase:

```js
const pct = totalExpenseLocal > 0 ? (nominal / totalExpenseLocal) * 100 : 0
```

#### MasyarakatExpenseCompositionCard

File: `Frontend/src/components/masyarakat/MasyarakatExpenseCompositionCard.jsx`

- Menerima `categories` yang ditentukan oleh halaman.
- Normalisasi kategori yang sama, namun khusus untuk kategori masyarakat.
- Mengembalikan nilai nominal dan persentase untuk setiap kategori berdasar total pengeluaran periode.

#### MahasiswaExpenseCompositionCard

File: `Frontend/src/components/mahasiswa/MahasiswaExpenseCompositionCard.jsx`

- Menyaring pengeluaran mahasiswa berdasarkan kategori seperti `Kos`, `UKT`, `Makan`, `Transportasi`, `Kebutuhan Kuliah`.
- Menjalankan logika komposisi serupa dengan agregasi kategori.

#### UmkmExpenseCompositionCard

File: `Frontend/src/components/umkm/UmkmExpenseCompositionCard.jsx`

- Normalisasi kategori UMKM menggunakan `businessCategory` atau `category`.
- Kategori utama UMKM meliputi:
  - `Pengeluaran Operasional`
  - `Beli Bahan Baku / Stok`
  - `Piutang Pelanggan`
  - `Hutang Supplier`
- Jika kategori tidak cocok, hasil fallback `Lainnya`.
- Persentase dihitung terhadap total transaksi kategori yang valid.

### Category Breakdown

Setiap kategori breakdown melakukan dua hal:

1. Mengidentifikasi kategori logis.
2. Menyajikan distribusi nilai nominal dan persentase.

Kategori breakdown visual bekerja sebagai berikut:

- `category` ditormalisasi dari teks asli.
- `nominal` disimpan sebagai jumlah rupiah.
- `percentage` dihitung dari `nominal / totalExpense`.

### Expense Percentage

Rumus expense percentage umum:

```js
percentage = totalExpense > 0 ? (nominal / totalExpense) * 100 : 0
```

Jika total pengeluaran periode sama dengan nol, persentase dipaksa menjadi 0 untuk menghindari pembagian dengan nol.

## Cashflow Analysis Flow

Cashflow analysis fokus pada perbandingan pendapatan dan pengeluaran.
Terdapat dua model utama di kode:

- `MonthlyCashflowTableCard` untuk ringkasan cashflow bulanan.
- `PeriodDevelopmentCard` untuk perkembangan periode dan perubahan relatif.

### Income Aggregation

Input untuk pendapatan diolah sebagai:

```js
const incomes = tx.filter((t) => t?.type === 'income')
const incomeAvg = incomes.length ? incomes.reduce((s, t) => s + (Number(t.amount) || 0), 0) / incomes.length : 0
```

### Expense Aggregation

Pengeluaran diolah sebagai:

```js
const expenses = tx.filter((t) => t?.type === 'expense')
const expenseAvg = expenses.length ? expenses.reduce((s, t) => s + (Number(t.amount) || 0), 0) / expenses.length : 0
```

### Net Cashflow Calculation

Net cashflow pada `MonthlyCashflowTableCard` dihitung sebagai:

```js
const netCashFlow = incomeAvg - expenseAvg
```

Nilai `netCashFlow` ini digunakan untuk menentukan apakah rata-rata transaksi berada dalam kondisi positif atau negatif.

### Additional cashflow metrics

Selain net cashflow rata-rata, komponen juga menghasilkan:

- `highestNet`: nilai tertinggi dari `perTxNet`
- `lowestNet`: nilai terendah dari `perTxNet`

Dimana `perTxNet` dibangun dari setiap transaksi:

```js
const perTxNet = tx.map((t) => {
  const amt = Number(t?.amount) || 0
  if (t?.type === 'income') return amt
  if (t?.type === 'expense') return -amt
  return 0
})
```

Hasil ini memberi visualisasi arus kas terbaik dan terburuk di periode.

## Period Development Flow

Komponen `PeriodDevelopmentCard` mengukur perkembangan periode saat ini dibanding periode sebelumnya.

File: `Frontend/src/components/PeriodDevelopmentCard.jsx`

### Current Period

`currentPeriod` ditentukan dengan menyaring transaksi berdasarkan `currentStart` dan `currentEnd`:

```js
const currentTx = tx.filter((t) => safeDateInRange(t, currentStart, currentEnd))
```

### Previous Period

`previousPeriod` ditentukan dengan menyaring transaksi berdasarkan `previousStart` dan `previousEnd`.

Jika rentang tidak tersedia, fallback memakai bulan ini dan bulan sebelumnya.

### Growth Calculation

Pertumbuhan dihitung dengan fungsi:

```js
function safePctChange(current, previous) {
  const prev = Number(previous) || 0
  const cur = Number(current) || 0

  if (prev === 0 && cur === 0) return 0
  if (prev === 0) return 100

  return ((cur - prev) / prev) * 100
}
```

Persentase perubahan yang dihitung:

- `incomeChangePct`
- `expenseChangePct`
- `netChangePct`
- `savingsRatioChangePct`

Ini menunjukkan arah pertumbuhan, baik positif maupun negatif.

### Statistik periode

Statistik yang dihitung untuk current dan previous:

- `incomeCur` / `incomePrev`
- `expenseCur` / `expensePrev`
- `netCur` / `netPrev`
- `savingsRatioCurPct`
- `savingsRatioPrevPct`

Dengan rumus:

```js
const netCur = incomeCur - expenseCur
const savingsRatioCur = incomeCur > 0 ? netCur / incomeCur : 0
```

#### Rasio tabungan

- `savingsRatioCurPct = savingsRatioCur * 100`
- `savingsRatioPrevPct = savingsRatioPrev * 100`

Periode pengembangan memvisualisasikan kondisi dan perubahan rasio tabungan dari periode terdahulu.

## Financial Score Calculation

Kode analisis skor keuangan terdapat di dashboard utama dan beberapa halaman dashboard per usertype.

File utama skor:

- `Frontend/src/pages/DashboardPage.jsx`
- `Frontend/src/pages/DashboardMahasiswaPage.jsx`
- `Frontend/src/pages/DashboardMasyarakatPage.jsx`

Semua sumber skor memanfaatkan pendekatan serupa, meskipun variabel input dapat berbeda sesuai tipe pengguna.

### Financial Health Score

Financial Health Score (`overallScore`) dihitung sebagai rata-rata tertimbang dari lima aspek:

- `cashflowScore` — 22%
- `savingsScore` — 18%
- `efficiencyScore` — 20%
- `debtScore` — 20%
- `stabilityScore` — 20%

Rumus umum:

```js
const overallScore = Math.round(
  cashflowScore * 0.22 +
  savingsScore * 0.18 +
  efficiencyScore * 0.2 +
  debtScore * 0.2 +
  stabilityScore * 0.2
)
```

### Cashflow Score

Cashflow Score mewakili proporsi saldo bersih terhadap pemasukan.

Rumus umum pada kode:

```js
cashflowScore = businessIncome > 0
  ? Math.round(Math.max(0, Math.min(100, (cashflow / businessIncome) * 50 + 50)))
  : 0
```

Dimana:

- `cashflow = businessIncome - businessExpense`
- `businessIncome` bisa berasal dari `walletSummary.income`, `umkmSummary.income + initialIncome`, atau `saldoPemasukanBulanIni`.

Pada `DashboardMasyarakatPage`, jika akun baru dan belum ada pemasukan non-initial, maka `cashflowScore` di-set `100` untuk menghindari penalti pada data awal.

### Savings Score

Savings Score dihitung dari rasio saldo saat ini terhadap pemasukan:

```js
savingsRatio = businessIncome > 0 ? Math.min(1, currentBalance / businessIncome) : 0
savingsScore = Math.round(Math.max(0, Math.min(100, savingsRatio * 100)))
```

Aturan khusus:

- Jika akun baru tanpa pemasukan non-initial, skor tabungan bisa dianggap `100`.
- Jika tidak ada pemasukan tetapi saldo positif tersedia, pada beberapa halaman `savingsRatio` fallback ke `0.5`.

### Savings Score pada Mahasiswa dan Dashboard Umum

Pada `DashboardMahasiswaPage`:

```js
const savingsRatio = totalIncome > 0 ? Math.min(1, walletSummary.current / totalIncome) : 0
const savingsScore = Math.round(Math.max(0, Math.min(100, savingsRatio * 100)))
```

### Efficiency Score

Efficiency Score berkaitan dengan penggunaan budget terhadap limit budget.

Rumus umum:

```js
const efficiencyScore = totalBudgetLimit > 0
  ? Math.round(Math.max(0, Math.min(100, (1 - budgetUsageRatio) * 100)))
  : 100
```

Khusus di `DashboardMasyarakatPage`, jika belum ada budget tetapi ada pengeluaran dan pemasukan, ada fallback:

```js
Math.round(Math.max(0, Math.min(100, (1 - Math.min(1, businessExpense / businessIncome)) * 100)))
```

### Debt Score

Debt Score menilai seberapa besar hutang relatif terhadap pemasukan.

Rumus umum:

```js
const debtRatio = businessIncome > 0 ? Math.min(1, totalDebt / businessIncome) : 1
const debtScore = Math.round(Math.max(0, Math.min(100, 100 - debtRatio * 80)))
```

Artinya, jika total hutang mencapai pemasukan penuh, skor minimum mendekati `20`.

#### Identifikasi hutang

Hutang ditemukan dengan pencarian pola pada `category`, `note`, dan `title`:

```js
return /hutang|utang|debt|loan/.test(term)
```

### Stability Score

Stability Score menggabungkan jumlah transaksi pemasukan positif, kondisi cashflow, dan status budget.

Rumus umum:

```js
const stabilityScore = Math.round(
  Math.max(
    0,
    Math.min(
      100,
      35 + Math.min(30, positiveIncomeTransactions * 10) + (cashflow > 0 ? 20 : -10) + (budgetUsageRatio <= 1 ? 15 : -10)
    )
  )
)
```

#### Interpretasi:

- `positiveIncomeTransactions * 10` memberi poin stabilitas sampai maksimum 30.
- Cashflow positif memberi tambahan `+20`, negatif memberi `-10`.
- Budget usage <= 100% memberi tambahan `+15`, melebihi batas memberi `-10`.

### Financial Category

`overallScore` diterjemahkan ke label kondisi:

- `>= 80` → `Sangat Sehat`
- `>= 60` → `Cukup Sehat`
- `>= 40` → `Kurang Stabil`
- `< 40` → `Buruk`

### Skor spesifik halaman

#### DashboardPage umum

`DashboardPage.jsx` melakukan perhitungan `businessIncome` dan `businessExpense` berbeda untuk UMKM dan non-UMKM.

- `businessIncome` adalah `umkmSummary.income + initialIncome` untuk UMKM.
- `businessExpense` adalah `umkmSummary.operationalExpense - initialIncome` untuk UMKM.
- `netCash` dihitung sebagai:

```js
const profitLoss = (businessIncome - initialIncome) - costOfGoodsSold - businessExpense
const netCash = profitLoss
```

#### DashboardMahasiswaPage

`DashboardMahasiswaPage.jsx` mendefinisikan kategori pendapatan dan pengeluaran mahasiswa.

- `totalIncome` menghitung pemasukan `income` untuk kategori mahasiswa di bulan berjalan.
- `totalExpense` menghitung pengeluaran `expense` untuk kategori mahasiswa di bulan berjalan.
- `budgetUsageRatio` digabungkan dari `budgets` atau `totalExpense / totalIncome` jika tidak ada budget.

#### DashboardMasyarakatPage

`DashboardMasyarakatPage.jsx` menambahkan logika khusus akun baru dan saldo awal:

- `isSaldoAwalTransaction` membedakan `Saldo Awal` / `Initial`.
- `hasNonInitialIncome` mendeteksi apakah ada pemasukan selain saldo awal.
- `isAkunBaru` menentukan apakah pengguna belum memiliki data pendapatan/pengeluaran riil.
- Saat `isAkunBaru`, beberapa skor seperti `cashflowScore`, `savingsScore`, dan `efficiencyScore` otomatis diberikan nilai `100`.

## Data Transformation

Setiap halaman analisis mentransformasikan data mentah menjadi objek informasi visual:

- `filteredTransactions` — transaksi yang sudah dibatasi rentang waktu.
- `rows` — barisan kategori nominal dan persentase.
- `stats` — ringkasan numerik seperti `incomeAvg`, `expenseAvg`, `netCashFlow`, `highestNet`, `lowestNet`.
- `currentPeriod` / `previousPeriod` — subset transaksi untuk bandingan periode.
- `healthAspects` — struktur skor terperinci untuk setiap aspek kesehatan finansial.

### Transformasi kategori

Transformasi kategori dilakukan dengan pemetaan string berisi kata kunci.
Contoh:

- `...includes('makan')` → `Makan`
- `...includes('hutang')` → `Hutang`
- `...includes('transport')` → `Transport`
- `...includes('belanja')` → `Belanja`
- `...includes('tagihan')` → `Tagihan`

Jika kategori tidak dikenali pada generic `ExpenseCompositionCard`, maka masuk sebagai `Kebutuhan Lainnya`.

### Transformasi tanggal

Fungsi `isTxInRange(tx, start, end)` mengubah `tx.date` menjadi objek `Date` dan memastikan:

```js
const d = new Date(tx?.date)
return d >= start && d <= end
```

Ini adalah filter waktu utama untuk semua analisis periode.

### Penanganan default nilai

Banyak nilai dilindungi dengan `Number(...) || 0`.
Contoh:

- `Number(t?.amount) || 0`
- `Number(budget?.limit) || 0`
- `Number(walletSummary.current || 0)`

Ini mencegah `NaN` dan menjaga analisis tetap stabil pada data kosong atau rusak.

## Component Data Mapping

Berikut pemetaan data ke komponen utama visualisasi:

- `AnalysisPage` → `MonthlyCashflowTableCard`, `ExpenseCompositionCard`, `PeriodDevelopmentCard`
- `AnalysisMasyarakatPage` → `MasyarakatMonthlyCashflowTableCard`, `MasyarakatExpenseCompositionCard`, `MasyarakatIncomeCompositionCard`, `MasyarakatPeriodDevelopmentCard`
- `AnalysisMahasiswaPage` → `MahasiswaMonthlyCashflowTableCard`, `MahasiswaExpenseCompositionCard`, `MahasiswaIncomeCompositionCard`, `MahasiswaPeriodDevelopmentCard`
- `AnalysisUMKMPage` → `UmkmMonthlyCashflowTableCard`, `UmkmExpenseCompositionCard`, `UmkmIncomeCompositionCard`, `UmkmPeriodDevelopmentCard`
- `DashboardPage` / `DashboardMahasiswaPage` / `DashboardMasyarakatPage` → skor kesehatan finansial plus catatan ringkas.

### Mapping transaksi

- `AnalysisPage` menerima `transactions` dari `App.jsx` sebagai transaksi generik yang sesuai tipe pengguna.
- `AnalysisMasyarakatPage` menerima `masyarakatTransactions`.
- `AnalysisMahasiswaPage` menerima `mahasiswaTransactions`.
- `AnalysisUMKMPage` menerima `umkmTransactions`.

### Mapping periode

Komponen periode menerima:

- `periodLabel`
- `currentStart`
- `currentEnd`
- `previousStart`
- `previousEnd`

`PeriodDevelopmentCard` menggunakan semua parameter ini untuk membandingkan dua periode.

## Visualization Flow

Alur visualisasi mengikuti empat langkah:

1. Halaman analisis memutuskan periode dan subset data.
2. Data difilter dan disiapkan melalui `useMemo`.
3. Komponen menampilkan kartu ringkasan, grafik batang, dan indikator persentase.
4. Skor dan indikator diberi warna berdasarkan ambang nilai.

### Komponen ringkasan arus kas

`MonthlyCashflowTableCard` dan varian khusus menampilkan:

- Rata-rata pemasukan
- Rata-rata pengeluaran
- Rata-rata arus kas bersih
- Arus kas tertinggi
- Arus kas terendah

### Komposisi pengeluaran

Komponen komposisi menampilkan:

- Nama kategori
- Nilai nominal
- Persentase terhadap total
- Progress bar visual untuk tiap kategori

### Komposisi pendapatan

Komponen pemasukan spesifik mahasiswa dan UMKM memvisualisasikan kategori pemasukan dan persentasenya.

### Perkembangan periode

`PeriodDevelopmentCard` menampilkan:

- Total pemasukan saat ini
- Total pengeluaran saat ini
- Total arus kas bersih saat ini
- Rasio tabungan saat ini
- Perubahan persentase terhadap periode sebelumnya

## Error Handling

Alur analisis telah diimplementasikan dengan beberapa proteksi kesalahan:

- `Array.isArray(transactions) ? transactions : []` menjaga agar analisis tidak crash jika input bukan array.
- `Number.isNaN(d.getTime())` memverifikasi tanggal valid.
- `Number(t?.amount) || 0` menormalisasi nilai numerik.
- `Math.max(0, Math.min(100, ...))` memaksa skor berada di rentang valid 0–100.
- Persentase perubahan memiliki `safePctChange` untuk menghindari pembagian dengan nol.

### Contoh penanganan tanggal invalid

```js
const d = new Date(tx?.date)
if (Number.isNaN(d.getTime())) return false
```

### Contoh penanganan pembagian nol

```js
if (prev === 0 && cur === 0) return 0
if (prev === 0) return 100
```

### Fallback nilai budget

Jika total `budget.limit` nol, `budgetUsageRatio` dihitung secara alternatif menggunakan `businessExpense / businessIncome`.

## Performance Considerations

Beberapa pola optimasi performa digunakan:

- `useMemo` untuk menghitung filtered transactions, kategori, dan statistik hanya ketika dependensi berubah.
- Pemisahan `transactions` menjadi `mahasiswaTransactions` dan `masyarakatTransactions` pada layer App sehingga halaman analisis tidak melakukan klasifikasi ulang berulang-ulang.
- Penyimpanan row dan stats dalam memori lokal selama render untuk mengurangi re-computation.

### Potensi bottleneck

- Filter dan reduksi pada array transaksi besar bisa berulang di beberapa halaman.
- `useMemo` membantu, tetapi masih memproses urutan penuh setiap kali dependensi berubah.
- Jika `transactions` berukuran besar, idealnya logika pre-processing dapat dipindahkan ke backend atau di-cache di level yang lebih tinggi.

## Future Improvements

Berdasarkan implementasi saat ini, beberapa perbaikan potensial:

1. Sinkronisasi logika kategori antara halaman analisis dan halaman transaksi agar normalisasi kategori konsisten.
2. Ekstraksi utilitas pemrosesan transaksi ke modul tranformasi tersendiri.
3. Penanganan data `amount` yang lebih ketat, misalnya konversi otomatis dari string numerik.
4. Penerapan memoization lebih agresif pada data yang dibagikan lintas halaman (mis. kategori expense global).
5. Penambahan metrik visualisasi tambahan seperti grafik garis waktu, stacked bar, atau pie chart.
6. Penggunaan data backend terstruktur untuk mengurangi heuristik parsing kategori di frontend.
7. Penghitungan skor yang lebih transparan dengan dokumentasi besaran bobot di UI.
8. Penambahan fitur perbandingan multi-periode selain hanya periode saat ini vs periode sebelumnya.
9. Standardisasi nama kategori di backend agar semua kategori disajikan seragam.
10. Normalisasi tambahan untuk nilai `businessCategory` di UMKM.

## Contributed By

KasCerdas Team
