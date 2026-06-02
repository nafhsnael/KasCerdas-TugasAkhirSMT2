import TransactionCard from '../components/TransactionCard'

function DashboardMahasiswaPage({ walletSummary, transactions, budgets, walletInfo, userProfile, onQuickAction }) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const mahasiswaPemasukanCategories = [
    'Beasiswa',
    'Tabungan',
    'Uang Saku',
    'Penghasilan Kerja Paruh Waktu',
    'Saldo Awal',
    'Initial',
  ]

  const mahasiswaPengeluaranCategories = [
    'UKT',
    'Buku/Alat Tulis',
    'Makan',
    'Kos',
    'Transportasi',
  ]

  const getWalletBalanceAtStartOfMonth = () => {
    const monthStart = new Date(currentYear, currentMonth, 1)

    const initialTx = transactions
      .filter((t) => {
        const d = new Date(t.date)
        return (
          (t.category === 'Saldo Awal' || t.category === 'Initial') &&
          !Number.isNaN(d.getTime()) &&
          d < monthStart
        )
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    return Number(initialTx?.amount || 0)
  }

  const totalIncome = walletSummary?.income !== undefined && walletSummary?.income !== null
    ? Number(walletSummary.income)
    : transactions
      .filter((t) => {
        const d = new Date(t.date)
        const cat = String(t.category || '').toLowerCase().trim()
        return (
          t.type === 'income' &&
          cat !== 'initial' &&
          cat !== 'saldo awal' &&
          d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear
        )
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0)

  const totalExpense = walletSummary?.expense !== undefined && walletSummary?.expense !== null && walletSummary?.expense > 0
    ? Number(walletSummary.expense)
    : transactions
      .filter((t) => {
        const d = new Date(t.date)
        return (
          t.type === 'expense' &&
          d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear
        )
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0)

  const totalBudgetLimit = budgets.reduce((sum, budget) => sum + (budget.limit || 0), 0)
  const totalBudgetUsage = budgets.reduce((sum, budget) => sum + (budget.usage || 0), 0)
  const budgetUsageRatio = totalBudgetLimit > 0
    ? Math.min(1, totalBudgetUsage / totalBudgetLimit)
    : totalExpense > 0
      ? Math.min(1, totalExpense / Math.max(totalIncome, 1))
      : 0

  const savingsRatio = totalIncome > 0 ? Math.min(1, walletSummary.current / totalIncome) : 0
  const cashflow = totalIncome - totalExpense
  const cashflowScore = totalIncome > 0
    ? Math.round(Math.max(0, Math.min(100, (cashflow / totalIncome) * 50 + 50)))
    : 0

  const debtTransactions = transactions.filter((t) => {
    const category = (t.category || '').toLowerCase()
    const note = (t.note || '').toLowerCase()
    return /hutang|utang|debt|loan/.test(category) || /hutang|utang|debt|loan/.test(note)
  })
  const totalDebt = debtTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
  const debtRatio = totalIncome > 0 ? Math.min(1, totalDebt / totalIncome) : 1
  const debtScore = Math.round(Math.max(0, Math.min(100, 100 - debtRatio * 80)))

  // Efisiensi pengeluaran: jika belum ada pengeluaran/budget, anggap maksimal (100)
  const efficiencyScore = totalBudgetLimit > 0
    ? Math.round(Math.max(0, Math.min(100, (1 - budgetUsageRatio) * 100)))
    : 100


  const positiveIncomeTransactions = transactions.filter((t) => {
    const d = new Date(t.date)
    return (
      t.type === 'income' &&
      d.getMonth() === currentMonth &&
      d.getFullYear() === currentYear
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

  const savingsScore = Math.round(Math.max(0, Math.min(100, savingsRatio * 100)))

  const overallScore = Math.round(
    (cashflowScore * 0.22 + savingsScore * 0.18 + efficiencyScore * 0.2 + debtScore * 0.2 + stabilityScore * 0.2)
  )

  const financialCategory =
    overallScore >= 80 ? 'Sangat Sehat' :
      overallScore >= 60 ? 'Cukup Sehat' :
        overallScore >= 40 ? 'Kurang Stabil' :
          'Buruk'

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
      note: cashflow > 0 ? 'Pemasukan lebih besar dari pengeluaran.' : 'Perhatikan arus kas, pengeluaran melebihi pemasukan.',
    },
    {
      label: 'Rasio Tabungan',
      score: savingsScore,
      note: savingsRatio >= 0.25 ? 'Tabungan stabil dibanding pemasukan.' : 'Tabungan perlu ditingkatkan.',
    },
    {
      label: 'Efisiensi Pengeluaran',
      score: efficiencyScore,
      note: budgetUsageRatio <= 0.85 ? 'Pengeluaran masih terkendali.' : 'Pengeluaran mendekati atau melebihi anggaran.',
    },
    {
      label: 'Kondisi Hutang',
      score: debtScore,
      note: totalDebt > 0 ? 'Hutang terdeteksi; pelunasan disarankan.' : 'Tidak ada hutang teridentifikasi.',
    },
    {
      label: 'Stabilitas Arus Kas',
      score: stabilityScore,
      note: positiveIncomeTransactions >= 2 ? 'Arus kas cukup stabil bulan ini.' : 'Perlu pemasukan yang lebih konsisten.',
    },
  ]

  const circleRadius = 60
  const circleCircumference = 2 * Math.PI * circleRadius
  const progressOffset = circleCircumference * (1 - overallScore / 100)

  // Aksi Cepat harus berada DI BAWAH Financial Health Score
  const quickActions = [
    // Pemasukan cepat
    {
      label: 'Beasiswa',
      category: 'Beasiswa',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 8l10 5 10-5-10-5zM6 10v6a6 6 0 0012 0v-6M21.5 8v6"/>
        </svg>
      )
    },
    {
      label: 'Tabungan',
      category: 'Tabungan',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
      )
    },
    {
      label: 'Uang Saku',
      category: 'Uang Saku',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      )
    },
    {
      label: 'Penghasilan Kerja Paruh Waktu',
      category: 'Penghasilan Kerja Paruh Waktu',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
      )
    },
    // Pengeluaran cepat
    {
      label: 'Kos',
      category: 'Kos',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
      )
    },
    {
      label: 'UKT',
      category: 'UKT',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
      )
    },
    {
      label: 'Makan',
      category: 'Makan',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 10a9 9 0 0018 0M3 10V9a2 2 0 012-2h14a2 2 0 012 2v1M9 3v2M12 3v2M15 3v2"/>
        </svg>
      )
    },
    {
      label: 'Transportasi',
      category: 'Transportasi',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h0M16 17h0M4 9h16M4 13h16M3 6a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6zm3 14a1 1 0 100-2 1 1 0 000 2zm12 0a1 1 0 100-2 1 1 0 000 2z"/>
        </svg>
      )
    },
    {
      label: 'Kebutuhan Kuliah',
      category: 'Kebutuhan Kuliah',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
        </svg>
      )
    },
    {
      label: 'Kebutuhan Lainnya',
      category: 'Kebutuhan Lainnya',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/>
        </svg>
      )
    },
    // Tambahan kategori hutang untuk akses cepat
    {
      label: 'Hutang',
      category: 'Hutang',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
        </svg>
      )
    },
  ]


  return (
    <div className="space-y-8 animate-fade-in-up">
      <section className="rounded-[32px] bg-gradient-to-r from-[#2e8b87] via-[#38ADA9] to-[#4fb7b2] p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,0.9fr)] xl:grid-cols-[1.8fr_0.8fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-100/80">Selamat Datang, Mahasiswa</p>
            <h1 className="mt-2 text-3xl font-semibold">{userProfile?.nama || 'Mahasiswa'}</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-100/90">Kelola keuangan kuliah, kos, dan pengeluaran sehari-hari dengan mudah.</p>


          </div>
          <div className="flex items-center justify-end">
            <div className="rounded-[28px] border border-white/20 bg-white/10 px-5 py-4 text-right text-slate-100/90 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.28em]">Saldo e-wallet</p>
              <p className="mt-3 text-2xl font-semibold text-white">Rp {walletSummary.current.toLocaleString('id-ID')}</p>
              <p className="mt-1 text-xs text-slate-100/80">Saldo e-wallet saat ini</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[32px] bg-white p-6 shadow-sm border border-slate-200/60 hover:shadow-md hover:border-slate-300 transition-all duration-300">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Saldo pemasukan</p>
          <h2 className="mt-4 text-4xl font-semibold text-slate-900">Rp {totalIncome.toLocaleString('id-ID')}</h2>
          <p className="mt-3 text-sm text-slate-500">Total pemasukan per bulan</p>
        </div>
        <div className="rounded-[32px] bg-[#F6B93B] p-6 text-white shadow-sm border border-[#e6a53f]/80 hover:shadow-md hover:scale-[1.01] transition-all duration-300">
          <p className="text-sm uppercase tracking-[0.24em] text-white/80">Saldo pengeluaran</p>
          <h2 className="mt-4 text-4xl font-semibold">Rp {totalExpense.toLocaleString('id-ID')}</h2>
          <p className="mt-3 text-sm text-white/80">Total pengeluaran per bulan</p>
        </div>
      </section>

      <section className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-[#f8fafc] to-[#eef2ff] p-4 shadow-sm">
        {(() => {
          const getBudgetUsage = (budget) => {
            const category = budget?.category || budget?.name || ''
            const now = new Date()
            const currentMonth = now.getMonth()
            const currentYear = now.getFullYear()

            const actualUsage = (transactions || [])
              .filter((t) => {
                const date = new Date(t.date)
                if (Number.isNaN(date.getTime())) return false

                const budgetParts = String(category).split(' - ')
                const budgetMainCat = String(budgetParts[0] || '').toLowerCase().trim()
                const budgetSubDetail = budgetParts[1] ? String(budgetParts[1]).toLowerCase().trim() : ''

                const tType = String(t.type || '').toLowerCase().trim()
                const tCategory = String(t.kategori || t.category || '').toLowerCase().trim()
                const tTitle = String(t.judul || t.title || '').toLowerCase().trim()

                const isKebutuhanLainnya = budgetMainCat === 'kebutuhan lainnya'

                if (isKebutuhanLainnya) {
                  return (
                    tType === 'expense' &&
                    tCategory === 'kebutuhan lainnya' &&
                    tTitle === budgetSubDetail &&
                    date.getMonth() === currentMonth &&
                    date.getFullYear() === currentYear
                  )
                }

                return (
                  tType === 'expense' &&
                  tCategory === String(category).toLowerCase().trim() &&
                  date.getMonth() === currentMonth &&
                  date.getFullYear() === currentYear
                )
              })
              .reduce((sum, t) => sum + Number(t.jumlah_uang || t.amount || 0), 0)

            const savedUsage = Number(budget?.usage) || 0
            return Math.max(actualUsage, savedUsage)
          }

          const processedBudgets = (budgets || []).map((b) => {
            const limit = Number(b?.limit) || 0
            const usage = getBudgetUsage(b)
            const ratio = limit > 0 ? usage / limit : 0
            const category = b?.category || b?.name || 'Kategori'
            return { ...b, category, limit, usage, ratio }
          })

          const sortedBudgets = [...processedBudgets].sort((a, b) => b.ratio - a.ratio)
          const topBudget = sortedBudgets[0]
          const topRatioPercent = topBudget ? Math.round(topBudget.ratio * 100) : 0
          const isWarning = topBudget && topBudget.ratio >= 0.9

          // Status definitions
          let statusLabel = 'Pengeluaran masih aman'
          let statusDesc = 'Pengeluaran bulan ini masih terkendali.'
          let badgeText = `${topRatioPercent}%`

          if (!budgets || budgets.length === 0) {
            statusLabel = 'Belum ada budget'
            statusDesc = 'Tambahkan budget agar ada pengingat otomatis.'
            badgeText = '-'
          } else if (isWarning) {
            statusLabel = 'Peringatan: Anggaran Hampir Habis!'
            statusDesc = `Pengeluaran untuk ${topBudget.category} telah mencapai ${topRatioPercent}%.`
          }

          const iconBgClass = !budgets || budgets.length === 0
            ? 'bg-slate-100 text-slate-500'
            : isWarning
              ? 'bg-amber-50 text-amber-500'
              : 'bg-green-50 text-green-500'

          const badgeColorClass = !budgets || budgets.length === 0
            ? 'bg-slate-50 text-slate-700 border-slate-200'
            : isWarning
              ? topRatioPercent >= 100
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-amber-50 text-amber-600 border border-amber-200'
              : 'bg-emerald-50 text-emerald-600 border border-emerald-200'

          return (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconBgClass}`}>
                  {!budgets || budgets.length === 0 ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : isWarning ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase block">Budget Reminder</span>
                  <h4 className="mt-0.5 text-[14px] font-bold text-slate-800 leading-tight">
                    {statusLabel}
                  </h4>
                  <p className="mt-0.5 text-xs text-slate-500 leading-tight line-clamp-2 w-full">
                    {statusDesc}
                  </p>
                </div>
              </div>

              <div className={`h-9 w-9 shrink-0 flex items-center justify-center rounded-full text-xs font-bold border ${badgeColorClass}`}>
                {badgeText}
              </div>
            </div>
          )
        })()}
      </section>

      <section className="rounded-[32px] border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Financial Health Score</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Nilai kesehatan keuangan Anda</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Skor dihitung dari cashflow, rasio tabungan, efisiensi pengeluaran, kondisi hutang, dan stabilitas arus kas.
            </p>
          </div>
          <div className={`rounded-3xl border px-4 py-3 text-center ${scoreColor}`}>
            <p className="text-xs uppercase tracking-[0.24em]">Status</p>
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
                  className="transition-all duration-500"
                  transform="rotate(-90 70 70)"
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Score</p>
                  <p className="mt-2 text-4xl font-semibold text-slate-900">{overallScore}</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Skor 0–100 berdasarkan kesehatan finansial bulanan.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {healthAspects.map((aspect) => (
              <div key={aspect.label} className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{aspect.label}</p>
                    <p className="mt-2 text-sm text-slate-500">{aspect.note}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900">{aspect.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Aksi Cepat (di bawah Financial Health Score) */}
      <section className="rounded-[32px] border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Aksi Cepat</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Mulai dengan cepat</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
              <button
              key={action.label}
              type="button"
              onClick={() => {
                onQuickAction?.(action.category)
              }}
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

export default DashboardMahasiswaPage

