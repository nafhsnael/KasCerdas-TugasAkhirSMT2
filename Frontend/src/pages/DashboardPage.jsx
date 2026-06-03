import TransactionCard from '../components/TransactionCard'
import StatCard from '../components/StatCard'

function DashboardPage({ walletSummary, transactions, budgets, walletInfo, userProfile, umkmSummary, onQuickAction }) {

  const recentTransactions = transactions.slice(0, 4)
  const isUmkm = userProfile?.usertype === 'umkm'
  // Ambil pendapatan usaha tanpa memasukkan saldo awal (Initial/Saldo Awal)
  const initialIncome = Number(transactions
    .filter((t) => {
      const cat = (t.businessCategory || t.category || '').toString().toLowerCase();
      return cat === 'initial' || cat === 'saldo awal';
    })
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0) || 0)

  const businessIncome = isUmkm ? (umkmSummary.income + initialIncome) : walletSummary.income || 0
  const businessExpense = isUmkm ? umkmSummary.operationalExpense - Number(transactions
    .filter((t) => {
      const cat = (t.category || '').toString();
      return cat === 'Initial' || cat === 'Saldo Awal';
    })
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0) || 0) : walletSummary.expense || 0
  const inventoryItems = isUmkm
    ? umkmSummary.inventory
    : [
        { name: 'Bahan baku utama', stock: 18, reorderLevel: 10 },
        { name: 'Produk siap jual', stock: 6, reorderLevel: 15 },
        { name: 'Kemasan & label', stock: 32, reorderLevel: 8 },
      ]
  const lowStockItems = inventoryItems.filter((item) => item.stock <= item.reorderLevel)
  const totalPayables = isUmkm ? umkmSummary.payables : 4200000
  const totalReceivables = isUmkm ? umkmSummary.receivables : 1750000
  const estimatedHpp = isUmkm ? umkmSummary.estimatedHpp : Math.round(businessIncome * 0.42)
  const costOfGoodsSold = estimatedHpp

  const profitLoss = (businessIncome - initialIncome) - costOfGoodsSold - businessExpense
  const netCash = profitLoss
  const financialHealthRaw = businessIncome > 0 ? (netCash / businessIncome) * 100 : 0
  const financialHealthPercent = Math.max(0, Math.min(100, financialHealthRaw))

  const financialHealthStatus = financialHealthPercent >= 60 ? 'Aman' : 'Perlu perhatian'

  const totalBudgetLimit = budgets.reduce((sum, budget) => sum + (budget.limit || 0), 0)
  const totalBudgetUsage = budgets.reduce((sum, budget) => sum + (budget.usage || 0), 0)
  const budgetUsageRatio = totalBudgetLimit > 0 ? Math.min(1, totalBudgetUsage / totalBudgetLimit) : (businessExpense > 0 ? Math.min(1, businessExpense / Math.max(businessIncome, 1)) : 0)

  const cashflow = businessIncome - businessExpense
  const cashflowScore = businessIncome > 0 ? Math.round(Math.max(0, Math.min(100, (cashflow / businessIncome) * 50 + 50))) : 0

  const savingsRatio = businessIncome > 0 ? Math.min(1, walletSummary.current / businessIncome) : 0
  const savingsScore = Math.round(Math.max(0, Math.min(100, savingsRatio * 100)))

  // Efisiensi pengeluaran: jika belum ada budget/usage, anggap maksimal (100)
  const efficiencyScore = totalBudgetLimit > 0 ? Math.round(Math.max(0, Math.min(100, (1 - budgetUsageRatio) * 100))) : 100


  const debtTransactions = transactions.filter((t) => {
    const term = (t.category || '').toString().toLowerCase() + ' ' + (t.note || '').toString().toLowerCase()
    return /hutang|utang|debt|loan/.test(term)
  })
  const totalDebt = debtTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
  const debtRatio = businessIncome > 0 ? Math.min(1, totalDebt / businessIncome) : 1
  const debtScore = Math.round(Math.max(0, Math.min(100, 100 - debtRatio * 80)))

  const positiveIncomeTransactions = transactions.filter((t) => {
    const d = new Date(t.date)
    return (
      t.type === 'income' &&
      d.getMonth() === new Date().getMonth() &&
      d.getFullYear() === new Date().getFullYear()
    )
  }).length
  const stabilityScore = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        35 + Math.min(30, positiveIncomeTransactions * 10) + (cashflow > 0 ? 20 : -10) + (budgetUsageRatio <= 1 ? 15 : -10)
      )
    )
  )

  const overallScore = Math.round(
    (cashflowScore * 0.22 + savingsScore * 0.18 + efficiencyScore * 0.2 + debtScore * 0.2 + stabilityScore * 0.2)
  )

  const isSaldoAwalTransaction = (t) => {
    const cat = String(t.businessCategory || t.category || '').toLowerCase().trim()
    const title = String(t.title || '').toLowerCase().trim()
    const note = String(t.note || '').toLowerCase().trim()
    return (
      cat === 'saldo awal' || cat === 'initial' || cat === 'initial balance' ||
      title === 'saldo awal' || title === 'initial' || title === 'initial balance' ||
      note === 'saldo awal' || note === 'initial' || note === 'initial balance'
    )
  }

  const isEmptyData =
    (transactions || []).length === 0 ||
    (transactions || []).filter(t => !isSaldoAwalTransaction(t)).length === 0

  const financialCategory = isEmptyData
    ? 'Belum ada data'
    : (overallScore >= 80 ? 'Sangat Sehat' :
       overallScore >= 60 ? 'Cukup Sehat' :
       overallScore >= 40 ? 'Kurang Stabil' :
       'Buruk')

  const scoreColor = isEmptyData
    ? 'text-slate-600 bg-slate-50 border-slate-200'
    : (overallScore >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
       overallScore >= 60 ? 'text-lime-700 bg-lime-50 border-lime-100' :
       overallScore >= 40 ? 'text-amber-700 bg-amber-50 border-amber-100' :
       'text-red-700 bg-red-50 border-red-100')

  const scoreRingColor = isEmptyData
    ? '#94A3B8'
    : (overallScore >= 80 ? '#16A34A' :
       overallScore >= 60 ? '#65A30D' :
       overallScore >= 40 ? '#F59E0B' :
       '#DC2626')

  const healthAspects = [
    {
      label: 'Cashflow',
      score: isEmptyData ? '-' : cashflowScore,
      note: isEmptyData ? 'Belum ada data transaksi pemasukan atau pengeluaran.' : (cashflow > 0 ? 'Pemasukan lebih besar dari pengeluaran.' : 'Pengeluaran melebihi pemasukan.'),
    },
    {
      label: 'Rasio Tabungan',
      score: isEmptyData ? '-' : savingsScore,
      note: isEmptyData ? 'Belum ada data tabungan.' : (savingsRatio >= 0.25 ? 'Tabungan stabil dibanding pemasukan.' : 'Perlu tingkatkan tabungan.'),
    },
    {
      label: 'Efisiensi Pengeluaran',
      score: isEmptyData ? '-' : efficiencyScore,
      note: isEmptyData ? 'Belum ada data anggaran.' : (budgetUsageRatio <= 0.85 ? 'Pengeluaran berada dalam batas anggaran.' : 'Pengeluaran mendekati atau melewati anggaran.'),
    },
    {
      label: 'Kondisi Hutang',
      score: isEmptyData ? '-' : debtScore,
      note: isEmptyData ? 'Belum ada data hutang.' : (totalDebt > 0 ? 'Hutang terdeteksi; usahakan pelunasan.' : 'Tidak ada hutang teridentifikasi.'),
    },
    {
      label: 'Stabilitas Arus Kas',
      score: isEmptyData ? '-' : stabilityScore,
      note: isEmptyData ? 'Belum ada data arus kas.' : (positiveIncomeTransactions >= 2 ? 'Arus kas cukup stabil bulan ini.' : 'Perlu pemasukan lebih konsisten.'),
    },
  ]

  const circleRadius = 60
  const circleCircumference = 2 * Math.PI * circleRadius
  const progressOffset = circleCircumference * (1 - (isEmptyData ? 0 : overallScore) / 100)

  const smartCashPerDay = walletSummary?.smartCashPerDay ?? 0
  const smartReductionPerDay = walletSummary?.smartReductionPerDay ?? 0

  const umkmQuickActions = [
    {
      label: 'Penjualan',
      businessCategory: 'Penjualan',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Pemasukan',
      businessCategory: 'Pemasukan',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      label: 'Pengeluaran Operasional',
      businessCategory: 'Pengeluaran Operasional',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
        </svg>
      ),
    },
    {
      label: 'Beli Bahan Baku',
      businessCategory: 'Beli Bahan Baku / Stok',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: 'Piutang Pelanggan',
      businessCategory: 'Piutang Pelanggan',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'Hutang Supplier',
      businessCategory: 'Hutang Supplier',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ]

  const quickActions = isUmkm
    ? umkmQuickActions
    : [
        {
          label: 'Transfer',
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          ),
        },
        {
          label: 'Tagihan',
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          label: 'Investasi',
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          ),
        },
        {
          label: 'QRIS',
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m0 11v1m4-6h1m-11 0h1m3-7H7a2 2 0 00-2 2v3m14-5v3a2 2 0 01-2 2h-3m-7 8v3a2 2 0 002 2h3m8-5v3a2 2 0 01-2 2h-3" />
            </svg>
          ),
        },
        {
          label: 'Donasi',
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ),
        },
        {
          label: 'Riwayat',
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
      ]


  return (
    <div className="space-y-8 animate-fade-in-up">
      <section className="rounded-[32px] bg-gradient-to-r from-[#2e8b87] via-[#38ADA9] to-[#4fb7b2] p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-100/80">Selamat Datang</p>
            <h1 className="mt-2 text-3xl font-semibold">{userProfile?.nama || 'Pengguna'}</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-100/90">
              Pantau saldo eco-wallet, pencapaian keberlanjutan, dan transaksi terbaru dalam satu tampilan bersih.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/20 bg-white/10 p-4 text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-100/80">Saldo E-Wallet</p>
            <p className="mt-2 text-3xl font-semibold">Rp {walletSummary.current.toLocaleString('id-ID')}</p>
            <p className="text-sm text-slate-100/80">Saldo e-wallet saat ini</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[32px] bg-white p-6 shadow-sm border border-slate-200/60 hover:shadow-md hover:border-slate-300 transition-all duration-300">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Saldo Pemasukan</p>
          <h2 className="mt-4 text-4xl font-semibold text-slate-900">Rp {smartCashPerDay.toLocaleString('id-ID')}</h2>
          <p className="mt-3 text-sm text-slate-500">Pemasukan per bulan</p>
        </div>

        <div className="rounded-[32px] bg-[#F6B93B] p-6 shadow-sm border border-[#e6a53f]/80 hover:shadow-md hover:scale-[1.01] transition-all duration-300 text-white">
          <p className="text-sm uppercase tracking-[0.24em] text-white/90">Saldo Pengeluaran</p>
          <h2 className="mt-4 text-4xl font-semibold">Rp {smartReductionPerDay.toLocaleString('id-ID')}</h2>
          <p className="mt-3 text-sm text-white/90">Pengeluaran per bulan</p>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Financial Health Score</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Kondisi Keuangan Anda</h2>
            <p className="mt-2 text-sm text-slate-500">Skor dihitung berdasarkan cashflow, rasio tabungan, efisiensi pengeluaran, kondisi hutang, dan stabilitas arus kas.</p>
          </div>
          <div className={`rounded-3xl border px-4 py-3 text-center ${scoreColor}`}>
            <p className="text-xs uppercase tracking-[0.24em]">Kategori</p>
            <p className="mt-2 text-lg font-semibold">{financialCategory}</p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6 text-center">
            <div className="relative mx-auto h-[140px] w-[140px]">
              <svg className="h-full w-full" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="60" stroke="#E2E8F0" strokeWidth="12" fill="transparent" />
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  stroke={scoreRingColor}
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={progressOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 70 70)"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Score</p>
                  <p className="mt-2 text-4xl font-semibold text-slate-900">{isEmptyData ? '-' : overallScore}</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Skala 0–100 berdasarkan kesehatan finansial bulanan.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {healthAspects.map((aspect) => (
              <div key={aspect.label} className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{aspect.label}</p>
                    <p className="mt-2 text-sm text-slate-500">{aspect.note}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900">
                    {aspect.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isUmkm && (
        <section className="rounded-[32px] border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">UMKM</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Ringkasan Usaha</h2>
              <p className="mt-3 text-sm text-slate-500">
                Fitur khusus UMKM untuk memisahkan keuangan usaha dan pribadi, memantau arus kas, stok, laba rugi, dan hutang/piutang.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-slate-900">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Dompet</p>
              <p className="mt-2 text-xl font-semibold">Dompet Usaha</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 hover:shadow-md transition-all duration-300">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Arus Kas Usaha</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">Rp {businessIncome.toLocaleString('id-ID')}</p>
              <p className="mt-2 text-sm text-slate-600">Pemasukan usaha</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 shadow-sm hover:shadow-md transition-all duration-300">
                  <p className="text-sm text-slate-500">Pengeluaran Operasional</p>
                  <p className="mt-2 text-lg font-semibold text-rose-600">Rp {businessExpense.toLocaleString('id-ID')}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm hover:shadow-md transition-all duration-300">
                  <p className="text-sm text-slate-500">HPP Diperkirakan</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">Rp {costOfGoodsSold.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 hover:shadow-md transition-all duration-300">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Laba Rugi Otomatis</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">Rp {profitLoss.toLocaleString('id-ID')}</p>
              <p className="mt-2 text-sm text-slate-600">Pendapatan dikurangi HPP dan biaya operasional</p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 hover:shadow-md transition-all duration-300">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Stok Barang</p>
              <div className="mt-3 space-y-3">
                {inventoryItems.map((item) => (
                  <div key={item.name} className="rounded-2xl bg-white p-4 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.stock <= item.reorderLevel ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {item.stock <= item.reorderLevel ? 'Menipis' : 'Aman'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">Stok: {item.stock} unit</p>
                  </div>
                ))}
              </div>
              {lowStockItems.length > 0 && (
                <p className="mt-4 text-sm text-rose-600">{lowStockItems.length} produk hampir menipis. Segera restock.</p>
              )}
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 hover:shadow-md transition-all duration-300">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Hutang & Piutang</p>
              <div className="mt-3 space-y-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm hover:shadow-md transition-all duration-300">
                  <p className="text-sm text-slate-500">Total Hutang</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">Rp {totalPayables.toLocaleString('id-ID')}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm hover:shadow-md transition-all duration-300">
                  <p className="text-sm text-slate-500">Total Piutang</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">Rp {totalReceivables.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-[32px] border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Aksi Cepat</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Mulai dengan cepat</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => onQuickAction?.(action.businessCategory)}
              className="group flex items-center gap-3 rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition-all duration-300 hover:border-[#38ADA9] hover:bg-[#f5fffd] hover:scale-105 active:scale-95 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e6f6f3] text-2xl text-[#2e8b87]">
                {action.icon}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{action.label}</p>
                <p className="text-sm text-slate-500">Lihat detail</p>
              </div>
            </button>
          ))}
        </div>
      </section>

    </div>
  )
}

export default DashboardPage
