import TransactionCard from '../components/TransactionCard'
import StatCard from '../components/StatCard'

function DashboardPage({ walletSummary, transactions, budgets, walletInfo, userProfile, umkmSummary, onQuickAction }) {

  const recentTransactions = transactions.slice(0, 4)
  const isUmkm = userProfile?.usertype === 'umkm'
  const businessIncome = isUmkm ? umkmSummary.income : walletSummary.income || 0
  const businessExpense = isUmkm ? umkmSummary.operationalExpense : walletSummary.expense || 0
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
  const profitLoss = businessIncome - costOfGoodsSold - businessExpense
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

  const efficiencyScore = totalBudgetLimit > 0 ? Math.round(Math.max(0, Math.min(100, (1 - budgetUsageRatio) * 100))) : 70

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

  const financialCategory =
    overallScore >= 80 ? 'Sangat Sehat' : overallScore >= 60 ? 'Cukup Sehat' : overallScore >= 40 ? 'Kurang Stabil' : 'Buruk'

  const scoreColor =
    overallScore >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
    overallScore >= 60 ? 'text-lime-700 bg-lime-50 border-lime-100' :
    overallScore >= 40 ? 'text-amber-700 bg-amber-50 border-amber-100' :
    'text-red-700 bg-red-50 border-red-100'

  const scoreRingColor =
    overallScore >= 80 ? '#16A34A' :
    overallScore >= 60 ? '#65A30D' :
    overallScore >= 40 ? '#F59E0B' :
    '#DC2626'

  const healthAspects = [
    {
      label: 'Cashflow',
      score: cashflowScore,
      note: cashflow > 0 ? 'Pemasukan lebih besar dari pengeluaran.' : 'Pengeluaran melebihi pemasukan.',
    },
    {
      label: 'Rasio Tabungan',
      score: savingsScore,
      note: savingsRatio >= 0.25 ? 'Tabungan stabil dibanding pemasukan.' : 'Perlu tingkatkan tabungan.',
    },
    {
      label: 'Efisiensi Pengeluaran',
      score: efficiencyScore,
      note: budgetUsageRatio <= 0.85 ? 'Pengeluaran berada dalam batas anggaran.' : 'Pengeluaran mendekati atau melewati anggaran.',
    },
    {
      label: 'Kondisi Hutang',
      score: debtScore,
      note: totalDebt > 0 ? 'Hutang terdeteksi; usahakan pelunasan.' : 'Tidak ada hutang teridentifikasi.',
    },
    {
      label: 'Stabilitas Arus Kas',
      score: stabilityScore,
      note: positiveIncomeTransactions >= 2 ? 'Arus kas cukup stabil bulan ini.' : 'Perlu pemasukan lebih konsisten.',
    },
  ]

  const circleRadius = 60
  const circleCircumference = 2 * Math.PI * circleRadius
  const progressOffset = circleCircumference * (1 - overallScore / 100)

  const smartCashPerDay = walletSummary?.smartCashPerDay ?? 0
  const smartReductionPerDay = walletSummary?.smartReductionPerDay ?? 0

  const umkmQuickActions = [
    { label: 'Penjualan', icon: '🧾', businessCategory: 'Penjualan' },
    { label: 'Pemasukan', icon: '＋', businessCategory: 'Pemasukan' },
    { label: 'Pengeluaran Operasional', icon: '−', businessCategory: 'Pengeluaran Operasional' },
    { label: 'Beli Bahan Baku', icon: '📦', businessCategory: 'Beli Bahan Baku / Stok' },
    { label: 'Piutang Pelanggan', icon: '👥', businessCategory: 'Piutang Pelanggan' },
    { label: 'Hutang Supplier', icon: '🏭', businessCategory: 'Hutang Supplier' },
  ]

  const quickActions = isUmkm
    ? umkmQuickActions
    : [
        { label: 'Transfer', icon: '🔁' },
        { label: 'Tagihan', icon: '📄' },
        { label: 'Investasi', icon: '📈' },
        { label: 'QRIS', icon: '🔲' },
        { label: 'Donasi', icon: '💚' },
        { label: 'Riwayat', icon: '🕘' },
      ]


  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-gradient-to-r from-[#2e8b87] via-[#38ADA9] to-[#4fb7b2] p-6 text-white shadow-xl">
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
        <div className="rounded-[32px] bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Saldo Pemasukan</p>
          <h2 className="mt-4 text-4xl font-semibold text-slate-900">Rp {smartCashPerDay.toLocaleString('id-ID')}</h2>
          <p className="mt-3 text-sm text-slate-500">Pemasukan per bulan</p>
        </div>

        <div className="rounded-[32px] bg-[#F6B93B] p-6 shadow-sm border border-[#e6a53f] text-white">
          <p className="text-sm uppercase tracking-[0.24em] text-white/90">Saldo Pengeluaran</p>
          <h2 className="mt-4 text-4xl font-semibold">Rp {smartReductionPerDay.toLocaleString('id-ID')}</h2>
          <p className="mt-3 text-sm text-white/90">Pengeluaran per bulan</p>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
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
                  <p className="mt-2 text-4xl font-semibold text-slate-900">{overallScore}</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Skala 0–100 berdasarkan kesehatan finansial bulanan.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {healthAspects.map((aspect) => (
              <div key={aspect.label} className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
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
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
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
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Arus Kas Usaha</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">Rp {businessIncome.toLocaleString('id-ID')}</p>
              <p className="mt-2 text-sm text-slate-600">Pemasukan usaha</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-500">Pengeluaran Operasional</p>
                  <p className="mt-2 text-lg font-semibold text-rose-600">Rp {businessExpense.toLocaleString('id-ID')}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-500">HPP Diperkirakan</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">Rp {costOfGoodsSold.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Laba Rugi Otomatis</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">Rp {profitLoss.toLocaleString('id-ID')}</p>
              <p className="mt-2 text-sm text-slate-600">Pendapatan dikurangi HPP dan biaya operasional</p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Stok Barang</p>
              <div className="mt-3 space-y-3">
                {inventoryItems.map((item) => (
                  <div key={item.name} className="rounded-2xl bg-white p-4 shadow-sm">
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

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Hutang & Piutang</p>
              <div className="mt-3 space-y-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-500">Total Hutang</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">Rp {totalPayables.toLocaleString('id-ID')}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-500">Total Piutang</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">Rp {totalReceivables.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
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
              className="group flex items-center gap-3 rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-[#38ADA9] hover:bg-[#f5fffd]"
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
